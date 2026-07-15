import { NextRequest, NextResponse } from "next/server";
import admin, { customInitApp } from "@/lib/firebase-admin-config";

export const VALID_ROLES = ["free", "fellow", "admin"] as const;
export type Role = (typeof VALID_ROLES)[number];

// Shared guard for admin-only API routes: checks server config, verifies the
// caller's ID token, and requires the 'admin' custom claim. Returns the
// decoded caller token, or a NextResponse to send back as-is.
export async function requireAdmin(
  request: NextRequest
): Promise<{ caller: admin.auth.DecodedIdToken } | { error: NextResponse }> {
  if (
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    !process.env.FIREBASE_ADMIN_PROJECT_ID
  ) {
    return {
      error: NextResponse.json(
        { error: "Server is missing FIREBASE_ADMIN_* configuration" },
        { status: 500 }
      ),
    };
  }
  customInitApp();

  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return {
      error: NextResponse.json(
        { error: "Missing Authorization: Bearer <idToken> header" },
        { status: 401 }
      ),
    };
  }

  let caller;
  try {
    caller = await admin.auth().verifyIdToken(idToken);
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  if (caller.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Admin privileges required" }, { status: 403 }),
    };
  }

  return { caller };
}
