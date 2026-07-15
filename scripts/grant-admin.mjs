// Bootstrap or repair a user's role custom claim from the command line.
// Needed for the first admin, since /api/admin/set-role requires an existing
// admin to call it.
//
//   node scripts/grant-admin.mjs <email> [free|fellow|admin]
//
// Reads FIREBASE_ADMIN_* from the environment, falling back to .env.local.
import { existsSync, readFileSync } from "node:fs";
import admin from "firebase-admin";

const [email, role = "admin"] = process.argv.slice(2);
const VALID_ROLES = ["free", "fellow", "admin"];

if (!email || !VALID_ROLES.includes(role)) {
  console.error("Usage: node scripts/grant-admin.mjs <email> [free|fellow|admin]");
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

const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { role });
await admin.firestore().doc(`users/${user.uid}`).set({ role }, { merge: true });

console.log(
  `Set role '${role}' for ${email} (uid ${user.uid}).\n` +
    `The user must sign out and back in (or wait up to an hour for a token refresh) before it takes effect.`
);
process.exit(0);
