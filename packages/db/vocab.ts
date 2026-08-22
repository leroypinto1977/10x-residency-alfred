/**
 * The words the panel and the site both use for a lead, with no database
 * behind them.
 *
 * Separate from index.ts because the board and the sheet are client
 * components: importing STATUSES from a module that also constructs a Prisma
 * client asks Turbopack to bundle `node:module` for the browser, which it
 * rightly refuses to do. Everything here is a constant, a type or a pure
 * function, so it is safe on either side of the wire.
 */

/* ------------------------------------------------------------------ */
/*  vocabulary                                                         */
/* ------------------------------------------------------------------ */

/** Where a lead has reached. The order here is the order the board shows. */
export const STATUSES = ["new", "contacted", "call_done", "won", "lost"] as const;
export type Status = (typeof STATUSES)[number];

/** How warm it feels, judged by whoever spoke to them. */
export const RATINGS = ["hot", "warm", "cold"] as const;
export type Rating = (typeof RATINGS)[number];

export const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  call_done: "Call done",
  won: "Won",
  lost: "Lost",
};

export const RATING_LABELS: Record<Rating, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

export function isRating(v: unknown): v is Rating {
  return typeof v === "string" && (RATINGS as readonly string[]).includes(v);
}

/**
 * What an account may do.
 *
 * `viewer` is the one carrying a real restriction: it may read the board and
 * export it, and every mutation refuses it. The other two differ only in
 * whether the team page is reachable.
 */
export type Role = "owner" | "member" | "viewer";

export const ROLES: readonly Role[] = ["owner", "member", "viewer"];

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

/** Everyone except a viewer may change a lead. */
export function canEdit(role: Role) {
  return role !== "viewer";
}

/* ------------------------------------------------------------------ */
/*  types                                                              */
/* ------------------------------------------------------------------ */

export type AdminUser = {
  id: number;
  username: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

/** A submitted form plus everything the team has since added to it. */
export type Lead = {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string;
  businessType: string;
  industryDuration: string;
  incomeLevel: string;
  incomeTarget: string;
  meetingTargets: string;
  websiteDetails: string;
  socialLinks: string;
  investmentReady: string;
  foundUs: string[];
  foundUsOther: string | null;
  createdAt: string;
  status: Status;
  rating: Rating | null;
  ownerId: number | null;
  ownerName: string | null;
  followUpOn: string | null;
  lastTouchedAt: string | null;
  noteCount: number;
};

export type LeadNote = {
  id: number;
  body: string;
  createdAt: string;
  authorName: string | null;
};

export type LeadEvent = {
  id: number;
  field: string;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  actorName: string | null;
};

/**
 * A `date` column comes back as a Date pinned to UTC midnight. Its default
 * string form is "Tue Aug 25 2026", which is neither what a date input wants
 * nor what a CSV sorts on, and calling toISOString() on it in a timezone
 * behind UTC yields the previous day. Formatting from the UTC parts avoids
 * both.
 */
export function dateOnly(d: Date | null): string | null {
  if (!d) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** Today in the timezone the team actually works in, as YYYY-MM-DD. */
export function todayInIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/* The board's filter shape. Pure, and read by the client to type its own
   props, so it belongs here rather than beside the query that consumes it. */
export type LeadFilters = {
  status?: Status | "all";
  rating?: Rating | "unrated" | "all";
  /** "yes" | "no" | "unanswered" — the investment-readiness answer */
  investReady?: string;
  ownerId?: number | "unassigned" | "all";
  /** matches name, email, phone or business type */
  q?: string;
  /** only leads whose follow-up date has arrived */
  dueOnly?: boolean;
};

