"use client";

import { useState, useEffect } from "react";
import type { Auth, User } from "firebase/auth";

export default function AssessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string>("");
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    import("@/lib/firebase-client").then((mod) => {
      setFirebaseAuth(mod.auth);
    });
  }, []);

  async function handleSignIn() {
    if (!firebaseAuth) return;
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      setUser(result.user);
      setStatus("Signed in. Assessment flow coming soon.");
    } catch (err) {
      setStatus(`Sign-in failed: ${(err as Error).message}`);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Assessment</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Sign in to take an assessment. The LLM judge will evaluate your answers
        against a software engineering hiring rubric.
      </p>

      {!user ? (
        <button
          onClick={handleSignIn}
          disabled={!firebaseAuth}
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <p className="font-medium">Welcome, {user.displayName}</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            Assessment UI will render here — topic selection, question display,
            answer input, and judge feedback.
          </p>
        </div>
      )}

      {status && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{status}</p>
      )}
    </div>
  );
}
