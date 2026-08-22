"use client";

import { useEffect, useState } from "react";
import {
  RATINGS,
  RATING_LABELS,
  STATUSES,
  STATUS_LABELS,
  type AdminUser,
  type Lead,
} from "@founder10x/db/vocab";
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

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  rating: "Rating",
  ownerId: "Owner",
  followUpOn: "Follow-up",
};

/** The submitted answers, in the order the form asked for them. */
function answers(lead: Lead): [string, string | null][] {
  return [
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Date of birth", lead.dob],
    ["Business", lead.businessType],
    ["Years in industry", lead.industryDuration],
    ["Income now", lead.incomeLevel],
    ["Income target", lead.incomeTarget],
    ["Meeting targets", lead.meetingTargets],
    ["Website", lead.websiteDetails],
    ["Socials", lead.socialLinks],
    ["Ready to invest", lead.investmentReady],
    ["Found us", lead.foundUs.join(", ") || null],
    ["Found us (other)", lead.foundUsOther],
  ];
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
  const [detail, setDetail] = useState<LeadDetail>({ lead: initial, notes: [], history: [] });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lead = detail.lead;

  // The board row carries no notes or history, so the sheet fetches the full
  // record on open rather than rendering a half-populated panel.
  useEffect(() => {
    let live = true;
    loadLead(initial.id)
      .then((d) => live && setDetail(d))
      .catch(() => live && setError("Could not load this lead."));
    return () => {
      live = false;
    };
  }, [initial.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Every mutation goes through here so the panel has one place that knows
   * about the pending flag, the error and telling the board to re-read. The
   * action returns the whole record, so nothing is patched by hand.
   */
  async function run(fn: () => Promise<LeadDetail>) {
    setBusy(true);
    setError("");
    try {
      setDetail(await fn());
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-label={`Lead: ${lead.name}`}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-[560px] overflow-y-auto border-l p-6"
        style={{ background: "var(--surface)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            <p className="text-xs" style={{ color: "var(--faint)" }}>
              Received {when(lead.createdAt)}
              {lead.lastTouchedAt ? ` · last touched ${when(lead.lastTouchedAt)}` : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none px-2">
            ×
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm" style={{ color: "var(--hot)" }} role="alert">
            {error}
          </p>
        ) : null}

        {!editable ? (
          <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
            Your account has read-only access.
          </p>
        ) : null}

        <section className="mt-5 grid grid-cols-2 gap-3">
          <label className="text-xs" style={{ color: "var(--muted)" }}>
            Status
            <select
              disabled={!editable || busy}
              value={lead.status}
              onChange={(e) => run(() => setStatus(lead.id, e.target.value))}
              className="mt-1 w-full rounded-md border px-2 py-1.5 disabled:opacity-60"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs" style={{ color: "var(--muted)" }}>
            Rating
            <select
              disabled={!editable || busy}
              value={lead.rating ?? ""}
              onChange={(e) => run(() => setRating(lead.id, e.target.value || null))}
              className="mt-1 w-full rounded-md border px-2 py-1.5 disabled:opacity-60"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}
            >
              <option value="">Unrated</option>
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {RATING_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs" style={{ color: "var(--muted)" }}>
            Owner
            <select
              disabled={!editable || busy}
              value={lead.ownerId ?? ""}
              onChange={(e) =>
                run(() => setOwner(lead.id, e.target.value ? Number(e.target.value) : null))
              }
              className="mt-1 w-full rounded-md border px-2 py-1.5 disabled:opacity-60"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs" style={{ color: "var(--muted)" }}>
            Follow-up
            <input
              type="date"
              disabled={!editable || busy}
              value={lead.followUpOn ?? ""}
              onChange={(e) => run(() => setFollowUp(lead.id, e.target.value || null))}
              className="mt-1 w-full rounded-md border px-2 py-1.5 disabled:opacity-60"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}
            />
          </label>
        </section>

        {editable && lead.ownerId !== null ? null : editable ? (
          <button
            disabled={busy}
            onClick={() => run(() => claimLead(lead.id))}
            className="mt-3 rounded-md border px-3 py-1.5 text-xs disabled:opacity-60"
          >
            Claim this lead
          </button>
        ) : null}

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>
            What they submitted
          </h3>
          <dl className="text-sm">
            {answers(lead).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-2 py-1 border-b last:border-0">
                <dt style={{ color: "var(--muted)" }} className="text-xs pt-0.5">
                  {k}
                </dt>
                <dd className="break-words">{v || <span style={{ color: "var(--faint)" }}>—</span>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>
            Notes
          </h3>
          {editable ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                const body = note;
                setNote("");
                run(() => createNote(lead.id, body));
              }}
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What was said on the call…"
                className="w-full rounded-md border px-3 py-2"
                style={{ background: "var(--surface-2)" }}
              />
              <button
                type="submit"
                disabled={busy || !note.trim()}
                className="mt-2 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#17130a" }}
              >
                Add note
              </button>
            </form>
          ) : null}

          <ul className="mt-3 space-y-3">
            {detail.notes.map((n) => (
              <li key={n.id} className="rounded-md border p-3" style={{ background: "var(--surface-2)" }}>
                <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                <p className="mt-1.5 text-[11px]" style={{ color: "var(--faint)" }}>
                  {n.authorName ?? "Removed account"} · {when(n.createdAt)}
                </p>
              </li>
            ))}
            {detail.notes.length === 0 ? (
              <li className="text-xs" style={{ color: "var(--faint)" }}>
                No notes yet.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>
            History
          </h3>
          <ul className="space-y-1.5">
            {detail.history.map((h) => (
              <li key={h.id} className="text-xs" style={{ color: "var(--muted)" }}>
                <span style={{ color: "var(--text)" }}>{FIELD_LABELS[h.field] ?? h.field}</span>{" "}
                {h.fromValue ?? "—"} → {h.toValue ?? "—"}
                <span style={{ color: "var(--faint)" }}>
                  {" "}
                  · {h.actorName ?? "Removed account"} · {when(h.createdAt)}
                </span>
              </li>
            ))}
            {detail.history.length === 0 ? (
              <li className="text-xs" style={{ color: "var(--faint)" }}>
                Nothing changed yet.
              </li>
            ) : null}
          </ul>
        </section>
      </aside>
    </div>
  );
}
