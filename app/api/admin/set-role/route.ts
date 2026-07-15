import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase-admin-config";
import { requireAdmin, VALID_ROLES } from "@/lib/admin-api";

export const runtime = "nodejs";

// Sets a user's role as a custom auth claim (the source of truth checked by
// the Firestore/Storage rules) and mirrors it onto their users doc for
// display. Admin-only. The new role takes effect when the target user's ID
// token refreshes (next sign-in, or within ~1 hour).
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;
  const { caller } = guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const { uid, role } = body ?? {};
  if (typeof uid !== "string" || uid.length === 0 || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Body must include uid (string) and role (free | fellow | admin)" },
      { status: 400 }
    );
  }

  if (uid === caller.uid && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    await admin.firestore().doc(`users/${uid}`).set({ role }, { merge: true });
  } catch (err) {
    console.error("set-role failed", err);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, uid, role });
}
