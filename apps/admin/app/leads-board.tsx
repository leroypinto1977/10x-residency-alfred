"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import LeadSheet from "./lead-sheet";
import { formatDate, formatDay, InvestPill, isDue, RatingPill, StatusPill } from "./ui";

/**
 * The board.
 *
 * Filters and the open lead both live in the URL. A filtered view is
 * therefore a link — "every hot lead who said yes" can be sent to whoever
 * should be calling them — and the open sheet survives a refresh and answers
 * to the back button, which a piece of component state would not.
 */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className={cn("tabular text-2xl font-semibold tracking-tight", accent)}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
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
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(filters.q ?? "");

  const editable = canEdit(me.role);

  /** Set or clear one param, keeping the rest. */
  const put = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      // a filter change with a sheet open would leave the sheet showing a lead
      // that the new filter may not even include
      if (key !== "lead") next.delete("lead");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const get = (k: string) => params.get(k);
  const openId = get("lead");
  const open = openId ? (leads.find((l) => l.id === Number(openId)) ?? null) : null;
  const filtered = ["status", "rating", "invest", "owner", "due", "q"].some((k) => get(k));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Total" value={counts.total ?? 0} />
        <Stat label="New" value={counts.new ?? 0} />
        <Stat label="Contacted" value={counts.contacted ?? 0} />
        <Stat label="Call done" value={counts.call_done ?? 0} />
        <Stat label="Won" value={counts.won ?? 0} accent="text-emerald-600" />
        <Stat label="Hot" value={counts.hot ?? 0} accent="text-red-600" />
        <Stat label="Due" value={counts.due ?? 0} accent="text-amber-600" />
      </div>

      <div className="mt-6 space-y-2.5 rounded-xl border bg-card p-4">
        <FilterRow label="Status">
          <Chip active={!get("status")} onClick={() => put("status", null)}>
            All
          </Chip>
          {STATUSES.map((s) => (
            <Chip key={s} active={get("status") === s} onClick={() => put("status", s)}>
              {STATUS_LABELS[s]}
              <span className="ml-1.5 opacity-60">{counts[s] ?? 0}</span>
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Rating">
          <Chip active={!get("rating")} onClick={() => put("rating", null)}>
            All
          </Chip>
          {RATINGS.map((r) => (
            <Chip key={r} active={get("rating") === r} onClick={() => put("rating", r)}>
              {RATING_LABELS[r]}
              <span className="ml-1.5 opacity-60">{counts[r] ?? 0}</span>
            </Chip>
          ))}
          <Chip active={get("rating") === "unrated"} onClick={() => put("rating", "unrated")}>
            Unrated
          </Chip>
        </FilterRow>

        {/* the qualifying question, and the reason most of this exists */}
        <FilterRow label="Ready 1.5L">
          <Chip active={!get("invest")} onClick={() => put("invest", null)}>
            All
          </Chip>
          <Chip active={get("invest") === "yes"} onClick={() => put("invest", "yes")}>
            Yes<span className="ml-1.5 opacity-60">{counts.invest_yes ?? 0}</span>
          </Chip>
          <Chip active={get("invest") === "no"} onClick={() => put("invest", "no")}>
            No<span className="ml-1.5 opacity-60">{counts.invest_no ?? 0}</span>
          </Chip>
          <Chip active={get("invest") === "unanswered"} onClick={() => put("invest", "unanswered")}>
            Unanswered
          </Chip>
        </FilterRow>

        <FilterRow label="Owner">
          <Chip active={!get("owner")} onClick={() => put("owner", null)}>
            Anyone
          </Chip>
          <Chip active={get("owner") === String(me.id)} onClick={() => put("owner", String(me.id))}>
            Mine
          </Chip>
          <Chip active={get("owner") === "unassigned"} onClick={() => put("owner", "unassigned")}>
            Unassigned
          </Chip>
          {users
            .filter((u) => u.id !== me.id)
            .map((u) => (
              <Chip
                key={u.id}
                active={get("owner") === String(u.id)}
                onClick={() => put("owner", String(u.id))}
              >
                {u.name}
              </Chip>
            ))}
        </FilterRow>

        <FilterRow label="Follow-up">
          <Chip active={!get("due")} onClick={() => put("due", null)}>
            Any
          </Chip>
          <Chip active={get("due") === "1"} onClick={() => put("due", "1")}>
            Due now<span className="ml-1.5 opacity-60">{counts.due ?? 0}</span>
          </Chip>
        </FilterRow>

        <form
          className="flex flex-wrap items-center gap-1.5 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            put("q", search.trim() || null);
          }}
        >
          <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, phone or business"
              className="h-8 w-72 pl-8 text-sm"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="tap h-8">
            Search
          </Button>
          {filtered && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="tap h-8 text-muted-foreground"
              onClick={() => {
                setSearch("");
                router.replace(pathname, { scroll: false });
              }}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </form>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{leads.length}</span>
        {filtered ? ` of ${counts.total ?? 0}` : ""} {leads.length === 1 ? "lead" : "leads"}
      </p>

      {leads.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filtered
              ? "No leads match these filters."
              : "No applications yet. They will appear here as soon as someone applies."}
          </p>
        </div>
      ) : (
        <>
          {/* A nine-column table on a 375px screen shows Name and Contact and
              hides everything the board exists for — status, rating, owner,
              what is due — behind a sideways scroll nobody discovers. The
              table is for screens that can hold it; a phone gets the cards
              below, which carry the same fields and the same click target. */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border bg-card md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px]">Received</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead className="hidden xl:table-cell">Business</TableHead>
                    <TableHead className="hidden xl:table-cell">Income now</TableHead>
                    <TableHead>Ready 1.5L</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden lg:table-cell">Owner</TableHead>
                    <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow
                      key={l.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open ${l.name}`}
                      onClick={() => put("lead", String(l.id))}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          put("lead", String(l.id));
                        }
                      }}
                      className={cn(
                        "cursor-pointer",
                        openId === String(l.id) && "bg-muted/70 hover:bg-muted/70",
                      )}
                    >
                      <TableCell className="tabular whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(l.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {l.name}
                        {l.noteCount > 0 && (
                          <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">
                            {l.noteCount}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-xs lg:table-cell">
                        <span className="block max-w-[200px] truncate">{l.email}</span>
                        <span className="tabular block text-muted-foreground">{l.phone}</span>
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-sm xl:table-cell">
                        {l.businessType}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground xl:table-cell">
                        {l.incomeLevel || "—"}
                      </TableCell>
                      <TableCell>
                        <InvestPill value={l.investmentReady} />
                      </TableCell>
                      <TableCell>
                        <StatusPill status={l.status} />
                      </TableCell>
                      <TableCell>
                        <RatingPill rating={l.rating} />
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell">
                        {l.ownerName ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell">
                        {l.followUpOn ? (
                          <span className={isDue(l.followUpOn) ? "font-medium text-red-600" : ""}>
                            {formatDay(l.followUpOn)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <ul className="mt-4 space-y-2 md:hidden">
            {leads.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => put("lead", String(l.id))}
                  className="w-full rounded-xl border bg-card p-3.5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium leading-tight">{l.name}</span>
                    <StatusPill status={l.status} className="shrink-0" />
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    <div className="break-all">{l.email}</div>
                    <div className="tabular">{l.phone}</div>
                  </div>

                  {l.businessType ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {l.businessType}
                    </p>
                  ) : null}

                  {/* Only the facts that are actually set, so a new lead is two
                      lines rather than a column of dashes. */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {l.rating ? <RatingPill rating={l.rating} /> : null}
                    {l.ownerName ? <span>{l.ownerName}</span> : null}
                    {l.followUpOn ? (
                      <span className={isDue(l.followUpOn) ? "font-medium text-red-600" : ""}>
                        due {formatDay(l.followUpOn)}
                      </span>
                    ) : null}
                    {l.noteCount > 0 ? (
                      <span>
                        {l.noteCount} note{l.noteCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                    <span className="ml-auto">{formatDate(l.createdAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {open ? (
        <LeadSheet
          key={open.id}
          lead={open}
          users={users}
          editable={editable}
          onClose={() => put("lead", null)}
          onChanged={() => router.refresh()}
        />
      ) : null}
    </>
  );
}
