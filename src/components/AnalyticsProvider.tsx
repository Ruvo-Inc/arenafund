// src/components/AnalyticsProvider.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getConsent, onConsentChange } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const search = useSearchParams();

  // Sync consent into gtag on mount and whenever user changes it.
  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;

    const apply = (state: "granted" | "denied") => {
      window.gtag("consent", "update", {
        ad_user_data: state,
        ad_personalization: state,
        ad_storage: state,
        analytics_storage: state,
        functionality_storage: "granted",
        security_storage: "granted",
      });
    };

    // initial
    apply(getConsent());
    // subscribe
    const off = onConsentChange(apply);
    return () => {
      if (off) off();
    };
  }, []);

  // Pageview on route change
  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;

    const url = pathname + (search?.toString() ? `?${search.toString()}` : "");
    window.gtag("event", "page_view", {
      page_location: window.location.origin + url,
      page_path: pathname || "/",
      page_title: document.title,
    });
  }, [pathname, search]);

  return null;
}
