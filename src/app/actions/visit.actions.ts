"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, requireOwner } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import {
  VisitTimeSlot,
  VALID_TIME_SLOTS,
  DbVisitStatus,
} from "@/types/visit.types";
import { createNotificationInternal } from "@/lib/notifications-server";
import { isValidUuid } from "@/lib/validation-helpers";

export interface CreateVisitInput {
  propertyId: string;
  roomId?: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: VisitTimeSlot;
  notes?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a database-backed visit request for a published property.
 * Enforces student session, published property eligibility,
 * date validity (future only), time slot validity, and initial status = 'pending'.
 */
export async function createVisitAction(input: CreateVisitInput): Promise<ActionResult<{ visitId: string }>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "Please sign in to schedule an in-person room visit.",
      };
    }

    // 1. Validate property existence & published status
    if (!input.propertyId || !isValidUuid(input.propertyId)) {
      return { success: false, error: "A valid property UUID is required." };
    }

    if (input.roomId && !isValidUuid(input.roomId)) {
      return { success: false, error: "Invalid room UUID format." };
    }

    if (input.notes && input.notes.length > 1000) {
      return { success: false, error: "Visit notes cannot exceed 1000 characters." };
    }

    const supabase = await createClient();

    const { data: property, error: propErr } = await supabase
      .from("properties")
      .select("id, status, title, owner_id")
      .eq("id", input.propertyId)
      .maybeSingle();

    if (propErr || !property) {
      return { success: false, error: "Property could not be found." };
    }

    if (property.status !== "published") {
      return {
        success: false,
        error: "Visits can only be requested for active published listings.",
      };
    }

    // 2. Validate optional room selection
    if (input.roomId) {
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("id, property_id")
        .eq("id", input.roomId)
        .maybeSingle();

      if (roomErr || !room || room.property_id !== property.id) {
        return {
          success: false,
          error: "Selected room does not belong to this property.",
        };
      }
    }

    // 3. Validate Date (Must be valid format, today or future, within 60 days)
    if (!input.preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate)) {
      return {
        success: false,
        error: "Please select a valid visit date in YYYY-MM-DD format.",
      };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (input.preferredDate < todayStr) {
      return {
        success: false,
        error: "Visit date cannot be in the past. Please select today or a future date.",
      };
    }

    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 60);
    const maxDateStr = maxFutureDate.toISOString().split("T")[0];
    if (input.preferredDate > maxDateStr) {
      return {
        success: false,
        error: "Visits cannot be scheduled more than 60 days in advance.",
      };
    }

    // 4. Validate Time Slot
    if (!VALID_TIME_SLOTS.includes(input.preferredTimeSlot)) {
      return {
        success: false,
        error: "Please select a supported time slot: morning, afternoon, or evening.",
      };
    }

    // 5. Prevent Duplicate Active Visit Requests
    const { data: existingVisits } = await supabase
      .from("visits")
      .select("id, status, preferred_date, preferred_time_slot")
      .eq("student_id", user.id)
      .eq("property_id", property.id)
      .in("status", ["pending", "confirmed"]);

    if (existingVisits && existingVisits.length > 0) {
      const hasExactDuplicate = existingVisits.some(
        (v) =>
          v.preferred_date === input.preferredDate &&
          v.preferred_time_slot === input.preferredTimeSlot
      );
      if (hasExactDuplicate) {
        return {
          success: false,
          error: "You already have an active visit scheduled for this property on this date and time.",
        };
      }
    }

    // 6. Server-enforced Insert into public.visits
    const { data: inserted, error: insertErr } = await supabase
      .from("visits")
      .insert({
        property_id: property.id,
        room_id: input.roomId || null,
        student_id: user.id,
        preferred_date: input.preferredDate,
        preferred_time_slot: input.preferredTimeSlot,
        status: "pending", // Strictly server-enforced initial status
        notes: input.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("[createVisitAction] Database insert error:", insertErr);
      return {
        success: false,
        error: insertErr?.message || "Failed to create visit request in database.",
      };
    }

    // Notify the PG property owner
    try {
      const { data: ownerRec } = await supabase
        .from("owners")
        .select("user_id")
        .eq("id", property.owner_id)
        .maybeSingle();

      if (ownerRec?.user_id) {
        await createNotificationInternal({
          userId: ownerRec.user_id,
          type: "visit_requested",
          title: "New Visit Request Received 📅",
          message: `A student requested an in-person room visit for "${property.title}" on ${input.preferredDate} (${input.preferredTimeSlot}).`,
          propertyId: property.id,
          visitId: inserted.id,
        });
      }
    } catch (notifErr) {
      console.error("[createVisitAction] Notification dispatch error:", notifErr);
    }

    revalidatePath("/visits");
    revalidatePath("/student/dashboard");
    revalidatePath("/owner/visits");
    revalidatePath(`/property/${property.id}`);

    return {
      success: true,
      data: { visitId: inserted.id },
    };
  } catch (err) {
    console.error("[createVisitAction] Unexpected error:", err);
    return {
      success: false,
      error: (err as Error)?.message || "An unexpected error occurred while scheduling your visit.",
    };
  }
}

/**
 * Cancels a visit request on behalf of the authenticated student.
 * Validates ownership (student_id = auth.uid()) and status eligibility.
 */
export async function studentCancelVisitAction(
  visitId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Please log in to manage your visits." };
    }

    if (!visitId || !isValidUuid(visitId)) {
      return { success: false, error: "Valid visit UUID is required." };
    }

    if (reason && reason.length > 500) {
      return { success: false, error: "Cancellation reason cannot exceed 500 characters." };
    }

    const supabase = await createClient();

    // Fetch existing visit with property and owner details
    const { data: visit, error: fetchErr } = await supabase
      .from("visits")
      .select(`
        id, student_id, status, notes, preferred_date, property_id,
        property:properties (id, title, owner:owners (id, user_id))
      `)
      .eq("id", visitId)
      .maybeSingle();

    if (fetchErr || !visit) {
      return { success: false, error: "Visit request not found." };
    }

    // Verify student ownership
    if (visit.student_id !== user.id) {
      return { success: false, error: "Unauthorized: You can only cancel your own visit requests." };
    }

    // Validate cancellation eligibility
    if (visit.status === "cancelled") {
      return { success: false, error: "This visit request is already cancelled." };
    }

    if (visit.status === "completed") {
      return { success: false, error: "Completed visits cannot be cancelled." };
    }

    if (visit.status === "declined") {
      return { success: false, error: "This visit was already declined by the property owner." };
    }

    const cancellationNote = reason?.trim()
      ? `${visit.notes ? visit.notes + "\n" : ""}[Student Cancelled: ${reason.trim()}]`
      : visit.notes;

    const { error: updateErr } = await supabase
      .from("visits")
      .update({
        status: "cancelled",
        notes: cancellationNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", visit.id)
      .eq("student_id", user.id);

    if (updateErr) {
      console.error("[studentCancelVisitAction] Update error:", updateErr);
      return { success: false, error: "Failed to cancel visit request." };
    }

    // Notify the PG property owner
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ownerUserId = (visit.property as any)?.owner?.user_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propTitle = (visit.property as any)?.title || "your property";
      if (ownerUserId) {
        await createNotificationInternal({
          userId: ownerUserId,
          type: "visit_cancelled",
          title: "Visit Cancelled by Student",
          message: `The visit for "${propTitle}" on ${visit.preferred_date} was cancelled by the student.${reason ? ' Reason: ' + reason : ''}`,
          propertyId: visit.property_id,
          visitId: visit.id,
        });
      }
    } catch (notifErr) {
      console.error("[studentCancelVisitAction] Notification dispatch error:", notifErr);
    }

    revalidatePath("/visits");
    revalidatePath("/student/dashboard");
    revalidatePath("/owner/visits");

    return { success: true };
  } catch (err) {
    console.error("[studentCancelVisitAction] Unexpected error:", err);
    return { success: false, error: (err as Error)?.message || "Failed to cancel visit request." };
  }
}

export interface OwnerVisitDecisionInput {
  visitId: string;
  status: "confirmed" | "declined" | "completed";
  hostNotes?: string;
}

/**
 * Updates a visit status on behalf of a verified PG owner.
 * Server-derives ownerId, confirms ownership of the underlying property,
 * and validates status transitions.
 */
export async function ownerUpdateVisitStatusAction(
  input: OwnerVisitDecisionInput
): Promise<ActionResult> {
  try {
    const user = await requireOwner();
    if (!user.ownerId) {
      return { success: false, error: "Owner profile required to manage visits." };
    }

    if (!input.visitId || !isValidUuid(input.visitId)) {
      return { success: false, error: "Valid visit UUID is required." };
    }

    if (input.hostNotes && input.hostNotes.length > 500) {
      return { success: false, error: "Host notes cannot exceed 500 characters." };
    }

    const supabase = await createClient();

    // Fetch visit with underlying property owner and details
    const { data: visit, error: fetchErr } = await supabase
      .from("visits")
      .select(`
        id, property_id, student_id, preferred_date, preferred_time_slot, status, host_notes,
        property:properties (id, title, owner_id)
      `)
      .eq("id", input.visitId)
      .maybeSingle();

    if (fetchErr || !visit) {
      return { success: false, error: "Visit request not found." };
    }

    // Verify property ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyOwnerId = (visit.property as any)?.owner_id;
    if (propertyOwnerId !== user.ownerId) {
      return {
        success: false,
        error: "Unauthorized: You can only manage visits for your own properties.",
      };
    }

    // Validate Status Transitions
    const currentStatus = visit.status as DbVisitStatus;
    const targetStatus = input.status;

    if (currentStatus === "cancelled") {
      return { success: false, error: "Cannot modify a visit that was cancelled by the student." };
    }
    if (currentStatus === "completed" && targetStatus !== "completed") {
      return { success: false, error: "Completed visits cannot be reopened." };
    }

    if (targetStatus === "confirmed" && currentStatus !== "pending") {
      return { success: false, error: "Only pending visit requests can be confirmed." };
    }

    if (targetStatus === "completed" && currentStatus !== "confirmed") {
      return { success: false, error: "Only confirmed visits can be marked as completed." };
    }

    const { error: updateErr } = await supabase
      .from("visits")
      .update({
        status: targetStatus,
        host_notes: input.hostNotes?.trim() || visit.host_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", visit.id);

    if (updateErr) {
      console.error("[ownerUpdateVisitStatusAction] Update error:", updateErr);
      return { success: false, error: "Failed to update visit status in database." };
    }

    // Notify the student about the host decision
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propTitle = (visit.property as any)?.title || "your selected PG";
      if (targetStatus === "confirmed") {
        await createNotificationInternal({
          userId: visit.student_id,
          type: "visit_confirmed",
          title: "Visit Request Confirmed! 🎉",
          message: `Your visit for "${propTitle}" on ${visit.preferred_date} (${visit.preferred_time_slot}) has been confirmed. Exact location details are now unlocked!`,
          propertyId: visit.property_id,
          visitId: visit.id,
        });
      } else if (targetStatus === "declined") {
        await createNotificationInternal({
          userId: visit.student_id,
          type: "visit_declined",
          title: "Visit Request Declined",
          message: `Your visit request for "${propTitle}" was declined by the host.${input.hostNotes ? ' Reason: ' + input.hostNotes : ''}`,
          propertyId: visit.property_id,
          visitId: visit.id,
        });
      } else if (targetStatus === "completed") {
        await createNotificationInternal({
          userId: visit.student_id,
          type: "visit_completed",
          title: "Visit Completed! ⭐",
          message: `Your room visit for "${propTitle}" has been marked completed by the host. Thank you for visiting!`,
          propertyId: visit.property_id,
          visitId: visit.id,
        });
      }
    } catch (notifErr) {
      console.error("[ownerUpdateVisitStatusAction] Notification dispatch error:", notifErr);
    }

    revalidatePath("/owner/visits");
    revalidatePath("/visits");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (err) {
    console.error("[ownerUpdateVisitStatusAction] Unexpected error:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update visit." };
  }
}

export interface OwnerRescheduleInput {
  visitId: string;
  newDate: string; // YYYY-MM-DD
  newTimeSlot: VisitTimeSlot;
  hostNotes?: string;
}

/**
 * Proposes a rescheduled visit date/time on behalf of the PG owner.
 * Updates preferred_date, preferred_time_slot, records hostNotes, and keeps status as 'pending'.
 */
export async function ownerRescheduleVisitAction(
  input: OwnerRescheduleInput
): Promise<ActionResult> {
  try {
    const user = await requireOwner();
    if (!user.ownerId) {
      return { success: false, error: "Owner profile required to reschedule visits." };
    }

    if (!input.visitId || !isValidUuid(input.visitId)) {
      return { success: false, error: "Valid visit UUID is required." };
    }

    if (input.hostNotes && input.hostNotes.length > 500) {
      return { success: false, error: "Host notes cannot exceed 500 characters." };
    }

    // Validate new date
    if (!input.newDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.newDate)) {
      return { success: false, error: "Please provide a valid rescheduled date in YYYY-MM-DD format." };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (input.newDate < todayStr) {
      return { success: false, error: "Proposed reschedule date cannot be in the past." };
    }

    // Validate new time slot
    if (!VALID_TIME_SLOTS.includes(input.newTimeSlot)) {
      return { success: false, error: "Please select a valid time slot: morning, afternoon, or evening." };
    }

    const supabase = await createClient();

    // Fetch visit with property owner
    const { data: visit, error: fetchErr } = await supabase
      .from("visits")
      .select(`
        id, property_id, student_id, status, host_notes,
        property:properties (id, title, owner_id)
      `)
      .eq("id", input.visitId)
      .maybeSingle();

    if (fetchErr || !visit) {
      return { success: false, error: "Visit request not found." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyOwnerId = (visit.property as any)?.owner_id;
    if (propertyOwnerId !== user.ownerId) {
      return {
        success: false,
        error: "Unauthorized: You can only manage visits for your own properties.",
      };
    }

    if (visit.status === "cancelled" || visit.status === "completed") {
      return { success: false, error: `Cannot reschedule a visit that is already ${visit.status}.` };
    }

    const notePrefix = `[Rescheduled by Host to ${input.newDate} (${input.newTimeSlot})]`;
    const fullHostNotes = input.hostNotes?.trim()
      ? `${notePrefix} ${input.hostNotes.trim()}`
      : notePrefix;

    const { error: updateErr } = await supabase
      .from("visits")
      .update({
        preferred_date: input.newDate,
        preferred_time_slot: input.newTimeSlot,
        status: "pending", // Remains pending until student or owner confirms
        host_notes: fullHostNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", visit.id);

    if (updateErr) {
      console.error("[ownerRescheduleVisitAction] Update error:", updateErr);
      return { success: false, error: "Failed to update visit in database." };
    }

    // Notify the student about the rescheduled visit time
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propTitle = (visit.property as any)?.title || "your selected PG";
      await createNotificationInternal({
        userId: visit.student_id,
        type: "visit_rescheduled",
        title: "Visit Rescheduled by Host 📅",
        message: `The host proposed a new time for "${propTitle}": ${input.newDate} (${input.newTimeSlot}).${input.hostNotes ? ' Note: ' + input.hostNotes : ''}`,
        propertyId: visit.property_id,
        visitId: visit.id,
      });
    } catch (notifErr) {
      console.error("[ownerRescheduleVisitAction] Notification dispatch error:", notifErr);
    }

    revalidatePath("/owner/visits");
    revalidatePath("/visits");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (err) {
    console.error("[ownerRescheduleVisitAction] Unexpected error:", err);
    return { success: false, error: (err as Error)?.message || "Failed to reschedule visit." };
  }
}
