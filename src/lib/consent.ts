// src/lib/consent.ts
export type ConsentState = "granted" | "denied";

/**
 * Local, simple consent store. If you later adopt a CMP, map it here.
 */
const KEY = "arena-consent";

type Listener = (c: ConsentState) => void;
const listeners = new Set<Listener>();

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "denied";
  const v = window.localStorage.getItem(KEY);
  return v === "granted" || v === "denied" ? v : "denied";
}

export function setConsent(state: ConsentState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, state);
  listeners.forEach((fn) => fn(state));
}

export function onConsentChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
