'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NotificationPayload } from '@/lib/notifications';

// Demo notifications for testing
const DEMO_NOTIFICATIONS: NotificationPayload[] = [
  {
    id: 'demo-1',
    type: 'follow-up',
    title: 'Follow-Up Needed',
    message: "Jennifer Adams' inspection request was submitted 3 days ago. They're waiting to hear from us!",
    actionUrl: '/dashboard/referrals',
    actionLabel: 'View Referral',
    referralId: 'ref-demo-1',
    referralName: 'Jennifer Adams',
    recipients: [],
    channels: ['in-app'],
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'pending',
  },
  {
    id: 'demo-2',
    type: 'status-change',
    title: 'Referral Quoted',
    message: "A quote has been sent to Mike Thompson. Fingers crossed!",
    referralId: 'ref-demo-2',
    referralName: 'Mike Thompson',
    recipients: [],
    channels: ['in-app'],
    priority: 'normal',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'sent',
  },
  {
    id: 'demo-3',
    type: 'milestone',
    title: 'Congratulations!',
    message: "You've unlocked Level 2 bonuses! You now earn $50 for every second-level referral that closes.",
    recipients: [],
    channels: ['in-app'],
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'sent',
  },
];

export interface UseNotificationsReturn {
  notifications: NotificationPayload[];
  unreadCount: number;
  isLoading: boolean;
  dismiss: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, fetch from API
      // const response = await fetch(`/api/notifications?userId=${userId}`);
      // const data = await response.json();
      // setNotifications(data.notifications);

      // For now, use demo data
      await new Promise((r) => setTimeout(r, 300));
      setNotifications(DEMO_NOTIFICATIONS);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Load read IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('guardianship-read-notifications');
    if (stored) {
      try {
        setReadIds(new Set(JSON.parse(stored)));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('guardianship-read-notifications', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set([...prev, ...notifications.map((n) => n.id)]);
      localStorage.setItem('guardianship-read-notifications', JSON.stringify([...next]));
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    dismiss,
    markAllRead,
    refresh: loadNotifications,
  };
}

export default useNotifications;
