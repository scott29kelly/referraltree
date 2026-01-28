// Authentication utilities for Guardianship App
// Uses localStorage for mock auth, will use Supabase Auth when connected

import { isSupabaseConfigured, getSupabaseClient } from './supabase';
import { getRepByEmail } from './data';
import { mockReps } from './mock-data';
import type { Rep, Session } from '@/types/database';

const AUTH_STORAGE_KEY = 'guardianship_auth';

interface StoredAuth {
  email: string;
  repId: string;
  expiresAt: number;
}

// ============ MOCK AUTH ============

function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const auth: StoredAuth = JSON.parse(stored);

    // Check if expired (24 hours)
    if (Date.now() > auth.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return auth;
  } catch {
    return null;
  }
}

function setStoredAuth(email: string, repId: string): void {
  if (typeof window === 'undefined') return;

  const auth: StoredAuth = {
    email,
    repId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ============ PUBLIC API ============

export interface SignInResult {
  success: boolean;
  error?: string;
  rep?: Rep;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  // Validate inputs
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get rep details
    const rep = await getRepByEmail(email);
    if (!rep) {
      await supabase.auth.signOut();
      return { success: false, error: 'No rep account found for this email' };
    }

    if (!rep.active) {
      await supabase.auth.signOut();
      return { success: false, error: 'Your account has been deactivated' };
    }

    return { success: true, rep };
  }

  // Mock auth - accept any password for demo purposes
  // In production, this would be replaced by Supabase Auth
  const rep = mockReps.find((r) => r.email.toLowerCase() === email.toLowerCase());

  if (!rep) {
    return { success: false, error: 'No account found with this email' };
  }

  if (!rep.active) {
    return { success: false, error: 'Your account has been deactivated' };
  }

  // Store auth in localStorage
  setStoredAuth(rep.email, rep.id);

  return { success: true, rep };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    await supabase.auth.signOut();
  }

  clearStoredAuth();
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email! };
  }

  const stored = getStoredAuth();
  if (!stored) return null;

  return { id: stored.repId, email: stored.email };
}

export async function getCurrentRep(): Promise<Rep | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient()!;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;
    return getRepByEmail(user.email);
  }

  const stored = getStoredAuth();
  if (!stored) return null;

  return mockReps.find((r) => r.id === stored.repId) || null;
}

export async function getSession(): Promise<Session | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const rep = await getCurrentRep();
  if (!rep) return null;

  return { user, rep };
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return getStoredAuth() !== null;
}

// For middleware/server-side checks via cookies
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/guardianship_auth=([^;]+)/);
  return match ? match[1] : null;
}

// Set auth cookie for middleware
export function setAuthCookie(repId: string, role: string): void {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `guardianship_auth=${repId}:${role}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'guardianship_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
