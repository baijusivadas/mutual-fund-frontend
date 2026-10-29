/**
 * Application-wide constants.
 * All magic numbers and shared string keys live here so they are
 * defined once, typed, and easy to change in a single place.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  ROLE: "auth_role",
  LOGIN_TIME: "auth_login_time",
} as const;

/** Milliseconds before an idle session is automatically logged out. */
export const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Milliseconds — fallback token lifetime matching the backend JWT expiry. */
export const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

/** How often (ms) the client polls for token expiry while logged in. */
export const TOKEN_CHECK_INTERVAL_MS = 60_000; // 1 minute

// ── API / Backend ─────────────────────────────────────────────────────────────
/** Auth endpoints that should NOT trigger an auto-logout on 401. */
export const AUTH_ROUTE_PREFIXES = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify-otp",
  "/auth/forgot-password",
] as const;

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

// ── Formatting ────────────────────────────────────────────────────────────────
export const CRORE_THRESHOLD = 10_000_000; // 1 Cr = 10,000,000
export const LAKH_THRESHOLD = 100_000;    // 1 L  =    100,000
export const THOUSAND_THRESHOLD = 1_000;

// ── Charts ────────────────────────────────────────────────────────────────────
/** Default sparkline height in pixels. */
export const SPARKLINE_HEIGHT = 48;
/** Default chart height in pixels. */
export const CHART_HEIGHT = 280;

// ── Dashboard ─────────────────────────────────────────────────────────────────
/** Number of months used in MIS / SIP business charts. */
export const CHART_MONTHS = 6;
/** Number of recent transactions shown in the feed panel. */
export const FEED_MAX_TRANSACTIONS = 10;
/** Available day-filter options for the operational metrics panel. */
export const DAY_FILTER_OPTIONS = [3, 7, 10, 15, 30] as const;
/** Default active day filter. */
export const DEFAULT_ACTIVE_DAYS = DAY_FILTER_OPTIONS[0];

// ── Colour Palette (chart series) ─────────────────────────────────────────────
export const CHART_COLORS = {
  blue: "#2563eb",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  rose: "#f43f5e",
} as const;

