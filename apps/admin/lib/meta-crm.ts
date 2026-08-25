/**
 * Reporting lead stages back to Meta.
 *
 * This is the half of the integration that actually changes what the ads buy.
 * The pixel on the landing site tells Meta "a form was submitted", and Meta
 * obligingly goes and finds more people who submit forms. Sending the stages
 * back — contacted, call done, won — tells it which of those submissions were
 * worth having, and it optimises towards those people instead.
 *
 * Server-to-server, out of the panel's server actions. There is deliberately
 * no pixel on any admin page: fbevents.js here would report the team as site
 * visitors, enrol them in retargeting, and send Meta the URLs of a screen
 * listing applicants' phone numbers and incomes.
 *
 * Nothing in here throws. A stage report failing must never undo a status
 * change the team has already made.
 */

import {
  leadMatchKeys,
  metaStageDelivered,
  recordMetaStage,
  type Rating,
  type Status,
} from "@founder10x/db";
import { isMetaConfigured, sendMetaEvent, splitName } from "@founder10x/meta";

/**
 * The CRM's own vocabulary, in Meta's.
 *
 * Meta treats the lead-stage event name as free-form — these are the names
 * that will appear in Events Manager, and the ones to build Custom
 * Conversions on, so they are prefixed to sit apart from the website `Lead`
 * the site already sends.
 *
 * `new` is absent: the website Lead event already reported it, and a second
 * event for the same moment would only double-count the top of the funnel.
 */
const STATUS_EVENTS: Partial<Record<Status, string>> = {
  contacted: "crm_contacted",
  call_done: "crm_call_done",
  won: "crm_won",
  lost: "crm_lost",
};

/**
 * Only "hot" is reported. Warm and cold are not stages a campaign should be
 * chasing, and an event for every rating would leave Meta optimising towards
 * leads that someone merely got round to judging.
 */
const RATING_EVENTS: Partial<Record<Rating, string>> = {
  hot: "crm_qualified_lead",
};

export function statusEventName(status: Status): string | undefined {
  return STATUS_EVENTS[status];
}

export function ratingEventName(rating: Rating | null): string | undefined {
  return rating ? RATING_EVENTS[rating] : undefined;
}

/**
 * Reports one stage for one lead, at most once.
 *
 * Stages are reported as they are actually reached, and never backfilled: a
 * lead dragged straight from New to Won was not contacted and did not sit
 * through a call, and inventing those events would be worse data than a
 * sparse funnel — the entire point here is telling Meta the truth about which
 * leads were good.
 */
export async function reportLeadStage(leadId: number, eventName: string): Promise<void> {
  if (!isMetaConfigured()) return;

  try {
    // A stage dragged backwards and forwards again must not be reported
    // twice; Meta only collapses duplicates inside a short window.
    if (await metaStageDelivered(leadId, eventName)) return;

    const lead = await leadMatchKeys(leadId);
    if (!lead) return;

    const { firstName, lastName } = splitName(lead.name);

    const result = await sendMetaEvent({
      eventName,
      // Deterministic, so a retry after a failure is recognised as the same
      // event rather than counted as a second conversion.
      eventId: `lead-${leadId}-${eventName}`,
      // Nobody clicked anything to cause this: our team moved a card. Meta
      // wants system_generated for events that come out of a CRM, and drops
      // the website-only fields for them.
      actionSource: "system_generated",
      email: lead.email,
      phone: lead.phone,
      firstName,
      lastName,
      // The cookies captured when the form was submitted. On leads that
      // predate that capture — or where the pixel was blocked and no fbclid
      // survived — these are null and Meta falls back to matching on the
      // hashed email and phone, which is weaker but still works.
      fbp: lead.fbp ?? undefined,
      fbc: lead.fbc ?? undefined,
    });

    await recordMetaStage(leadId, eventName, result.ok, result.detail);
  } catch (error) {
    console.error(`Meta CRM stage ${eventName} for lead ${leadId} failed:`, error);
  }
}
