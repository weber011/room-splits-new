"use server";

import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth-helpers";
import { createNotificationInternal } from "@/lib/notifications-server";
import { isValidUuid } from "@/lib/validation-helpers";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminMetrics {
  totalProfiles: number;
  studentCount: number;
  ownerCount: number;
  adminCount: number;
  pendingOwnerVerifications: number;
  verifiedOwnersCount: number;
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  archivedProperties: number;
  verifiedProperties: number;
  totalVisits: number;
  pendingVisits: number;
  confirmedVisits: number;
  completedVisits: number;
  cancelledVisits: number;
}

/**
 * 1. ADMIN METRICS
 * Performs high-efficiency HEAD count aggregations across core database tables.
 */
export async function getAdminMetricsAction(): Promise<ActionResult<AdminMetrics>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Run parallel count aggregations using { count: "exact", head: true }
    const [
      totalProfilesRes,
      studentsRes,
      adminsRes,
      ownersRes,
      pendingOwnersRes,
      verifiedOwnersRes,
      totalPropsRes,
      publishedPropsRes,
      draftPropsRes,
      archivedPropsRes,
      verifiedPropsRes,
      totalVisitsRes,
      pendingVisitsRes,
      confirmedVisitsRes,
      completedVisitsRes,
      cancelledVisitsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      supabase.from("owners").select("*", { count: "exact", head: true }),
      supabase.from("owners").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
      supabase.from("owners").select("*", { count: "exact", head: true }).eq("is_verified", true),
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "archived"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("is_verified", true),
      supabase.from("visits").select("*", { count: "exact", head: true }),
      supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    ]);

    const totalProfiles = totalProfilesRes.count || 0;
    const studentCount = studentsRes.count || 0;
    const adminCount = adminsRes.count || 0;
    const ownerCount = ownersRes.count || 0;
    const pendingOwnerVerifications = pendingOwnersRes.count || 0;
    const verifiedOwnersCount = verifiedOwnersRes.count || 0;
    const totalProperties = totalPropsRes.count || 0;
    const publishedProperties = publishedPropsRes.count || 0;
    const draftProperties = draftPropsRes.count || 0;
    const archivedProperties = archivedPropsRes.count || 0;
    const verifiedProperties = verifiedPropsRes.count || 0;
    const totalVisits = totalVisitsRes.count || 0;
    const pendingVisits = pendingVisitsRes.count || 0;
    const confirmedVisits = confirmedVisitsRes.count || 0;
    const completedVisits = completedVisitsRes.count || 0;
    const cancelledVisits = cancelledVisitsRes.count || 0;

    return {
      success: true,
      data: {
        totalProfiles,
        studentCount,
        ownerCount,
        adminCount,
        pendingOwnerVerifications,
        verifiedOwnersCount,
        totalProperties,
        publishedProperties,
        draftProperties,
        archivedProperties,
        verifiedProperties,
        totalVisits,
        pendingVisits,
        confirmedVisits,
        completedVisits,
        cancelledVisits,
      },
    };
  } catch (err) {
    console.error("[getAdminMetricsAction] Error:", err);
    return { success: false, error: "Failed to calculate platform metrics." };
  }
}

/**
 * 2. AUDIT LOGGING HELPER
 */
export async function logAdminActionInternal(input: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("admin_audit_logs").insert({
      admin_id: input.adminId,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      metadata: input.metadata || {},
    });
  } catch (err) {
    console.error("[logAdminActionInternal] Warning: Audit log failed to insert:", err);
  }
}

/**
 * 3. OWNER VERIFICATION REVIEW
 */
export interface AdminOwnerItem {
  id: string;
  userId: string;
  businessName: string;
  phone: string;
  whatsapp: string | null;
  primaryCity: string;
  isVerified: boolean;
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  fullName: string;
  propertiesCount?: number;
}

export async function getAdminOwnersAction(filter?: "all" | "pending" | "verified" | "rejected"): Promise<ActionResult<AdminOwnerItem[]>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    let query = supabase
      .from("owners")
      .select(`
        id, user_id, business_name, phone, whatsapp, primary_city,
        is_verified, verification_status, verified_at, verified_by,
        rejection_reason, created_at,
        profile:profiles!user_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (filter && filter !== "all") {
      query = query.eq("verification_status", filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getAdminOwnersAction] Database error:", error);
      return { success: false, error: "Failed to retrieve owners." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: AdminOwnerItem[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      businessName: row.business_name,
      phone: row.phone,
      whatsapp: row.whatsapp,
      primaryCity: row.primary_city,
      isVerified: row.is_verified,
      verificationStatus: row.verification_status,
      verifiedAt: row.verified_at,
      verifiedBy: row.verified_by,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      fullName: row.profile?.full_name || "PG Host",
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error("[getAdminOwnersAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while fetching owners." };
  }
}

export interface ReviewOwnerInput {
  ownerId: string;
  decision: "verified" | "rejected";
  rejectionReason?: string;
}

export async function reviewOwnerVerificationAction(input: ReviewOwnerInput): Promise<ActionResult> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    if (!input.ownerId || !isValidUuid(input.ownerId)) {
      return { success: false, error: "Valid owner UUID is required." };
    }

    if (input.decision === "rejected" && (!input.rejectionReason || !input.rejectionReason.trim())) {
      return { success: false, error: "A rejection reason is required when declining an owner application." };
    }

    if (input.rejectionReason && input.rejectionReason.length > 1000) {
      return { success: false, error: "Rejection reason cannot exceed 1000 characters." };
    }

    const supabase = await createClient();

    // 1. Fetch current owner record
    const { data: owner, error: fetchErr } = await supabase
      .from("owners")
      .select("id, user_id, business_name, is_verified, verification_status")
      .eq("id", input.ownerId)
      .maybeSingle();

    if (fetchErr || !owner) {
      return { success: false, error: "Owner application not found." };
    }

    // 2. Prevent self-verification
    if (owner.user_id === authCheck.user.id) {
      return {
        success: false,
        error: "Platform Security Violation: Administrators cannot verify or approve their own host application.",
      };
    }

    const isApprove = input.decision === "verified";
    const now = new Date().toISOString();

    // 3. Update owner status in database
    const { error: updateErr } = await supabase
      .from("owners")
      .update({
        is_verified: isApprove,
        verification_status: input.decision,
        verified_at: now,
        verified_by: authCheck.user.id,
        rejection_reason: isApprove ? null : input.rejectionReason?.trim() || null,
        updated_at: now,
      })
      .eq("id", owner.id);

    if (updateErr) {
      console.error("[reviewOwnerVerificationAction] Update error:", updateErr);
      return { success: false, error: "Failed to update owner verification in database." };
    }

    // 4. Log to security audit log
    await logAdminActionInternal({
      adminId: authCheck.user.id,
      action: isApprove ? "OWNER_VERIFIED" : "OWNER_REJECTED",
      targetType: "owner",
      targetId: owner.id,
      metadata: {
        businessName: owner.business_name,
        priorStatus: owner.verification_status,
        decision: input.decision,
        reason: input.rejectionReason?.trim() || null,
      },
    });

    // 5. Notify the owner about the verification decision
    try {
      if (isApprove) {
        await createNotificationInternal({
          userId: owner.user_id,
          type: "system",
          title: "Host Profile Verified! 🛡️",
          message: `Congratulations! Your business "${owner.business_name}" has been officially verified by RoomSplits administrators. Your listings now show the Verified Host badge!`,
        });
      } else {
        await createNotificationInternal({
          userId: owner.user_id,
          type: "system",
          title: "Host Verification Update",
          message: `Your host verification application for "${owner.business_name}" was not approved. Reason: ${input.rejectionReason?.trim()}`,
        });
      }
    } catch (notifErr) {
      console.error("[reviewOwnerVerificationAction] Notification dispatch error:", notifErr);
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/owner-verification");
    revalidatePath("/admin/owners");

    return { success: true };
  } catch (err) {
    console.error("[reviewOwnerVerificationAction] Error:", err);
    return { success: false, error: (err as Error)?.message || "Failed to complete owner review." };
  }
}

/**
 * 4. PROPERTY MODERATION
 */
export interface AdminPropertyItem {
  id: string;
  title: string;
  slug: string;
  city: string;
  locality: string;
  category: string;
  genderPolicy: string;
  startingPrice: number;
  status: "draft" | "published" | "archived";
  isVerified: boolean;
  coverImage: string;
  ownerId: string;
  ownerBusinessName: string;
  ownerName: string;
  createdAt: string;
}

export async function getAdminPropertiesAction(filters?: {
  status?: string;
  city?: string;
  search?: string;
}): Promise<ActionResult<AdminPropertyItem[]>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    let query = supabase
      .from("properties")
      .select(`
        id, title, slug, city, locality, category, gender_policy,
        starting_price, status, is_verified, cover_image, created_at, owner_id,
        owner:owners (id, business_name, user_id, profile:profiles!user_id (full_name))
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status.toLowerCase());
    }

    if (filters?.city && filters.city !== "ALL") {
      query = query.eq("city", filters.city);
    }

    if (filters?.search && filters.search.trim()) {
      query = query.ilike("title", `%${filters.search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getAdminPropertiesAction] Error:", error);
      return { success: false, error: "Failed to load properties for administration." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: AdminPropertyItem[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      city: row.city,
      locality: row.locality,
      category: row.category,
      genderPolicy: row.gender_policy,
      startingPrice: Number(row.starting_price),
      status: row.status,
      isVerified: row.is_verified,
      coverImage: row.cover_image,
      ownerId: row.owner_id,
      ownerBusinessName: row.owner?.business_name || "Independent PG",
      ownerName: row.owner?.profile?.full_name || "PG Host",
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error("[getAdminPropertiesAction] Error:", err);
    return { success: false, error: "Failed to retrieve properties." };
  }
}

export interface ModeratePropertyInput {
  propertyId: string;
  action: "archive" | "publish" | "verify" | "unverify";
  reason?: string;
}

export async function moderatePropertyAction(input: ModeratePropertyInput): Promise<ActionResult> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    if (!input.propertyId || !isValidUuid(input.propertyId)) {
      return { success: false, error: "Valid property UUID is required." };
    }

    if (input.reason && input.reason.length > 1000) {
      return { success: false, error: "Moderation reason cannot exceed 1000 characters." };
    }

    const supabase = await createClient();

    // 1. Fetch current property
    const { data: prop, error: fetchErr } = await supabase
      .from("properties")
      .select("id, title, status, is_verified, owner_id, owner:owners(user_id)")
      .eq("id", input.propertyId)
      .maybeSingle();

    if (fetchErr || !prop) {
      return { success: false, error: "Property not found." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    let actionLog = "";

    switch (input.action) {
      case "archive":
        updates.status = "archived";
        actionLog = "PROPERTY_ARCHIVED";
        break;
      case "publish":
        updates.status = "published";
        actionLog = "PROPERTY_RESTORED";
        break;
      case "verify":
        updates.is_verified = true;
        actionLog = "PROPERTY_VERIFIED";
        break;
      case "unverify":
        updates.is_verified = false;
        actionLog = "PROPERTY_UNVERIFIED";
        break;
      default:
        return { success: false, error: "Unsupported moderation action." };
    }

    const { error: updateErr } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", prop.id);

    if (updateErr) {
      console.error("[moderatePropertyAction] Update error:", updateErr);
      return { success: false, error: "Failed to apply property moderation." };
    }

    // 2. Audit log
    await logAdminActionInternal({
      adminId: authCheck.user.id,
      action: actionLog,
      targetType: "property",
      targetId: prop.id,
      metadata: {
        title: prop.title,
        priorStatus: prop.status,
        newStatus: updates.status || prop.status,
        priorVerified: prop.is_verified,
        newVerified: updates.is_verified ?? prop.is_verified,
        reason: input.reason?.trim() || null,
      },
    });

    // 3. Notify owner if listing was archived due to violations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ownerUserId = (prop.owner as any)?.user_id;
    if (ownerUserId && input.action === "archive") {
      try {
        await createNotificationInternal({
          userId: ownerUserId,
          type: "system",
          title: "Listing Archived by Administrator",
          message: `Your listing "${prop.title}" has been archived by platform administration.${input.reason ? ' Reason: ' + input.reason : ''}`,
          propertyId: prop.id,
        });
      } catch (notifErr) {
        console.error("[moderatePropertyAction] Notification error:", notifErr);
      }
    }

    revalidatePath("/admin/properties");
    revalidatePath("/admin/dashboard");
    revalidatePath("/discover");
    revalidatePath(`/property/${prop.id}`);

    return { success: true };
  } catch (err) {
    console.error("[moderatePropertyAction] Error:", err);
    return { success: false, error: (err as Error)?.message || "Failed to moderate property." };
  }
}

/**
 * 5. USER MANAGEMENT
 */
export interface AdminUserItem {
  id: string;
  fullName: string;
  phone: string | null;
  role: "student" | "owner" | "admin";
  createdAt: string;
  ownerBusinessName?: string;
  ownerVerificationStatus?: string;
  isOwnerVerified?: boolean;
}

export async function getAdminUsersAction(filters?: {
  role?: string;
  search?: string;
}): Promise<ActionResult<AdminUserItem[]>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    let query = supabase
      .from("profiles")
      .select(`
        id, full_name, phone, role, created_at,
        owner:owners (id, business_name, is_verified, verification_status)
      `)
      .order("created_at", { ascending: false });

    if (filters?.role && filters.role !== "ALL") {
      query = query.eq("role", filters.role.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      query = query.or(`full_name.ilike.%${filters.search.trim()}%,phone.ilike.%${filters.search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getAdminUsersAction] Error:", error);
      return { success: false, error: "Failed to fetch platform users directory." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: AdminUserItem[] = (data || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      role: row.role,
      createdAt: row.created_at,
      ownerBusinessName: row.owner?.[0]?.business_name || row.owner?.business_name,
      ownerVerificationStatus: row.owner?.[0]?.verification_status || row.owner?.verification_status,
      isOwnerVerified: row.owner?.[0]?.is_verified ?? row.owner?.is_verified,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error("[getAdminUsersAction] Error:", err);
    return { success: false, error: "Failed to retrieve users." };
  }
}

/**
 * 6. VISIT OVERSIGHT
 */
export interface AdminVisitItem {
  id: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  notes: string | null;
  hostNotes: string | null;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  ownerBusinessName: string;
  studentName: string;
  studentPhone: string | null;
}

export async function getAdminVisitsAction(filters?: {
  status?: string;
  search?: string;
}): Promise<ActionResult<AdminVisitItem[]>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    let query = supabase
      .from("visits")
      .select(`
        id, preferred_date, preferred_time_slot, status, notes, host_notes, created_at, property_id,
        property:properties (id, title, city, owner:owners (business_name)),
        student:profiles!student_id (id, full_name, phone)
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status.toLowerCase());
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getAdminVisitsAction] Error:", error);
      return { success: false, error: "Failed to fetch visit requests." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: AdminVisitItem[] = (data || []).map((row: any) => ({
      id: row.id,
      preferredDate: row.preferred_date,
      preferredTimeSlot: row.preferred_time_slot,
      status: row.status,
      notes: row.notes,
      hostNotes: row.host_notes,
      createdAt: row.created_at,
      propertyId: row.property_id,
      propertyTitle: row.property?.title || "Property",
      propertyCity: row.property?.city || "Jharkhand",
      ownerBusinessName: row.property?.owner?.business_name || "PG Host",
      studentName: row.student?.full_name || "Student Resident",
      studentPhone: row.student?.phone || "N/A",
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error("[getAdminVisitsAction] Error:", err);
    return { success: false, error: "Failed to load visit requests." };
  }
}

/**
 * 7. AUDIT LOGS
 */
export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function getAdminAuditLogsAction(limit: number = 50): Promise<ActionResult<AdminAuditLogItem[]>> {
  try {
    const authCheck = await assertAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select(`
        id, admin_id, action, target_type, target_id, metadata, created_at,
        admin:profiles!admin_id (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getAdminAuditLogsAction] Error:", error);
      return { success: false, error: "Failed to load security audit logs." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: AdminAuditLogItem[] = (data || []).map((row: any) => ({
      id: row.id,
      adminId: row.admin_id,
      adminName: row.admin?.full_name || "Administrator",
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error("[getAdminAuditLogsAction] Error:", err);
    return { success: false, error: "Failed to retrieve audit trail." };
  }
}
