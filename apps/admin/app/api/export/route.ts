import { isRating, isStatus, listLeads, type LeadFilters } from "@founder10x/db";
import { currentUser } from "@/lib/session";

/**
 * The filtered board as CSV.
 *
 * Behind the same session as the board — this is the whole table in one file,
 * so it is the most sensitive URL in the panel. A viewer may export, because
 * reading is exactly what a viewer is for.
 */
const COLUMNS: [string, (l: Awaited<ReturnType<typeof listLeads>>[number]) => string][] = [
  ["id", (l) => String(l.id)],
  ["received", (l) => l.createdAt],
  ["name", (l) => l.name],
  ["email", (l) => l.email],
  ["phone", (l) => l.phone],
  ["dob", (l) => l.dob ?? ""],
  ["business", (l) => l.businessType],
  ["years_in_industry", (l) => l.industryDuration],
  ["income_now", (l) => l.incomeLevel],
  ["income_target", (l) => l.incomeTarget],
  ["meeting_targets", (l) => l.meetingTargets],
  ["website", (l) => l.websiteDetails],
  ["socials", (l) => l.socialLinks],
  ["investment_ready", (l) => l.investmentReady],
  ["found_us", (l) => l.foundUs.join("; ")],
  ["found_us_other", (l) => l.foundUsOther ?? ""],
  ["status", (l) => l.status],
  ["rating", (l) => l.rating ?? ""],
  ["owner", (l) => l.ownerName ?? ""],
  ["follow_up_on", (l) => l.followUpOn ?? ""],
  ["last_touched_at", (l) => l.lastTouchedAt ?? ""],
  ["notes", (l) => String(l.noteCount)],
];

/**
 * RFC 4180 quoting, with one addition: a field starting with =, +, - or @ is
 * prefixed with a quote, because Excel and Sheets treat those as formulas. A
 * lead who types `=cmd|...` into the website field should not become a
 * spreadsheet exploit on the machine that opens the export.
 */
function cell(value: string) {
  const risky = /^[=+\-@\t\r]/.test(value);
  const v = risky ? `'${value}` : value;
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const p = new URL(request.url).searchParams;
  const status = p.get("status");
  const rating = p.get("rating");
  const owner = p.get("owner");
  const invest = p.get("invest");

  const filters: LeadFilters = {
    status: isStatus(status) ? status : "all",
    rating: rating === "unrated" || isRating(rating) ? rating : "all",
    investReady: invest === "yes" || invest === "no" || invest === "unanswered" ? invest : "all",
    ownerId:
      owner === "unassigned" ? "unassigned" : owner && /^\d+$/.test(owner) ? Number(owner) : "all",
    q: p.get("q") ?? "",
    dueOnly: p.get("due") === "1",
  };

  const leads = await listLeads(filters);
  const rows = [
    COLUMNS.map(([h]) => h).join(","),
    ...leads.map((l) => COLUMNS.map(([, get]) => cell(get(l))).join(",")),
  ];
  // A BOM so Excel reads it as UTF-8; without it Indian names with accents
  // arrive mangled.
  const body = `﻿${rows.join("\r\n")}\r\n`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="founder10x-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
