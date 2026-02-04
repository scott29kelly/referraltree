'use client';

import { useState, useEffect } from 'react';
import type { ViewMode } from '@/components/referral-tree/ViewToggle';

const STORAGE_KEY = 'guardianship-view-preference';

export function useViewPreference(defaultView: ViewMode = 'tree'): [ViewMode, (view: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'tree' || stored === 'list') {
      setView(stored);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when view changes
  const setViewWithStorage = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem(STORAGE_KEY, newView);
  };

  // Return default view until hydrated to avoid hydration mismatch
  return [isHydrated ? view : defaultView, setViewWithStorage];
}

export default useViewPreference;
