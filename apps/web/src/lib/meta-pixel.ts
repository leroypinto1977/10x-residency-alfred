// Browser half of the Meta tracking. The server half lives in meta-capi.ts,
// and the two are tied together by eventId.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Sends an event to the Meta pixel, if it loaded at all.
 *
 * `eventId` is not optional by accident: every event we send from here is
 * also sent from the server, and Meta only collapses the pair into one
 * conversion when both carry the same id.
 */
export function trackMetaEvent(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown> = {}
): void {
  window.fbq?.("track", eventName, customData, { eventID: eventId });
}

/** Ids only have to be unique per event, so the built-in generator will do. */
export function newMetaEventId(): string {
  return crypto.randomUUID();
}
