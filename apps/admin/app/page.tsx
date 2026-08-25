import Link from "next/link";
import { Download } from "lucide-react";
import {
  canEdit,
  isRating,
  isStatus,
  leadCounts,
  listLeads,
  listUsers,
  type LeadFilters,
} from "@founder10x/db";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import LeadsBoard from "./leads-board";

// The board is a live view of a table people are editing; a cached render is
// a wrong one. Every visit re-reads.
export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Filters live in the URL rather than in component state, so a filtered board
 * is a link someone can send ("the hot ones nobody owns") and the back button
 * does what it should.
 *
 * Whatever arrives in the query string is a stranger's input, so each filter
 * is checked against the values that exist rather than passed through. An
 * unrecognised one falls back to "all", which shows more rather than less — a
 * filter nobody can read should not quietly empty the board.
 */
function parseFilters(params: Search): LeadFilters {
  const status = one(params.status);
  const rating = one(params.rating);
  const owner = one(params.owner);
  const invest = one(params.invest);

  return {
    status: isStatus(status) ? status : "all",
    rating: rating === "unrated" || isRating(rating) ? rating : "all",
    investReady: invest === "yes" || invest === "no" || invest === "unanswered" ? invest : "all",
    ownerId:
      owner === "unassigned" ? "unassigned" : owner && /^\d+$/.test(owner) ? Number(owner) : "all",
    q: one(params.q) ?? "",
    dueOnly: one(params.due) === "1",
  };
}

export default async function BoardPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const params = await searchParams;
  const filters = parseFilters(params);

  // The download follows the filters, so it hands over what is on screen
  // rather than the whole table. Not which sheet happens to be open, though —
  // that is view state and has no business in a download URL.
  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const value = one(v);
    if (value && k !== "lead") exportParams.set(k, value);
  }
  const exportHref = exportParams.size ? `/api/export?${exportParams}` : "/api/export";

  const [leads, counts, users] = await Promise.all([
    listLeads(filters),
    leadCounts(),
    listUsers(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-3.5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-base font-semibold tracking-tight">Leads</h1>
            <p className="text-xs text-muted-foreground">
              Founder 10X · signed in as {user.name}
              {!canEdit(user.role) && " · read only"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "owner" && (
              <Button asChild variant="ghost" size="sm" className="tap">
                <Link href="/team">Team</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="tap">
              <a href={exportHref}>
                <Download className="size-3.5" />
                Download CSV
              </a>
            </Button>
            <form action="/api/logout" method="post">
              <Button type="submit" variant="outline" size="sm" className="tap">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <LeadsBoard
          me={user}
          leads={leads}
          counts={counts}
          users={users.filter((u) => u.active)}
          filters={filters}
        />
      </main>
    </div>
  );
}
