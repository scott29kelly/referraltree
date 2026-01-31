'use client';

import { clsx } from 'clsx';
import { UserPlus, RefreshCw, CheckCircle } from 'lucide-react';
import { NoActivityEmpty } from '@/components/ui/empty-state';
import type { Activity } from '@/types/database';

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'referral_created':
      return UserPlus;
    case 'status_changed':
      return RefreshCw;
    case 'referral_sold':
      return CheckCircle;
    default:
      return RefreshCw;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'referral_created':
      return 'bg-sky-500/20 text-sky-400';
    case 'status_changed':
      return 'bg-amber-500/20 text-amber-400';
    case 'referral_sold':
      return 'bg-emerald-500/20 text-emerald-400';
    default:
      return 'bg-slate-700 text-slate-400';
  }
}

export default function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={clsx('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <NoActivityEmpty className="py-4" />
      </div>
    );
  }

  return (
    <div className={clsx('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 group"
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  colorClass
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.customer_name && (
                    <span className="text-xs text-slate-400">
                      {activity.customer_name}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
