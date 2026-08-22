import {
  isRating,
  isStatus,
  leadCounts,
  listLeads,
  listUsers,
  type LeadFilters,
} from "@founder10x/db";
import { requireUser } from "@/lib/session";
import LeadsBoard from "./leads-board";

// The board is a live view of a table people are editing; a cached render is
// a wrong one. Every visit re-reads.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Filters live in the URL rather than in component state, so a filtered board
 * is a link someone can send ("the hot ones nobody owns") and the back button
 * does what it should.
 */
function parseFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
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

export default async function BoardPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const filters = parseFilters(params);

  const [leads, counts, users] = await Promise.all([
    listLeads(filters),
    leadCounts(),
    listUsers(),
  ]);

  return (
    <LeadsBoard
      me={user}
      leads={leads}
      counts={counts}
      users={users.filter((u) => u.active)}
      filters={filters}
    />
  );
}
