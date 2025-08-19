// src/app/profile/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { track } from "@/lib/analytics";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';

type Accreditation = 'yes' | 'no' | 'unsure';
type ContentType = 'application/pdf' | 'image/png' | 'image/jpeg';
type FsTime = Timestamp | FieldValue;

type DocItem = {
  path: string;
  contentType: ContentType;
  label?: string;
  uploadedAt?: FsTime;
};

type Profile = {
  name?: string;
  location?: string;
  accreditation?: Accreditation;
  documents?: DocItem[];
  createdAt?: FsTime;
  updatedAt?: FsTime;
};

const db = getFirestore();

const MAX_MB = 15;
const ALLOWED_TYPES = new Set<ContentType>([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

function isAccreditation(x: unknown): x is Accreditation {
  return x === 'yes' || x === 'no' || x === 'unsure';
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>('');

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [accreditation, setAccreditation] = useState<Accreditation>('unsure');
  const [documents, setDocuments] = useState<DocItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load existing profile
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'profiles', user.uid);
        const snap = await getDoc(ref);
        if (!cancelled && snap.exists()) {
          const data = snap.data();

          setName(typeof data.name === 'string' ? data.name : '');
          setLocation(typeof data.location === 'string' ? data.location : '');

          const acc = data.accreditation;
          setAccreditation(isAccreditation(acc) ? acc : 'unsure');

          const docs = Array.isArray(data.documents)
            ? data.documents
                .filter(
                  (d: unknown) =>
                    typeof d === 'object' &&
                    d !== null &&
                    typeof (d as { path?: unknown }).path === 'string' &&
                    ALLOWED_TYPES.has(
                      (d as { contentType?: unknown }).contentType as ContentType
                    )
                )
                .map((d) => d as DocItem)
            : [];
          setDocuments(docs);
        }
      } catch (e) {
        setStatus(`Failed to load profile: ${errMsg(e)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const authedEmail = useMemo(() => user?.email || '—', [user]);

  function removeDoc(idx: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onPickFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;

    const typeOk = ALLOWED_TYPES.has(f.type as ContentType);
    if (!typeOk) {
      setStatus('Only PDF, PNG, or JPEG allowed.');
      ev.target.value = '';
      return;
    }
    const sizeOk = f.size <= MAX_MB * 1024 * 1024;
    if (!sizeOk) {
      setStatus(`Max ${MAX_MB} MB.`);
      ev.target.value = '';
      return;
    }

    setStatus('Requesting upload URL…');
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: f.name, contentType: f.type }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`upload-url failed: ${t}`);
      }
      const { url, objectPath } = (await res.json()) as { url: string; objectPath: string };

      setStatus('Uploading file…');
      const put = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': f.type },
        body: f,
      });
      if (!put.ok) {
        const t = await put.text();
        throw new Error(`upload PUT failed: ${t}`);
      }

      setDocuments((prev) => [
        ...prev,
        { path: objectPath, contentType: f.type as ContentType, uploadedAt: serverTimestamp() },
      ]);
      setStatus('File uploaded. Remember to Save Profile.');

      // Analytics after successful upload
      track("profile_upload_success", { content_type: f.type, size_bytes: f.size });
    } catch (e) {
      setStatus(`Upload failed: ${errMsg(e)}`);
    } finally {
      ev.target.value = '';
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setStatus('Saving…');
    try {
      const ref = doc(db, 'profiles', user.uid);
      const payload: Profile = {
        name: name.trim(),
        location: location.trim(),
        accreditation,
        documents,
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, { ...payload, createdAt: serverTimestamp() }, { merge: true });
      setStatus('Profile saved.');

      // Analytics after successful save
      track("profile_save", { has_docs: Number(documents.length > 0), accreditation });
    } catch (e) {
      setStatus(`Save failed: ${errMsg(e)}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <main className="min-h-screen bg-white">
          <div className="max-w-2xl mx-auto px-6 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                Investor Profile
              </div>
              <h1 className="mb-3">
                Complete Your Profile
              </h1>
              <p className="text-gray-600 mb-4">
                Help us understand your investment preferences and eligibility
              </p>
              <div className="inline-flex items-center text-sm text-gray-500">
                Signed in as <span className="font-medium ml-1">{authedEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Progress Banner */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Complete your profile</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Add your name, location, accreditation status, and supporting documents to access investment opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                    Full name *
                  </label>
                  <input
                    id="name"
                    className="w-full min-h-[48px] rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full legal name"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Use your legal name as it appears on official documents
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="loc">
                    Location *
                  </label>
                  <input
                    id="loc"
                    className="w-full min-h-[48px] rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State/Country"
                    maxLength={120}
                    autoComplete="address-level2"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Your primary residence or business location
                  </p>
                </div>

                {/* Accreditation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="acc">
                    Accredited investor status *
                  </label>
                  <select
                    id="acc"
                    className="w-full min-h-[48px] rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value as Accreditation)}
                  >
                    <option value="unsure">I'm not sure</option>
                    <option value="yes">Yes, I am an accredited investor</option>
                    <option value="no">No, I am not an accredited investor</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    This helps us route you to the appropriate investment opportunities and onboarding process.
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload documents that support your investor status (optional but recommended).
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  className="hidden"
                  onChange={onPickFile}
                />
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload PDF, PNG, or JPEG
                </button>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</h3>
                    <ul className="space-y-3">
                      {documents.map((d, i) => (
                        <li
                          key={`${d.path}-${i}`}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{d.path}</p>
                              <p className="text-sm text-gray-500">{d.contentType}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            onClick={() => removeDoc(i)}
                            aria-label={`Remove ${d.path}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {documents.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Section */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Save your profile</h3>
                  <p className="text-sm text-gray-500">Your information will be securely stored and encrypted.</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
              {status && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  status.includes('saved') || status.includes('uploaded') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : status.includes('failed') || status.includes('Failed')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
