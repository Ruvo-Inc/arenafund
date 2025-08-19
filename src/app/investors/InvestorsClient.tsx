// src/app/investors/InvestorsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { track } from "@/lib/analytics";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ----- Types -----
type RaiseStatus = "draft" | "open" | "closed";

interface RaiseDoc {
  id: string;
  title: string;
  subtitle?: string;
  status: RaiseStatus;
  spvOpen: boolean;
  spvExternalUrl: string | null;
  cfOpen: boolean;
  cfExternalUrl: string | null;
  minCheck?: number;
  maxCheck?: number;
  allocationUsd?: number;
  closesAt?: Timestamp;
  tags?: string[];
  highlights?: string[];
}

type Accreditation = "yes" | "no" | "unsure";
type ContentType = "application/pdf" | "image/png" | "image/jpeg";

interface DocItem {
  path: string;
  contentType: ContentType;
  label?: string;
}

interface Profile {
  name?: string;
  location?: string;
  accreditation?: Accreditation;
  documents?: DocItem[];
}

const db = getFirestore();

// Minimal completeness for CTA gating: name, location, accreditation is yes or no
function isMinimalComplete(p: Profile | null | undefined): boolean {
  if (!p) return false;
  const hasName = typeof p.name === "string" && p.name.trim().length > 1;
  const hasLoc = typeof p.location === "string" && p.location.trim().length > 1;
  const accKnown = p.accreditation === "yes" || p.accreditation === "no";
  return hasName && hasLoc && accKnown;
}

// Separate doc presence for banner nudging
function hasAtLeastOneDoc(p: Profile | null | undefined): boolean {
  return Array.isArray(p?.documents) && p!.documents!.length > 0;
}

export default function InvestorsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [raise, setRaise] = useState<RaiseDoc | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load raise (query contract: try "open" ordered by closesAt asc, fallback to raises/current)
  useEffect(() => {
    let cancelled = false;
    async function loadRaise() {
      try {
        const q = query(
          collection(db, "raises"),
          where("status", "==", "open"),
          orderBy("closesAt", "asc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          if (!snap.empty) {
            const d = snap.docs[0];
            setRaise({ id: d.id, ...(d.data() as Omit<RaiseDoc, "id">) });
            return;
          }
          const cur = await getDoc(doc(db, "raises", "current"));
          if (cur.exists()) {
            setRaise({ id: cur.id, ...(cur.data() as Omit<RaiseDoc, "id">) });
          } else {
            setRaise(null);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setStatus(`Failed to load raise: ${msg}`);
          setRaise(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRaise();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profile
  useEffect(() => {
    let cancelled = false;
    async function loadProfile(uid: string) {
      try {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (!cancelled) {
          setProfile(snap.exists() ? (snap.data() as Profile) : null);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setStatus(`Failed to load profile: ${msg}`);
          setProfile(null);
        }
      }
    }
    if (user?.uid) loadProfile(user.uid);
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Derived state
  const minimalComplete = useMemo(() => isMinimalComplete(profile), [profile]);
  const docPresent = useMemo(() => hasAtLeastOneDoc(profile), [profile]);
  const showBanner = useMemo(() => !minimalComplete || !docPresent, [minimalComplete, docPresent]);
  const accredited = useMemo(() => profile?.accreditation === "yes", [profile?.accreditation]);
  const email = useMemo(() => user?.email ?? "", [user?.email]);

  // CTA reasons
  const spvDisabledReason = useMemo(() => {
    if (!raise?.spvOpen) return "SPV window is closed.";
    if (!minimalComplete) return "Complete profile to access SPV.";
    if (!accredited) return "SPV available to accredited investors only.";
    if (!raise.spvExternalUrl) return "SPV link is not yet available.";
    return "";
  }, [raise?.spvOpen, minimalComplete, accredited, raise?.spvExternalUrl]);

  const cfDisabledReason = useMemo(() => {
    if (!raise?.cfOpen) return "Reg CF window is closed.";
    if (!minimalComplete) return "Complete profile to access Reg CF.";
    if (!raise.cfExternalUrl) return "Reg CF link is not yet available.";
    return "";
  }, [raise?.cfOpen, minimalComplete, raise?.cfExternalUrl]);

  async function joinWaitlist() {
    if (!user || !raise) return;
    setSaving(true);
    setStatus("Recording your interest…");
    try {
      await setDoc(
        doc(db, "raises", raise.id, "interest", user.uid),
        {
          uid: user.uid,
          email,
          profileComplete: minimalComplete,
          accredited,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus("Thanks. You’re on the list for this raise.");

      // Analytics
      track("invest_waitlist", {
        raise_id: raise.id,
        accredited,
        profile_complete: minimalComplete,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`Could not record interest: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Render states
  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mobile-content-container py-12 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 mb-8 bg-gray-100 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Investment access</span>
            </div>
            <h1 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Investors
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Please sign in to view the current raise and investment opportunities.
            </p>
            <a 
              href="/account" 
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md touch-target"
            >
              Sign in to continue
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mobile-content-container py-12 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 mb-8 bg-gray-100 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Loading investment data</span>
            </div>
            <h1 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Investors
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mobile-content-container py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 mb-8 bg-gray-100 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Investment opportunities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            For Investors
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Access curated B2B AI deals with buyer validation and operator support.
          </p>
        </div>

        {showBanner && (
          <div className="mb-6 sm:mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Complete your profile to unlock investment access</h3>
            <p className="text-blue-700 mb-4 text-sm sm:text-base">Add your name, location, accreditation status, and supporting documents.</p>
            <a 
              href="/profile" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 touch-target"
            >
              Complete Profile
            </a>
          </div>
        )}

        {!raise ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gray-50 rounded-xl p-8 sm:p-12 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">No active raise</h3>
              <p className="text-gray-600">Check back soon for new investment opportunities.</p>
            </div>
          </div>
        ) : (
          <section className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 mb-4 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Current Raise</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{raise.title}</h2>
              {raise.subtitle ? <p className="text-gray-600 text-lg">{raise.subtitle}</p> : null}
            </div>

            <div className="mobile-content-grid cols-4 mb-6 sm:mb-8">
              {typeof raise.minCheck === "number" ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Min Check</div>
                  <div className="text-xl font-bold">${raise.minCheck.toLocaleString()}</div>
                </div>
              ) : null}
              {typeof raise.maxCheck === "number" ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Max Check</div>
                  <div className="text-xl font-bold">${raise.maxCheck.toLocaleString()}</div>
                </div>
              ) : null}
              {typeof raise.allocationUsd === "number" ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Allocation</div>
                  <div className="text-xl font-bold">${raise.allocationUsd.toLocaleString()}</div>
                </div>
              ) : null}
              {raise.closesAt ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Closes</div>
                  <div className="text-xl font-bold">{raise.closesAt.toDate().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
                </div>
              ) : null}
            </div>

            {Array.isArray(raise.tags) && raise.tags.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {raise.tags.map((t) => (
                    <span key={t} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{t}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(raise.highlights) && raise.highlights.length > 0 ? (
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Key Highlights</h4>
                <div className="space-y-3">
                  {raise.highlights.map((h, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-lg font-semibold mb-6">Investment Options</h4>
              <div className="mobile-content-grid cols-3 gap-4">
                {/* SPV CTA */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h5 className="font-semibold mb-2">SPV Investment</h5>
                  <p className="text-sm text-gray-600 mb-4">For accredited investors</p>
                  <a
                    href={spvDisabledReason ? "#" : (raise.spvExternalUrl || "#")}
                    target={spvDisabledReason ? undefined : "_blank"}
                    rel={spvDisabledReason ? undefined : "noopener noreferrer"}
                    className={`block w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      spvDisabledReason 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md"
                    }`}
                    aria-disabled={!!spvDisabledReason}
                    aria-label="Invest via SPV"
                    onClick={() => {
                      if (!spvDisabledReason && raise?.spvExternalUrl) {
                        track("invest_spv_click", {
                          raise_id: raise.id,
                          min_check: typeof raise.minCheck === "number" ? raise.minCheck : 0,
                        });
                      }
                    }}
                  >
                    Invest via SPV
                  </a>
                  {spvDisabledReason ? <p className="text-xs text-gray-500 mt-2">{spvDisabledReason}</p> : null}
                </div>

                {/* Reg CF CTA */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h5 className="font-semibold mb-2">Reg CF Investment</h5>
                  <p className="text-sm text-gray-600 mb-4">For community investors</p>
                  <a
                    href={cfDisabledReason ? "#" : (raise.cfExternalUrl || "#")}
                    target={cfDisabledReason ? undefined : "_blank"}
                    rel={cfDisabledReason ? undefined : "noopener noreferrer"}
                    className={`block w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      cfDisabledReason 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                    }`}
                    aria-disabled={!!cfDisabledReason}
                    aria-label="Invest via Reg CF"
                    onClick={() => {
                      if (!cfDisabledReason && raise?.cfExternalUrl) {
                        track("invest_cf_click", { raise_id: raise.id });
                      }
                    }}
                  >
                    Invest via Reg CF
                  </a>
                  {cfDisabledReason ? <p className="text-xs text-gray-500 mt-2">{cfDisabledReason}</p> : null}
                </div>

                {/* Waitlist CTA */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h5 className="font-semibold mb-2">Join Waitlist</h5>
                  <p className="text-sm text-gray-600 mb-4">Get notified of updates</p>
                  <button
                    type="button"
                    onClick={joinWaitlist}
                    disabled={saving || !raise}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {saving ? "Joining..." : "Join Waitlist"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {status ? (
          <div className="mt-8 text-center">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
              <p className="text-blue-800 font-medium">{status}</p>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
