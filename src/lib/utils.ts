import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to create a Date object that represents the local date
// from a date string without timezone conversion issues
export function parseLocalDate(dateString: string): Date {
  // Parse the date string (e.g., "2025-08-15") and create a local date
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}
