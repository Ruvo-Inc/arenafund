"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, googleProvider } from "@/lib/firebaseClient";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
  getIdToken,
} from "firebase/auth";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Complete email-link sign-in when the user clicks the magic link
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem("arena-email-for-signin") || "";
      const promptEmail = stored || window.prompt("Confirm your email for sign-in") || "";
      if (promptEmail) {
        setStatus("Completing sign-in…");
        signInWithEmailLink(auth, promptEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem("arena-email-for-signin");
            setStatus("Signed in via email link.");
          })
          .catch((e) => setStatus(`Email link sign-in failed: ${e.message}`));
      }
    }
  }, []);

  const sendLink = async () => {
    try {
      setStatus("Sending link…");
      await sendSignInLinkToEmail(auth, email, {
        handleCodeInApp: true,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/account`
            : "https://arenafund-web-47542144158.us-central1.run.app/account",
      });
      window.localStorage.setItem("arena-email-for-signin", email);
      setStatus("Magic link sent. Check your inbox.");
    } catch (e: any) {
      setStatus(`Failed to send link: ${e.message}`);
    }
  };

  const signInGoogle = async () => {
    try {
      setStatus("Opening Google sign-in…");
      await signInWithPopup(auth, googleProvider);
      setStatus("Signed in with Google.");
    } catch (e: any) {
      setStatus(`Google sign-in failed: ${e.message}`);
    }
  };

  const signOutAll = async () => {
    await signOut(auth);
    setStatus("Signed out.");
  };

  const copyIdToken = async () => {
    if (!user) return;
    const t = await getIdToken(user, /*forceRefresh*/ true);
    await navigator.clipboard.writeText(t);
    setStatus("ID token copied to clipboard.");
  };

  const authedEmail = useMemo(() => user?.email || "—", [user]);

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Account</h1>

      {!user && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="mt-2 rounded-lg border px-4 py-2"
              onClick={sendLink}
              disabled={!email}
            >
              Send magic link
            </button>
          </div>

          <div>
            <button className="rounded-lg border px-4 py-2" onClick={signInGoogle}>
              Sign in with Google
            </button>
          </div>
        </div>
      )}

      {user && (
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            Signed in as <span className="font-medium">{authedEmail}</span>
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg border px-4 py-2" onClick={copyIdToken}>
              Copy ID token
            </button>
            <button className="rounded-lg border px-4 py-2" onClick={signOutAll}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {status && <p className="mt-6 text-sm text-gray-600">{status}</p>}
    </main>
  );
}
