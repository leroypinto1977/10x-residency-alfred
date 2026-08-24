import { createHash } from "node:crypto";

// Meta's Conversions API — the server-side twin of the browser pixel.
//
// The pixel alone loses events: ad blockers, tracking protection and iOS mail
// privacy all stop fbevents.js from ever running. A submitted application is
// the one event worth paying for, so we report it from the server too, where
// nothing can block it. Both copies carry the same eventId and Meta keeps
// only one — see the dedup note in BookCallForm.
//
// https://developers.facebook.com/docs/marketing-api/conversions-api

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v26.0";

// Meta wants PII lowercased and trimmed before hashing, so that the same
// person hashes identically here and in an advertiser's uploaded list.
function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Phone numbers hash on digits only — no plus, spaces or punctuation — but
// they keep the country code.
function hashPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits ? createHash("sha256").update(digits).digest("hex") : "";
}

export interface MetaEventInput {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** Straight from the request — Meta matches on these unhashed. */
  clientIp?: string;
  clientUserAgent?: string;
  /** The pixel's own browser cookies, when the pixel managed to run. */
  fbp?: string;
  fbc?: string;
  customData?: Record<string, unknown>;
}

/**
 * Reports one event to Meta. Never throws: analytics must not be able to fail
 * a form submission the applicant has already completed.
 */
export async function sendMetaEvent(input: MetaEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // Unconfigured is the normal state in development, so stay quiet.
  if (!pixelId || !accessToken) return;

  const userData: Record<string, string> = {};
  if (input.email) userData.em = hash(input.email);
  if (input.phone) userData.ph = hashPhone(input.phone);
  if (input.firstName) userData.fn = hash(input.firstName);
  if (input.lastName) userData.ln = hash(input.lastName);
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: input.customData,
      },
    ],
    // Set this while watching the Test Events tab in Events Manager; leave it
    // unset in production or the events never reach the live dataset.
    ...(process.env.META_CAPI_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
      : {}),
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      // The body names the offending field, which is most of the diagnosis.
      console.error(
        `Meta CAPI ${input.eventName} rejected (${response.status}):`,
        await response.text()
      );
    }
  } catch (error) {
    console.error(`Meta CAPI ${input.eventName} failed to send:`, error);
  }
}

/** Splits "Priya Ann Menon" into the first/last name Meta expects. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts[parts.length - 1] };
}
