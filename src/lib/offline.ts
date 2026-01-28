// Offline support utilities for Guardianship App
// Handles offline form submissions and sync when back online

const OFFLINE_QUEUE_KEY = 'guardianship_offline_queue';

export interface OfflineAction {
  id: string;
  type: 'create_referral' | 'update_status';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// Get pending offline actions
export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Add action to offline queue
export function addToOfflineQueue(
  type: OfflineAction['type'],
  data: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const queue = getOfflineQueue();
  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

// Remove action from queue
export function removeFromOfflineQueue(id: string): void {
  if (typeof window === 'undefined') return;

  const queue = getOfflineQueue();
  const filtered = queue.filter((a) => a.id !== id);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
}

// Update action in queue
export function updateOfflineAction(
  id: string,
  updates: Partial<OfflineAction>
): void {
  if (typeof window === 'undefined') return;

  const queue = getOfflineQueue();
  const updated = queue.map((a) =>
    a.id === id ? { ...a, ...updates } : a
  );
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
}

// Check if online
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

// Process a single offline action
async function processAction(action: OfflineAction): Promise<boolean> {
  try {
    switch (action.type) {
      case 'create_referral': {
        const { createReferral } = await import('./data');
        await createReferral(action.data as unknown as Parameters<typeof createReferral>[0]);
        return true;
      }
      case 'update_status': {
        const { updateReferralStatus } = await import('./data');
        await updateReferralStatus(
          action.data.id as string,
          action.data.status as unknown as Parameters<typeof updateReferralStatus>[1]
        );
        return true;
      }
      default:
        console.error('Unknown action type:', action.type);
        return false;
    }
  } catch (error) {
    console.error('Failed to process offline action:', error);
    return false;
  }
}

// Sync all pending actions
export async function syncOfflineQueue(): Promise<{
  success: number;
  failed: number;
}> {
  if (!isOnline()) {
    return { success: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  let success = 0;
  let failed = 0;

  for (const action of queue) {
    const result = await processAction(action);

    if (result) {
      removeFromOfflineQueue(action.id);
      success++;
    } else {
      // Increment retry count
      updateOfflineAction(action.id, { retries: action.retries + 1 });
      failed++;

      // Remove if too many retries
      if (action.retries >= 3) {
        removeFromOfflineQueue(action.id);
        console.error('Removed action after 3 failed retries:', action);
      }
    }
  }

  return { success, failed };
}

// Setup online/offline listeners
export function setupOfflineSync(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    console.log('Back online, syncing...');
    const result = await syncOfflineQueue();
    console.log(`Synced: ${result.success} success, ${result.failed} failed`);
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('Gone offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial sync if online
  if (isOnline()) {
    syncOfflineQueue();
  }

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Hook-friendly pending count
export function getPendingCount(): number {
  return getOfflineQueue().length;
}
