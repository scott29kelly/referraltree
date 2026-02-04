import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits.length > 0 ? `(${digits}` : '';
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Should have exactly 10 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

export function generateId(): string {
  return `ref-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the base URL for the application.
 * Prioritizes NEXT_PUBLIC_APP_URL environment variable for production deployments,
 * falls back to window.location.origin for development.
 */
export function getAppUrl(): string {
  // First check environment variable (works on server and client)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback to window.location.origin (client-side only)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Default fallback for SSR when no env var is set
  return '';
}

/**
 * Generate a referral link for a specific rep.
 * Uses the production URL when available.
 */
export function getReferralUrl(repId: string): string {
  const baseUrl = getAppUrl();
  return `${baseUrl}/refer/${repId}`;
}

/**
 * Generate a customer tree view URL.
 */
export function getCustomerTreeUrl(customerId: string): string {
  const baseUrl = getAppUrl();
  return `${baseUrl}/referrals/${customerId}`;
}
