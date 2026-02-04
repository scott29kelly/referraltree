'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationPayload, NotificationType } from '@/lib/notifications';

interface NotificationBellProps {
  userId?: string;
  className?: string;
}

const typeConfig: Record<
  NotificationType,
  { icon: any; color: string; bg: string; border: string }
> = {
  'follow-up': {
    icon: AlertTriangle,
    color: 'text-guardian-orange',
    bg: 'bg-guardian-orange/10',
    border: 'border-guardian-orange/30',
  },
  'status-change': {
    icon: CheckCircle,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  milestone: {
    icon: Trophy,
    color: 'text-guardian-gold',
    bg: 'bg-guardian-gold/10',
    border: 'border-guardian-gold/30',
  },
  'tax-threshold': {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
};

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, dismiss, markAllRead } = useNotifications(userId);

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          isOpen
            ? 'bg-guardian-gold/20 text-guardian-gold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-guardian-orange text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-guardian-gold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[50vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => dismiss(notification.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-700/50">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: NotificationPayload;
  onDismiss: () => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        'p-4 hover:bg-slate-800/50 transition-colors group',
        notification.priority === 'high' && 'border-l-2 border-guardian-orange'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-white">{notification.title}</h4>
            <button
              onClick={onDismiss}
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message}</p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-xs text-guardian-gold hover:underline flex items-center gap-1"
              >
                {notification.actionLabel || 'View'}
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Banner component for displaying high-priority notifications
export function NotificationBanner({
  notification,
  onDismiss,
}: {
  notification: NotificationPayload;
  onDismiss: () => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border',
        config.bg,
        config.border
      )}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
        <Icon className={cn('w-5 h-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white">{notification.title}</h4>
        <p className="text-sm text-slate-400 mt-0.5">{notification.message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              config.color,
              'bg-white/10 hover:bg-white/20'
            )}
          >
            {notification.actionLabel || 'View'}
          </a>
        )}
        <button
          onClick={onDismiss}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export default NotificationBell;
