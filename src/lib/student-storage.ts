/**
 * RoomSplits Student Local Storage Utility
 * Provides safe, hydration-friendly, client-side persistence for:
 * - Shortlisted / Saved property IDs
 * - Recently viewed property IDs (deduplicated, max 10)
 * - Demo student profile preferences
 * 
 * Includes cross-component event notifications so UI updates immediately.
 */

export const ROOMSPLITS_SAVED_KEY = "roomsplits_saved_properties";
export const ROOMSPLITS_RECENT_KEY = "roomsplits_recently_viewed";
export const ROOMSPLITS_PROFILE_KEY = "roomsplits_student_profile";
export const ROOMSPLITS_STORAGE_EVENT = "roomsplits:storage_change";

export interface StudentProfile {
  fullName: string;
  college: string;
  preferredCity: string;
  monthlyBudget: string;
  preferredSharing: string;
}

const DEFAULT_PROFILE: StudentProfile = {
  fullName: "",
  college: "",
  preferredCity: "Ranchi",
  monthlyBudget: "₹5,000–₹8,000",
  preferredSharing: "Double Sharing",
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyStorageChange(key: string) {
  if (isClient()) {
    window.dispatchEvent(
      new CustomEvent(ROOMSPLITS_STORAGE_EVENT, { detail: { key } })
    );
  }
}

// ==========================================
// SAVED / SHORTLISTED PROPERTIES
// ==========================================

export function getSavedPropertyIds(): string[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(ROOMSPLITS_SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function isPropertySaved(id: string): boolean {
  if (!id) return false;
  const saved = getSavedPropertyIds();
  return saved.includes(id);
}

export function toggleSaveProperty(id: string): boolean {
  if (!isClient() || !id) return false;
  const current = getSavedPropertyIds();
  const index = current.indexOf(id);
  let next: string[];
  let isNowSaved = false;

  if (index >= 0) {
    next = current.filter((item) => item !== id);
    isNowSaved = false;
  } else {
    next = [id, ...current];
    isNowSaved = true;
  }

  try {
    window.localStorage.setItem(ROOMSPLITS_SAVED_KEY, JSON.stringify(next));
    notifyStorageChange(ROOMSPLITS_SAVED_KEY);
  } catch {
    // LocalStorage quota or permission issue fallback
  }

  return isNowSaved;
}

export function removeSavedProperty(id: string): void {
  if (!isClient() || !id) return;
  const current = getSavedPropertyIds();
  const next = current.filter((item) => item !== id);
  try {
    window.localStorage.setItem(ROOMSPLITS_SAVED_KEY, JSON.stringify(next));
    notifyStorageChange(ROOMSPLITS_SAVED_KEY);
  } catch {
    // Fallback
  }
}

// ==========================================
// RECENTLY VIEWED PROPERTIES
// ==========================================

const MAX_RECENTLY_VIEWED = 10;

export function getRecentlyViewedIds(): string[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(ROOMSPLITS_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(id: string): void {
  if (!isClient() || !id) return;
  const current = getRecentlyViewedIds();
  // Deduplicate and move to front
  const filtered = current.filter((item) => item !== id);
  const next = [id, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

  try {
    window.localStorage.setItem(ROOMSPLITS_RECENT_KEY, JSON.stringify(next));
    notifyStorageChange(ROOMSPLITS_RECENT_KEY);
  } catch {
    // Fallback
  }
}

export function clearRecentlyViewed(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(ROOMSPLITS_RECENT_KEY);
    notifyStorageChange(ROOMSPLITS_RECENT_KEY);
  } catch {
    // Fallback
  }
}

// ==========================================
// DEMO STUDENT PROFILE
// ==========================================

export function getStudentProfile(): StudentProfile {
  if (!isClient()) return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(ROOMSPLITS_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : DEFAULT_PROFILE.fullName,
      college: typeof parsed.college === "string" ? parsed.college : DEFAULT_PROFILE.college,
      preferredCity: typeof parsed.preferredCity === "string" ? parsed.preferredCity : DEFAULT_PROFILE.preferredCity,
      monthlyBudget: typeof parsed.monthlyBudget === "string" ? parsed.monthlyBudget : DEFAULT_PROFILE.monthlyBudget,
      preferredSharing: typeof parsed.preferredSharing === "string" ? parsed.preferredSharing : DEFAULT_PROFILE.preferredSharing,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: Partial<StudentProfile>): StudentProfile {
  if (!isClient()) return DEFAULT_PROFILE;
  const current = getStudentProfile();
  const updated: StudentProfile = {
    fullName: profile.fullName ?? current.fullName,
    college: profile.college ?? current.college,
    preferredCity: profile.preferredCity ?? current.preferredCity,
    monthlyBudget: profile.monthlyBudget ?? current.monthlyBudget,
    preferredSharing: profile.preferredSharing ?? current.preferredSharing,
  };

  try {
    window.localStorage.setItem(ROOMSPLITS_PROFILE_KEY, JSON.stringify(updated));
    notifyStorageChange(ROOMSPLITS_PROFILE_KEY);
  } catch {
    // Fallback
  }

  return updated;
}

export function resetStudentProfile(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(ROOMSPLITS_PROFILE_KEY);
    notifyStorageChange(ROOMSPLITS_PROFILE_KEY);
  } catch {
    // Fallback
  }
}

// ==========================================
// SUBSCRIPTION HELPER
// ==========================================

export function subscribeToStorage(callback: () => void): () => void {
  if (!isClient()) return () => {};

  const handler = () => {
    callback();
  };

  window.addEventListener(ROOMSPLITS_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(ROOMSPLITS_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
