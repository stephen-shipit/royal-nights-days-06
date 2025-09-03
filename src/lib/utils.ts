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

// Phone number formatting utility
export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const numericOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedNumeric = numericOnly.slice(0, 10);
  
  // Format as (XXX) XXX-XXXX
  if (limitedNumeric.length >= 6) {
    return `(${limitedNumeric.slice(0, 3)}) ${limitedNumeric.slice(3, 6)}-${limitedNumeric.slice(6)}`;
  } else if (limitedNumeric.length >= 3) {
    return `(${limitedNumeric.slice(0, 3)}) ${limitedNumeric.slice(3)}`;
  } else if (limitedNumeric.length > 0) {
    return `(${limitedNumeric}`;
  }
  
  return '';
}

// Phone number validation regex
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}
