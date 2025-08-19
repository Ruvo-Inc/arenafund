"use client";

import Script from "next/script";

type Props = { siteKey: string };

export default function RecaptchaScript({ siteKey }: Props) {
  // Prefer google.com; switch to www.recaptcha.net if regions block google
  const src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  return (
    <Script
      src={src}
      strategy="afterInteractive"
      onError={() => console.error("reCAPTCHA script failed to load")}
    />
  );
}

