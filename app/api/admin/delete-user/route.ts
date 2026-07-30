import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase-admin-config";
import { requireAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";

// Permanently deletes a user: their auth account and their users/{uid} doc
// including subcollections (progress, quizAttempts). Authored content
// (questions, field reports) is intentionally kept — approved questions
// stay in the shared quiz bank with the authorName still on them.
// Admin-only; admins cannot delete themselves.
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const { uid } = body ?? {};
  if (typeof uid !== "string" || uid === "") {
    return NextResponse.json({ error: "uid is required" }, { status: 400 });
  }
  if (uid === guard.caller.uid) {
    return NextResponse.json(
      { error: "You can't delete your own account" },
      { status: 400 }
    );
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (err: any) {
    // doc cleanup should still run if the auth account is already gone
    if (err?.code !== "auth/user-not-found") {
      console.error("delete-user auth deletion failed", err);
      return NextResponse.json({ error: "Failed to delete auth account" }, { status: 500 });
    }
  }

  try {
    const firestore = admin.firestore();
    await firestore.recursiveDelete(firestore.doc(`users/${uid}`));
  } catch (err) {
    console.error("delete-user doc cleanup failed", err);
    return NextResponse.json(
      { error: "Auth account deleted but Firestore cleanup failed — remove users/" + uid + " manually" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, uid });
}
