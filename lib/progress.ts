import {
  Firestore,
  Timestamp,
  deleteField,
  doc,
  setDoc,
} from "firebase/firestore";

// Per-fellow progress lives in users/{uid}/progress/{topicId} — one doc per
// fellow per topic, owned by that fellow. Objective completion is a map keyed
// by objective id; counts are always derived from the map so they can't drift.

export interface ObjectiveCompletion {
  completedAt: Timestamp;
  // uid of the admin who marked it, for Skills sign-offs
  signedOffBy?: string;
}

export interface TopicProgress {
  userId: string;
  userName?: string | null;
  topicId: string;
  completed?: Record<string, ObjectiveCompletion>;
  lastUpdated: Timestamp;
}

export function progressDocRef(
  firestore: Firestore,
  userId: string,
  topicId: string
) {
  return doc(firestore, "users", userId, "progress", topicId);
}

export function getCompletion(
  progress: TopicProgress | undefined,
  objectiveId: string
): ObjectiveCompletion | undefined {
  return progress?.completed?.[objectiveId];
}

export function completedObjectiveCount(
  progress: TopicProgress | undefined
): number {
  return Object.keys(progress?.completed ?? {}).length;
}

export async function setObjectiveCompletion(
  firestore: Firestore,
  opts: {
    userId: string;
    topicId: string;
    objectiveId: string;
    completed: boolean;
    userName?: string | null;
    signedOffBy?: string;
  }
) {
  await setDoc(
    progressDocRef(firestore, opts.userId, opts.topicId),
    {
      userId: opts.userId,
      topicId: opts.topicId,
      ...(opts.userName !== undefined && { userName: opts.userName }),
      completed: {
        [opts.objectiveId]: opts.completed
          ? {
              completedAt: Timestamp.now(),
              ...(opts.signedOffBy && { signedOffBy: opts.signedOffBy }),
            }
          : deleteField(),
      },
      lastUpdated: Timestamp.now(),
    },
    { merge: true }
  );
}
