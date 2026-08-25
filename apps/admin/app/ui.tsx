import { RATING_LABELS, STATUS_LABELS, type Rating, type Status } from "@founder10x/db/vocab";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** IST, because that is where the calls are made from. */
export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Today where the calls are made, as YYYY-MM-DD.
 *
 * Follow-ups are dates, not moments, so "is this due" is a comparison between
 * two calendar days and not between two instants. Turning the date into a
 * `Date` to compare it would put it at UTC midnight and make everything look
 * due five and a half hours early.
 */
export function todayInIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Both sides are YYYY-MM-DD, which sorts correctly as text. */
export function isDue(followUpOn: string | null) {
  return Boolean(followUpOn) && followUpOn! <= todayInIST();
}

/**
 * On a white page the pills carry all the colour there is, so each one is a
 * tint rather than a fill — enough to find at a glance down a column of forty
 * rows, quiet enough that forty of them together still read as a table.
 */
const STATUS_STYLE: Record<Status, string> = {
  new: "bg-slate-100 text-slate-700 border-slate-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  call_done: "bg-violet-50 text-violet-700 border-violet-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const RATING_STYLE: Record<Rating, string> = {
  hot: "bg-red-50 text-red-700 border-red-200",
  warm: "bg-amber-50 text-amber-700 border-amber-200",
  cold: "bg-sky-50 text-sky-700 border-sky-200",
};

export function RatingPill({ rating, className }: { rating: Rating | null; className?: string }) {
  if (!rating) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }
  return (
    <Badge variant="outline" className={cn("font-medium", RATING_STYLE[rating], className)}>
      {RATING_LABELS[rating]}
    </Badge>
  );
}

/**
 * The answer to the 1.5L question, which is the one field that decides whether
 * a call is worth booking — so Yes is the only thing on the row allowed to
 * look like a result. This form asks it as a straight yes/no, so there is no
 * middle answer to tint here.
 */
export function InvestPill({ value, className }: { value: string | null; className?: string }) {
  if (!value) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }
  const tone =
    value.toLowerCase() === "yes"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-neutral-100 text-neutral-600 border-neutral-200";
  return (
    <Badge variant="outline" className={cn("font-medium", tone, className)}>
      {value}
    </Badge>
  );
}
