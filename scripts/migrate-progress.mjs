// One-time migration of fellow progress out of the embedded arrays
// (topics/{id}.userProgress and topics/{id}/objectives/{id}.completedBy)
// into per-fellow docs at users/{uid}/progress/{topicId}.
//
//   node scripts/migrate-progress.mjs [--dry-run] [--cleanup]
//
//   --dry-run   print what would be written, write nothing
//   --cleanup   after migrating, delete the legacy userProgress/completedBy
//               fields (run this only once the new code is deployed)
//
// The completedBy arrays are the source of truth for per-objective state;
// the legacy completedObjectives counters are ignored (they could drift).
// Safe to re-run: writes are merges keyed by uid+topicId.
//
// Reads FIREBASE_ADMIN_* from the environment, falling back to .env.local.
import { existsSync, readFileSync } from "node:fs";
import admin from "firebase-admin";

const dryRun = process.argv.includes("--dry-run");
const cleanup = process.argv.includes("--cleanup");

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

const db = admin.firestore();

// uid -> display name fallback from the users collection
const userNames = new Map();
for (const userDoc of (await db.collection("users").get()).docs) {
  const name = userDoc.data().name;
  if (name) userNames.set(userDoc.id, name);
}

const topics = await db.collection("topics").get();
let docsWritten = 0;

for (const topic of topics.docs) {
  const objectives = await topic.ref.collection("objectives").get();

  // uid -> { userName, completed: { objectiveId: { completedAt, ... } }, lastUpdated }
  const perUser = new Map();
  const entryFor = (uid) => {
    if (!perUser.has(uid)) {
      perUser.set(uid, {
        userName: userNames.get(uid) ?? null,
        completed: {},
        lastUpdated: null,
      });
    }
    return perUser.get(uid);
  };

  for (const objective of objectives.docs) {
    for (const completion of objective.data().completedBy ?? []) {
      if (!completion.userId) continue;
      const entry = entryFor(completion.userId);
      if (completion.userName && !entry.userName) entry.userName = completion.userName;
      const completedAt = completion.completedAt ?? admin.firestore.Timestamp.now();
      entry.completed[objective.id] = { completedAt };
      if (!entry.lastUpdated || completedAt.toMillis() > entry.lastUpdated.toMillis()) {
        entry.lastUpdated = completedAt;
      }
    }
  }

  // Pick up users who appear only in the topic-level array (e.g. counter
  // written but completedBy write failed) so they at least get a doc; their
  // per-objective state is unrecoverable and the count may shrink.
  for (const legacy of topic.data().userProgress ?? []) {
    if (!legacy.userId) continue;
    const entry = entryFor(legacy.userId);
    if (legacy.userName && !entry.userName) entry.userName = legacy.userName;
    if (legacy.completedObjectives > Object.keys(entry.completed).length) {
      console.warn(
        `  WARN topic ${topic.id} user ${legacy.userId}: legacy counter says ` +
          `${legacy.completedObjectives} completed but completedBy arrays only ` +
          `show ${Object.keys(entry.completed).length}; using completedBy.`
      );
    }
  }

  console.log(`topic ${topic.id} (${topic.data().topicName ?? "?"}): ${perUser.size} user(s)`);

  for (const [uid, entry] of perUser) {
    const count = Object.keys(entry.completed).length;
    console.log(`  users/${uid}/progress/${topic.id}: ${count} completed objective(s)`);
    if (dryRun) continue;
    await db.doc(`users/${uid}/progress/${topic.id}`).set(
      {
        userId: uid,
        userName: entry.userName,
        topicId: topic.id,
        completed: entry.completed,
        lastUpdated: entry.lastUpdated ?? admin.firestore.Timestamp.now(),
      },
      { merge: true }
    );
    docsWritten += 1;
  }

  if (cleanup && !dryRun) {
    await topic.ref.update({ userProgress: admin.firestore.FieldValue.delete() });
    for (const objective of objectives.docs) {
      await objective.ref.update({ completedBy: admin.firestore.FieldValue.delete() });
    }
    console.log(`  cleaned legacy fields on topic ${topic.id}`);
  }
}

console.log(
  dryRun
    ? "Dry run complete — nothing written."
    : `Migration complete: ${docsWritten} progress doc(s) written.` +
        (cleanup ? " Legacy fields removed." : " Legacy fields left in place (re-run with --cleanup to remove).")
);
process.exit(0);
