/**
 * Shared formatting utilities for consistent data presentation.
 * Import these instead of defining local formatters in individual files.
 */

import { CRORE_THRESHOLD, LAKH_THRESHOLD } from "@/lib/constants";

/**
 * Format a number as Indian Rupee (INR) using the browser's Intl API.
 */
export const formatCurrency = (value: number, maximumFractionDigits = 0): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(value);
};

/**
 * Format a number in compact Indian units (Cr / L) with a ₹ prefix.
 * Falls back to `formatCurrency` for values below 1 Lakh.
 */
export const formatIndianUnits = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= CRORE_THRESHOLD) return `₹${(value / CRORE_THRESHOLD).toFixed(2)} Cr`;
  if (abs >= LAKH_THRESHOLD) return `₹${(value / LAKH_THRESHOLD).toFixed(2)} L`;
  return formatCurrency(value);
};

/**
 * Compact variant (k / L / Cr) — useful for chart axis tick labels.
 * Does NOT include decimals for "k" to stay tidy on narrow axes.
 */
export const formatCompactCurrency = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= CRORE_THRESHOLD) return `₹${(value / CRORE_THRESHOLD).toFixed(1)}Cr`;
  if (abs >= LAKH_THRESHOLD) return `₹${(value / LAKH_THRESHOLD).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(value / 1_000).toFixed(0)}k`;
  return `₹${value}`;
};

/**
 * Format a date value to a standard, human-readable string.
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", options);
};

/**
 * Format a numeric percentage with a leading sign.
 * e.g., `formatPercent(3.5)` → `"+3.50%"`, `formatPercent(-1.2)` → `"-1.20%"`
 */
export const formatPercent = (value: number | string): string => {
  const val = typeof value === "string" ? parseFloat(value) : value;
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
};

/**
 * Format a monetary amount in en-IN locale with optional fraction digits.
 * Suitable for table cells where ₹ symbol is already present via column header.
 */
export const formatAmount = (value: number, fractionDigits = 0): string =>
  value.toLocaleString("en-IN", { maximumFractionDigits: fractionDigits });
