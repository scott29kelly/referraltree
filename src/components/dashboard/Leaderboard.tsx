'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Users,
  DollarSign,
  Target,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RepLeaderboardData {
  id: string;
  name: string;
  totalReferrals: number;
  contactedReferrals: number;
  closedDeals: number;
  revenue: number;
  level2Unlocked: boolean;
  trend: 'up' | 'down' | 'neutral';
  avatar?: string;
}

// Mock data for demonstration - in production this comes from API
const MOCK_LEADERBOARD: RepLeaderboardData[] = [
  {
    id: '1',
    name: 'Mike Thompson',
    totalReferrals: 47,
    contactedReferrals: 38,
    closedDeals: 18,
    revenue: 2250,
    level2Unlocked: true,
    trend: 'up',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    totalReferrals: 42,
    contactedReferrals: 35,
    closedDeals: 15,
    revenue: 1875,
    level2Unlocked: true,
    trend: 'up',
  },
  {
    id: '3',
    name: 'David Williams',
    totalReferrals: 38,
    contactedReferrals: 28,
    closedDeals: 12,
    revenue: 1500,
    level2Unlocked: true,
    trend: 'neutral',
  },
  {
    id: '4',
    name: 'Jennifer Adams',
    totalReferrals: 31,
    contactedReferrals: 22,
    closedDeals: 9,
    revenue: 1125,
    level2Unlocked: false,
    trend: 'down',
  },
  {
    id: '5',
    name: 'Robert Garcia',
    totalReferrals: 28,
    contactedReferrals: 20,
    closedDeals: 8,
    revenue: 1000,
    level2Unlocked: false,
    trend: 'up',
  },
  {
    id: '6',
    name: 'Lisa Chen',
    totalReferrals: 24,
    contactedReferrals: 18,
    closedDeals: 7,
    revenue: 875,
    level2Unlocked: false,
    trend: 'neutral',
  },
  {
    id: '7',
    name: 'James Miller',
    totalReferrals: 19,
    contactedReferrals: 12,
    closedDeals: 5,
    revenue: 625,
    level2Unlocked: false,
    trend: 'down',
  },
  {
    id: '8',
    name: 'Emily Davis',
    totalReferrals: 15,
    contactedReferrals: 10,
    closedDeals: 4,
    revenue: 500,
    level2Unlocked: false,
    trend: 'up',
  },
];

type SortField = 'totalReferrals' | 'closedDeals' | 'revenue' | 'closeRate';

interface LeaderboardProps {
  data?: RepLeaderboardData[];
  currentRepId?: string;
  showAll?: boolean;
  className?: string;
}

export function Leaderboard({
  data = MOCK_LEADERBOARD,
  currentRepId,
  showAll = false,
  className,
}: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortField>('closedDeals');
  const [expanded, setExpanded] = useState(showAll);

  // Sort data based on selected field
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'totalReferrals':
          return b.totalReferrals - a.totalReferrals;
        case 'closedDeals':
          return b.closedDeals - a.closedDeals;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'closeRate':
          const rateA = a.totalReferrals > 0 ? a.closedDeals / a.totalReferrals : 0;
          const rateB = b.totalReferrals > 0 ? b.closedDeals / b.totalReferrals : 0;
          return rateB - rateA;
        default:
          return 0;
      }
    });
  }, [data, sortBy]);

  const displayData = expanded ? sortedData : sortedData.slice(0, 5);

  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-guardian-gold/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-guardian-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Rep Leaderboard</h3>
              <p className="text-xs text-slate-400">This month's performance</p>
            </div>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-sm text-white
                       focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
          >
            <option value="closedDeals">Sort by Closed</option>
            <option value="totalReferrals">Sort by Referrals</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="closeRate">Sort by Close Rate</option>
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 bg-slate-900/30 grid grid-cols-12 gap-4 text-xs text-slate-400 uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Rep</div>
        <div className="col-span-2 text-center">Referrals</div>
        <div className="col-span-2 text-center">Closed</div>
        <div className="col-span-2 text-right">Revenue</div>
        <div className="col-span-1 text-center">Trend</div>
      </div>

      {/* Leaderboard Rows */}
      <div data-leaderboard className="divide-y divide-slate-700/30">
        <AnimatePresence>
          {displayData.map((rep, index) => (
            <LeaderboardRow
              key={rep.id}
              rep={rep}
              rank={index + 1}
              isCurrentUser={rep.id === currentRepId}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse Button */}
      {data.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <span>{expanded ? 'Show less' : `Show all ${data.length} reps`}</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
}

interface LeaderboardRowProps {
  rep: RepLeaderboardData;
  rank: number;
  isCurrentUser: boolean;
  index: number;
}

function LeaderboardRow({ rep, rank, isCurrentUser, index }: LeaderboardRowProps) {
  const closeRate = rep.totalReferrals > 0
    ? Math.round((rep.closedDeals / rep.totalReferrals) * 100)
    : 0;

  const TrendIcon = rep.trend === 'up' ? TrendingUp : rep.trend === 'down' ? TrendingDown : Minus;
  const trendColor = rep.trend === 'up' ? 'text-emerald-400' : rep.trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-800/30 transition-colors',
        isCurrentUser && 'bg-guardian-gold/5 border-l-2 border-guardian-gold'
      )}
    >
      {/* Rank */}
      <div className="col-span-1">
        {rank <= 3 ? (
          <RankBadge rank={rank} />
        ) : (
          <span className="text-slate-500 font-medium">{rank}</span>
        )}
      </div>

      {/* Rep Info */}
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
            rank === 1
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900'
              : rank === 2
              ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
              : rank === 3
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
              : 'bg-slate-700 text-slate-300'
          )}
        >
          {rep.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className={cn('font-medium truncate', isCurrentUser ? 'text-guardian-gold' : 'text-white')}>
            {rep.name}
            {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
          </p>
          {rep.level2Unlocked && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <Target className="w-3 h-3" />
              Level 2 Unlocked
            </span>
          )}
        </div>
      </div>

      {/* Referrals */}
      <div className="col-span-2 text-center">
        <span className="font-semibold text-white">{rep.totalReferrals}</span>
        <span className="text-xs text-slate-500 ml-1">({rep.contactedReferrals} contacted)</span>
      </div>

      {/* Closed */}
      <div className="col-span-2 text-center">
        <span className="font-semibold text-white">{rep.closedDeals}</span>
        <span className="text-xs text-slate-500 ml-1">({closeRate}%)</span>
      </div>

      {/* Revenue */}
      <div className="col-span-2 text-right">
        <span className="font-semibold text-emerald-400 earnings-number">${rep.revenue.toLocaleString()}</span>
      </div>

      {/* Trend */}
      <div className="col-span-1 flex justify-center">
        <TrendIcon className={cn('w-4 h-4', trendColor)} />
      </div>
    </motion.div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const config = {
    1: { icon: Crown, bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    2: { icon: Medal, bg: 'bg-slate-400/20', border: 'border-slate-400/30', text: 'text-slate-300' },
    3: { icon: Medal, bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  }[rank] || { icon: Users, bg: 'bg-slate-700', border: 'border-slate-600', text: 'text-slate-400' };

  const Icon = config.icon;

  return (
    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center border', config.bg, config.border)}>
      <Icon className={cn('w-4 h-4', config.text)} />
    </div>
  );
}

// Compact version for dashboard widgets
export function LeaderboardCompact({
  data = MOCK_LEADERBOARD.slice(0, 3),
  className,
}: {
  data?: RepLeaderboardData[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((rep, index) => (
        <div
          key={rep.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50"
        >
          <RankBadge rank={index + 1} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{rep.name}</p>
            <p className="text-xs text-slate-400">{rep.closedDeals} closed</p>
          </div>
          <span className="text-emerald-400 font-semibold text-sm earnings-number">
            ${rep.revenue.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;
