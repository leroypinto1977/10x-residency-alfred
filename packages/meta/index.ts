/**
 * Meta's Conversions API — the server-side twin of the browser pixel.
 *
 * Shared by both apps because the same dataset now hears from both of them:
 *
 *   - the landing site reports the form submission itself ("website" events,
 *     paired with the browser pixel by eventId);
 *   - the admin panel reports what happened to that lead afterwards
 *     ("system_generated" CRM events — contacted, call done, won, lost).
 *
 * The second half is the point of the integration. A pixel on its own tells
 * Meta that a form was filled in, and Meta happily buys more of whoever fills
 * in forms. Reporting the stages back tells it which of those people were
 * worth having, which is a different and much better instruction.
 *
 * The panel's pages are NOT pixelled, and must not be: fbevents.js on an
 * internal tool would count staff as visitors, drop them into retargeting
 * audiences, and hand Meta the URLs of a screen full of applicants' phone
 * numbers and incomes. The CRM half of this integration is server-to-server
 * for exactly that reason.
 *
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 * https://developers.facebook.com/docs/marketing-api/conversions-api/conversion-leads-integration
 */

import { createHash } from "node:crypto";

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v26.0";

/** Meta gives up on a request long before we should still be holding a form open. */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Where the conversion happened, in Meta's vocabulary.
 *
 * "website" is a browser doing something. "system_generated" is what Meta
 * asks for when the event comes out of a CRM rather than off a page — nobody
 * clicked anything, our team moved a card.
 */
export type ActionSource = "website" | "system_generated";

/** Names the CRM in Events Manager, so these events are attributable to it. */
const LEAD_EVENT_SOURCE = "Founder 10X admin";

/**
 * The dataset (formerly "pixel") id everything is reported against.
 *
 * Both halves must land on the same one or Meta cannot join a website Lead to
 * the CRM stages that follow it. The site already exposes it to the browser;
 * the admin panel has no NEXT_PUBLIC_ anything, so it sets META_DATASET_ID.
 */
function datasetId(): string | undefined {
  return process.env.META_DATASET_ID ?? process.env.NEXT_PUBLIC_FB_PIXEL_ID;
}

/** True when there is enough configuration to report anything at all. */
export function isMetaConfigured(): boolean {
  return Boolean(datasetId() && process.env.META_CAPI_ACCESS_TOKEN);
}

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
  /** Defaults to "website"; CRM stage reports pass "system_generated". */
  actionSource?: ActionSource;
  /** Required for website events, meaningless for system-generated ones. */
  eventSourceUrl?: string;
  /** Defaults to now. CRM events may be reported a little after the fact. */
  eventTime?: Date;
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

export interface MetaEventResult {
  ok: boolean;
  /** Short enough to store beside the lead, for when something is misconfigured. */
  detail?: string;
}

/**
 * Reports one event to Meta. Never throws: analytics must not be able to fail
 * a form submission the applicant has already completed, nor a status change
 * the team has already made.
 *
 * The result is returned rather than swallowed so the CRM can remember whether
 * a stage actually landed and try it again later if it did not.
 */
export async function sendMetaEvent(input: MetaEventInput): Promise<MetaEventResult> {
  const pixelId = datasetId();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // Unconfigured is the normal state in development, so stay quiet.
  if (!pixelId || !accessToken) return { ok: false, detail: "not configured" };

  const actionSource = input.actionSource ?? "website";

  const userData: Record<string, string> = {};
  if (input.email) userData.em = hash(input.email);
  if (input.phone) userData.ph = hashPhone(input.phone);
  if (input.firstName) userData.fn = hash(input.firstName);
  if (input.lastName) userData.ln = hash(input.lastName);
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
  // Kept unhashed on purpose: these two are Meta's own identifiers, and
  // hashing them would simply make them unmatchable.
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const customData =
    actionSource === "system_generated"
      ? // Both fields are what mark the event as coming from a CRM rather than
        // from a page; Events Manager groups the lead stages by them.
        { lead_event_source: LEAD_EVENT_SOURCE, event_source: "crm", ...input.customData }
      : input.customData;

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor((input.eventTime ?? new Date()).getTime() / 1000),
        event_id: input.eventId,
        // Meta rejects a website event without a source URL and ignores one on
        // a system-generated event, so it is sent only where it belongs.
        ...(actionSource === "website" && input.eventSourceUrl
          ? { event_source_url: input.eventSourceUrl }
          : {}),
        action_source: actionSource,
        user_data: userData,
        ...(customData ? { custom_data: customData } : {}),
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
        // Without this a stalled connection to Meta becomes a stalled form
        // submission or a stalled status change.
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      // The body names the offending field, which is most of the diagnosis.
      const body = await response.text();
      console.error(`Meta CAPI ${input.eventName} rejected (${response.status}):`, body);
      return { ok: false, detail: `${response.status}: ${body.slice(0, 300)}` };
    }

    return { ok: true };
  } catch (error) {
    console.error(`Meta CAPI ${input.eventName} failed to send:`, error);
    return { ok: false, detail: String(error).slice(0, 300) };
  }
}

/** Splits "Priya Ann Menon" into the first/last name Meta expects. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts[parts.length - 1] };
}

/**
 * Builds the _fbc value the pixel would have written, from the fbclid Meta
 * put on the landing URL.
 *
 * Worth doing because the case this covers is precisely the case the
 * Conversions API exists for: when an ad blocker stops fbevents.js, no _fbc
 * cookie is ever set, and the click that paid for the lead goes unattributed
 * unless we reconstruct it. The "1" is the subdomain index — the cookie the
 * pixel writes lives on the registrable domain.
 *
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 */
export function fbcFromClickId(fbclid: string, clickedAt: Date = new Date()): string {
  return `fb.1.${clickedAt.getTime()}.${fbclid}`;
}
