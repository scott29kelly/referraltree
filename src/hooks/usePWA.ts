'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncOfflineQueue, getPendingCount } from '@/lib/offline';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  pendingSync: number;
  isSyncing: boolean;
}

interface UsePWAReturn extends PWAState {
  promptInstall: () => Promise<boolean>;
  syncNow: () => Promise<{ success: number; failed: number }>;
}

// Helper to check if app is installed (runs only on client)
function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (navigator as { standalone?: boolean }).standalone === true;
  return isStandalone || isIosStandalone;
}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: getIsInstalled(),
    pendingSync: 0,
    isSyncing: false,
  }));

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update pending sync count periodically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePendingCount = () => {
      setState((prev) => ({
        ...prev,
        pendingSync: getPendingCount(),
      }));
    };

    // Initial count
    updatePendingCount();

    // Update every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  // Prompt install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState((prev) => ({
          ...prev,
          isInstallable: false,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Manual sync
  const syncNow = useCallback(async (): Promise<{ success: number; failed: number }> => {
    if (!state.isOnline) {
      return { success: 0, failed: 0 };
    }

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const result = await syncOfflineQueue();
      setState((prev) => ({
        ...prev,
        pendingSync: getPendingCount(),
        isSyncing: false,
      }));
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      setState((prev) => ({ ...prev, isSyncing: false }));
      return { success: 0, failed: 0 };
    }
  }, [state.isOnline]);

  return {
    ...state,
    promptInstall,
    syncNow,
  };
}

export default usePWA;
