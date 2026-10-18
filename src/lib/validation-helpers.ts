/**
 * Centralized Input Validation & Sanitization Helpers
 * Provides strict validation for UUIDs, string lengths, and input sanitization.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that an input is a valid RFC 4122 UUID.
 */
export function isValidUuid(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Trims and validates string length boundaries.
 */
export function validateBoundedString(
  val: unknown,
  fieldName: string,
  minLen: number,
  maxLen: number
): { valid: boolean; value?: string; error?: string } {
  if (typeof val !== "string") {
    return { valid: false, error: `${fieldName} must be a valid text string.` };
  }
  const trimmed = val.trim();
  if (trimmed.length < minLen) {
    return { valid: false, error: `${fieldName} must be at least ${minLen} characters long.` };
  }
  if (trimmed.length > maxLen) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLen} characters.` };
  }
  return { valid: true, value: trimmed };
}

/**
 * Standard sanitized error message helper to avoid leaking internal DB schema or constraint names.
 */
export function sanitizeDatabaseError(err: unknown, fallbackMessage: string): string {
  if (!err) return fallbackMessage;
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = msg.toLowerCase();

  // Handle specific user-safe conditions
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
  if (lower.includes("check constraint") || lower.includes("23514")) {
    return "The submitted values do not meet required validation rules.";
  }

  // Never return raw internal Postgres error strings containing table/column identifiers
  return fallbackMessage;
}
