// src/components/ConsentBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent, ConsentState } from "@/lib/consent";

export default function ConsentBanner() {
  const [ready, setReady] = useState(false);
  const [consent, setLocal] = useState<ConsentState>("denied");

  useEffect(() => {
    setLocal(getConsent());
    setReady(true);
  }, []);

  if (!ready || consent === "granted") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur px-4 py-3 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-800">
          We use analytics to improve the site. No ads. You control your data.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm"
            onClick={() => {
              setConsent("denied");
              setLocal("denied");
            }}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded-md border bg-gray-900 px-3 py-1.5 text-sm text-white"
            onClick={() => {
              setConsent("granted");
              setLocal("granted");
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
