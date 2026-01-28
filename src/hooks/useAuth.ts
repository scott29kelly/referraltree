'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentRep,
  getSession,
  signOut as authSignOut,
  clearAuthCookie,
} from '@/lib/auth';
import type { Rep, Session } from '@/types/database';

interface UseAuthReturn {
  rep: Rep | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [rep, setRep] = useState<Rep | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentSession = await getSession();
      setSession(currentSession);

      if (currentSession) {
        const currentRep = await getCurrentRep();
        setRep(currentRep);
      } else {
        setRep(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
      setRep(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    try {
      await authSignOut();
      clearAuthCookie();
      setSession(null);
      setRep(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router]);

  return {
    rep,
    session,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: rep?.role === 'admin',
    signOut,
    refreshSession,
  };
}

// Hook for requiring authentication
export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, redirectTo, router]);

  return auth;
}

// Hook for requiring admin role
export function useRequireAdmin(redirectTo = '/dashboard') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push('/login');
      } else if (!auth.isAdmin) {
        router.push(redirectTo);
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.isAdmin, redirectTo, router]);

  return auth;
}

export default useAuth;
