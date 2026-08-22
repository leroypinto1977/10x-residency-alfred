"use server";

import { revalidatePath } from "next/cache";
import {
  addNote,
  getLead,
  isRating,
  isStatus,
  leadHistory,
  leadNotes,
  updateLeadField,
  type Lead,
  type LeadEvent,
  type LeadNote,
} from "@founder10x/db";
import { requireEditor, requireUser } from "@/lib/session";

export type LeadDetail = {
  lead: Lead;
  notes: LeadNote[];
  history: LeadEvent[];
};

/**
 * Every action re-reads the lead and returns the whole detail, rather than
 * returning nothing and letting the client patch its own copy. A field change
 * also writes last_touched_at and an event row, so the client's idea of the
 * lead is stale the instant it succeeds; sending the truth back is cheaper
 * than reconciling.
 */
async function detail(leadId: number): Promise<LeadDetail> {
  const [lead, notes, history] = await Promise.all([
    getLead(leadId),
    leadNotes(leadId),
    leadHistory(leadId),
  ]);
  if (!lead) throw new Error("That lead no longer exists.");
  return { lead, notes, history };
}

/** Ids arrive from the client, so they are checked rather than trusted. */
function leadIdOf(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Bad lead id.");
  return id;
}

export async function setStatus(leadId: number, status: string): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  if (!isStatus(status)) throw new Error("Unknown status.");
  await updateLeadField(id, user.id, "status", status);
  revalidatePath("/");
  return detail(id);
}

export async function setRating(leadId: number, rating: string | null): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  if (rating !== null && !isRating(rating)) throw new Error("Unknown rating.");
  await updateLeadField(id, user.id, "rating", rating);
  revalidatePath("/");
  return detail(id);
}

export async function setOwner(leadId: number, ownerId: number | null): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  await updateLeadField(id, user.id, "ownerId", ownerId);
  revalidatePath("/");
  return detail(id);
}

/** Assign to yourself — the common case, and one click instead of a select. */
export async function claimLead(leadId: number): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  await updateLeadField(id, user.id, "ownerId", user.id);
  revalidatePath("/");
  return detail(id);
}

export async function setFollowUp(leadId: number, date: string | null): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  // The date input hands back "" when cleared, and a YYYY-MM-DD string
  // otherwise. Anything else is not something this should be storing.
  const value = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  await updateLeadField(id, user.id, "followUpOn", value);
  revalidatePath("/");
  return detail(id);
}

export async function createNote(leadId: number, body: string): Promise<LeadDetail> {
  const user = await requireEditor();
  const id = leadIdOf(leadId);
  const text = body.trim();
  if (!text) throw new Error("A note needs something in it.");
  if (text.length > 5000) throw new Error("That note is too long.");
  await addNote(id, user.id, text);
  revalidatePath("/");
  return detail(id);
}

/** Read-only, so a viewer may call it. */
export async function loadLead(leadId: number): Promise<LeadDetail> {
  await requireUser();
  return detail(leadIdOf(leadId));
}
