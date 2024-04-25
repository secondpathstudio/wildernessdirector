"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  StorageProvider,
  useFirebaseApp,
} from "reactfire";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isBrowser } from "@/lib/utils";
import { getAnalytics } from "firebase/analytics";
import { FirebaseOptions } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNsAaANv4Fp2yuOtKK3QuwLTqc5E_zIb8",
  authDomain: "wildernessdirector-755c1.firebaseapp.com",
  projectId: "wildernessdirector-755c1",
  storageBucket: "wildernessdirector-755c1.appspot.com",
  messagingSenderId: "777528754167",
  appId: "1:777528754167:web:1b65fc91235ce948e938f2",
  measurementId: "G-K9BFBXEWLQ"
};

const FirebaseProviderSDKs: FC<{ children: ReactNode }> = ({ children }) => {
  const firebase = useFirebaseApp();
  // we have to use getters to pass to providers, children should use hooks
  const auth = useMemo(() => getAuth(), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const storage = useMemo(() => getStorage(firebase), []);
  const analytics = useMemo(() => isBrowser() && getAnalytics(firebase), []);

  return (
    <>
      {auth && (
        <AuthProvider sdk={auth}>
          <FirestoreProvider sdk={firestore}>
            <StorageProvider sdk={storage}>
            {/* we can only use analytics in the browser */}
            {analytics ? (
              <AnalyticsProvider sdk={analytics}>{children}</AnalyticsProvider>
            ) : (
              <>{children}</>
            )}
            </StorageProvider>
          </FirestoreProvider>
        </AuthProvider>
      )}
    </>
  );
};

export const MyFirebaseProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <FirebaseProviderSDKs>{children}</FirebaseProviderSDKs>
      </FirebaseAppProvider>
    </>
  );
};
