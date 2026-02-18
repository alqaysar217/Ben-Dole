'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // Catch errors to prevent runtime crashes if network is unstable
  signInAnonymously(authInstance).catch((err) => {
    if (err.code === 'auth/network-request-failed') {
      console.warn("Firebase Auth: Network request failed. Retrying may be needed.");
    } else {
      console.error("Firebase Auth: Anonymous sign-in failed:", err);
    }
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((err) => {
    console.error("Firebase Auth: Email sign-up failed:", err);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((err) => {
    console.error("Firebase Auth: Email sign-in failed:", err);
  });
}
