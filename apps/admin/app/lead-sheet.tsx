"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Lock, Mail, Phone } from "lucide-react";
import {
  RATINGS,
  RATING_LABELS,
  STATUSES,
  STATUS_LABELS,
  type AdminUser,
  type Lead,
} from "@founder10x/db/vocab";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  claimLead,
  createNote,
  loadLead,
  setFollowUp,
  setOwner,
  setRating,
  setStatus,
  type LeadDetail,
} from "./actions";
import { formatDate, InvestPill, isDue, RatingPill, StatusPill } from "./ui";

/**
 * The detail panel.
 *
 * Everything here saves the moment it changes — picking a status is one click,
 * not a click and then a Save. Each action returns the lead's fresh detail, so
 * the panel redraws from what the database now holds rather than from what we
 * hoped it would hold. That costs a moment of latency and buys never showing a
 * change that did not land.
 */

const UNASSIGNED = "unassigned";
const UNRATED = "unrated";

/**
 * The names Meta knows these stages by, back in the words the panel uses.
 * The sheet shows what has been reported so that a token that has quietly
 * expired is visible here rather than only in Events Manager three weeks later.
 */
const META_EVENT_LABELS: Record<string, string> = {
  crm_qualified_lead: "Qualified",
  crm_contacted: "Contacted",
  crm_call_done: "Call done",
  crm_won: "Won",
  crm_lost: "Lost",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/**
 * A website or social answer, made clickable.
 *
 * People type "instagram.com/handle" as often as they paste a full URL, so a
 * bare href would resolve against the admin's own origin and 404. Anything
 * without a scheme gets https, and anything that still will not parse is left
 * as plain text rather than rendered as a link that goes nowhere.
 */
function ExternalLink({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let ok = false;
  try {
    ok = Boolean(new URL(href).hostname.includes("."));
  } catch {
    ok = false;
  }
  if (!ok) return <span className="break-all">{value}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="break-all hover:underline"
    >
      {value}
    </a>
  );
}

function describe(field: string, from: string | null, to: string | null) {
  const label = (v: string | null) => {
    if (!v) return "—";
    if (field === "status") return STATUS_LABELS[v as keyof typeof STATUS_LABELS] ?? v;
    if (field === "rating") return RATING_LABELS[v as keyof typeof RATING_LABELS] ?? v;
    return v;
  };
  const names: Record<string, string> = {
    status: "Status",
    rating: "Rating",
    ownerId: "Owner",
    followUpOn: "Follow-up",
  };
  return `${names[field] ?? field} · ${label(from)} → ${label(to)}`;
}

export default function LeadSheet({
  lead: initial,
  users,
  editable,
  onClose,
  onChanged,
}: {
  lead: Lead;
  users: AdminUser[];
  editable: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  // The board row carries no notes, history or Meta reports, so the sheet
  // opens on what the row already knows and fills the rest in when it lands —
  // rather than holding a spinner over a name it could have shown at once.
  const [data, setData] = useState<LeadDetail>({
    lead: initial,
    notes: [],
    history: [],
    meta: [],
  });
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    loadLead(initial.id)
      .then((d) => live && setData(d))
      .catch(
        (e) => live && toast.error(e instanceof Error ? e.message : "Could not open that lead."),
      )
      .finally(() => live && setLoading(false));
    // a second click on another row while the first is in flight must not
    // paint the first one's data into the second one's sheet
    return () => {
      live = false;
    };
  }, [initial.id]);

  /** Run a save, keep whatever it returns, and say so if it fails. */
  function save(run: () => Promise<LeadDetail>, message: string) {
    startTransition(async () => {
      try {
        setData(await run());
        toast.success(message);
        onChanged();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That did not save.");
      }
    });
  }

  const lead = data.lead;
  // the server refuses a viewer's writes regardless; this just stops them
  // clicking into an error
  const locked = !editable || pending;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="gap-2 border-b p-6">
          <SheetTitle className="text-xl">{lead.name}</SheetTitle>
          <SheetDescription>
            Received {formatDate(lead.createdAt)}
            {lead.lastTouchedAt ? ` · last touched ${formatDate(lead.lastTouchedAt)}` : ""}
          </SheetDescription>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusPill status={lead.status} />
            <RatingPill rating={lead.rating} />
            <InvestPill value={lead.investmentReady} />
            {!editable && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Read only
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* the controls first: this panel exists to change these four */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={lead.status}
                disabled={locked}
                onValueChange={(v) =>
                  save(() => setStatus(lead.id, v), `Moved to ${STATUS_LABELS[v as never]}`)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rating</Label>
              <Select
                value={lead.rating ?? UNRATED}
                disabled={locked}
                onValueChange={(v) =>
                  save(
                    () => setRating(lead.id, v === UNRATED ? null : v),
                    v === UNRATED ? "Rating cleared" : `Marked ${RATING_LABELS[v as never]}`,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNRATED}>Not rated</SelectItem>
                  {RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RATING_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Owner</Label>
              <Select
                value={lead.ownerId ? String(lead.ownerId) : UNASSIGNED}
                disabled={locked}
                onValueChange={(v) =>
                  save(
                    () => setOwner(lead.id, v === UNASSIGNED ? null : Number(v)),
                    v === UNASSIGNED ? "Unassigned" : "Owner set",
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Follow-up</Label>
              <Input
                type="date"
                disabled={locked}
                defaultValue={lead.followUpOn ?? ""}
                // onChange, not onBlur: a date picker closes on choose and
                // a blur that never comes is a save that never happens
                onChange={(e) =>
                  save(
                    () => setFollowUp(lead.id, e.target.value || null),
                    e.target.value ? "Follow-up set" : "Follow-up cleared",
                  )
                }
                className={isDue(lead.followUpOn) ? "border-red-300 text-red-700" : ""}
              />
            </div>
          </div>

          {editable && lead.ownerId === null && (
            <Button
              size="sm"
              variant="outline"
              className="tap"
              disabled={pending}
              onClick={() => save(() => claimLead(lead.id), "Claimed")}
            >
              Claim this lead
            </Button>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 break-all hover:underline"
              >
                <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                {lead.email}
              </a>
            </Field>
            <Field label="Phone">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                {lead.phone}
              </a>
            </Field>
            <Field label="Date of birth">
              {lead.dob || <span className="text-muted-foreground">—</span>}
            </Field>
            <Field label="Ready to invest">
              <InvestPill value={lead.investmentReady} />
            </Field>
            <div className="col-span-2">
              <Field label="Business">
                {lead.businessType ? (
                  // The form asks for a short explanation, so this arrives
                  // as prose with the line breaks the person typed.
                  <span className="whitespace-pre-wrap">{lead.businessType}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
            </div>
            <Field label="Years in industry">
              {lead.industryDuration || <span className="text-muted-foreground">—</span>}
            </Field>
            <Field label="Income now">
              {lead.incomeLevel || <span className="text-muted-foreground">—</span>}
            </Field>
            <Field label="Income target">
              {lead.incomeTarget || <span className="text-muted-foreground">—</span>}
            </Field>
            <Field label="Meeting targets">
              {lead.meetingTargets || <span className="text-muted-foreground">—</span>}
            </Field>
            <div className="col-span-2">
              <Field label="Website">
                <ExternalLink value={lead.websiteDetails} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Social links">
                <ExternalLink value={lead.socialLinks} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Found us via">
                {lead.foundUs?.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {lead.foundUs.map((src) => (
                      <Badge key={src} variant="secondary" className="font-normal">
                        {src}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
            </div>
            {lead.foundUsOther && (
              <div className="col-span-2">
                <Field label="Found us (other)">{lead.foundUsOther}</Field>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Call notes</p>
            {editable && (
              <>
                <Textarea
                  rows={3}
                  value={note}
                  disabled={locked}
                  placeholder="What was said on the call?"
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  size="sm"
                  className="tap"
                  disabled={locked || !note.trim()}
                  onClick={() =>
                    save(async () => {
                      const d = await createNote(lead.id, note);
                      setNote("");
                      return d;
                    }, "Note added")
                  }
                >
                  {pending && <Loader2 className="size-3.5 animate-spin" />}
                  Add note
                </Button>
              </>
            )}

            {loading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading notes…
              </p>
            ) : data.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border bg-muted/40 p-3">
                    <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {n.authorName ?? "Removed account"} · {formatDate(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Reported to Meta</p>
            {data.meta.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nothing reported yet — stages are sent as this lead moves past New.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.meta.map((m) => (
                  <li key={m.eventName} className="text-xs text-muted-foreground">
                    <span className="text-foreground">
                      {META_EVENT_LABELS[m.eventName] ?? m.eventName}
                    </span>{" "}
                    {m.ok ? "sent" : <span className="text-destructive">failed</span>} ·{" "}
                    {formatDate(m.sentAt)}
                    {m.ok ? null : (
                      <span className="block">{m.detail ?? "No reason given."}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.history.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">History</p>
                <ul className="space-y-1.5">
                  {data.history.map((h) => (
                    <li key={h.id} className="text-xs text-muted-foreground">
                      <span className="text-foreground">
                        {describe(h.field, h.fromValue, h.toValue)}
                      </span>{" "}
                      · {h.actorName ?? "Removed account"}, {formatDate(h.createdAt)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
