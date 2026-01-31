'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// ============================================
// Stats Card Skeleton
// ============================================
interface StatsCardSkeletonProps {
  variant?: 'default' | 'gold' | 'green' | 'blue';
  className?: string;
}

const variantStyles = {
  default: 'from-slate-800/80 to-slate-800/40',
  gold: 'from-guardian-gold/10 to-guardian-gold/5',
  green: 'from-emerald-500/10 to-emerald-500/5',
  blue: 'from-sky-500/10 to-sky-500/5',
};

export function StatsCardSkeleton({ variant = 'default', className }: StatsCardSkeletonProps) {
  return (
    <Card
      className={cn(
        'relative border-slate-700/40 overflow-hidden backdrop-blur-sm',
        `bg-gradient-to-br ${variantStyles[variant]}`,
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24 bg-slate-700/60" />
            <Skeleton className="h-8 w-20 bg-slate-700/60" />
            <Skeleton className="h-3 w-16 bg-slate-700/40" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl bg-slate-700/40" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Dashboard Stats Grid Skeleton
// ============================================
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCardSkeleton variant="default" />
      <StatsCardSkeleton variant="blue" />
      <StatsCardSkeleton variant="green" />
      <StatsCardSkeleton variant="gold" />
    </div>
  );
}

// ============================================
// Activity Feed Skeleton
// ============================================
interface ActivityFeedSkeletonProps {
  count?: number;
  className?: string;
}

export function ActivityFeedSkeleton({ count = 5, className }: ActivityFeedSkeletonProps) {
  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}>
      <Skeleton className="h-6 w-32 mb-4 bg-slate-700/60" />
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-lg bg-slate-700/50 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-[200px] bg-slate-700/50" />
              <Skeleton className="h-3 w-24 bg-slate-700/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Referral List Skeleton
// ============================================
interface ReferralListSkeletonProps {
  count?: number;
  className?: string;
}

export function ReferralListSkeleton({ count = 5, className }: ReferralListSkeletonProps) {
  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-36 bg-slate-700/60" />
        <Skeleton className="h-4 w-16 bg-slate-700/40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-slate-700/50" />
              <Skeleton className="h-3 w-20 bg-slate-700/40" />
            </div>
            <Skeleton className="h-6 w-16 rounded bg-slate-700/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Quick Action Card Skeleton
// ============================================
export function QuickActionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-5 rounded-xl',
        'bg-slate-800/50 border border-slate-700/50',
        className
      )}
    >
      <Skeleton className="w-12 h-12 rounded-xl bg-slate-700/50" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32 bg-slate-700/50" />
        <Skeleton className="h-3 w-24 bg-slate-700/40" />
      </div>
      <Skeleton className="w-5 h-5 rounded bg-slate-700/40" />
    </div>
  );
}

// ============================================
// Table Skeleton
// ============================================
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showFilters?: boolean;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 5, 
  showFilters = true,
  className 
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30',
        'backdrop-blur-sm border border-slate-700/40 overflow-hidden',
        'shadow-2xl shadow-black/20',
        className
      )}
    >
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-slate-700/40 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-xl bg-slate-700/50" />
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/40 bg-slate-800/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-5 py-4 text-left">
                  <Skeleton className="h-3 w-16 bg-slate-700/50" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-5 py-4">
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl bg-slate-700/50" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28 bg-slate-700/50" />
                          <Skeleton className="h-3 w-36 bg-slate-700/40" />
                        </div>
                      </div>
                    ) : colIdx === 1 ? (
                      <Skeleton className="h-6 w-20 rounded-lg bg-slate-700/50" />
                    ) : (
                      <Skeleton className="h-4 w-16 bg-slate-700/50" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/40 bg-slate-800/30">
        <Skeleton className="h-4 w-40 bg-slate-700/40" />
      </div>
    </div>
  );
}

// ============================================
// Rep Card Skeleton
// ============================================
export function RepCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-slate-800/50 border border-slate-700/50 p-5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full bg-slate-700/50" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 bg-slate-700/50" />
          <Skeleton className="h-4 w-48 bg-slate-700/40" />
        </div>
        <Skeleton className="w-8 h-8 rounded bg-slate-700/40" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/40">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-6 w-12 mx-auto bg-slate-700/50" />
              <Skeleton className="h-3 w-16 mx-auto bg-slate-700/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Pipeline Status Skeleton
// ============================================
export function PipelineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}>
      <Skeleton className="h-6 w-32 mb-4 bg-slate-700/60" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-12 mx-auto bg-slate-700/50" />
            <Skeleton className="h-4 w-16 mx-auto bg-slate-700/40" />
            <Skeleton className="h-2 w-full rounded-full bg-slate-700/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Full Dashboard Skeleton
// ============================================
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-slate-700/60" />
        <Skeleton className="h-5 w-80 bg-slate-700/40" />
      </div>

      {/* Stats Grid */}
      <DashboardStatsSkeleton />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionSkeleton />
        <QuickActionSkeleton />
        <QuickActionSkeleton />
      </div>

      {/* Activity & Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeedSkeleton />
        <ReferralListSkeleton />
      </div>
    </div>
  );
}

// ============================================
// Full Admin Skeleton
// ============================================
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-slate-700/60" />
        <Skeleton className="h-5 w-64 bg-slate-700/40" />
      </div>

      {/* Stats Grid */}
      <DashboardStatsSkeleton />

      {/* Pipeline */}
      <PipelineSkeleton />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionSkeleton />
        <QuickActionSkeleton />
      </div>

      {/* Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReferralListSkeleton />
        <ActivityFeedSkeleton />
      </div>
    </div>
  );
}
