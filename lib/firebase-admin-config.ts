import { initializeApp, getApps, cert } from "firebase-admin/app";
import admin from "firebase-admin";

// Init is lazy (called by API routes, not at import) so builds and pages that
// never touch the Admin SDK don't require the service account env vars.
export function customInitApp() {
  if (getApps().length <= 0) {
    initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Vercel/dotenv store the key with literal \n sequences
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      }),
    });
  }
}

export default admin;
