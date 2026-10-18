import { Property, PropertySearchParams, RoomOption, SharingType, PropertyCategory, GenderPolicy } from "@/types";

/**
 * Production Jharkhand Seed/Demo Properties.
 * Kept strictly separated from live database queries for reference and testing.
 */
export const SEED_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    ownerId: "owner-1",
    title: "Sunrise Student Living",
    slug: "sunrise-student-living",
    description: "Premium student living space near Circular Road Lalpur with high-speed Wi-Fi, 3x daily meals, quiet study desk, and housekeeping.",
    category: "coliving",
    genderPolicy: "boys",
    location: {
      address: "Circular Road, Lalpur",
      locality: "Lalpur",
      city: "Ranchi",
      state: "Jharkhand",
      country: "India",
      pincode: "834001",
      nearbyLandmarks: ["Nucleus Mall", "Women's College Lalpur", "Ranchi University"],
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "AC in Rooms", "Study Table & Chair", "CCTV & 24/7 Security", "Power Backup"],
    rules: ["No smoking inside rooms", "Quiet study hours after 10 PM", "Gate closes at 10:30 PM"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 6500,
    rating: 4.9,
    reviewCount: 128,
    roomOptions: [
      { id: "r-1", sharingType: "single", monthlyRent: 10500, securityDeposit: 21000, availableBeds: 1, totalBeds: 2, hasAttachedBathroom: true, hasBalcony: true },
      { id: "r-2", sharingType: "double", monthlyRent: 6500, securityDeposit: 13000, availableBeds: 3, totalBeds: 6, hasAttachedBathroom: true, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prop-2",
    ownerId: "owner-2",
    title: "Campus Comfort PG",
    slug: "campus-comfort-pg",
    description: "Comfortable student hostel near Hirapur & IIT ISM region with 24/7 power backup, attached bathrooms, and homestyle food.",
    category: "pg",
    genderPolicy: "boys",
    location: {
      address: "Near Park Market, Hirapur",
      locality: "Hirapur",
      city: "Dhanbad",
      state: "Jharkhand",
      country: "India",
      pincode: "826001",
      nearbyLandmarks: ["IIT ISM Main Gate", "Hirapur Market", "Dhanbad Railway Station"],
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "Attached Bathroom", "Power Backup", "Laundry / Washing Machine"],
    rules: ["Boys only", "No alcohol or smoking on premises"],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 5200,
    rating: 4.8,
    reviewCount: 94,
    roomOptions: [
      { id: "r-3", sharingType: "double", monthlyRent: 6200, securityDeposit: 12400, availableBeds: 2, totalBeds: 4, hasAttachedBathroom: true, hasBalcony: false },
      { id: "r-4", sharingType: "triple", monthlyRent: 5200, securityDeposit: 10400, availableBeds: 4, totalBeds: 8, hasAttachedBathroom: false, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

import { createClient } from "@/lib/supabase/client";

/**
 * Get the Supabase client for data queries.
 * Safe for both client and server components without pulling in next/headers into client bundles.
 */
function getSupabaseClient() {
  return createClient();
}

/**
 * Maps a PostgreSQL database row from public.properties (with joins)
 * to the strongly typed frontend Property interface.
 * Strictly guarantees that private exact addresses and contact numbers
 * are not leaked in public queries.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbRowToProperty(row: any): Property {
  const roomOptions: RoomOption[] = Array.isArray(row.rooms)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.rooms.map((rm: any) => ({
        id: rm.id,
        sharingType: rm.sharing_type as SharingType,
        monthlyRent: Number(rm.monthly_rent),
        securityDeposit: Number(rm.security_deposit || 0),
        totalBeds: Number(rm.total_beds || 1),
        availableBeds: Number(rm.available_beds || 0),
        hasAttachedBathroom: Boolean(rm.has_attached_bathroom),
        hasBalcony: Boolean(rm.has_balcony),
      }))
    : [];

  const rawImages: string[] =
    Array.isArray(row.property_images) && row.property_images.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? row.property_images
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((img: any) => img.image_url)
      : [];

  const defaultCover =
    row.cover_image ||
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";

  let images: string[] = [];
  if (rawImages.length > 0) {
    if (row.cover_image && rawImages.includes(row.cover_image)) {
      images = [
        row.cover_image,
        ...rawImages.filter((u: string) => u !== row.cover_image),
      ];
    } else if (row.cover_image) {
      images = [row.cover_image, ...rawImages];
    } else {
      images = rawImages;
    }
  } else {
    images = [defaultCover];
  }

  const amenities: string[] = Array.isArray(row.property_amenities)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.property_amenities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((pa: any) => pa.amenity?.name || pa.amenities?.name)
        .filter(Boolean)
    : [];

  const genderPolicy =
    row.gender_policy === "co-ed" ? "unisex" : (row.gender_policy as GenderPolicy) || "boys";

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: (row.category as PropertyCategory) || "pg",
    genderPolicy,
    location: {
      address: `${row.locality}, ${row.city}`, // Public listing only discloses locality and city
      locality: row.locality,
      city: row.city,
      state: "Jharkhand",
      country: "India",
      pincode: "",
    },
    amenities: amenities.length > 0 ? amenities : ["High-Speed Wi-Fi", "Power Backup"],
    rules: ["Standard House Rules", "Valid Student ID required at check-in"],
    images,
    coverImage: row.cover_image || images[0],
    featured: false,
    verified: Boolean(row.is_verified),
    startingPrice: Number(row.starting_price) || 5000,
    rating: 4.8,
    reviewCount: 0,
    roomOptions,
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PropertyService {
  getAllProperties(params?: PropertySearchParams): Promise<Property[]>;
  getPublishedProperties(params?: PropertySearchParams): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getRecommendedProperties(): Promise<Property[]>;
  getPropertiesByCity(city: string): Promise<Property[]>;
  searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(idOrSlug: string, userId?: string, userRole?: string, userOwnerId?: string): Promise<Property | null>;
  getPropertyBySlug(slug: string, userId?: string, userRole?: string, userOwnerId?: string): Promise<Property | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOwnerProperties(ownerId: string, customClient?: any): Promise<Property[]>;
}

export const propertyService: PropertyService = {
  /**
   * Fetches published properties with optional server-side filtering.
   * If database has 0 published properties, returns empty array.
   */
  async getAllProperties(params?: PropertySearchParams): Promise<Property[]> {
    return this.getPublishedProperties(params);
  },

  async getPublishedProperties(params?: PropertySearchParams): Promise<Property[]> {
    try {
      const supabase = await getSupabaseClient();

      let query = supabase
        .from("properties")
        .select(`
          id, owner_id, title, slug, description, category, gender_policy,
          city, locality, starting_price, security_deposit, cover_image,
          status, is_verified, created_at, updated_at,
          rooms:rooms (
            id, sharing_type, monthly_rent, security_deposit, total_beds, available_beds, has_attached_bathroom, has_balcony
          ),
          property_images:property_images (
            id, image_url, caption, display_order
          ),
          property_amenities:property_amenities (
            amenity:amenities (id, name, category, icon)
          )
        `)
        .eq("status", "published");

      // Server-side Filtering
      if (params?.city) {
        query = query.eq("city", params.city);
      }
      if (params?.category && params.category !== ("all" as unknown)) {
        query = query.eq("category", params.category);
      }
      if (params?.genderPolicy && params.genderPolicy !== ("all" as unknown)) {
        const mapped = params.genderPolicy === "unisex" ? "co-ed" : params.genderPolicy;
        query = query.eq("gender_policy", mapped);
      }
      if (params?.maxPrice) {
        query = query.lte("starting_price", params.maxPrice);
      }
      if (params?.minPrice) {
        query = query.gte("starting_price", params.minPrice);
      }
      if (params?.query && params.query.trim().length > 0) {
        const q = params.query.trim();
        query = query.or(`title.ilike.%${q}%,locality.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Server-side Sorting
      if (params?.sortBy === "price_low_to_high" || params?.sortBy === "price_asc") {
        query = query.order("starting_price", { ascending: true });
      } else if (params?.sortBy === "price_high_to_low" || params?.sortBy === "price_desc") {
        query = query.order("starting_price", { ascending: false });
      } else if (params?.sortBy === "name_asc") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("[propertyService.getPublishedProperties] Supabase query error:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      let properties = data.map(mapDbRowToProperty);

      // In-memory filter for room sharing type if specified
      if (params?.sharingType && params.sharingType !== "") {
        properties = properties.filter((p) =>
          p.roomOptions.some((rm) => rm.sharingType === params.sharingType)
        );
      }

      return properties;
    } catch (err) {
      console.error("[propertyService.getPublishedProperties] Unexpected error:", err);
      return [];
    }
  },

  async getFeaturedProperties(): Promise<Property[]> {
    const all = await this.getPublishedProperties();
    return all.slice(0, 6);
  },

  async getRecommendedProperties(): Promise<Property[]> {
    const all = await this.getPublishedProperties();
    return all.slice(0, 6);
  },

  async getPropertiesByCity(city: string): Promise<Property[]> {
    return this.getPublishedProperties({ city });
  },

  async searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
    const properties = await this.getPublishedProperties(params);
    return {
      properties,
      total: properties.length,
    };
  },

  /**
   * Fetches a single property by ID or slug.
   * If property is in draft/archived status, only the verified owner or admin can view it.
   */
  async getPropertyById(
    idOrSlug: string,
    userId?: string,
    userRole?: string,
    userOwnerId?: string
  ): Promise<Property | null> {
    try {
      const supabase = await getSupabaseClient();

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase
        .from("properties")
        .select(`
          id, owner_id, title, slug, description, category, gender_policy,
          city, locality, starting_price, security_deposit, cover_image,
          status, is_verified, created_at, updated_at,
          rooms:rooms (
            id, sharing_type, monthly_rent, security_deposit, total_beds, available_beds, has_attached_bathroom, has_balcony
          ),
          property_images:property_images (
            id, image_url, caption, display_order
          ),
          property_amenities:property_amenities (
            amenity:amenities (id, name, category, icon)
          )
        `);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        return null;
      }

      // Authorization guard: draft or archived properties are strictly private to their owner or admin
      if (data.status !== "published") {
        const isOwner = userOwnerId && userOwnerId === data.owner_id;
        const isAdmin = userRole === "admin";
        if (!isOwner && !isAdmin) {
          return null;
        }
      }

      return mapDbRowToProperty(data);
    } catch (err) {
      console.error("[propertyService.getPropertyById] Unexpected error:", err);
      return null;
    }
  },

  async getPropertyBySlug(
    slug: string,
    userId?: string,
    userRole?: string,
    userOwnerId?: string
  ): Promise<Property | null> {
    return this.getPropertyById(slug, userId, userRole, userOwnerId);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOwnerProperties(ownerId: string, customClient?: any): Promise<Property[]> {
    if (!ownerId) return [];

    try {
      const supabase = customClient || getSupabaseClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, owner_id, title, slug, description, category, gender_policy,
          city, locality, starting_price, security_deposit, cover_image,
          status, is_verified, created_at, updated_at,
          rooms:rooms (
            id, sharing_type, monthly_rent, security_deposit, total_beds, available_beds, has_attached_bathroom, has_balcony
          ),
          property_images:property_images (
            id, image_url, caption, display_order
          ),
          property_amenities:property_amenities (
            amenity:amenities (id, name, category, icon)
          )
        `)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error("[propertyService.getOwnerProperties] Query error:", error);
        return [];
      }

      return data.map(mapDbRowToProperty);
    } catch (err) {
      console.error("[propertyService.getOwnerProperties] Unexpected error:", err);
      return [];
    }
  },
};
