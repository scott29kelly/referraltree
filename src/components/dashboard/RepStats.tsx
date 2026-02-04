'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Phone,
  MessageSquare,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Target,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RepStatsData {
  totalReferrals: number;
  submitted: number;
  contacted: number;
  quoted: number;
  sold: number;
  totalEarnings: number;
  pendingEarnings: number;
  level2Unlocked: boolean;
  level2Progress: {
    contacted: number;
    contactedRequired: number;
    closed: number;
    closedRequired: number;
  };
}

interface RepStatsProps {
  stats: RepStatsData;
  className?: string;
}

export function RepStats({ stats, className }: RepStatsProps) {
  const conversionRate = stats.totalReferrals > 0
    ? Math.round((stats.sold / stats.totalReferrals) * 100)
    : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Earnings Summary */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Earnings Summary
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">${stats.totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">${stats.pendingEarnings.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-400">${(stats.pendingEarnings + stats.totalEarnings).toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Projected</p>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline Overview</h3>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <PipelineStat
            icon={Users}
            label="Total"
            value={stats.totalReferrals}
            color="slate"
          />
          <PipelineStat
            icon={Users}
            label="Submitted"
            value={stats.submitted}
            color="slate"
          />
          <PipelineStat
            icon={Phone}
            label="Contacted"
            value={stats.contacted}
            color="sky"
          />
          <PipelineStat
            icon={MessageSquare}
            label="Quoted"
            value={stats.quoted}
            color="amber"
          />
          <PipelineStat
            icon={CheckCircle}
            label="Sold"
            value={stats.sold}
            color="emerald"
          />
        </div>

        {/* Conversion Rate */}
        <div className="mt-6 p-4 rounded-lg bg-slate-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversion Rate
            </span>
            <span className="font-bold text-white">{conversionRate}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${conversionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Level 2 Unlock Progress */}
      <Level2Progress
        isUnlocked={stats.level2Unlocked}
        progress={stats.level2Progress}
      />
    </div>
  );
}

function PipelineStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: 'slate' | 'sky' | 'amber' | 'emerald';
}) {
  const colorClasses = {
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    sky: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className={cn('p-4 rounded-xl border', colorClasses[color])}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

interface Level2ProgressProps {
  isUnlocked: boolean;
  progress: {
    contacted: number;
    contactedRequired: number;
    closed: number;
    closedRequired: number;
  };
}

function Level2Progress({ isUnlocked, progress }: Level2ProgressProps) {
  const contactedPercent = Math.min((progress.contacted / progress.contactedRequired) * 100, 100);
  const closedPercent = Math.min((progress.closed / progress.closedRequired) * 100, 100);

  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        isUnlocked
          ? 'bg-gradient-to-br from-guardian-gold/10 to-guardian-orange/5 border-guardian-gold/30'
          : 'bg-slate-800/50 border-slate-700/50'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {isUnlocked ? (
            <>
              <Unlock className="w-5 h-5 text-guardian-gold" />
              Level 2 Unlocked!
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 text-slate-400" />
              Unlock Bonus Tiers
            </>
          )}
        </h3>
        {isUnlocked && (
          <span className="px-3 py-1 rounded-full bg-guardian-gold/20 text-guardian-gold text-xs font-semibold">
            ACTIVE
          </span>
        )}
      </div>

      {!isUnlocked ? (
        <>
          <p className="text-sm text-slate-400 mb-4">
            Complete both requirements to unlock multi-level bonuses:
          </p>

          <div className="space-y-4">
            {/* Contacted Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400" />
                  Contacted Referrals
                </span>
                <span className={cn(
                  'font-medium',
                  contactedPercent >= 100 ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {progress.contacted} / {progress.contactedRequired}
                  {contactedPercent >= 100 && ' ✓'}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${contactedPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    contactedPercent >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-sky-500 to-sky-400'
                  )}
                />
              </div>
            </div>

            {/* Closed Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Closed Deals
                </span>
                <span className={cn(
                  'font-medium',
                  closedPercent >= 100 ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {progress.closed} / {progress.closedRequired}
                  {closedPercent >= 100 && ' ✓'}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${closedPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className={cn(
                    'h-full rounded-full',
                    closedPercent >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Bonus Preview */}
          <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">Once unlocked you earn:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-guardian-gold" />
                <span className="text-white">+$50</span>
                <span className="text-slate-500">Level 2</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-guardian-orange" />
                <span className="text-white">+$10</span>
                <span className="text-slate-500">Level 3</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Congratulations! You&apos;re now earning multi-level bonuses on your referral network.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-lg font-bold text-guardian-gold">$125</p>
              <p className="text-xs text-slate-400">Level 1</p>
              <p className="text-[10px] text-slate-500">Direct referrals</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-lg font-bold text-guardian-gold">$50</p>
              <p className="text-xs text-slate-400">Level 2</p>
              <p className="text-[10px] text-slate-500">Referral of referral</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-lg font-bold text-guardian-gold">$10</p>
              <p className="text-xs text-slate-400">Level 3</p>
              <p className="text-[10px] text-slate-500">Third level</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepStats;
