import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type guard to check if an unknown value is a non-null object/record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Safely parse any value to a finite number, falling back to 0.
 */
export function numericValue(value: unknown): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

