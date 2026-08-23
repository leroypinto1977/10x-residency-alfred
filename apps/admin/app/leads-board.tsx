"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RATINGS,
  RATING_LABELS,
  STATUSES,
  STATUS_LABELS,
  canEdit,
  type AdminUser,
  type Lead,
  type LeadFilters,
} from "@founder10x/db/vocab";
import LeadSheet from "./lead-sheet";

const RATING_COLOR: Record<string, string> = {
  hot: "var(--hot)",
  warm: "var(--warm)",
  cold: "var(--cold)",
};
const STATUS_COLOR: Record<string, string> = {
  new: "var(--accent)",
  contacted: "var(--warm)",
  call_done: "var(--cold)",
  won: "var(--won)",
  lost: "var(--lost)",
};

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** Today in IST, so "due" means the same thing here as it does in the query. */
function todayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function LeadsBoard({
  me,
  leads,
  counts,
  users,
  filters,
}: {
  me: AdminUser;
  leads: Lead[];
  counts: Record<string, number>;
  users: AdminUser[];
  filters: LeadFilters;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<number | null>(null);
  const [search, setSearch] = useState(filters.q ?? "");

  const editable = canEdit(me.role);
  const today = todayIST();

  /** One writer for the query string, so filters compose instead of clobber. */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      startTransition(() => router.push(`/?${next.toString()}`));
    },
    [params, router]
  );

  const open = leads.find((l) => l.id === openId) ?? null;
  const filtered = ["status", "rating", "invest", "owner", "due", "q"].some((k) => params.get(k));

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-6">
      <header className="flex flex-wrap items-center gap-3 justify-between mb-5">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: "var(--accent)" }}>
            Founder 10X
          </p>
          <h1 className="text-lg font-semibold">Leads</h1>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
          <span>
            {me.name} · {me.role}
          </span>
          {me.role === "owner" ? (
            <a href="/team" className="tap underline underline-offset-2">
              Team
            </a>
          ) : null}
          <a
            href={`/api/export?${params.toString()}`}
            className="tap underline underline-offset-2"
          >
            Export CSV
          </a>
          <form action="/api/logout" method="post">
            <button type="submit" className="tap underline underline-offset-2">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Counts are of the whole table, never of the filtered view — a summary
          that moves with the filter cannot tell you what is going on. */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ["Total", counts.total, null] as const,
          ...STATUSES.map((s) => [STATUS_LABELS[s], counts[s] ?? 0, s] as const),
          ["Due", counts.due ?? 0, "due"] as const,
        ].map(([label, n, key]) => (
          <button
            key={label}
            onClick={() =>
              key === "due"
                ? setParam("due", params.get("due") === "1" ? null : "1")
                : setParam("status", key)
            }
            className="rounded-md border px-3 py-1.5 text-left"
            style={{
              background: "var(--surface)",
              borderColor:
                (key === "due" && params.get("due") === "1") || (key && params.get("status") === key)
                  ? "var(--accent)"
                  : "var(--border)",
            }}
          >
            <span className="block text-[11px]" style={{ color: "var(--muted)" }}>
              {label}
            </span>
            <span className="block text-base font-semibold">{n}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", search.trim() || null);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, business"
            className="rounded-md border px-3 py-1.5 w-64"
            style={{ background: "var(--surface)" }}
          />
        </form>

        <select
          value={(filters.rating as string) ?? "all"}
          onChange={(e) => setParam("rating", e.target.value)}
          className="rounded-md border px-2 py-1.5"
          style={{ background: "var(--surface)" }}
        >
          <option value="all">Any rating</option>
          {RATINGS.map((r) => (
            <option key={r} value={r}>
              {RATING_LABELS[r]}
            </option>
          ))}
          <option value="unrated">Unrated</option>
        </select>

        <select
          value={String(filters.ownerId ?? "all")}
          onChange={(e) => setParam("owner", e.target.value)}
          className="rounded-md border px-2 py-1.5"
          style={{ background: "var(--surface)" }}
        >
          <option value="all">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={(filters.investReady as string) ?? "all"}
          onChange={(e) => setParam("invest", e.target.value)}
          className="rounded-md border px-2 py-1.5"
          style={{ background: "var(--surface)" }}
        >
          <option value="all">Investment: any</option>
          <option value="yes">Ready</option>
          <option value="no">Not ready</option>
          <option value="unanswered">Unanswered</option>
        </select>

        {filtered ? (
          <button
            onClick={() => startTransition(() => router.push("/"))}
            className="text-xs underline underline-offset-2"
            style={{ color: "var(--muted)" }}
          >
            Clear filters
          </button>
        ) : null}

        <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
          {pending ? "Loading…" : `${leads.length} shown`}
        </span>
      </div>

      {/* A nine-column table on a 375px screen shows Name and Contact and
          hides everything the board exists for — status, rating, owner, what
          is due — behind a sideways scroll nobody discovers. The table is for
          screens that can hold it; a phone gets the cards below, which carry
          the same fields and the same click target. */}
      <div
        className="hidden md:block rounded-lg border overflow-x-auto"
        style={{ background: "var(--surface)" }}
      >
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr style={{ color: "var(--muted)" }} className="text-xs">
              {["Name", "Contact", "Business", "Income", "Status", "Rating", "Owner", "Follow-up", "Received"].map(
                (h) => (
                  <th key={h} className="font-medium px-3 py-2 border-b whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const due = l.followUpOn && l.followUpOn <= today;
              return (
                <tr
                  key={l.id}
                  onClick={() => setOpenId(l.id)}
                  className="cursor-pointer border-b last:border-0 hover:brightness-125"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-medium">{l.name}</span>
                    {l.noteCount > 0 ? (
                      <span className="ml-2 text-[11px]" style={{ color: "var(--faint)" }}>
                        {l.noteCount} note{l.noteCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                    <div>{l.email}</div>
                    <div>{l.phone}</div>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                    {l.businessType}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                    {l.incomeLevel}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className="rounded px-2 py-0.5 text-[11px]"
                      style={{ border: `1px solid ${STATUS_COLOR[l.status]}`, color: STATUS_COLOR[l.status] }}
                    >
                      {STATUS_LABELS[l.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {l.rating ? (
                      <span style={{ color: RATING_COLOR[l.rating] }} className="text-[11px]">
                        ● {RATING_LABELS[l.rating]}
                      </span>
                    ) : (
                      <span style={{ color: "var(--faint)" }} className="text-[11px]">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                    {l.ownerName ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: due ? "var(--hot)" : "var(--muted)" }}>
                    {l.followUpOn ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: "var(--faint)" }}>
                    {when(l.createdAt)}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center" style={{ color: "var(--muted)" }}>
                  {filtered ? "Nothing matches those filters." : "No leads yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-2">
        {leads.map((l) => {
          const due = l.followUpOn && l.followUpOn <= today;
          return (
            <li key={l.id}>
              <button
                onClick={() => setOpenId(l.id)}
                className="w-full text-left rounded-lg border p-3.5"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium leading-tight">{l.name}</span>
                  <span
                    className="shrink-0 rounded px-2 py-0.5 text-[11px]"
                    style={{
                      border: `1px solid ${STATUS_COLOR[l.status]}`,
                      color: STATUS_COLOR[l.status],
                    }}
                  >
                    {STATUS_LABELS[l.status]}
                  </span>
                </div>

                <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  <div className="break-all">{l.email}</div>
                  <div>{l.phone}</div>
                </div>

                {l.businessType ? (
                  <p className="mt-1.5 text-xs line-clamp-2" style={{ color: "var(--muted)" }}>
                    {l.businessType}
                  </p>
                ) : null}

                {/* Only the facts that are actually set, so a new lead is two
                    lines rather than a column of dashes. */}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                  {l.rating ? (
                    <span style={{ color: RATING_COLOR[l.rating] }}>● {RATING_LABELS[l.rating]}</span>
                  ) : null}
                  {l.ownerName ? (
                    <span style={{ color: "var(--muted)" }}>{l.ownerName}</span>
                  ) : null}
                  {l.followUpOn ? (
                    <span style={{ color: due ? "var(--hot)" : "var(--muted)" }}>
                      due {l.followUpOn}
                    </span>
                  ) : null}
                  {l.noteCount > 0 ? (
                    <span style={{ color: "var(--faint)" }}>
                      {l.noteCount} note{l.noteCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  <span className="ml-auto" style={{ color: "var(--faint)" }}>
                    {when(l.createdAt)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
        {leads.length === 0 ? (
          <li
            className="rounded-lg border p-8 text-center"
            style={{ background: "var(--surface)", color: "var(--muted)" }}
          >
            {filtered ? "Nothing matches those filters." : "No leads yet."}
          </li>
        ) : null}
      </ul>

      {open ? (
        <LeadSheet
          key={open.id}
          lead={open}
          users={users}
          editable={editable}
          onClose={() => setOpenId(null)}
          onChanged={() => router.refresh()}
        />
      ) : null}
    </main>
  );
}
