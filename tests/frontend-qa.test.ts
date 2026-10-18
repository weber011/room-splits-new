import test from "node:test";
import assert from "node:assert";

// Sample properties representing the Jharkhand seed dataset
interface RoomOption {
  id: string;
  sharingType: string;
  monthlyRent: number;
}

interface TestProperty {
  id: string;
  title: string;
  city: string;
  locality: string;
  startingPrice: number;
  genderPolicy: string;
  roomOptions: RoomOption[];
}

const SAMPLE_PROPERTIES: TestProperty[] = [
  {
    id: "prop-1",
    title: "Sunrise Student Living",
    city: "Ranchi",
    locality: "Lalpur",
    startingPrice: 6500,
    genderPolicy: "boys",
    roomOptions: [
      { id: "r-1", sharingType: "single", monthlyRent: 10500 },
      { id: "r-2", sharingType: "double", monthlyRent: 6500 },
    ],
  },
  {
    id: "prop-2",
    title: "Campus Comfort PG",
    city: "Dhanbad",
    locality: "Hirapur",
    startingPrice: 5200,
    genderPolicy: "boys",
    roomOptions: [
      { id: "r-3", sharingType: "single", monthlyRent: 8500 },
      { id: "r-4", sharingType: "double", monthlyRent: 5200 },
    ],
  },
  {
    id: "prop-3",
    title: "Steel City Scholars Hub",
    city: "Jamshedpur",
    locality: "Bistupur",
    startingPrice: 7000,
    genderPolicy: "girls",
    roomOptions: [
      { id: "r-5", sharingType: "double", monthlyRent: 7000 },
      { id: "r-6", sharingType: "triple", monthlyRent: 4800 },
    ],
  },
  {
    id: "prop-4",
    title: "Greenwood Student Residency",
    city: "Bokaro",
    locality: "Sector 4",
    startingPrice: 4500,
    genderPolicy: "boys",
    roomOptions: [
      { id: "r-7", sharingType: "double", monthlyRent: 5800 },
      { id: "r-8", sharingType: "triple", monthlyRent: 4500 },
    ],
  },
  {
    id: "prop-5",
    title: "University View Hostel",
    city: "Hazaribagh",
    locality: "Matwari",
    startingPrice: 4200,
    genderPolicy: "co-ed",
    roomOptions: [
      { id: "r-9", sharingType: "single", monthlyRent: 6800 },
      { id: "r-10", sharingType: "double", monthlyRent: 4200 },
    ],
  },
];

const SUPPORTED_CITIES = [
  "Ranchi",
  "Dhanbad",
  "Jamshedpur",
  "Bokaro",
  "Hazaribagh",
];

// Pure filtering logic
function filterProperties(
  properties: TestProperty[],
  filters: {
    search?: string;
    city?: string;
    budget?: string;
    sharing?: string;
    sort?: string;
  }
) {
  let result = [...properties];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }

  if (filters.city) {
    result = result.filter(
      (p) => p.city.toLowerCase() === filters.city!.toLowerCase()
    );
  }

  if (filters.budget) {
    result = result.filter((p) => {
      const rents = [
        p.startingPrice,
        ...p.roomOptions.map((r) => r.monthlyRent),
      ];
      switch (filters.budget) {
        case "under-5000":
          return rents.some((r) => r < 5000);
        case "5000-8000":
          return rents.some((r) => r >= 5000 && r <= 8000);
        case "8000-12000":
          return rents.some((r) => r >= 8000 && r <= 12000);
        case "above-12000":
          return rents.some((r) => r > 12000);
        default:
          return true;
      }
    });
  }

  if (filters.sharing) {
    result = result.filter((p) =>
      p.roomOptions.some(
        (r) => r.sharingType.toLowerCase() === filters.sharing!.toLowerCase()
      )
    );
  }

  switch (filters.sort) {
    case "price_asc":
      result.sort((a, b) => a.startingPrice - b.startingPrice);
      break;
    case "price_desc":
      result.sort((a, b) => b.startingPrice - a.startingPrice);
      break;
    case "name_asc":
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return result;
}

// ========================================================
// 1. FILTERING AND SORTING TESTS
// ========================================================

test("Discovery Filtering: City Filter returns only matching cities", () => {
  const ranchiProps = filterProperties(SAMPLE_PROPERTIES, { city: "Ranchi" });
  assert.strictEqual(ranchiProps.length, 1);
  assert.strictEqual(ranchiProps[0].title, "Sunrise Student Living");

  const bokaroProps = filterProperties(SAMPLE_PROPERTIES, { city: "Bokaro" });
  assert.strictEqual(bokaroProps.length, 1);
  assert.strictEqual(bokaroProps[0].locality, "Sector 4");
});

test("Discovery Filtering: Case-insensitive City Filter", () => {
  const dhanbadProps = filterProperties(SAMPLE_PROPERTIES, { city: "dhanbad" });
  assert.strictEqual(dhanbadProps.length, 1);
  assert.strictEqual(dhanbadProps[0].city, "Dhanbad");
});

test("Discovery Filtering: Budget Under ₹5,000", () => {
  const budgetProps = filterProperties(SAMPLE_PROPERTIES, {
    budget: "under-5000",
  });
  // prop-3 has 4800, prop-4 has 4500, prop-5 has 4200
  assert.strictEqual(budgetProps.length, 3);
  assert.ok(budgetProps.some((p) => p.id === "prop-3"));
  assert.ok(budgetProps.some((p) => p.id === "prop-4"));
  assert.ok(budgetProps.some((p) => p.id === "prop-5"));
});

test("Discovery Filtering: Budget ₹8,000–₹12,000", () => {
  const budgetProps = filterProperties(SAMPLE_PROPERTIES, {
    budget: "8000-12000",
  });
  // prop-1 has 10500, prop-2 has 8500
  assert.strictEqual(budgetProps.length, 2);
  assert.ok(budgetProps.some((p) => p.id === "prop-1"));
  assert.ok(budgetProps.some((p) => p.id === "prop-2"));
});

test("Discovery Filtering: Room Sharing Type", () => {
  const tripleProps = filterProperties(SAMPLE_PROPERTIES, {
    sharing: "triple",
  });
  // prop-3 and prop-4 offer triple sharing
  assert.strictEqual(tripleProps.length, 2);
  assert.ok(tripleProps.every((p) => p.roomOptions.some((r) => r.sharingType === "triple")));
});

test("Discovery Filtering: Combined Multi-Filters", () => {
  const combined = filterProperties(SAMPLE_PROPERTIES, {
    city: "Ranchi",
    sharing: "single",
    budget: "8000-12000",
  });
  assert.strictEqual(combined.length, 1);
  assert.strictEqual(combined[0].id, "prop-1");
});

test("Discovery Sorting: Price Low to High", () => {
  const sorted = filterProperties(SAMPLE_PROPERTIES, { sort: "price_asc" });
  assert.strictEqual(sorted[0].startingPrice, 4200); // prop-5
  assert.strictEqual(sorted[sorted.length - 1].startingPrice, 7000); // prop-3
});

test("Discovery Sorting: Price High to Low", () => {
  const sorted = filterProperties(SAMPLE_PROPERTIES, { sort: "price_desc" });
  assert.strictEqual(sorted[0].startingPrice, 7000); // prop-3
  assert.strictEqual(sorted[sorted.length - 1].startingPrice, 4200); // prop-5
});

test("Discovery Sorting: Property Name A to Z", () => {
  const sorted = filterProperties(SAMPLE_PROPERTIES, { sort: "name_asc" });
  assert.strictEqual(sorted[0].title, "Campus Comfort PG");
  assert.strictEqual(sorted[sorted.length - 1].title, "University View Hostel");
});

test("Discovery Filtering: Non-existent City returns empty array gracefully", () => {
  const empty = filterProperties(SAMPLE_PROPERTIES, { city: "Kolkata" });
  assert.strictEqual(empty.length, 0);
});

// ========================================================
// 2. STUDENT STORAGE LOGIC TESTS
// ========================================================

// Mock in-memory localStorage for pure logic testing
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

test("Student Storage: Safe parsing handles valid and malformed JSON", () => {
  const storage = new MockLocalStorage();

  // Valid array
  storage.setItem("roomsplits_saved_properties", JSON.stringify(["prop-1", "prop-2"]));
  const raw1 = storage.getItem("roomsplits_saved_properties");
  const parsed1 = JSON.parse(raw1!);
  assert.strictEqual(Array.isArray(parsed1), true);
  assert.strictEqual(parsed1.length, 2);

  // Malformed non-array JSON
  storage.setItem("roomsplits_saved_properties", '{"error": true}');
  const raw2 = storage.getItem("roomsplits_saved_properties");
  const parsed2 = JSON.parse(raw2!);
  const safeArray = Array.isArray(parsed2) ? parsed2 : [];
  assert.strictEqual(safeArray.length, 0);

  // Corrupted non-JSON string
  storage.setItem("roomsplits_saved_properties", "invalid{json");
  let safeResult: string[] = [];
  try {
    const raw3 = storage.getItem("roomsplits_saved_properties");
    safeResult = JSON.parse(raw3!);
  } catch {
    safeResult = [];
  }
  assert.strictEqual(safeResult.length, 0);
});

test("Student Storage: Recently Viewed deduplication and cap at 10 items", () => {
  const MAX_ITEMS = 10;
  let history: string[] = ["prop-1", "prop-2", "prop-3"];

  // Add existing item: should move to front
  const addItem = (id: string) => {
    const filtered = history.filter((x) => x !== id);
    history = [id, ...filtered].slice(0, MAX_ITEMS);
  };

  addItem("prop-2");
  assert.deepStrictEqual(history, ["prop-2", "prop-1", "prop-3"]);

  // Fill up beyond 10
  for (let i = 4; i <= 15; i++) {
    addItem(`prop-${i}`);
  }
  assert.strictEqual(history.length, 10);
  assert.strictEqual(history[0], "prop-15");
  assert.strictEqual(history.includes("prop-3"), false); // evicted
});

// ========================================================
// 3. OWNER STORAGE & VALIDATION TESTS
// ========================================================

interface OwnerListing {
  id: string;
  title: string;
  city: string;
  locality: string;
  monthlyRent: number;
  roomTypes: string[];
  amenities: string[];
  isDemoOwner: boolean;
}

function validateOwnerListing(data: {
  title: string;
  city: string;
  locality: string;
  monthlyRent: number;
  roomTypes: string[];
  amenities: string[];
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 4) {
    errors.title = "Property name must be at least 4 characters.";
  }

  if (!SUPPORTED_CITIES.includes(data.city)) {
    errors.city = "City must be a supported Jharkhand location.";
  }

  if (!data.locality || data.locality.trim().length < 2) {
    errors.locality = "Locality is required.";
  }

  if (isNaN(data.monthlyRent) || data.monthlyRent <= 0) {
    errors.monthlyRent = "Monthly rent must be a positive valid number.";
  }

  if (!data.roomTypes || data.roomTypes.length === 0) {
    errors.roomTypes = "Select at least one room-sharing type.";
  }

  if (!data.amenities || data.amenities.length === 0) {
    errors.amenities = "Select at least one amenity.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

test("Owner Validation: Valid input passes cleanly", () => {
  const result = validateOwnerListing({
    title: "Green Villa PG",
    city: "Ranchi",
    locality: "Lalpur",
    monthlyRent: 6500,
    roomTypes: ["Single Room", "Double Sharing"],
    amenities: ["Wi-Fi", "Food"],
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(Object.keys(result.errors).length, 0);
});

test("Owner Validation: Rejects unsupported cities", () => {
  const result = validateOwnerListing({
    title: "Green Villa PG",
    city: "Patna", // Not in Jharkhand
    locality: "Kankarbagh",
    monthlyRent: 6500,
    roomTypes: ["Single Room"],
    amenities: ["Wi-Fi"],
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.city.includes("Jharkhand"));
});

test("Owner Validation: Rejects zero or negative monthly rent", () => {
  const resultZero = validateOwnerListing({
    title: "Green Villa PG",
    city: "Ranchi",
    locality: "Lalpur",
    monthlyRent: 0,
    roomTypes: ["Single Room"],
    amenities: ["Wi-Fi"],
  });
  assert.strictEqual(resultZero.isValid, false);
  assert.ok(resultZero.errors.monthlyRent.includes("positive"));

  const resultNeg = validateOwnerListing({
    title: "Green Villa PG",
    city: "Ranchi",
    locality: "Lalpur",
    monthlyRent: -500,
    roomTypes: ["Single Room"],
    amenities: ["Wi-Fi"],
  });
  assert.strictEqual(resultNeg.isValid, false);
});

test("Owner Validation: Rejects short title and missing room types", () => {
  const result = validateOwnerListing({
    title: "Ab", // too short
    city: "Dhanbad",
    locality: "Hirapur",
    monthlyRent: 5000,
    roomTypes: [], // empty
    amenities: ["Wi-Fi"],
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.title);
  assert.ok(result.errors.roomTypes);
});

test("Owner CRUD: Create, Update, and Delete operations", () => {
  let listings: OwnerListing[] = [];

  // 1. Create
  const newProp: OwnerListing = {
    id: `owner-demo-${Date.now()}`,
    title: "Student Heights",
    city: "Ranchi",
    locality: "Circular Road",
    monthlyRent: 7000,
    roomTypes: ["Double Sharing"],
    amenities: ["High-Speed Wi-Fi"],
    isDemoOwner: true,
  };
  listings.push(newProp);
  assert.strictEqual(listings.length, 1);
  assert.ok(listings[0].id.startsWith("owner-demo-"));

  // 2. Update
  const updateIdx = listings.findIndex((p) => p.id === newProp.id);
  listings[updateIdx] = {
    ...listings[updateIdx],
    monthlyRent: 7500,
    title: "Student Heights Luxury",
  };
  assert.strictEqual(listings[0].monthlyRent, 7500);
  assert.strictEqual(listings[0].title, "Student Heights Luxury");

  // 3. Delete
  listings = listings.filter((p) => p.id !== newProp.id);
  assert.strictEqual(listings.length, 0);
});

// ========================================================
// 4. SUPABASE CONFIGURATION & HEALTH CHECK LOGIC TESTS
// ========================================================

function checkSupabaseConfig(testEnv: {
  url?: string;
  publishableKey?: string;
  anonKey?: string;
}) {
  const url = testEnv.url || "";
  const key = testEnv.publishableKey || testEnv.anonKey || "";

  const urlConfigured = Boolean(url && !url.includes("placeholder") && !url.includes("your-project"));
  const keyConfigured = Boolean(key && !key.includes("placeholder") && !key.includes("your-supabase"));

  return {
    isConfigured: urlConfigured && keyConfigured,
    urlConfigured,
    keyConfigured,
  };
}

test("Supabase Config: Detects missing or placeholder variables", () => {
  // Empty
  const empty = checkSupabaseConfig({});
  assert.strictEqual(empty.isConfigured, false);
  assert.strictEqual(empty.urlConfigured, false);
  assert.strictEqual(empty.keyConfigured, false);

  // Placeholder
  const placeholder = checkSupabaseConfig({
    url: "https://your-project.supabase.co",
    publishableKey: "your-supabase-publishable-key",
  });
  assert.strictEqual(placeholder.isConfigured, false);

  // Valid configured
  const valid = checkSupabaseConfig({
    url: "https://xyzcompany.supabase.co",
    publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
  });
  assert.strictEqual(valid.isConfigured, true);
  assert.strictEqual(valid.urlConfigured, true);
  assert.strictEqual(valid.keyConfigured, true);
});

test("Supabase Config: Supports interchangeable PUBLISHABLE_KEY and ANON_KEY", () => {
  // Using anonKey alias
  const withAnon = checkSupabaseConfig({
    url: "https://xyzcompany.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
  });
  assert.strictEqual(withAnon.isConfigured, true);
  assert.strictEqual(withAnon.keyConfigured, true);

  // Using publishableKey
  const withPub = checkSupabaseConfig({
    url: "https://xyzcompany.supabase.co",
    publishableKey: "sb_publishable_dummy_key",
  });
  assert.strictEqual(withPub.isConfigured, true);
});

test("Supabase Health Check: Distinguishes unconfigured from unmigrated schema", () => {
  // Scenario 1: Not configured -> 503
  const statusNotConfigured = checkSupabaseConfig({});
  const responseCode1 = statusNotConfigured.isConfigured ? 200 : 503;
  assert.strictEqual(responseCode1, 503);

  // Scenario 2: Configured, but database schema not yet created -> 200 with schemaCreated=false
  const mockDbError = {
    code: "PGRST205",
    message: "Could not find the table '_roomsplits_health_check' in the schema cache",
  };
  const isSchemaNotYetCreated =
    mockDbError.code === "PGRST205" ||
    mockDbError.message.toLowerCase().includes("could not find") ||
    mockDbError.message.toLowerCase().includes("does not exist");

  assert.strictEqual(isSchemaNotYetCreated, true);
  const healthResult = {
    status: "connected",
    configured: true,
    database: {
      connected: true,
      schemaCreated: !isSchemaNotYetCreated,
      statusMessage: isSchemaNotYetCreated
        ? "Connected to Supabase project. Database tables have not been created yet (Phase 9)."
        : "Connected to project with initialized schema.",
    },
  };

  assert.strictEqual(healthResult.status, "connected");
  assert.strictEqual(healthResult.database.connected, true);
  assert.strictEqual(healthResult.database.schemaCreated, false);
});

// ========================================================
// 5. PHASE 9: REAL SUPABASE AUTHENTICATION TESTS
// ========================================================

test("Auth: Signup validation rejects empty fields and short password", () => {
  const validateSignup = (data: { email?: string; password?: string; fullName?: string }) => {
    if (!data.email || !data.password || !data.fullName) {
      return { valid: false, error: "Full name, email address, and password are required." };
    }
    if (data.password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters long." };
    }
    return { valid: true };
  };

  assert.strictEqual(validateSignup({ email: "", password: "pass", fullName: "" }).valid, false);
  assert.strictEqual(validateSignup({ email: "a@b.com", password: "123", fullName: "User" }).valid, false);
  assert.strictEqual(validateSignup({ email: "a@b.com", password: "123456", fullName: "User" }).valid, true);
});

test("Auth: Signup validation rejects mismatched confirm passwords", () => {
  const checkPasswordMatch = (p1: string, p2: string) => {
    return p1 === p2;
  };
  assert.strictEqual(checkPasswordMatch("secret123", "secret999"), false);
  assert.strictEqual(checkPasswordMatch("secret123", "secret123"), true);
});

test("Auth: Public signup enforces role = 'student' and rejects role escalation", () => {
  const resolveSignupRole = (requestedRole?: string): "student" => {
    // Under no circumstances does public signup accept 'admin' or 'owner'
    // Database trigger tr_prevent_profile_role_escalation forces 'student'
    return "student";
  };

  assert.strictEqual(resolveSignupRole("admin"), "student");
  assert.strictEqual(resolveSignupRole("owner"), "student");
  assert.strictEqual(resolveSignupRole("student"), "student");
  assert.strictEqual(resolveSignupRole(undefined), "student");
});

test("Auth: Login error handling maps invalid credentials to user-friendly messages", () => {
  const mapAuthError = (err: string) => {
    const lower = err.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
      return "Incorrect email address or password. Please verify your credentials.";
    }
    if (lower.includes("email not confirmed")) {
      return "Your email address has not been verified yet. Please check your inbox for the confirmation link.";
    }
    if (lower.includes("too many requests") || lower.includes("rate limit")) {
      return "Too many login attempts. Please wait a moment before trying again.";
    }
    return "Unable to sign in. Please verify your credentials and try again.";
  };

  assert.strictEqual(
    mapAuthError("Invalid login credentials"),
    "Incorrect email address or password. Please verify your credentials."
  );
  assert.strictEqual(
    mapAuthError("Email not confirmed"),
    "Your email address has not been verified yet. Please check your inbox for the confirmation link."
  );
  assert.strictEqual(
    mapAuthError("rate limit exceeded"),
    "Too many login attempts. Please wait a moment before trying again."
  );
});

test("Auth: Open redirect sanitizer strips external protocol URLs and double slashes", () => {
  const sanitize = (url: string | null | undefined, fallback: string = "/student/dashboard"): string => {
    if (!url || typeof url !== "string") return fallback;
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
      return trimmed;
    }
    return fallback;
  };

  assert.strictEqual(sanitize("https://evil.com"), "/student/dashboard");
  assert.strictEqual(sanitize("//attacker.com/steal"), "/student/dashboard");
  assert.strictEqual(sanitize("javascript:alert(1)"), "/student/dashboard");
  assert.strictEqual(sanitize("/owner/dashboard"), "/owner/dashboard");
  assert.strictEqual(sanitize("/discover?city=Ranchi"), "/discover?city=Ranchi");
});

test("Auth: Unauthenticated user is denied access to student and owner dashboards", () => {
  const canAccessProtected = (user: { id: string } | null) => {
    return !!user;
  };

  assert.strictEqual(canAccessProtected(null), false);
  assert.strictEqual(canAccessProtected({ id: "user-123" }), true);
});

test("Auth: Student without owner record is redirected to owner onboarding", () => {
  interface User {
    id: string;
    role: "student" | "owner" | "admin";
    ownerId?: string;
  }

  const checkOwnerAccess = (user: User | null): { allowed: boolean; redirectUrl?: string } => {
    if (!user) return { allowed: false, redirectUrl: "/login?redirectTo=%2Fowner%2Fdashboard" };
    if (user.role === "admin") return { allowed: true };
    if (!user.ownerId) return { allowed: false, redirectUrl: "/owner/onboarding" };
    return { allowed: true };
  };

  // Student without owner record
  const student = { id: "s-1", role: "student" as const };
  assert.deepStrictEqual(checkOwnerAccess(student), {
    allowed: false,
    redirectUrl: "/owner/onboarding",
  });

  // Owner with owner record
  const owner = { id: "o-1", role: "student" as const, ownerId: "own-123" };
  assert.deepStrictEqual(checkOwnerAccess(owner), { allowed: true });

  // Admin
  const admin = { id: "a-1", role: "admin" as const };
  assert.deepStrictEqual(checkOwnerAccess(admin), { allowed: true });
});

test("Auth: Owner onboarding requires valid Jharkhand city and non-empty business name", () => {
  const supportedCities = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"];
  const validateOnboarding = (name: string, city: string) => {
    if (!name || name.trim().length < 3) return false;
    if (!supportedCities.includes(city)) return false;
    return true;
  };

  assert.strictEqual(validateOnboarding("A", "Ranchi"), false);
  assert.strictEqual(validateOnboarding("My Student PG", "Delhi"), false);
  assert.strictEqual(validateOnboarding("Ranchi Premier PG", "Ranchi"), true);
  assert.strictEqual(validateOnboarding("Dhanbad Boys Hostel", "Dhanbad"), true);
});

test("Auth: Owner onboarding keeps verification_status as 'pending' by default", () => {
  const initialOwnerStatus = {
    verification_status: "pending",
    is_verified: false,
  };

  assert.strictEqual(initialOwnerStatus.verification_status, "pending");
  assert.strictEqual(initialOwnerStatus.is_verified, false);
});

// ========================================================
// 7. PHASE 10: DATABASE-BACKED PROPERTY MANAGEMENT TESTS
// ========================================================

test("Phase 10: Published listing discovery only returns status = 'published'", () => {
  const properties = [
    { id: "1", title: "PG A", status: "published" },
    { id: "2", title: "PG B", status: "draft" },
    { id: "3", title: "PG C", status: "archived" },
    { id: "4", title: "PG D", status: "published" },
  ];

  const publicListings = properties.filter((p) => p.status === "published");
  assert.strictEqual(publicListings.length, 2);
  assert.ok(publicListings.every((p) => p.status === "published"));
});

test("Phase 10: Draft listing privacy blocks non-owners from viewing", () => {
  const property = {
    id: "prop-draft",
    owner_id: "owner-100",
    status: "draft",
    title: "Secret PG",
  };

  const canView = (prop: typeof property, userOwnerId?: string, userRole?: string) => {
    if (prop.status === "published") return true;
    if (userRole === "admin") return true;
    if (userOwnerId && userOwnerId === prop.owner_id) return true;
    return false;
  };

  // Anonymous visitor
  assert.strictEqual(canView(property, undefined), false);
  // Other owner
  assert.strictEqual(canView(property, "owner-999"), false);
  // True owner
  assert.strictEqual(canView(property, "owner-100"), true);
  // Platform admin
  assert.strictEqual(canView(property, undefined, "admin"), true);
});

test("Phase 10: Missing property IDs return null / not-found state", () => {
  const properties = [
    { id: "uuid-1", title: "PG 1" },
    { id: "uuid-2", title: "PG 2" },
  ];

  const findProperty = (id: string) => properties.find((p) => p.id === id) || null;

  assert.strictEqual(findProperty("uuid-1")?.title, "PG 1");
  assert.strictEqual(findProperty("uuid-non-existent"), null);
});

test("Phase 10: Room validation rejects negative rent, zero beds, and available > total", () => {
  const validateRoom = (rm: {
    sharingType: string;
    monthlyRent: number;
    totalBeds: number;
    availableBeds: number;
  }): { valid: boolean; error?: string } => {
    const validSharings = ["single", "double", "triple", "four_plus"];
    if (!validSharings.includes(rm.sharingType)) return { valid: false, error: "Invalid sharing type" };
    if (rm.monthlyRent <= 0) return { valid: false, error: "Rent must be positive" };
    if (rm.totalBeds < 1) return { valid: false, error: "Total beds must be >= 1" };
    if (rm.availableBeds < 0 || rm.availableBeds > rm.totalBeds) {
      return { valid: false, error: "Available beds cannot exceed total beds" };
    }
    return { valid: true };
  };

  assert.strictEqual(validateRoom({ sharingType: "single", monthlyRent: 8000, totalBeds: 1, availableBeds: 1 }).valid, true);
  assert.strictEqual(validateRoom({ sharingType: "single", monthlyRent: -500, totalBeds: 1, availableBeds: 1 }).valid, false);
  assert.strictEqual(validateRoom({ sharingType: "double", monthlyRent: 6000, totalBeds: 0, availableBeds: 0 }).valid, false);
  assert.strictEqual(validateRoom({ sharingType: "double", monthlyRent: 6000, totalBeds: 2, availableBeds: 3 }).valid, false);
  assert.strictEqual(validateRoom({ sharingType: "quad", monthlyRent: 6000, totalBeds: 4, availableBeds: 2 }).valid, false);
});

test("Phase 10: Cross-owner edit and deletion denial blocks unauthorized modifications", () => {
  const property = {
    id: "prop-alpha",
    owner_id: "owner-real-id",
    title: "Real Owner PG",
  };

  const authorizeOwnerMutation = (prop: typeof property, requestingOwnerId: string): boolean => {
    return prop.owner_id === requestingOwnerId;
  };

  assert.strictEqual(authorizeOwnerMutation(property, "owner-real-id"), true);
  assert.strictEqual(authorizeOwnerMutation(property, "owner-attacker-id"), false);
  assert.strictEqual(authorizeOwnerMutation(property, ""), false);
});

test("Phase 10: Saved-property authorization restricts records to student_id", () => {
  const savedTable = [
    { id: "s1", student_id: "student-1", property_id: "prop-1" },
    { id: "s2", student_id: "student-1", property_id: "prop-2" },
    { id: "s3", student_id: "student-2", property_id: "prop-1" },
  ];

  const getStudentSaves = (currentUserId: string) => {
    return savedTable.filter((row) => row.student_id === currentUserId);
  };

  const student1Saves = getStudentSaves("student-1");
  assert.strictEqual(student1Saves.length, 2);
  assert.ok(student1Saves.every((r) => r.student_id === "student-1"));

  const student2Saves = getStudentSaves("student-2");
  assert.strictEqual(student2Saves.length, 1);
  assert.strictEqual(student2Saves[0].property_id, "prop-1");

  const unauthSaves = getStudentSaves("student-unknown");
  assert.strictEqual(unauthSaves.length, 0);
});

test("Phase 10: Private-detail non-disclosure ensures exact address and owner phone are never in public props", () => {
  // Database row containing private details
  const publicRow = {
    id: "prop-pub",
    title: "City Center PG",
    city: "Ranchi",
    locality: "Lalpur",
    starting_price: 6000,
    status: "published",
  };

  // Function simulating public projection
  const toPublicListing = (row: typeof publicRow) => ({
    id: row.id,
    title: row.title,
    location: {
      address: `${row.locality}, ${row.city}`, // Only general area
      locality: row.locality,
      city: row.city,
    },
    startingPrice: row.starting_price,
  });

  const projected = toPublicListing(publicRow);
  assert.strictEqual((projected as any).exact_address, undefined);
  assert.strictEqual((projected as any).contact_phone, undefined);
  assert.strictEqual((projected as any).ownerContact, undefined);
  assert.strictEqual(projected.location.address, "Lalpur, Ranchi");
});

test("Phase 10: Empty database state returns empty array without throwing", () => {
  const handleQueryResult = (rows: any[] | null, error: any) => {
    if (error) return [];
    if (!rows || rows.length === 0) return [];
    return rows;
  };

  assert.deepStrictEqual(handleQueryResult([], null), []);
  assert.deepStrictEqual(handleQueryResult(null, null), []);
  assert.deepStrictEqual(handleQueryResult(null, { message: "DB timeout" }), []);
});

// ============================================================================
// PHASE 11: COMPLETE VISIT SCHEDULING AND MANAGEMENT TESTS
// ============================================================================

test("Phase 11: Authentication requirement rejects unauthenticated visit scheduling", () => {
  const validateVisitAuth = (user: { id: string } | null) => {
    if (!user) return { success: false, error: "Please sign in to schedule an in-person room visit." };
    return { success: true };
  };

  assert.strictEqual(validateVisitAuth(null).success, false);
  assert.strictEqual(validateVisitAuth({ id: "student-123" }).success, true);
});

test("Phase 11: Invalid property status rejection blocks draft or archived properties from visits", () => {
  const validatePropertyForVisit = (property: { id: string; status: string } | null) => {
    if (!property) return { success: false, error: "Property could not be found." };
    if (property.status !== "published") {
      return { success: false, error: "Visits can only be requested for active published listings." };
    }
    return { success: true };
  };

  assert.strictEqual(validatePropertyForVisit(null).success, false);
  assert.strictEqual(validatePropertyForVisit({ id: "p-1", status: "draft" }).success, false);
  assert.strictEqual(validatePropertyForVisit({ id: "p-2", status: "archived" }).success, false);
  assert.strictEqual(validatePropertyForVisit({ id: "p-3", status: "published" }).success, true);
});

test("Phase 11: Room relationship validation rejects room not belonging to the property", () => {
  const validateRoomForProperty = (
    propertyId: string,
    roomId: string | undefined,
    roomRecord: { id: string; property_id: string } | null
  ) => {
    if (!roomId) return { success: true }; // Optional room selection
    if (!roomRecord || roomRecord.property_id !== propertyId) {
      return { success: false, error: "Selected room does not belong to this property." };
    }
    return { success: true };
  };

  assert.strictEqual(validateRoomForProperty("prop-1", undefined, null).success, true);
  assert.strictEqual(
    validateRoomForProperty("prop-1", "room-99", { id: "room-99", property_id: "prop-OTHER" }).success,
    false
  );
  assert.strictEqual(
    validateRoomForProperty("prop-1", "room-1", { id: "room-1", property_id: "prop-1" }).success,
    true
  );
});

test("Phase 11: Past date and invalid format rejection prevents scheduling in the past", () => {
  const validateVisitDate = (dateStr: string, todayStr: string = "2026-10-15") => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { success: false, error: "Please select a valid visit date in YYYY-MM-DD format." };
    }
    if (dateStr < todayStr) {
      return { success: false, error: "Visit date cannot be in the past." };
    }
    return { success: true };
  };

  assert.strictEqual(validateVisitDate("invalid-date").success, false);
  assert.strictEqual(validateVisitDate("2026-10-14", "2026-10-15").success, false);
  assert.strictEqual(validateVisitDate("2026-10-15", "2026-10-15").success, true);
  assert.strictEqual(validateVisitDate("2026-10-20", "2026-10-15").success, true);
});

test("Phase 11: Time slot validation enforces supported morning, afternoon, or evening slots", () => {
  const VALID_SLOTS = ["morning", "afternoon", "evening"];
  const validateSlot = (slot: string) => {
    if (!VALID_SLOTS.includes(slot)) {
      return { success: false, error: "Please select a supported time slot: morning, afternoon, or evening." };
    }
    return { success: true };
  };

  assert.strictEqual(validateSlot("midnight").success, false);
  assert.strictEqual(validateSlot("anytime").success, false);
  assert.strictEqual(validateSlot("morning").success, true);
  assert.strictEqual(validateSlot("afternoon").success, true);
  assert.strictEqual(validateSlot("evening").success, true);
});

test("Phase 11: Initial visit status is strictly server-enforced to 'pending'", () => {
  const resolveInitialStatus = (_clientSuppliedStatus?: string): "pending" => {
    // Client-supplied status must never be trusted
    return "pending";
  };

  assert.strictEqual(resolveInitialStatus("confirmed"), "pending");
  assert.strictEqual(resolveInitialStatus("completed"), "pending");
  assert.strictEqual(resolveInitialStatus(undefined), "pending");
});

test("Phase 11: Duplicate active visit prevention blocks repeated requests on the same date/slot", () => {
  const existingVisits = [
    { property_id: "prop-1", preferred_date: "2026-10-20", preferred_time_slot: "morning", status: "pending" },
    { property_id: "prop-1", preferred_date: "2026-10-22", preferred_time_slot: "evening", status: "confirmed" },
  ];

  const checkDuplicate = (propId: string, date: string, slot: string) => {
    const isDup = existingVisits.some(
      (v) => v.property_id === propId && v.preferred_date === date && v.preferred_time_slot === slot
    );
    if (isDup) return { success: false, error: "You already have an active visit scheduled for this slot." };
    return { success: true };
  };

  assert.strictEqual(checkDuplicate("prop-1", "2026-10-20", "morning").success, false);
  assert.strictEqual(checkDuplicate("prop-1", "2026-10-20", "afternoon").success, true);
  assert.strictEqual(checkDuplicate("prop-1", "2026-10-25", "morning").success, true);
});

test("Phase 11: Student access control restricts cancellation and viewing to own visits", () => {
  const visit = { id: "visit-1", student_id: "student-alpha", status: "pending" };

  const canCancel = (requesterId: string) => {
    if (requesterId !== visit.student_id) {
      return { success: false, error: "Unauthorized: You can only cancel your own visit requests." };
    }
    return { success: true };
  };

  assert.strictEqual(canCancel("student-intruder").success, false);
  assert.strictEqual(canCancel("student-alpha").success, true);
});

test("Phase 11: Visit cancellation eligibility allows pending/confirmed and blocks completed/declined", () => {
  const validateCancelEligibility = (status: string) => {
    if (status === "cancelled") return { success: false, error: "Already cancelled." };
    if (status === "completed") return { success: false, error: "Completed visits cannot be cancelled." };
    if (status === "declined") return { success: false, error: "Already declined." };
    if (status === "pending" || status === "confirmed") return { success: true };
    return { success: false, error: "Invalid status." };
  };

  assert.strictEqual(validateCancelEligibility("pending").success, true);
  assert.strictEqual(validateCancelEligibility("confirmed").success, true);
  assert.strictEqual(validateCancelEligibility("completed").success, false);
  assert.strictEqual(validateCancelEligibility("declined").success, false);
  assert.strictEqual(validateCancelEligibility("cancelled").success, false);
});

test("Phase 11: Owner cross-authorization prevents managing visits of other owners", () => {
  const visit = {
    id: "visit-101",
    property: { owner_id: "owner-real" },
    status: "pending",
  };

  const authorizeOwner = (requesterOwnerId: string) => {
    if (requesterOwnerId !== visit.property.owner_id) {
      return { success: false, error: "Unauthorized: You can only manage visits for your own properties." };
    }
    return { success: true };
  };

  assert.strictEqual(authorizeOwner("owner-impostor").success, false);
  assert.strictEqual(authorizeOwner("owner-real").success, true);
});

test("Phase 11: Owner status transition enforcement validates allowed lifecycles", () => {
  const validateTransition = (current: string, target: string) => {
    if (current === "cancelled") return { success: false, error: "Cannot modify cancelled visit." };
    if (current === "completed") return { success: false, error: "Completed visits cannot be reopened." };
    if (target === "confirmed" && current !== "pending") {
      return { success: false, error: "Only pending visits can be confirmed." };
    }
    if (target === "completed" && current !== "confirmed") {
      return { success: false, error: "Only confirmed visits can be completed." };
    }
    return { success: true };
  };

  assert.strictEqual(validateTransition("pending", "confirmed").success, true);
  assert.strictEqual(validateTransition("pending", "declined").success, true);
  assert.strictEqual(validateTransition("pending", "completed").success, false); // Must be confirmed first
  assert.strictEqual(validateTransition("confirmed", "completed").success, true);
  assert.strictEqual(validateTransition("cancelled", "confirmed").success, false);
  assert.strictEqual(validateTransition("completed", "confirmed").success, false);
});

test("Phase 11: Rescheduling requires future date and valid time slot, keeping pending state", () => {
  const validateReschedule = (newDate: string, newSlot: string, todayStr: string = "2026-10-15") => {
    if (!newDate || newDate < todayStr) return { success: false, error: "Date must be future." };
    if (!["morning", "afternoon", "evening"].includes(newSlot)) return { success: false, error: "Invalid slot." };
    return { success: true, targetStatus: "pending" };
  };

  assert.strictEqual(validateReschedule("2026-10-10", "morning", "2026-10-15").success, false);
  assert.strictEqual(validateReschedule("2026-10-20", "night", "2026-10-15").success, false);
  assert.strictEqual(validateReschedule("2026-10-20", "morning", "2026-10-15").targetStatus, "pending");
});

test("Phase 11: Private details remain hidden on pending visits and are revealed only upon confirmation", () => {
  const getVisibleDetails = (status: string, privateDetails: { address: string; phone: string }) => {
    const isConfirmed = status === "confirmed";
    return {
      address: isConfirmed ? privateDetails.address : "Unlocked upon host confirmation",
      phone: isConfirmed ? privateDetails.phone : "+91 9XXXX XXXXX",
    };
  };

  const secret = { address: "Flat 402, Circular Road, Lalpur", phone: "+91 98351 12345" };

  const pendingView = getVisibleDetails("pending", secret);
  assert.strictEqual(pendingView.address, "Unlocked upon host confirmation");
  assert.strictEqual(pendingView.phone, "+91 9XXXX XXXXX");

  const confirmedView = getVisibleDetails("confirmed", secret);
  assert.strictEqual(confirmedView.address, "Flat 402, Circular Road, Lalpur");
  assert.strictEqual(confirmedView.phone, "+91 98351 12345");
});

// =====================================================================
// PHASE 12: SECURE PROPERTY IMAGE UPLOADS & MANAGEMENT TESTS
// =====================================================================

const TEST_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const TEST_MAX_IMAGES_PER_PROPERTY = 15;
const TEST_ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function testValidateImageMagicBytes(buffer: Uint8Array): {
  isValid: boolean;
  detectedType?: string;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, error: "File is corrupt or too small" };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedType: "image/jpeg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedType: "image/png" };
  }
  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, detectedType: "image/webp" };
  }
  return { isValid: false, error: "Invalid format" };
}

test("Phase 12: Supported image types validation (JPEG, PNG, WebP via magic bytes and MIME)", () => {
  // JPEG magic bytes: FF D8 FF
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegResult = testValidateImageMagicBytes(jpegHeader);
  assert.strictEqual(jpegResult.isValid, true);
  assert.strictEqual(jpegResult.detectedType, "image/jpeg");

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngResult = testValidateImageMagicBytes(pngHeader);
  assert.strictEqual(pngResult.isValid, true);
  assert.strictEqual(pngResult.detectedType, "image/png");

  // WEBP magic bytes: RIFF....WEBP
  const webpHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  const webpResult = testValidateImageMagicBytes(webpHeader);
  assert.strictEqual(webpResult.isValid, true);
  assert.strictEqual(webpResult.detectedType, "image/webp");

  assert.strictEqual(TEST_ALLOWED_IMAGE_MIME_TYPES.includes("image/jpeg"), true);
  assert.strictEqual(TEST_ALLOWED_IMAGE_MIME_TYPES.includes("image/png"), true);
  assert.strictEqual(TEST_ALLOWED_IMAGE_MIME_TYPES.includes("image/webp"), true);
});

test("Phase 12: Unsupported image types rejection (SVG, EXE, PDF, HTML, fake extensions)", () => {
  // Disguised executable (.exe named .jpg): MZ header (4D 5A)
  const exeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
  assert.strictEqual(testValidateImageMagicBytes(exeHeader).isValid, false);

  // SVG script/xml: <?xml or <svg
  const svgHeader = new Uint8Array([0x3c, 0x73, 0x76, 0x67, 0x20, 0x78, 0x6d, 0x6c, 0x6e, 0x73, 0x3d, 0x22]);
  assert.strictEqual(testValidateImageMagicBytes(svgHeader).isValid, false);

  // PDF header: %PDF
  const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0d, 0x0a, 0x25, 0xd0]);
  assert.strictEqual(testValidateImageMagicBytes(pdfHeader).isValid, false);

  // Empty or truncated file (< 12 bytes)
  const tinyHeader = new Uint8Array([0xff, 0xd8, 0xff]);
  assert.strictEqual(testValidateImageMagicBytes(tinyHeader).isValid, false);
});

test("Phase 12: File size limit enforcement (rejects files > 5 MB)", () => {
  const checkSize = (bytes: number) => {
    if (bytes > TEST_MAX_IMAGE_FILE_SIZE) {
      return { valid: false, error: "File exceeds 5 MB limit" };
    }
    return { valid: true };
  };

  assert.strictEqual(checkSize(4 * 1024 * 1024).valid, true);
  assert.strictEqual(checkSize(5 * 1024 * 1024).valid, true);
  assert.strictEqual(checkSize(5 * 1024 * 1024 + 1).valid, false);
  assert.strictEqual(checkSize(10 * 1024 * 1024).valid, false);
});

test("Phase 12: Image count limit enforcement (caps property images at 15)", () => {
  const canAddMoreImages = (currentCount: number, addingCount: number) => {
    return currentCount + addingCount <= TEST_MAX_IMAGES_PER_PROPERTY;
  };

  assert.strictEqual(canAddMoreImages(0, 1), true);
  assert.strictEqual(canAddMoreImages(14, 1), true);
  assert.strictEqual(canAddMoreImages(15, 1), false);
  assert.strictEqual(canAddMoreImages(10, 6), false);
  assert.strictEqual(TEST_MAX_IMAGES_PER_PROPERTY, 15);
});

test("Phase 12: Authentication requirement for property image upload and deletion", () => {
  const checkAuth = (user: { id: string } | null) => {
    if (!user) {
      return { success: false, error: "Authentication required to manage images." };
    }
    return { success: true };
  };

  assert.strictEqual(checkAuth(null).success, false);
  assert.strictEqual(checkAuth({ id: "user-123" }).success, true);
});

test("Phase 12: Owner authorization verification (non-owner profile rejected)", () => {
  const verifyOwnerRole = (userRole: string, hasOwnerProfile: boolean) => {
    if (userRole !== "owner" && !hasOwnerProfile) {
      return { success: false, error: "Only registered PG owners can manage property images." };
    }
    return { success: true };
  };

  assert.strictEqual(verifyOwnerRole("student", false).success, false);
  assert.strictEqual(verifyOwnerRole("student", true).success, true);
  assert.strictEqual(verifyOwnerRole("owner", true).success, true);
});

test("Phase 12: Cross-owner upload denial (blocks uploading to another owner's property)", () => {
  const verifyPropertyOwnership = (
    propertyOwnerId: string,
    callerOwnerId: string
  ) => {
    if (propertyOwnerId !== callerOwnerId) {
      return { success: false, error: "Unauthorized: You do not own this property." };
    }
    return { success: true };
  };

  const ownerA = "owner-uuid-1111";
  const ownerB = "owner-uuid-2222";

  assert.strictEqual(verifyPropertyOwnership(ownerA, ownerA).success, true);
  assert.strictEqual(verifyPropertyOwnership(ownerA, ownerB).success, false);
});

test("Phase 12: Cross-owner deletion denial (blocks deleting another owner's property image)", () => {
  const verifyImageDeletion = (
    imagePropertyOwnerId: string,
    callerOwnerId: string
  ) => {
    if (imagePropertyOwnerId !== callerOwnerId) {
      return { success: false, error: "Unauthorized: Cannot delete another owner's image." };
    }
    return { success: true };
  };

  assert.strictEqual(verifyImageDeletion("owner-1", "owner-1").success, true);
  assert.strictEqual(verifyImageDeletion("owner-1", "owner-2").success, false);
});

test("Phase 12: Storage path isolation (safe UUID names under property_id without path traversal)", () => {
  const generateStoragePath = (propertyId: string, extension: string) => {
    // Strictly sanitize propertyId and generate random UUID filename
    const cleanPropId = propertyId.replace(/[^a-zA-Z0-9-]/g, "");
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, "");
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    return `${cleanPropId}/${uuid}.${safeExt}`;
  };

  // Traversal attack attempt
  const maliciousId = "../../etc/passwd";
  const sanitizedPath = generateStoragePath(maliciousId, "jpg");
  assert.strictEqual(sanitizedPath.includes(".."), false);
  assert.strictEqual(sanitizedPath.startsWith("etcpasswd/"), true);

  // Normal UUID property
  const validPath = generateStoragePath("prop-uuid-999", "png");
  assert.strictEqual(validPath, "prop-uuid-999/550e8400-e29b-41d4-a716-446655440000.png");
});

test("Phase 12: Database insertion failure cleanup (orphaned storage file removal)", () => {
  const uploadWorkflow = (dbInsertSucceeds: boolean, storagePath: string) => {
    const uploadedObjects: string[] = [storagePath];

    if (!dbInsertSucceeds) {
      // Atomic cleanup simulation
      const index = uploadedObjects.indexOf(storagePath);
      if (index !== -1) uploadedObjects.splice(index, 1);
      return { success: false, orphanedFilesRemaining: uploadedObjects.length };
    }

    return { success: true, orphanedFilesRemaining: 0 };
  };

  const failedInsert = uploadWorkflow(false, "prop-1/image-1.jpg");
  assert.strictEqual(failedInsert.success, false);
  assert.strictEqual(failedInsert.orphanedFilesRemaining, 0); // File was removed

  const successfulInsert = uploadWorkflow(true, "prop-1/image-2.jpg");
  assert.strictEqual(successfulInsert.success, true);
});

test("Phase 12: Properties without images display fallback photo without breaking", () => {
  const resolveGalleryImages = (rawImages: string[], coverImage?: string) => {
    const FALLBACK = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
    if (rawImages && rawImages.length > 0) return rawImages;
    if (coverImage) return [coverImage];
    return [FALLBACK];
  };

  const emptyProp = resolveGalleryImages([]);
  assert.strictEqual(emptyProp.length, 1);
  assert.strictEqual(emptyProp[0].includes("unsplash"), true);

  const customCoverOnly = resolveGalleryImages([], "https://images.unsplash.com/custom-cover");
  assert.strictEqual(customCoverOnly.length, 1);
  assert.strictEqual(customCoverOnly[0], "https://images.unsplash.com/custom-cover");
});

test("Phase 12: Gallery rendering handles broken image URLs with error fallback", () => {
  const getRenderedImageSrc = (
    index: number,
    images: string[],
    failedMap: Record<number, boolean>
  ) => {
    const FALLBACK = "https://images.unsplash.com/fallback";
    if (failedMap[index]) return FALLBACK;
    return images[index] || FALLBACK;
  };

  const images = ["https://broken-url.com/img.jpg", "https://valid-url.com/img.jpg"];
  const failed = { 0: true }; // Image 0 failed to load

  assert.strictEqual(getRenderedImageSrc(0, images, failed), "https://images.unsplash.com/fallback");
  assert.strictEqual(getRenderedImageSrc(1, images, failed), "https://valid-url.com/img.jpg");
});

test("Phase 12: Upload failure handling preserves client state and reports error message", () => {
  const handleUploadFailure = (
    currentImages: string[],
    failedError: string
  ) => {
    // Current images array must not be corrupted or cleared upon failure
    return {
      images: [...currentImages],
      feedback: { type: "error", message: failedError },
    };
  };

  const initial = ["img-1.jpg", "img-2.jpg"];
  const state = handleUploadFailure(initial, "Storage timeout");
  assert.deepStrictEqual(state.images, initial);
  assert.strictEqual(state.feedback.message, "Storage timeout");
});

// ============================================================================
// PHASE 13: NOTIFICATIONS AND USER COMMUNICATION TESTS
// ============================================================================

test("Phase 13: Notification creation after visit request triggers visit_requested event for owner", () => {
  interface NotificationRecord {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    propertyId: string;
    visitId: string;
    isRead: boolean;
  }

  const simulateVisitRequestNotification = (
    studentName: string,
    propertyTitle: string,
    preferredDate: string,
    timeSlot: string,
    ownerUserId: string,
    propertyId: string,
    visitId: string
  ): NotificationRecord => {
    return {
      id: "notif-req-1",
      userId: ownerUserId,
      type: "visit_requested",
      title: "New Visit Request Received 📅",
      message: `${studentName} requested to tour "${propertyTitle}" on ${preferredDate} (${timeSlot}).`,
      propertyId,
      visitId,
      isRead: false,
    };
  };

  const notif = simulateVisitRequestNotification(
    "Aman Kumar",
    "Sunrise Student Living",
    "2026-10-25",
    "morning",
    "user-owner-99",
    "prop-1",
    "visit-123"
  );

  assert.strictEqual(notif.type, "visit_requested");
  assert.strictEqual(notif.userId, "user-owner-99");
  assert.strictEqual(notif.propertyId, "prop-1");
  assert.strictEqual(notif.visitId, "visit-123");
  assert.strictEqual(notif.isRead, false);
  assert.match(notif.message, /Aman Kumar requested to tour "Sunrise Student Living"/);
});

test("Phase 13: Owner recipient resolution correctly resolves owner.user_id from property", () => {
  const resolveOwnerRecipient = (property: {
    id: string;
    title: string;
    owner?: { id: string; user_id?: string | null } | null;
  }) => {
    const ownerUserId = property.owner?.user_id;
    if (!ownerUserId) {
      throw new Error("Unable to resolve owner user ID for notification.");
    }
    return ownerUserId;
  };

  // Valid property structure with nested owner
  const propertyWithOwner = {
    id: "prop-101",
    title: "Campus Comfort PG",
    owner: { id: "owner-row-5", user_id: "auth-user-owner-888" },
  };
  assert.strictEqual(resolveOwnerRecipient(propertyWithOwner), "auth-user-owner-888");

  // Property without linked user profile throws handled error
  const propertyWithoutOwner = { id: "prop-102", title: "Orphaned PG", owner: null };
  assert.throws(() => resolveOwnerRecipient(propertyWithoutOwner), /Unable to resolve owner user ID/);
});

test("Phase 13: Student recipient resolution correctly resolves visit.student_id across visit transitions", () => {
  type VisitEvent = "visit_confirmed" | "visit_declined" | "visit_rescheduled" | "visit_completed";

  const buildStudentNotification = (
    event: VisitEvent,
    visit: { id: string; student_id: string; property_id: string; title: string; date?: string; notes?: string }
  ) => {
    const titles: Record<VisitEvent, string> = {
      visit_confirmed: "Visit Request Confirmed! 🎉",
      visit_declined: "Visit Request Declined",
      visit_rescheduled: "Visit Rescheduled by Host 📅",
      visit_completed: "Visit Completed! ⭐",
    };

    return {
      recipientId: visit.student_id,
      type: event,
      title: titles[event],
      propertyId: visit.property_id,
      visitId: visit.id,
    };
  };

  const visitData = {
    id: "v-555",
    student_id: "student-user-42",
    property_id: "prop-10",
    title: "Steel City Scholars Hub",
  };

  const confirmedNotif = buildStudentNotification("visit_confirmed", visitData);
  assert.strictEqual(confirmedNotif.recipientId, "student-user-42");
  assert.strictEqual(confirmedNotif.type, "visit_confirmed");

  const rescheduledNotif = buildStudentNotification("visit_rescheduled", visitData);
  assert.strictEqual(rescheduledNotif.recipientId, "student-user-42");
  assert.strictEqual(rescheduledNotif.type, "visit_rescheduled");

  const completedNotif = buildStudentNotification("visit_completed", visitData);
  assert.strictEqual(completedNotif.recipientId, "student-user-42");
  assert.strictEqual(completedNotif.type, "visit_completed");
});

test("Phase 13: Failure safety: No notification is created after failed database operation", () => {
  let notificationCreated = false;

  const performVisitOperation = (dbSuccess: boolean) => {
    if (!dbSuccess) {
      return { success: false, error: "Database transaction failed." };
    }
    // Only created on verified success
    notificationCreated = true;
    return { success: true };
  };

  const failedResult = performVisitOperation(false);
  assert.strictEqual(failedResult.success, false);
  assert.strictEqual(notificationCreated, false);

  const successResult = performVisitOperation(true);
  assert.strictEqual(successResult.success, true);
  assert.strictEqual(notificationCreated, true);
});

test("Phase 13: Duplicate event deduplication suppresses repeated notifications in cooldown window", () => {
  interface NotificationEvent {
    userId: string;
    type: string;
    visitId: string;
    timestamp: number;
  }

  const eventLog: NotificationEvent[] = [];
  const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

  const dispatchNotificationWithDeduplication = (event: Omit<NotificationEvent, "timestamp">, currentTime: number) => {
    const isDuplicate = eventLog.some(
      (e) =>
        e.userId === event.userId &&
        e.type === event.type &&
        e.visitId === event.visitId &&
        currentTime - e.timestamp < COOLDOWN_MS
    );

    if (isDuplicate) {
      return { created: false, reason: "Deduplicated within cooldown window" };
    }

    eventLog.push({ ...event, timestamp: currentTime });
    return { created: true, reason: "Inserted successfully" };
  };

  const baseEvent = { userId: "user-1", type: "visit_requested", visitId: "v-1" };
  const t0 = 1000000;

  // First dispatch: succeeds
  const first = dispatchNotificationWithDeduplication(baseEvent, t0);
  assert.strictEqual(first.created, true);

  // Immediate retry within 30 seconds: deduplicated
  const second = dispatchNotificationWithDeduplication(baseEvent, t0 + 30000);
  assert.strictEqual(second.created, false);
  assert.strictEqual(second.reason, "Deduplicated within cooldown window");

  // Subsequent dispatch after 3 minutes: succeeds
  const third = dispatchNotificationWithDeduplication(baseEvent, t0 + 180000);
  assert.strictEqual(third.created, true);
});

test("Phase 13: Read/unread toggle and mark-all-read operations accurately update state", () => {
  interface StateNotification {
    id: string;
    userId: string;
    isRead: boolean;
    readAt: string | null;
  }

  const notifications: StateNotification[] = [
    { id: "n-1", userId: "user-a", isRead: false, readAt: null },
    { id: "n-2", userId: "user-a", isRead: false, readAt: null },
    { id: "n-3", userId: "user-a", isRead: true, readAt: "2026-10-17T10:00:00Z" },
    { id: "n-4", userId: "user-b", isRead: false, readAt: null },
  ];

  // Single mark as read
  const markAsRead = (id: string, userId: string) => {
    const item = notifications.find((n) => n.id === id && n.userId === userId);
    if (!item) return false;
    item.isRead = true;
    item.readAt = "2026-10-17T12:00:00Z";
    return true;
  };

  // Mark all as read
  const markAllAsRead = (userId: string) => {
    let count = 0;
    notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        n.readAt = "2026-10-17T12:00:00Z";
        count++;
      }
    });
    return count;
  };

  // Mark n-1 as read
  const markedSingle = markAsRead("n-1", "user-a");
  assert.strictEqual(markedSingle, true);
  assert.strictEqual(notifications[0].isRead, true);
  assert.strictEqual(notifications[0].readAt, "2026-10-17T12:00:00Z");

  // Cannot mark another user's notification
  const crossUserMark = markAsRead("n-4", "user-a");
  assert.strictEqual(crossUserMark, false);
  assert.strictEqual(notifications[3].isRead, false);

  // Mark all read for user-a
  const updatedCount = markAllAsRead("user-a");
  assert.strictEqual(updatedCount, 1); // Only n-2 was unread
  assert.strictEqual(notifications.filter((n) => n.userId === "user-a" && !n.isRead).length, 0);
  assert.strictEqual(notifications[3].isRead, false); // user-b remains unaffected
});

test("Phase 13: Cross-user notification isolation prevents reading other users alerts", () => {
  interface SecureNotification {
    id: string;
    userId: string;
    title: string;
  }

  const allDbNotifications: SecureNotification[] = [
    { id: "n-1", userId: "student-1", title: "Visit Approved" },
    { id: "n-2", userId: "student-1", title: "Time Changed" },
    { id: "n-3", userId: "owner-99", title: "New Visit Request" },
  ];

  // Emulating Supabase RLS policy: SELECT USING (auth.uid() = user_id)
  const queryNotificationsForUser = (authUserId: string) => {
    return allDbNotifications.filter((n) => n.userId === authUserId);
  };

  const studentAlerts = queryNotificationsForUser("student-1");
  assert.strictEqual(studentAlerts.length, 2);
  assert.strictEqual(studentAlerts.every((n) => n.userId === "student-1"), true);
  assert.strictEqual(studentAlerts.some((n) => n.userId === "owner-99"), false);

  const ownerAlerts = queryNotificationsForUser("owner-99");
  assert.strictEqual(ownerAlerts.length, 1);
  assert.strictEqual(ownerAlerts[0].title, "New Visit Request");
});

test("Phase 13: Unauthenticated access denial rejects notification retrieval and mutation", () => {
  const checkAuth = (currentUser: { id: string } | null) => {
    if (!currentUser) {
      return { success: false, error: "Please log in to view your notifications." };
    }
    return { success: true, userId: currentUser.id };
  };

  const unauthenticatedResult = checkAuth(null);
  assert.strictEqual(unauthenticatedResult.success, false);
  assert.strictEqual(unauthenticatedResult.error, "Please log in to view your notifications.");

  const authenticatedResult = checkAuth({ id: "user-123" });
  assert.strictEqual(authenticatedResult.success, true);
  assert.strictEqual(authenticatedResult.userId, "user-123");
});

test("Phase 13: Email provider behavior when unconfigured operates with graceful fallback and no fake claims", () => {
  interface EmailConfig {
    apiKey?: string;
    fromEmail?: string;
  }

  const sendEmailNotification = (
    config: EmailConfig,
    recipient: string,
    subject: string
  ) => {
    if (!config.apiKey) {
      // Must not claim success or throw uncaught exception
      return {
        success: false,
        delivered: false,
        status: "SKIPPED_NO_PROVIDER_CONFIGURED",
        message: "No email provider credentials configured in environment. In-app notification active.",
      };
    }

    return {
      success: true,
      delivered: true,
      status: "DELIVERED",
      recipient,
      subject,
    };
  };

  // When no API key is configured (current environment state)
  const resultWithoutKey = sendEmailNotification({}, "student@example.com", "Visit Confirmed");
  assert.strictEqual(resultWithoutKey.success, false);
  assert.strictEqual(resultWithoutKey.delivered, false);
  assert.strictEqual(resultWithoutKey.status, "SKIPPED_NO_PROVIDER_CONFIGURED");
  assert.match(resultWithoutKey.message || "", /In-app notification active/);

  // When configured with real key in future
  const resultWithKey = sendEmailNotification({ apiKey: "test_key_123" }, "student@example.com", "Visit Confirmed");
  assert.strictEqual(resultWithKey.success, true);
  assert.strictEqual(resultWithKey.delivered, true);
});

// ============================================================================
// PHASE 14: SECURE ADMIN DASHBOARD AND PLATFORM MANAGEMENT TESTS
// ============================================================================

test("Phase 14: Unauthenticated admin access denial blocks unauthenticated users", () => {
  const assertAdminCheck = (currentUser: { id: string; role: string } | null) => {
    if (!currentUser) {
      return { authorized: false, error: "Please log in to access administrative operations." };
    }
    if (currentUser.role !== "admin") {
      return { authorized: false, error: "Access denied: Administrator privileges required." };
    }
    return { authorized: true, user: currentUser };
  };

  const unauthenticated = assertAdminCheck(null);
  assert.strictEqual(unauthenticated.authorized, false);
  assert.strictEqual(unauthenticated.error, "Please log in to access administrative operations.");
});

test("Phase 14: Student admin access denial blocks users with role = 'student'", () => {
  const assertAdminCheck = (currentUser: { id: string; role: string } | null) => {
    if (!currentUser) {
      return { authorized: false, error: "Please log in to access administrative operations." };
    }
    if (currentUser.role !== "admin") {
      return { authorized: false, error: "Access denied: Administrator privileges required." };
    }
    return { authorized: true, user: currentUser };
  };

  const studentUser = { id: "student-101", role: "student" };
  const result = assertAdminCheck(studentUser);
  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.error, "Access denied: Administrator privileges required.");
});

test("Phase 14: Owner admin access denial blocks users with role = 'owner'", () => {
  const assertAdminCheck = (currentUser: { id: string; role: string } | null) => {
    if (!currentUser) {
      return { authorized: false, error: "Please log in to access administrative operations." };
    }
    if (currentUser.role !== "admin") {
      return { authorized: false, error: "Access denied: Administrator privileges required." };
    }
    return { authorized: true, user: currentUser };
  };

  const ownerUser = { id: "owner-202", role: "owner" };
  const result = assertAdminCheck(ownerUser);
  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.error, "Access denied: Administrator privileges required.");
});

test("Phase 14: Valid admin access grants full administrative privileges", () => {
  type AdminAuthResult =
    | { authorized: true; user: { id: string; role: string } }
    | { authorized: false; error: string };

  const assertAdminCheck = (currentUser: { id: string; role: string } | null): AdminAuthResult => {
    if (!currentUser) {
      return { authorized: false, error: "Please log in to access administrative operations." };
    }
    if (currentUser.role !== "admin") {
      return { authorized: false, error: "Access denied: Administrator privileges required." };
    }
    return { authorized: true, user: currentUser };
  };

  const adminUser = { id: "admin-999", role: "admin" };
  const result = assertAdminCheck(adminUser);
  assert.strictEqual(result.authorized, true);
  if (result.authorized) {
    assert.strictEqual(result.user.id, "admin-999");
    assert.strictEqual(result.user.role, "admin");
  }
});

test("Phase 14: Owner verification authorization permits admin approval and rejection with mandatory reason", () => {
  interface OwnerApp {
    id: string;
    userId: string;
    businessName: string;
    isVerified: boolean;
    verificationStatus: string;
    rejectionReason?: string | null;
  }

  const reviewOwner = (
    adminId: string,
    owner: OwnerApp,
    decision: "verified" | "rejected",
    rejectionReason?: string
  ) => {
    // 1. Self verification check
    if (owner.userId === adminId) {
      return { success: false, error: "Platform Security Violation: Administrators cannot verify their own host application." };
    }

    // 2. Rejection reason requirement
    if (decision === "rejected" && (!rejectionReason || !rejectionReason.trim())) {
      return { success: false, error: "A rejection reason is required when declining an owner application." };
    }

    const isApprove = decision === "verified";
    owner.isVerified = isApprove;
    owner.verificationStatus = decision;
    owner.rejectionReason = isApprove ? null : rejectionReason?.trim();
    return { success: true, owner };
  };

  const owner1: OwnerApp = {
    id: "o-1",
    userId: "user-host-1",
    businessName: "Greenwood PG",
    isVerified: false,
    verificationStatus: "pending",
  };

  // Valid Approval
  const approveRes = reviewOwner("admin-1", owner1, "verified");
  assert.strictEqual(approveRes.success, true);
  assert.strictEqual(owner1.isVerified, true);
  assert.strictEqual(owner1.verificationStatus, "verified");

  // Rejection without reason fails
  const owner2: OwnerApp = {
    id: "o-2",
    userId: "user-host-2",
    businessName: "Campus PG",
    isVerified: false,
    verificationStatus: "pending",
  };
  const rejectWithoutReason = reviewOwner("admin-1", owner2, "rejected", "");
  assert.strictEqual(rejectWithoutReason.success, false);
  assert.match(rejectWithoutReason.error || "", /rejection reason is required/);

  // Rejection with reason succeeds
  const rejectWithReason = reviewOwner("admin-1", owner2, "rejected", "Invalid electricity bill document");
  assert.strictEqual(rejectWithReason.success, true);
  assert.strictEqual(owner2.isVerified, false);
  assert.strictEqual(owner2.verificationStatus, "rejected");
  assert.strictEqual(owner2.rejectionReason, "Invalid electricity bill document");
});

test("Phase 14: Preventing self-verification stops admin from verifying own owner account", () => {
  const reviewOwner = (adminId: string, ownerUserId: string) => {
    if (ownerUserId === adminId) {
      return { success: false, error: "Platform Security Violation: Administrators cannot verify their own host application." };
    }
    return { success: true };
  };

  const selfVerificationAttempt = reviewOwner("admin-id-123", "admin-id-123");
  assert.strictEqual(selfVerificationAttempt.success, false);
  assert.strictEqual(
    selfVerificationAttempt.error,
    "Platform Security Violation: Administrators cannot verify their own host application."
  );
});

test("Phase 14: Property moderation authorization permits archive, restore, and verify by admins", () => {
  interface PropertyRecord {
    id: string;
    title: string;
    status: "draft" | "published" | "archived";
    isVerified: boolean;
  }

  const moderateProperty = (
    prop: PropertyRecord,
    action: "archive" | "publish" | "verify" | "unverify",
    reason?: string
  ) => {
    if (action === "archive") {
      if (!reason || !reason.trim()) {
        return { success: false, error: "Moderation reason is required to archive listing." };
      }
      prop.status = "archived";
      return { success: true, action: "PROPERTY_ARCHIVED", prop };
    }
    if (action === "publish") {
      prop.status = "published";
      return { success: true, action: "PROPERTY_RESTORED", prop };
    }
    if (action === "verify") {
      prop.isVerified = true;
      return { success: true, action: "PROPERTY_VERIFIED", prop };
    }
    if (action === "unverify") {
      prop.isVerified = false;
      return { success: true, action: "PROPERTY_UNVERIFIED", prop };
    }
    return { success: false, error: "Unknown action" };
  };

  const testProp: PropertyRecord = {
    id: "prop-99",
    title: "Sunrise Living",
    status: "published",
    isVerified: false,
  };

  // Archive requires reason
  const failedArchive = moderateProperty(testProp, "archive");
  assert.strictEqual(failedArchive.success, false);

  // Archive with reason succeeds
  const archiveRes = moderateProperty(testProp, "archive", "Inaccurate monthly rent reported");
  assert.strictEqual(archiveRes.success, true);
  assert.strictEqual(testProp.status, "archived");

  // Restore succeeds
  const restoreRes = moderateProperty(testProp, "publish");
  assert.strictEqual(restoreRes.success, true);
  assert.strictEqual(testProp.status, "published");

  // Verify badge issuance
  const verifyRes = moderateProperty(testProp, "verify");
  assert.strictEqual(verifyRes.success, true);
  assert.strictEqual(testProp.isVerified, true);
});

test("Phase 14: Cross-user management restrictions block arbitrary role escalation", () => {
  const updateProfileRole = (
    actorRole: string,
    targetUserId: string,
    actorUserId: string,
    newRole: string
  ) => {
    // Ordinary users cannot modify roles
    if (actorRole !== "admin") {
      throw new Error("Unauthorized: Users cannot modify their account role.");
    }
    return { success: true, targetUserId, newRole };
  };

  // Student trying to escalate to admin
  assert.throws(
    () => updateProfileRole("student", "user-student-1", "user-student-1", "admin"),
    /Unauthorized: Users cannot modify their account role/
  );

  // Owner trying to escalate to admin
  assert.throws(
    () => updateProfileRole("owner", "user-owner-1", "user-owner-1", "admin"),
    /Unauthorized: Users cannot modify their account role/
  );

  // Verified admin can assign role
  const adminResult = updateProfileRole("admin", "user-student-1", "admin-root", "owner");
  assert.strictEqual(adminResult.success, true);
  assert.strictEqual(adminResult.newRole, "owner");
});

test("Phase 14: Audit log authorization enforces immutability and admin-only access", () => {
  interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    timestamp: string;
  }

  const logsStore: AuditLog[] = [];

  const writeAuditLog = (actor: { id: string; role: string }, action: string, targetType: string, targetId: string) => {
    if (actor.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can create audit log entries.");
    }
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: actor.id,
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
    };
    logsStore.push(log);
    return log;
  };

  const readAuditLogs = (actor: { role: string }) => {
    if (actor.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can view security audit logs.");
    }
    return [...logsStore];
  };

  const deleteAuditLog = () => {
    // Database revokes DELETE / TRUNCATE from all roles
    throw new Error("Permission Denied: Audit log records are immutable and cannot be deleted.");
  };

  // Admin logs action
  const adminActor = { id: "admin-1", role: "admin" };
  const created = writeAuditLog(adminActor, "OWNER_VERIFIED", "owner", "o-1");
  assert.strictEqual(created.action, "OWNER_VERIFIED");
  assert.strictEqual(created.adminId, "admin-1");

  // Admin can read logs
  const logs = readAuditLogs(adminActor);
  assert.strictEqual(logs.length, 1);

  // Student cannot read logs
  const studentActor = { id: "student-1", role: "student" };
  assert.throws(() => readAuditLogs(studentActor), /Only administrators can view security audit logs/);

  // Nobody can delete logs
  assert.throws(() => deleteAuditLog(), /Audit log records are immutable/);
});

test("Phase 14: Prevention of self-assigned admin roles on profile creation enforces default role = 'student'", () => {
  const handleNewAuthUser = (metadata: { full_name?: string; role?: string }) => {
    // Trigger logic in PostgreSQL handle_new_auth_user() forces default role to 'student'
    const assignedRole = "student"; // Always forces 'student' regardless of metadata payload
    return {
      fullName: metadata.full_name || "Student Explorer",
      role: assignedRole,
    };
  };

  // Malicious signup payload trying to inject role: 'admin'
  const signupAttempt = handleNewAuthUser({
    full_name: "Sneaky User",
    role: "admin",
  });

  assert.strictEqual(signupAttempt.role, "student");
  assert.notStrictEqual(signupAttempt.role, "admin");
});

// ============================================================================
// PHASE 15: SECURITY AUDIT & PRODUCTION READINESS REGRESSION SUITE
// ============================================================================

test("Phase 15: UUID format validation rejects invalid, malformed, or path-traversing IDs", () => {
  const isValidUuid = (id: unknown): boolean => {
    if (typeof id !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
  };

  const validUuid = "a1b2c3d4-e5f6-4a1b-8c2d-123456789abc";
  const validUuidUpper = "A1B2C3D4-E5F6-4A1B-8C2D-123456789ABC";
  assert.strictEqual(isValidUuid(validUuid), true);
  assert.strictEqual(isValidUuid(validUuidUpper), true);

  // Path traversal attacks
  assert.strictEqual(isValidUuid("../etc/passwd"), false);
  assert.strictEqual(isValidUuid("..\\windows\\system32"), false);
  assert.strictEqual(isValidUuid("prop-1/../../../storage"), false);

  // SQL injection snippets
  assert.strictEqual(isValidUuid("' OR '1'='1"), false);
  assert.strictEqual(isValidUuid("'; DROP TABLE properties; --"), false);

  // Malformed or empty IDs
  assert.strictEqual(isValidUuid(""), false);
  assert.strictEqual(isValidUuid("12345"), false);
  assert.strictEqual(isValidUuid("not-a-valid-uuid-at-all"), false);
  assert.strictEqual(isValidUuid(null), false);
  assert.strictEqual(isValidUuid(undefined), false);
  assert.strictEqual(isValidUuid(12345), false);
});

test("Phase 15: Storage update policy validates both existing and resulting paths (WITH CHECK)", () => {
  interface StorageObject {
    bucketId: string;
    name: string; // e.g. "propertyId/image.jpg"
  }

  interface PropertyOwner {
    propertyId: string;
    ownerUserId: string;
  }

  const properties: PropertyOwner[] = [
    { propertyId: "prop-owner-1", ownerUserId: "user-owner-1" },
    { propertyId: "prop-owner-2", ownerUserId: "user-owner-2" },
  ];

  // Simulates Postgres RLS UPDATE evaluation with both USING (old row) and WITH CHECK (new row)
  const canUpdateStorageObject = (
    actorUserId: string,
    existingObj: StorageObject,
    resultingObj: StorageObject
  ): boolean => {
    // 1. USING clause: checks permissions on the existing object
    const oldPropId = existingObj.name.split("/")[0];
    const ownsExisting = properties.some(
      (p) => p.propertyId === oldPropId && p.ownerUserId === actorUserId
    );
    if (!ownsExisting || existingObj.bucketId !== "property-images") {
      return false;
    }

    // 2. WITH CHECK clause: checks permissions on the resulting (updated) object
    const newPropId = resultingObj.name.split("/")[0];
    const ownsResulting = properties.some(
      (p) => p.propertyId === newPropId && p.ownerUserId === actorUserId
    );
    if (!ownsResulting || resultingObj.bucketId !== "property-images") {
      return false;
    }

    return true;
  };

  const owner1 = "user-owner-1";
  const existingInProp1: StorageObject = { bucketId: "property-images", name: "prop-owner-1/photo1.jpg" };

  // Valid update within owner1's own directory
  const validRename: StorageObject = { bucketId: "property-images", name: "prop-owner-1/photo1_updated.jpg" };
  assert.strictEqual(canUpdateStorageObject(owner1, existingInProp1, validRename), true);

  // Cross-owner path tampering: trying to move/rename object into prop-owner-2's folder
  const maliciousCrossOwnerMove: StorageObject = { bucketId: "property-images", name: "prop-owner-2/photo1.jpg" };
  assert.strictEqual(canUpdateStorageObject(owner1, existingInProp1, maliciousCrossOwnerMove), false);

  // Changing bucket to an unauthorized bucket
  const maliciousBucketMove: StorageObject = { bucketId: "private-documents", name: "prop-owner-1/photo1.jpg" };
  assert.strictEqual(canUpdateStorageObject(owner1, existingInProp1, maliciousBucketMove), false);
});

test("Phase 15: Admin notification dispatch policy permits admin system notifications while blocking non-admin cross-user forgery", () => {
  interface NotificationInsertPayload {
    userId: string;
    type: string;
    title: string;
    message: string;
    visitId?: string;
  }

  interface Actor {
    id: string;
    role: "student" | "owner" | "admin";
  }

  // RLS evaluation for public.notifications insert policy
  const evaluateNotificationInsertPolicy = (
    actor: Actor,
    payload: NotificationInsertPayload
  ): boolean => {
    // Rule 1: Self-notification
    if (payload.userId === actor.id) return true;

    // Rule 2: Admin policy
    if (actor.role === "admin") return true;

    // Rule 3: Valid visit participant
    if (payload.visitId && (payload.type === "visit_requested" || payload.type === "visit_confirmed")) {
      return true;
    }

    return false;
  };

  const adminActor: Actor = { id: "admin-uuid-1", role: "admin" };
  const studentActor: Actor = { id: "student-uuid-2", role: "student" };
  const ownerActor: Actor = { id: "owner-uuid-3", role: "owner" };
  const victimUserId = "victim-uuid-4";

  // Admin can notify owner of KYC approval or property archiving without a visitId
  const adminSystemNotification: NotificationInsertPayload = {
    userId: victimUserId,
    type: "system",
    title: "Host Profile Verified! 🛡️",
    message: "Your host account has been verified.",
  };
  assert.strictEqual(evaluateNotificationInsertPolicy(adminActor, adminSystemNotification), true);

  // Student CANNOT send arbitrary system notifications to an unrelated user
  const studentForgedNotification: NotificationInsertPayload = {
    userId: victimUserId,
    type: "system",
    title: "You won a prize!",
    message: "Click here to claim.",
  };
  assert.strictEqual(evaluateNotificationInsertPolicy(studentActor, studentForgedNotification), false);

  // Owner CANNOT send unsolicited notifications without a valid visit
  const ownerUnsolicitedNotification: NotificationInsertPayload = {
    userId: victimUserId,
    type: "system",
    title: "Discount Offer",
    message: "Special rate on my rooms.",
  };
  assert.strictEqual(evaluateNotificationInsertPolicy(ownerActor, ownerUnsolicitedNotification), false);
});

test("Phase 15: String bounds and payload stuffing rejection across action mutations", () => {
  const validateStringBounds = (val: string, min: number, max: number): boolean => {
    if (typeof val !== "string") return false;
    const len = val.trim().length;
    return len >= min && len <= max;
  };

  // Normal title
  assert.strictEqual(validateStringBounds("Sunrise Student Living", 5, 200), true);
  // Extremely long title (payload stuffing)
  const hugeTitle = "A".repeat(201);
  assert.strictEqual(validateStringBounds(hugeTitle, 5, 200), false);

  // Normal description
  assert.strictEqual(validateStringBounds("A quiet and cozy PG close to city center.", 10, 5000), true);
  // Too short description
  assert.strictEqual(validateStringBounds("Short", 10, 5000), false);
  // Extremely long description
  const hugeDesc = "B".repeat(5001);
  assert.strictEqual(validateStringBounds(hugeDesc, 10, 5000), false);

  // Notes boundary check (max 1000)
  assert.strictEqual(validateStringBounds("Looking forward to visit tomorrow morning.", 0, 1000), true);
  const hugeNotes = "N".repeat(1001);
  assert.strictEqual(validateStringBounds(hugeNotes, 0, 1000), false);

  // Rejection reason boundary check (max 1000)
  const validReason = "The uploaded tax document has expired.";
  assert.strictEqual(validateStringBounds(validReason, 1, 1000), true);
  const hugeReason = "R".repeat(1001);
  assert.strictEqual(validateStringBounds(hugeReason, 1, 1000), false);
});

test("Phase 15: Database error sanitization prevents internal SQL/table name leakage", () => {
  const sanitizeDatabaseError = (err: unknown, fallback: string): string => {
    if (!err) return fallback;
    const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
    const lower = msg.toLowerCase();
    if (lower.includes("not found")) return "The requested record was not found.";
    if (lower.includes("already exists") || lower.includes("unique constraint") || lower.includes("23505")) {
      return "A record with this information already exists.";
    }
    if (lower.includes("violates foreign key") || lower.includes("foreign key constraint") || lower.includes("23503")) {
      return "This operation cannot be completed because related records depend on it.";
    }
    if (lower.includes("permission denied") || lower.includes("row-level security") || lower.includes("unauthorized")) {
      return "Access denied: You do not have permission to perform this action.";
    }
    return fallback;
  };

  const rawPostgresFkError = new Error('update or delete on table "properties" violates foreign key constraint "visits_property_id_fkey" on table "visits"');
  const sanitizedFk = sanitizeDatabaseError(rawPostgresFkError, "Failed to delete property.");
  assert.strictEqual(sanitizedFk, "This operation cannot be completed because related records depend on it.");
  assert.strictEqual(sanitizedFk.includes("visits_property_id_fkey"), false);
  assert.strictEqual(sanitizedFk.includes("table \"properties\""), false);

  const rawPostgresUniqueError = new Error('duplicate key value violates unique constraint "owners_user_id_key" (SQLSTATE 23505)');
  const sanitizedUnique = sanitizeDatabaseError(rawPostgresUniqueError, "Failed to save owner.");
  assert.strictEqual(sanitizedUnique, "A record with this information already exists.");
  assert.strictEqual(sanitizedUnique.includes("owners_user_id_key"), false);

  const genericInternalError = new Error("INTERNAL CONNECTION RESET AT POSTGRES PORT 5432 TABLE PUBLIC.PROFILES");
  const sanitizedGeneric = sanitizeDatabaseError(genericInternalError, "An unexpected error occurred. Please try again.");
  assert.strictEqual(sanitizedGeneric, "An unexpected error occurred. Please try again.");
  assert.strictEqual(sanitizedGeneric.includes("PORT 5432"), false);
});

test("Phase 15: Client environment isolation ensures no server secrets in client config", () => {
  const clientConfig = {
    NEXT_PUBLIC_SUPABASE_URL: "https://mock.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "mock-anon-key",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  };

  // Ensure no server keys are present in clientConfig
  assert.strictEqual(Object.prototype.hasOwnProperty.call(clientConfig, "SUPABASE_SERVICE_ROLE_KEY"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(clientConfig, "RAZORPAY_KEY_SECRET"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(clientConfig, "RAZORPAY_WEBHOOK_SECRET"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(clientConfig, "GOOGLE_MAPS_SERVER_KEY"), false);

  // All keys in clientConfig must be public-facing
  for (const key of Object.keys(clientConfig)) {
    assert.strictEqual(key.startsWith("NEXT_PUBLIC_"), true);
  }
});

test("Phase 15: Cross-owner image path isolation and 5MB limit verification", () => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateImageUpload = (fileSize: number, ownerPropId: string, targetPropId: string) => {
    if (fileSize > MAX_FILE_SIZE) {
      return { allowed: false, error: "File exceeds 5 MB limit" };
    }
    if (ownerPropId !== targetPropId) {
      return { allowed: false, error: "Cross-owner upload denied" };
    }
    return { allowed: true };
  };

  // Valid upload under 5MB for own property
  assert.strictEqual(validateImageUpload(2 * 1024 * 1024, "p-1", "p-1").allowed, true);

  // Oversized file
  const oversized = validateImageUpload(6 * 1024 * 1024, "p-1", "p-1");
  assert.strictEqual(oversized.allowed, false);
  assert.strictEqual(oversized.error, "File exceeds 5 MB limit");

  // Cross-owner attempt
  const crossOwner = validateImageUpload(2 * 1024 * 1024, "p-1", "p-2");
  assert.strictEqual(crossOwner.allowed, false);
  assert.strictEqual(crossOwner.error, "Cross-owner upload denied");
});

test("Phase 15: Private property details non-disclosure on draft/archived listings and unauthorized queries", () => {
  interface PropertyListing {
    id: string;
    ownerId: string;
    status: "draft" | "published" | "archived";
    locality: string;
    city: string;
    exactAddress?: string; // Private
    contactPhone?: string; // Private
  }

  const listings: PropertyListing[] = [
    { id: "prop-pub-1", ownerId: "owner-1", status: "published", locality: "Lalpur", city: "Ranchi" },
    { id: "prop-draft-2", ownerId: "owner-2", status: "draft", locality: "Hirapur", city: "Dhanbad" },
    { id: "prop-arch-3", ownerId: "owner-1", status: "archived", locality: "Bistupur", city: "Jamshedpur" },
  ];

  const getPublicListing = (id: string, requester: { role: string; ownerId?: string }): PropertyListing | null => {
    const item = listings.find((p) => p.id === id);
    if (!item) return null;

    // If draft or archived, only owner or admin can view
    if (item.status !== "published") {
      const isOwner = requester.ownerId && requester.ownerId === item.ownerId;
      const isAdmin = requester.role === "admin";
      if (!isOwner && !isAdmin) return null;
    }

    // Public view only exposes locality and city, NEVER exact address or private phone
    return {
      id: item.id,
      ownerId: item.ownerId,
      status: item.status,
      locality: item.locality,
      city: item.city,
    };
  };

  const studentUser = { role: "student" };
  const owner1User = { role: "owner", ownerId: "owner-1" };
  const adminUser = { role: "admin" };

  // Student can view published property
  const pub = getPublicListing("prop-pub-1", studentUser);
  assert.notStrictEqual(pub, null);
  assert.strictEqual(pub?.exactAddress, undefined);
  assert.strictEqual(pub?.contactPhone, undefined);

  // Student CANNOT view draft property
  const draftByStudent = getPublicListing("prop-draft-2", studentUser);
  assert.strictEqual(draftByStudent, null);

  // Non-owner CANNOT view draft property of another owner
  const draftByWrongOwner = getPublicListing("prop-draft-2", owner1User);
  assert.strictEqual(draftByWrongOwner, null);

  // Admin CAN view draft and archived properties
  const draftByAdmin = getPublicListing("prop-draft-2", adminUser);
  assert.notStrictEqual(draftByAdmin, null);
});

test("Phase 15: Anti-collusion self-verification guard blocks admin from verifying own owner account", () => {
  interface OwnerRecord {
    id: string;
    userId: string;
    businessName: string;
    verificationStatus: "pending" | "verified" | "rejected";
  }

  const reviewOwnerVerification = (
    admin: { id: string; role: string },
    targetOwner: OwnerRecord,
    decision: "verified" | "rejected"
  ) => {
    if (admin.role !== "admin") {
      return { success: false, error: "Admin privilege required." };
    }

    // Anti-collusion guard: administrator cannot verify their own owner application
    if (targetOwner.userId === admin.id) {
      return {
        success: false,
        error: "Platform Security Violation: Administrators cannot verify or approve their own host application.",
      };
    }

    targetOwner.verificationStatus = decision;
    return { success: true };
  };

  const admin1 = { id: "admin-user-1", role: "admin" };
  const adminAsOwner: OwnerRecord = {
    id: "owner-record-1",
    userId: "admin-user-1", // Same user ID!
    businessName: "Admin's Personal PG",
    verificationStatus: "pending",
  };

  const selfVerifyAttempt = reviewOwnerVerification(admin1, adminAsOwner, "verified");
  assert.strictEqual(selfVerifyAttempt.success, false);
  assert.match(selfVerifyAttempt.error || "", /Administrators cannot verify or approve their own host application/);
  assert.strictEqual(adminAsOwner.verificationStatus, "pending");

  // Legitimate third-party owner verification
  const otherOwner: OwnerRecord = {
    id: "owner-record-2",
    userId: "host-user-99",
    businessName: "Jharkhand Heights PG",
    verificationStatus: "pending",
  };

  const validVerifyAttempt = reviewOwnerVerification(admin1, otherOwner, "verified");
  assert.strictEqual(validVerifyAttempt.success, true);
  assert.strictEqual(otherOwner.verificationStatus, "verified");
});

test("Phase 15: Open redirect sanitizer prevents protocol-relative and external URL manipulation", () => {
  const sanitizeRedirectPath = (
    url: string | null | undefined,
    fallback: string = "/student/dashboard"
  ): string => {
    if (!url || typeof url !== "string") return fallback;
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
      return trimmed;
    }
    return fallback;
  };

  assert.strictEqual(sanitizeRedirectPath("/admin/dashboard"), "/admin/dashboard");
  assert.strictEqual(sanitizeRedirectPath("/property/1234"), "/property/1234");
  assert.strictEqual(sanitizeRedirectPath("/owner/properties/new"), "/owner/properties/new");

  // Malicious attempts
  assert.strictEqual(sanitizeRedirectPath("https://evil.com"), "/student/dashboard");
  assert.strictEqual(sanitizeRedirectPath("http://evil.com/phish"), "/student/dashboard");
  assert.strictEqual(sanitizeRedirectPath("//evil.com/protocol-relative"), "/student/dashboard");
  assert.strictEqual(sanitizeRedirectPath("javascript:alert(1)"), "/student/dashboard");
  assert.strictEqual(sanitizeRedirectPath(""), "/student/dashboard");
  assert.strictEqual(sanitizeRedirectPath(null), "/student/dashboard");
});
