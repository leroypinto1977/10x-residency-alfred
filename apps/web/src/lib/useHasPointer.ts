"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/**
 * True on the server, because the CSS that pairs with this defaults to the
 * pointer branch and only swaps under `(hover: none)`. Matching that default
 * keeps the server's markup and the first painted styles telling the same
 * story.
 */
function getServerSnapshot() {
  return true;
}

/**
 * Whether the device has a hovering pointer.
 *
 * Distinct from `useIsMobile`, and the distinction matters: width decides how
 * many columns fit, but whether a photograph is worth opening depends on
 * there being a cursor to inspect it with. Keying both off width put a narrow
 * desktop window in a state where the copy offered to open a frame and the
 * tiles were not openable — the same mismatch in the other direction.
 */
export function useHasPointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
