'use client';

import { clsx } from 'clsx';
import { User, Mail, Trophy, DollarSign, MoreVertical, Star } from 'lucide-react';
import type { RepWithStats } from '@/types/database';

interface RepCardProps {
  rep: RepWithStats;
  onEdit?: (rep: RepWithStats) => void;
  onToggleActive?: (rep: RepWithStats) => void;
  className?: string;
}

export default function RepCard({
  rep,
  onEdit,
  onToggleActive,
  className,
}: RepCardProps) {
  return (
    <div
      className={clsx(
        'relative rounded-2xl border p-5 overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:shadow-2xl',
        rep.active
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border-slate-700/40 hover:border-slate-600/50'
          : 'bg-slate-900/50 border-slate-800/50 opacity-60',
        className
      )}
    >
      {/* Top performer badge */}
      {rep.total_earnings > 2000 && rep.active && (
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10 flex items-center justify-center border border-guardian-gold/30 animate-pulse-subtle">
            <Star className="w-4 h-4 text-guardian-gold" />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              'border shadow-lg transition-transform duration-300 hover:scale-105',
              rep.role === 'admin'
                ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-slate-600/40 to-slate-700/30 border-slate-600/30'
            )}
          >
            <User
              className={clsx(
                'w-7 h-7',
                rep.role === 'admin' ? 'text-emerald-400' : 'text-slate-300'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg tracking-tight">{rep.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px]">{rep.email}</span>
            </div>
          </div>
        </div>

        {(onEdit || onToggleActive) && (
          <div className="relative group">
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-44 py-2 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {onEdit && (
                <button
                  onClick={() => onEdit(rep)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                >
                  Edit Details
                </button>
              )}
              {onToggleActive && (
                <button
                  onClick={() => onToggleActive(rep)}
                  className={clsx(
                    'w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800/50 transition-colors',
                    rep.active
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-emerald-400 hover:text-emerald-300'
                  )}
                >
                  {rep.active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span
          className={clsx(
            'px-2.5 py-1 rounded-lg text-xs font-semibold',
            rep.role === 'admin'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
          )}
        >
          {rep.role}
        </span>
        <span
          className={clsx(
            'px-2.5 py-1 rounded-lg text-xs font-semibold border',
            rep.active
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/20 text-red-400 border-red-500/20'
          )}
        >
          {rep.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-guardian-gold/10 to-guardian-gold/5 border border-guardian-gold/10">
          <div className="w-9 h-9 rounded-lg bg-guardian-gold/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-guardian-gold" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Referrals</p>
            <p className="font-bold text-white text-lg">{rep.total_referrals}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Earnings</p>
            <p className="font-bold text-white text-lg">
              ${rep.total_earnings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
