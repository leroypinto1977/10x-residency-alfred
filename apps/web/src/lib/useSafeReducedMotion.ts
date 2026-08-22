"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * matchMedia is unavailable during SSR and can resolve synchronously on the
 * client, so branching render output directly on it causes a hydration
 * mismatch. useSyncExternalStore guarantees the server snapshot is used for
 * both the SSR pass and the client's hydration pass, then re-renders with the
 * real value right after — no mismatch, and it stays in sync if the user
 * flips the OS setting later.
 */
export function useSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
