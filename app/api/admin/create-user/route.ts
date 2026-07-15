import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import admin from "@/lib/firebase-admin-config";
import { requireAdmin, VALID_ROLES } from "@/lib/admin-api";

export const runtime = "nodejs";

// Provisions a fellow (or other role) ahead of their first login: creates the
// auth account with a temporary password, sets the role custom claim, and
// creates their users doc. Admin-only.
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return guard.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const { email, password, name = "", role = "fellow" } = body ?? {};
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "role must be free, fellow, or admin" },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await admin.auth().createUser({
      email,
      password,
      displayName: typeof name === "string" ? name : "",
    });
  } catch (err: any) {
    if (err?.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }
    console.error("create-user failed", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  try {
    await admin.auth().setCustomUserClaims(user.uid, { role });
    await admin.firestore().doc(`users/${user.uid}`).set({
      email,
      name: typeof name === "string" ? name : "",
      role,
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    // auth account exists but provisioning didn't finish; surface it clearly
    console.error("create-user post-provisioning failed", err);
    return NextResponse.json(
      { error: "User created but role/profile setup failed — set their role again from the admin page" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, uid: user.uid, email, role });
}
