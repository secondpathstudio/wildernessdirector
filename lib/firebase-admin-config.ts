import { initializeApp, getApps, cert } from "firebase-admin/app";
import admin from "firebase-admin";

const firebaseAdminConfig = {
  credential: cert({
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  }),
};

export function customInitApp() {
  if (getApps().length <= 0) {
    console.log('starting firebase admin')
    initializeApp(firebaseAdminConfig);
  }
}

customInitApp();

export default admin;