/**
 * RoomSplits Owner Demo Storage Utility
 * Provides safe, hydration-friendly, client-side persistence for:
 * - Owner-created demo PG listings
 * - Owner demo profile preferences
 * 
 * Strictly separated from student shortlist storage and seed property datasets.
 */

export const ROOMSPLITS_OWNER_PROPERTIES_KEY = "roomsplits_owner_demo_properties";
export const ROOMSPLITS_OWNER_PROFILE_KEY = "roomsplits_owner_demo_profile";
export const ROOMSPLITS_OWNER_STORAGE_EVENT = "roomsplits:owner_storage_change";

export const SUPPORTED_JHARKHAND_CITIES = [
  "Ranchi",
  "Dhanbad",
  "Jamshedpur",
  "Bokaro",
  "Hazaribagh",
] as const;

export type SupportedCity = (typeof SUPPORTED_JHARKHAND_CITIES)[number];

export const AVAILABLE_AMENITIES = [
  "High-Speed Wi-Fi",
  "3x Daily Meals",
  "Power Backup",
  "Attached Bathroom",
  "Daily Housekeeping",
  "CCTV & 24/7 Security",
  "Study Table & Chair",
  "Laundry / Washing Machine",
  "RO Drinking Water",
  "AC in Rooms",
] as const;

export interface OwnerProperty {
  id: string;
  title: string;
  city: SupportedCity;
  locality: string;
  address: string;
  description: string;
  monthlyRent: number;
  securityDeposit?: number;
  genderPolicy: "boys" | "girls" | "co-ed";
  roomTypes: string[];
  amenities: string[];
  images: string[];
  coverImage: string;
  status: "draft" | "demo_published";
  createdAt: string;
  updatedAt: string;
  isDemoOwner: true;
}

export interface OwnerProfile {
  displayName: string;
  contactPreference: "phone" | "whatsapp" | "email";
  contactValue: string;
  primaryCity: SupportedCity;
}

const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  displayName: "",
  contactPreference: "phone",
  contactValue: "",
  primaryCity: "Ranchi",
};

export const SAMPLE_PG_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
];

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyOwnerStorageChange() {
  if (isClient()) {
    window.dispatchEvent(
      new CustomEvent(ROOMSPLITS_OWNER_STORAGE_EVENT, {
        detail: { timestamp: Date.now() },
      })
    );
  }
}

// ==========================================
// OWNER DEMO PROPERTIES CRUD
// ==========================================

export function getOwnerProperties(): OwnerProperty[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(ROOMSPLITS_OWNER_PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p): p is OwnerProperty =>
          Boolean(p && typeof p === "object" && typeof p.id === "string" && p.isDemoOwner === true)
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function getOwnerPropertyById(id: string): OwnerProperty | null {
  if (!id) return null;
  const list = getOwnerProperties();
  return list.find((p) => p.id === id) || null;
}

export function createOwnerProperty(
  data: Omit<OwnerProperty, "id" | "createdAt" | "updatedAt" | "isDemoOwner">
): OwnerProperty {
  const list = getOwnerProperties();
  const now = new Date().toISOString();
  const newProp: OwnerProperty = {
    ...data,
    id: `owner-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
    isDemoOwner: true,
  };

  const nextList = [newProp, ...list];
  if (isClient()) {
    try {
      window.localStorage.setItem(
        ROOMSPLITS_OWNER_PROPERTIES_KEY,
        JSON.stringify(nextList)
      );
      notifyOwnerStorageChange();
    } catch {
      // Storage quota fallback
    }
  }

  return newProp;
}

export function updateOwnerProperty(
  id: string,
  data: Partial<Omit<OwnerProperty, "id" | "createdAt" | "isDemoOwner">>
): OwnerProperty | null {
  const list = getOwnerProperties();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = list[index];
  const updated: OwnerProperty = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
    isDemoOwner: true,
  };

  const nextList = [...list];
  nextList[index] = updated;

  if (isClient()) {
    try {
      window.localStorage.setItem(
        ROOMSPLITS_OWNER_PROPERTIES_KEY,
        JSON.stringify(nextList)
      );
      notifyOwnerStorageChange();
    } catch {
      // Storage fallback
    }
  }

  return updated;
}

export function deleteOwnerProperty(id: string): boolean {
  const list = getOwnerProperties();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) {
    return false; // item was not found
  }

  if (isClient()) {
    try {
      window.localStorage.setItem(
        ROOMSPLITS_OWNER_PROPERTIES_KEY,
        JSON.stringify(filtered)
      );
      notifyOwnerStorageChange();
    } catch {
      // Storage fallback
    }
  }

  return true;
}

// ==========================================
// OWNER DEMO PROFILE
// ==========================================

export function getOwnerProfile(): OwnerProfile {
  if (!isClient()) return DEFAULT_OWNER_PROFILE;
  try {
    const raw = window.localStorage.getItem(ROOMSPLITS_OWNER_PROFILE_KEY);
    if (!raw) return DEFAULT_OWNER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : DEFAULT_OWNER_PROFILE.displayName,
      contactPreference:
        parsed.contactPreference === "whatsapp" || parsed.contactPreference === "email"
          ? parsed.contactPreference
          : "phone",
      contactValue: typeof parsed.contactValue === "string" ? parsed.contactValue : DEFAULT_OWNER_PROFILE.contactValue,
      primaryCity: (SUPPORTED_JHARKHAND_CITIES.includes(parsed.primaryCity)
        ? parsed.primaryCity
        : "Ranchi") as SupportedCity,
    };
  } catch {
    return DEFAULT_OWNER_PROFILE;
  }
}

export function saveOwnerProfile(profile: Partial<OwnerProfile>): OwnerProfile {
  if (!isClient()) return DEFAULT_OWNER_PROFILE;
  const current = getOwnerProfile();
  const updated: OwnerProfile = {
    displayName: profile.displayName ?? current.displayName,
    contactPreference: profile.contactPreference ?? current.contactPreference,
    contactValue: profile.contactValue ?? current.contactValue,
    primaryCity: profile.primaryCity ?? current.primaryCity,
  };

  try {
    window.localStorage.setItem(
      ROOMSPLITS_OWNER_PROFILE_KEY,
      JSON.stringify(updated)
    );
    notifyOwnerStorageChange();
  } catch {
    // Storage fallback
  }

  return updated;
}

export function resetOwnerProfile(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(ROOMSPLITS_OWNER_PROFILE_KEY);
    notifyOwnerStorageChange();
  } catch {
    // Storage fallback
  }
}

// ==========================================
// SUBSCRIPTION HELPER
// ==========================================

export function subscribeToOwnerStorage(callback: () => void): () => void {
  if (!isClient()) return () => {};

  const handler = () => {
    callback();
  };

  window.addEventListener(ROOMSPLITS_OWNER_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(ROOMSPLITS_OWNER_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
