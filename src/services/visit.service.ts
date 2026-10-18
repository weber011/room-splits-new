import { createClient } from "@/lib/supabase/client";
import {
  DbVisit,
  DbVisitStatus,
  VisitTimeSlot,
  TIME_SLOT_LABELS,
  VisitPass,
  computeVisitPassVisibility,
} from "@/types/visit.types";
import {
  createVisitAction,
  studentCancelVisitAction,
  ownerUpdateVisitStatusAction,
  ownerRescheduleVisitAction,
  CreateVisitInput,
} from "@/app/actions/visit.actions";

function getSupabaseClient(customClient?: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (customClient) return customClient as any;
  return createClient();
}

/**
 * Maps a database row from public.visits (with joined relations)
 * to strongly typed DbVisit.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbRowToDbVisit(row: any): DbVisit {
  const property = row.properties || row.property;
  const room = row.rooms || row.room;
  const student = row.profiles || row.student;

  return {
    id: row.id,
    propertyId: row.property_id,
    roomId: row.room_id || undefined,
    studentId: row.student_id,
    preferredDate: row.preferred_date,
    preferredTimeSlot: row.preferred_time_slot as VisitTimeSlot,
    status: row.status as DbVisitStatus,
    notes: row.notes || undefined,
    hostNotes: row.host_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    property: property
      ? {
          id: property.id,
          title: property.title,
          city: property.city,
          locality: property.locality,
          coverImage: property.cover_image,
          ownerId: property.owner_id,
          startingPrice: Number(property.starting_price || 0),
        }
      : undefined,
    room: room
      ? {
          id: room.id,
          sharingType: room.sharing_type,
          monthlyRent: Number(room.monthly_rent || 0),
        }
      : undefined,
    student: student
      ? {
          id: student.id,
          fullName: student.full_name || "Student Applicant",
          email: student.email || "",
          phone: student.phone || "",
        }
      : undefined,
  };
}

/**
 * Converts a DbVisit into the legacy VisitPass format so existing
 * UI cards and components render seamlessly without regressions.
 */
export function mapDbVisitToVisitPass(v: DbVisit): VisitPass {
  const timeLabel = TIME_SLOT_LABELS[v.preferredTimeSlot] || v.preferredTimeSlot;
  const isConfirmed = v.status === "confirmed";
  const isRescheduled = v.hostNotes?.includes("Rescheduled by Host");

  let uiStatus: VisitPass["status"] = "REQUESTED";
  if (v.status === "confirmed") uiStatus = "CONFIRMED";
  else if (v.status === "cancelled") uiStatus = "CANCELLED";
  else if (v.status === "declined") uiStatus = "CANCELLED";
  else if (v.status === "completed") uiStatus = "COMPLETED";
  else if (isRescheduled) uiStatus = "RESCHEDULED";

  return {
    id: v.id,
    passCode: `VP-${v.id.slice(0, 8).toUpperCase()}`,
    user: {
      id: v.studentId,
      fullName: v.student?.fullName || "Student Applicant",
      email: v.student?.email || "",
      phone: v.student?.phone || "+91 9XXXX XXXXX",
    },
    property: {
      id: v.propertyId,
      title: v.property?.title || "PG Accommodation",
      locality: v.property?.locality || "Jharkhand",
      city: v.property?.city || "Ranchi",
      coverImage:
        v.property?.coverImage ||
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      address: isConfirmed
        ? `${v.property?.locality || ""}, ${v.property?.city || "Jharkhand"}`
        : "Address unlocked upon host confirmation",
    },
    owner: {
      id: v.property?.ownerId || "owner",
      name: "Property Host",
      phone: isConfirmed ? "+91 98000 00000" : "+91 9XXXX XXXXX",
      email: "host@roomsplits.com",
    },
    preferredDate: v.preferredDate,
    preferredTime: timeLabel,
    status: uiStatus,
    visitPassAmount: 0,
    paymentStatus: "PAID",
    ownerConfirmation: isConfirmed ? "ACCEPTED" : isRescheduled ? "PROPOSED_NEW_TIME" : "PENDING",
    studentMessage: v.notes,
    ownerMessage: v.hostNotes,
    confirmedDate: isConfirmed ? v.preferredDate : undefined,
    confirmedTime: isConfirmed ? timeLabel : undefined,
    exactLocationVisibility: isConfirmed,
    contactVisibility: isConfirmed,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

export const visitService = {
  getVisitPassFee(): number {
    return 0; // Free in-person visit scheduling
  },

  sanitizeVisitPass(vp: VisitPass, isUnlocked: boolean = true): VisitPass {
    const visibility = computeVisitPassVisibility(vp.status, isUnlocked);
    return {
      ...vp,
      exactLocationVisibility: visibility.exactLocationVisibility,
      contactVisibility: visibility.contactVisibility,
    };
  },

  /**
   * Fetches visits for a student from Supabase.
   */
  async getStudentVisits(studentId?: string, customClient?: unknown): Promise<DbVisit[]> {
    try {
      const supabase = getSupabaseClient(customClient);
      let query = supabase
        .from("visits")
        .select(`
          id, property_id, room_id, student_id,
          preferred_date, preferred_time_slot, status, notes, host_notes,
          created_at, updated_at,
          properties:properties (id, title, city, locality, cover_image, owner_id, starting_price),
          rooms:rooms (id, sharing_type, monthly_rent)
        `)
        .order("created_at", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[visitService.getStudentVisits] Query error:", error);
        return [];
      }

      if (!data || data.length === 0) return [];
      return data.map(mapDbRowToDbVisit);
    } catch (err) {
      console.error("[visitService.getStudentVisits] Unexpected error:", err);
      return [];
    }
  },

  /**
   * Fetches visits for a PG Owner from Supabase.
   */
  async getOwnerVisits(ownerId?: string, customClient?: unknown): Promise<DbVisit[]> {
    try {
      const supabase = getSupabaseClient(customClient);
      const { data, error } = await supabase
        .from("visits")
        .select(`
          id, property_id, room_id, student_id,
          preferred_date, preferred_time_slot, status, notes, host_notes,
          created_at, updated_at,
          properties:properties!inner (id, title, city, locality, cover_image, owner_id, starting_price),
          rooms:rooms (id, sharing_type, monthly_rent),
          profiles:profiles!student_id (id, full_name, email, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[visitService.getOwnerVisits] Query error:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      let mapped: DbVisit[] = data.map(mapDbRowToDbVisit);
      if (ownerId) {
        mapped = mapped.filter((v: DbVisit) => v.property?.ownerId === ownerId);
      }
      return mapped;
    } catch (err) {
      console.error("[visitService.getOwnerVisits] Unexpected error:", err);
      return [];
    }
  },

  /**
   * Fetches a single visit by ID from Supabase.
   */
  async getVisitById(visitId: string, customClient?: unknown): Promise<DbVisit | null> {
    try {
      const supabase = getSupabaseClient(customClient);
      const { data, error } = await supabase
        .from("visits")
        .select(`
          id, property_id, room_id, student_id,
          preferred_date, preferred_time_slot, status, notes, host_notes,
          created_at, updated_at,
          properties:properties (id, title, city, locality, cover_image, owner_id, starting_price),
          rooms:rooms (id, sharing_type, monthly_rent),
          profiles:profiles!student_id (id, full_name, email, phone)
        `)
        .eq("id", visitId)
        .maybeSingle();

      if (error || !data) return null;
      return mapDbRowToDbVisit(data);
    } catch (err) {
      console.error("[visitService.getVisitById] Unexpected error:", err);
      return null;
    }
  },

  // Backward-compatible method returning VisitPass[]
  async getUserVisits(userId?: string, customClient?: unknown): Promise<VisitPass[]> {
    const visits = await this.getStudentVisits(userId, customClient);
    return visits.map(mapDbVisitToVisitPass);
  },

  // Backward-compatible method returning VisitPass[] for owner
  async getOwnerVisitPasses(ownerId?: string, customClient?: unknown): Promise<VisitPass[]> {
    const visits = await this.getOwnerVisits(ownerId, customClient);
    return visits.map(mapDbVisitToVisitPass);
  },

  async getVisitPassById(visitId: string, customClient?: unknown): Promise<VisitPass | null> {
    const v = await this.getVisitById(visitId, customClient);
    if (!v) return null;
    return mapDbVisitToVisitPass(v);
  },

  async rescheduleVisitPass(visitId: string, date: string, time: string): Promise<VisitPass | null> {
    await this.ownerProposeTime(visitId, date, time);
    return this.getVisitPassById(visitId);
  },

  async cancelVisitPass(visitId: string, reason?: string): Promise<VisitPass | null> {
    await this.studentCancelVisit(visitId, reason);
    return this.getVisitPassById(visitId);
  },

  async acceptRescheduledVisit(visitId: string): Promise<void> {
    await this.ownerAcceptVisit(visitId);
  },

  async payVisitPass(visitId: string): Promise<VisitPass | null> {
    // Legacy stub for backward compatibility
    return this.getVisitPassById(visitId);
  },

  // Action delegations
  async createVisitRequest(input: {
    propertyId: string;
    roomId?: string;
    preferredDate: string;
    preferredTimeSlot?: VisitTimeSlot;
    preferredTime?: string;
    studentMessage?: string;
  }): Promise<{ visitId: string }> {
    let slot: VisitTimeSlot = "evening";
    if (input.preferredTimeSlot && ["morning", "afternoon", "evening"].includes(input.preferredTimeSlot)) {
      slot = input.preferredTimeSlot;
    } else if (input.preferredTime) {
      const lower = input.preferredTime.toLowerCase();
      if (lower.includes("morning")) slot = "morning";
      else if (lower.includes("afternoon")) slot = "afternoon";
      else slot = "evening";
    }

    const payload: CreateVisitInput = {
      propertyId: input.propertyId,
      roomId: input.roomId,
      preferredDate: input.preferredDate,
      preferredTimeSlot: slot,
      notes: input.studentMessage,
    };

    const result = await createVisitAction(payload);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to schedule visit request.");
    }
    return { visitId: result.data.visitId };
  },

  async studentCancelVisit(visitId: string, reason?: string): Promise<void> {
    const result = await studentCancelVisitAction(visitId, reason);
    if (!result.success) {
      throw new Error(result.error || "Failed to cancel visit request.");
    }
  },

  async ownerAcceptVisit(visitId: string, ownerMessage?: string): Promise<void> {
    const result = await ownerUpdateVisitStatusAction({
      visitId,
      status: "confirmed",
      hostNotes: ownerMessage,
    });
    if (!result.success) {
      throw new Error(result.error || "Failed to confirm visit request.");
    }
  },

  async ownerRejectVisit(visitId: string, reason: string): Promise<void> {
    const result = await ownerUpdateVisitStatusAction({
      visitId,
      status: "declined",
      hostNotes: reason,
    });
    if (!result.success) {
      throw new Error(result.error || "Failed to decline visit request.");
    }
  },

  async ownerMarkCompleted(visitId: string): Promise<void> {
    const result = await ownerUpdateVisitStatusAction({
      visitId,
      status: "completed",
    });
    if (!result.success) {
      throw new Error(result.error || "Failed to mark visit completed.");
    }
  },

  async ownerProposeTime(
    visitId: string,
    date: string,
    time: string,
    ownerNote?: string
  ): Promise<void> {
    let slot: VisitTimeSlot = "evening";
    const lower = time.toLowerCase();
    if (lower.includes("morning")) slot = "morning";
    else if (lower.includes("afternoon")) slot = "afternoon";

    const result = await ownerRescheduleVisitAction({
      visitId,
      newDate: date,
      newTimeSlot: slot,
      hostNotes: ownerNote,
    });
    if (!result.success) {
      throw new Error(result.error || "Failed to reschedule visit.");
    }
  },
};
