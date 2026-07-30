// Repair a user's display name everywhere: the auth profile, their users
// doc, and the authorName on every question and field report they authored.
// Fixes accounts that signed up before the sign-up form collected a name
// (their content shows author "unknown").
//
//   node scripts/fix-author-name.mjs <email> "<Full Name>"
//
// Reads FIREBASE_ADMIN_* from the environment, falling back to .env.local.
import { existsSync, readFileSync } from "node:fs";
import admin from "firebase-admin";

const [email, name] = process.argv.slice(2);

if (!email || !name || name.trim() === "") {
  console.error('Usage: node scripts/fix-author-name.mjs <email> "<Full Name>"');
  process.exit(1);
}

if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    // tolerate `export KEY=value` and spaces around `=`, like dotenv does
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  }),
});

const displayName = name.trim();
const user = await admin.auth().getUserByEmail(email);
const firestore = admin.firestore();

await admin.auth().updateUser(user.uid, { displayName });
await firestore.doc(`users/${user.uid}`).set({ name: displayName }, { merge: true });

let updated = 0;
for (const collection of ["questions", "fieldReports"]) {
  const snapshot = await firestore
    .collection(collection)
    .where("authorId", "==", user.uid)
    .get();
  for (const docSnap of snapshot.docs) {
    await docSnap.ref.update({ authorName: displayName });
    updated++;
  }
  console.log(`${collection}: ${snapshot.size} doc(s) re-attributed`);
}

console.log(
  `Set name '${displayName}' for ${email} (uid ${user.uid}); ${updated} authored doc(s) updated.`
);
process.exit(0);
