/**
 * The lead store, shared by the landing site and the admin panel.
 *
 * The site writes a ClientIntake row when someone submits the form; the panel
 * reads those rows and hangs status, rating, ownership, notes and a history on
 * them. Both go through this module so the shape is defined once.
 *
 * Prisma rather than raw SQL because this repo already had Prisma, its
 * migrations and its live table — rewriting a working pipeline onto a second
 * driver would have been risk taken for symmetry with a sibling repo.
 */

export { prisma, isConfigured } from "./client";

import { prisma } from "./client";

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
function dateOnly(d: Date | null): string | null {
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

/* ------------------------------------------------------------------ */
/*  accounts                                                           */
/* ------------------------------------------------------------------ */

const USER_FIELDS = {
  id: true,
  username: true,
  name: true,
  role: true,
  active: true,
  createdAt: true,
  lastLoginAt: true,
} as const;

type RawUser = {
  id: number;
  username: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

function shapeUser(u: RawUser): AdminUser {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: (isRole(u.role) ? u.role : "viewer") as Role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  };
}

/**
 * Case-insensitively, because people capitalise their own username however
 * they please. Prisma's `mode: "insensitive"` is a Postgres ILIKE, which is
 * what the supporting index in the migration is built for.
 */
export async function findUserByUsername(
  username: string
): Promise<(AdminUser & { passwordHash: string }) | null> {
  const row = await prisma.adminUser.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { ...USER_FIELDS, passwordHash: true },
  });
  return row ? { ...shapeUser(row), passwordHash: row.passwordHash } : null;
}

/** Active accounts only — a session outlives a deactivation otherwise. */
export async function findUserById(id: number): Promise<AdminUser | null> {
  const row = await prisma.adminUser.findFirst({
    where: { id, active: true },
    select: USER_FIELDS,
  });
  return row ? shapeUser(row) : null;
}

export async function listUsers(): Promise<AdminUser[]> {
  const rows = await prisma.adminUser.findMany({
    select: USER_FIELDS,
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return rows.map(shapeUser);
}

export async function createUser(input: {
  username: string;
  name: string;
  passwordHash: string;
  role?: Role;
}) {
  const row = await prisma.adminUser.create({
    data: {
      username: input.username,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role ?? "member",
    },
    select: { id: true },
  });
  return { id: row.id };
}

export async function setUserPassword(id: number, passwordHash: string) {
  await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
}

export async function setUserActive(id: number, active: boolean) {
  await prisma.adminUser.update({ where: { id }, data: { active } });
}

export async function setUserRole(id: number, role: Role) {
  await prisma.adminUser.update({ where: { id }, data: { role } });
}

/**
 * Remove an account entirely.
 *
 * Notes and history keep their rows — the author and actor columns are
 * `onDelete: SetNull`, so the record of what happened survives the person who
 * did it and the panel shows those as "Removed account". Losing the history
 * along with the login would be the wrong trade.
 */
export async function deleteUser(username: string) {
  const row = await prisma.adminUser.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (!row) return null;
  await prisma.adminUser.delete({ where: { id: row.id } });
  return { name: row.name };
}

export async function markLogin(id: number) {
  await prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}

/** Whether any account exists yet — the panel is useless until one does. */
export async function hasAnyUser() {
  return (await prisma.adminUser.count()) > 0;
}

/* ------------------------------------------------------------------ */
/*  login throttling                                                   */
/* ------------------------------------------------------------------ */

const MAX_FAILS = 8;
const WINDOW_MINUTES = 15;

/** How long this IP is locked out for, in seconds. 0 when it may try. */
export async function loginLockRemaining(ip: string): Promise<number> {
  const row = await prisma.adminLoginAttempt.findUnique({
    where: { ip },
    select: { lockedUntil: true },
  });
  if (!row?.lockedUntil) return 0;
  const ms = row.lockedUntil.getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 1000) : 0;
}

/**
 * Read-then-write inside a transaction. Two simultaneous failures from one IP
 * could still collapse into a single increment, which costs an attacker
 * nothing and is not worth a locking scheme — the window is what does the
 * work here, not the exactness of the count.
 */
export async function recordLoginFailure(ip: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60_000);

  await prisma.$transaction(async (tx) => {
    const prev = await tx.adminLoginAttempt.findUnique({ where: { ip } });

    // A stale window starts over, so the odd typo never accumulates.
    const stale = !prev || prev.firstFailAt < windowStart;
    const fails = stale ? 1 : prev.fails + 1;
    const firstFailAt = stale ? now : prev.firstFailAt;
    const lockedUntil =
      fails >= MAX_FAILS ? new Date(now.getTime() + WINDOW_MINUTES * 60_000) : null;

    await tx.adminLoginAttempt.upsert({
      where: { ip },
      create: { ip, fails, firstFailAt, lockedUntil },
      update: { fails, firstFailAt, lockedUntil },
    });
  });
}

export async function clearLoginFailures(ip: string) {
  await prisma.adminLoginAttempt.deleteMany({ where: { ip } });
}

/* ------------------------------------------------------------------ */
/*  the board                                                          */
/* ------------------------------------------------------------------ */

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

const LEAD_SELECT = {
  id: true,
  name: true,
  email: true,
  dob: true,
  phone: true,
  businessType: true,
  industryDuration: true,
  incomeLevel: true,
  incomeTarget: true,
  meetingTargets: true,
  websiteDetails: true,
  socialLinks: true,
  investmentReady: true,
  foundUs: true,
  foundUsOther: true,
  createdAt: true,
  status: true,
  rating: true,
  ownerId: true,
  followUpOn: true,
  lastTouchedAt: true,
  owner: { select: { name: true } },
  _count: { select: { notes: true } },
} as const;

type RawLead = {
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
  createdAt: Date;
  status: string;
  rating: string | null;
  ownerId: number | null;
  followUpOn: Date | null;
  lastTouchedAt: Date | null;
  owner: { name: string } | null;
  _count: { notes: number };
};

function shapeLead(r: RawLead): Lead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    dob: r.dob,
    phone: r.phone,
    businessType: r.businessType,
    industryDuration: r.industryDuration,
    incomeLevel: r.incomeLevel,
    incomeTarget: r.incomeTarget,
    meetingTargets: r.meetingTargets,
    websiteDetails: r.websiteDetails,
    socialLinks: r.socialLinks,
    investmentReady: r.investmentReady,
    foundUs: r.foundUs,
    foundUsOther: r.foundUsOther,
    createdAt: r.createdAt.toISOString(),
    status: (isStatus(r.status) ? r.status : "new") as Status,
    rating: isRating(r.rating) ? r.rating : null,
    ownerId: r.ownerId,
    ownerName: r.owner?.name ?? null,
    followUpOn: dateOnly(r.followUpOn),
    lastTouchedAt: r.lastTouchedAt ? r.lastTouchedAt.toISOString() : null,
    noteCount: r._count.notes,
  };
}

/**
 * The board, filtered.
 *
 * Every filter is an equality against an indexed column except the search,
 * which is a case-insensitive contains across the four fields someone would
 * actually type into a search box. The "unrated" and "unassigned" cases are
 * `null` checks rather than equality — `= null` is never true in SQL and would
 * silently return an empty board.
 */
export async function listLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const { status, rating, investReady, ownerId, q, dueOnly } = filters;
  const where: Record<string, unknown> = {};

  if (status && status !== "all") where.status = status;

  if (rating === "unrated") where.rating = null;
  else if (rating && rating !== "all") where.rating = rating;

  const invest = investReady && investReady !== "all" ? investReady.toLowerCase() : null;
  if (invest === "unanswered") where.investmentReady = { in: ["", " "] };
  else if (invest) where.investmentReady = { equals: invest, mode: "insensitive" };

  if (ownerId === "unassigned") where.ownerId = null;
  else if (typeof ownerId === "number") where.ownerId = ownerId;

  if (dueOnly) {
    where.followUpOn = { not: null, lte: new Date(`${todayInIST()}T00:00:00.000Z`) };
  }

  const search = q?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { businessType: { contains: search, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.clientIntake.findMany({
    where,
    select: LEAD_SELECT,
    orderBy: { createdAt: "desc" },
  });
  return (rows as unknown as RawLead[]).map(shapeLead);
}

/** Counts for the summary strip, deliberately unaffected by the filters. */
export async function leadCounts(): Promise<Record<string, number>> {
  const today = new Date(`${todayInIST()}T00:00:00.000Z`);
  const [byStatus, byRating, total, investYes, investNo, due] = await Promise.all([
    prisma.clientIntake.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.clientIntake.groupBy({ by: ["rating"], _count: { _all: true } }),
    prisma.clientIntake.count(),
    prisma.clientIntake.count({
      where: { investmentReady: { equals: "yes", mode: "insensitive" } },
    }),
    prisma.clientIntake.count({
      where: { investmentReady: { equals: "no", mode: "insensitive" } },
    }),
    prisma.clientIntake.count({ where: { followUpOn: { not: null, lte: today } } }),
  ]);

  const out: Record<string, number> = { total, invest_yes: investYes, invest_no: investNo, due };
  for (const s of STATUSES) out[s] = 0;
  for (const r of RATINGS) out[r] = 0;
  for (const g of byStatus as { status: string; _count: { _all: number } }[]) {
    out[g.status] = g._count._all;
  }
  for (const g of byRating as { rating: string | null; _count: { _all: number } }[]) {
    if (g.rating) out[g.rating] = g._count._all;
  }
  return out;
}

export async function getLead(id: number): Promise<Lead | null> {
  const row = await prisma.clientIntake.findUnique({ where: { id }, select: LEAD_SELECT });
  return row ? shapeLead(row as unknown as RawLead) : null;
}

export async function leadNotes(leadId: number): Promise<LeadNote[]> {
  const rows = await prisma.leadNote.findMany({
    where: { leadId },
    select: { id: true, body: true, createdAt: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    authorName: r.author?.name ?? null,
  }));
}

export async function leadHistory(leadId: number): Promise<LeadEvent[]> {
  const rows = await prisma.leadEvent.findMany({
    where: { leadId },
    select: {
      id: true,
      field: true,
      fromValue: true,
      toValue: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    field: r.field,
    fromValue: r.fromValue,
    toValue: r.toValue,
    createdAt: r.createdAt.toISOString(),
    actorName: r.actor?.name ?? null,
  }));
}

export async function addNote(leadId: number, authorId: number, body: string) {
  await prisma.$transaction([
    prisma.leadNote.create({ data: { leadId, authorId, body } }),
    prisma.clientIntake.update({
      where: { id: leadId },
      data: { lastTouchedAt: new Date(), lastTouchedById: authorId },
    }),
  ]);
}

export type LeadField = "status" | "rating" | "ownerId" | "followUpOn";

/**
 * Change one field and record who changed it.
 *
 * The previous value is read inside the same call rather than trusted from the
 * client, so the history says what actually changed. A no-op write records
 * nothing — a timeline full of "status: won → won" buries the entries that
 * matter.
 */
export async function updateLeadField(
  leadId: number,
  actorId: number,
  field: LeadField,
  value: string | number | null
): Promise<{ changed: boolean } | null> {
  const prev = await prisma.clientIntake.findUnique({
    where: { id: leadId },
    select: {
      status: true,
      rating: true,
      ownerId: true,
      followUpOn: true,
      owner: { select: { name: true } },
    },
  });
  if (!prev) return null;

  const data: Record<string, unknown> = {
    lastTouchedAt: new Date(),
    lastTouchedById: actorId,
  };
  if (field === "followUpOn") {
    data.followUpOn = value ? new Date(`${value}T00:00:00.000Z`) : null;
  } else {
    data[field] = value;
  }
  await prisma.clientIntake.update({ where: { id: leadId }, data });

  // Names, not ids, in the history: "owner: null → 3" tells nobody anything.
  const fromValue =
    field === "ownerId"
      ? (prev.owner?.name ?? null)
      : field === "followUpOn"
        ? dateOnly(prev.followUpOn)
        : ((prev[field] as string | null) ?? null);

  let toValue: string | null = value === null || value === "" ? null : String(value);
  if (field === "ownerId" && value !== null) {
    const who = await prisma.adminUser.findUnique({
      where: { id: Number(value) },
      select: { name: true },
    });
    toValue = who?.name ?? null;
  }

  if (fromValue === toValue) return { changed: false };

  await prisma.leadEvent.create({
    data: { leadId, actorId, field, fromValue, toValue },
  });
  return { changed: true };
}
