'use client';

import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { TrendingUp } from 'lucide-react';
import type { Referral } from '@/types/database';

interface EarningsChartProps {
  referrals: Referral[];
  className?: string;
}

interface MonthData {
  label: string;
  earned: number;
  pending: number;
}

export default function EarningsChart({ referrals, className }: EarningsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthReferrals = referrals.filter((r) => {
        const created = new Date(r.created_at);
        return created >= monthStart && created <= monthEnd;
      });

      const earned = monthReferrals
        .filter((r) => r.status === 'sold')
        .reduce((sum, r) => sum + r.value, 0);

      const pending = monthReferrals
        .filter((r) => r.status !== 'sold')
        .reduce((sum, r) => sum + r.value, 0);

      months.push({ label: monthLabel, earned, pending });
    }

    return months;
  }, [referrals]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.earned + d.pending), 100);
  }, [data]);

  const totalEarned = useMemo(() => {
    return referrals
      .filter((r) => r.status === 'sold')
      .reduce((sum, r) => sum + r.value, 0);
  }, [referrals]);

  const totalPending = useMemo(() => {
    return referrals
      .filter((r) => r.status !== 'sold')
      .reduce((sum, r) => sum + r.value, 0);
  }, [referrals]);

  return (
    <div
      className={clsx(
        'rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30',
        'backdrop-blur-sm border border-slate-700/40 p-6',
        'shadow-2xl shadow-black/20',
        className
      )}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Earnings Over Time</h3>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30" />
            <span className="text-slate-400 font-medium">Earned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 shadow-lg shadow-slate-500/30" />
            <span className="text-slate-400 font-medium">Pending</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 flex items-end gap-3 mb-2">
        {data.map((month, index) => {
          const earnedHeight = (month.earned / maxValue) * 100;
          const pendingHeight = (month.pending / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (month.earned > 0 || month.pending > 0) && (
                <div className="absolute -mt-16 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-xl text-xs z-10">
                  <div className="text-emerald-400 font-medium">Earned: ${month.earned}</div>
                  <div className="text-slate-400">Pending: ${month.pending}</div>
                </div>
              )}

              <div className="w-full flex flex-col items-center justify-end h-44 relative">
                {/* Pending bar (stacked on top) */}
                {month.pending > 0 && (
                  <div
                    className={clsx(
                      'w-full max-w-10 rounded-t-lg transition-all duration-500 ease-out',
                      'bg-gradient-to-t from-slate-600 to-slate-500',
                      isHovered && 'scale-105 shadow-lg shadow-slate-500/30'
                    )}
                    style={{ height: `${pendingHeight}%` }}
                  />
                )}
                {/* Earned bar */}
                {month.earned > 0 && (
                  <div
                    className={clsx(
                      'w-full max-w-10 transition-all duration-500 ease-out',
                      'bg-gradient-to-t from-emerald-600 to-emerald-400',
                      month.pending > 0 ? '' : 'rounded-t-lg',
                      isHovered && 'scale-105 shadow-lg shadow-emerald-500/40'
                    )}
                    style={{ height: `${earnedHeight}%` }}
                  />
                )}
                {/* Empty state */}
                {month.earned === 0 && month.pending === 0 && (
                  <div className="w-full max-w-10 h-1 bg-slate-700/50 rounded-full" />
                )}
              </div>
              <span className={clsx(
                'text-xs font-medium transition-colors duration-200',
                isHovered ? 'text-white' : 'text-slate-500'
              )}>
                {month.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700/40 grid grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
          <p className="text-sm font-medium text-slate-400 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-emerald-400">
            ${totalEarned.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-700/10 border border-slate-600/20">
          <p className="text-sm font-medium text-slate-400 mb-1">Total Pending</p>
          <p className="text-2xl font-bold text-slate-300">
            ${totalPending.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
