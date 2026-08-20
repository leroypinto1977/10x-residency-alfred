// Single source of truth for the residency's factual details.
//
// These numbers used to be inlined in the sections that displayed them
// (Hero's meta row, Urgency's stat cards, the countdown), which meant a
// date change had to be chased through several files and the countdown
// silently went stale. Anything a section states as fact now comes from
// here.
//
// TODO(content): the two dates below are the only values still awaiting
// confirmation from the team. Everything else is live copy.
export const EVENT = {
  name: "Founder 10X",
  edition: "Edition I",
  host: "The GOAT Media",

  /** Where the residency runs. */
  venue: "Athirapalli, Kerala",
  venueLong: "Athirapalli, Kerala",

  /** Format, as stated across the page. */
  format: "3-day residential intensive",
  durationDays: 3,

  /** Cohort size — kept small deliberately, and stated as such. */
  seats: 25,

  /** Selection model. */
  admission: "By application",

  /**
   * The first day of the residency, ISO `YYYY-MM-DD`.
   * TODO(content): replace with the confirmed residency start date.
   */
  startDate: null as string | null,

  /**
   * When applications close, ISO `YYYY-MM-DD`. Drives the countdown in the
   * Urgency section — leave `null` and the countdown hides itself rather
   * than rendering a made-up number.
   * TODO(content): replace with the confirmed application deadline.
   */
  applicationsCloseOn: null as string | null,
} as const;

/**
 * Whole days between now and the application deadline.
 *
 * Returns `null` when no deadline is configured, or once the deadline has
 * passed, so callers can drop the countdown instead of showing "0 days"
 * or a negative number. Computed from UTC midnight on both ends so the
 * figure doesn't drift by one depending on the viewer's timezone.
 */
export function daysUntilApplicationsClose(now: Date = new Date()): number | null {
  if (!EVENT.applicationsCloseOn) return null;

  const deadline = Date.parse(`${EVENT.applicationsCloseOn}T00:00:00Z`);
  if (Number.isNaN(deadline)) return null;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.ceil((deadline - today) / 86_400_000);

  return days > 0 ? days : null;
}
