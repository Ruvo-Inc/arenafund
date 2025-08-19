// src/lib/analytics.ts
type EventName =
  | "auth_signin_google"
  | "auth_signout"
  | "account_magiclink_sent"
  | "profile_save"
  | "profile_upload_success"
  | "invest_spv_click"
  | "invest_cf_click"
  | "invest_waitlist";

type Params = Record<string, string | number | boolean | null | undefined>;

export function track(event: EventName, params?: Params) {
  if (typeof window === "undefined") return;
  // If GA not loaded or consent denied, this will no-op.
  const g = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!g) return;
  try {
    g("event", event, params || {});
  } catch {
    // swallow
  }
}
