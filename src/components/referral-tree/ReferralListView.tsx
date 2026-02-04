'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  Mail,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReferralNodeData, ReferralStatus } from './ReferralNode';

const REFERRAL_BONUS = 125;

// Status configuration
const STATUS_CONFIG: Record<
  ReferralStatus,
  { icon: any; label: string; color: string; bgColor: string; borderColor: string }
> = {
  submitted: {
    icon: Clock,
    label: 'Submitted',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
  },
  contacted: {
    icon: Phone,
    label: 'Contacted',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    borderColor: 'border-sky-500/30',
  },
  quoted: {
    icon: MessageSquare,
    label: 'Quoted',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  sold: {
    icon: CheckCircle2,
    label: 'Closed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
};

interface ReferralListViewProps {
  referrals: ReferralNodeData[];
  className?: string;
}

export function ReferralListView({ referrals, className }: ReferralListViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');

  // Separate root and referrals
  const root = referrals.find((r) => r.isRoot);
  const children = referrals.filter((r) => !r.isRoot);

  // Filter referrals based on search and status
  const filteredReferrals = useMemo(() => {
    return children.filter((referral) => {
      const matchesSearch =
        searchQuery === '' ||
        referral.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.phone?.includes(searchQuery) ||
        referral.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || referral.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [children, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const soldCount = children.filter((r) => r.status === 'sold').length;
    return {
      total: children.length,
      filtered: filteredReferrals.length,
      sold: soldCount,
      earnings: soldCount * REFERRAL_BONUS,
    };
  }, [children, filteredReferrals]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredReferrals.map((r) => r.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search and Filters */}
      <div className="px-4 py-3 border-b border-slate-800/50 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50
                       focus:border-guardian-gold/50 text-sm"
          />
        </div>

        {/* Filter and Actions Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white
                         focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="sold">Closed</option>
            </select>
          </div>

          {/* Expand/Collapse */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>
            Showing{' '}
            <span className="text-white font-medium">{stats.filtered}</span> of{' '}
            <span className="text-white font-medium">{stats.total}</span> referrals
          </span>
          <span className="text-emerald-400">
            <DollarSign className="inline-block w-3 h-3" />
            {stats.earnings} earned
          </span>
        </div>
      </div>

      {/* Root Referrer Card */}
      {root && (
        <div className="px-4 py-3 border-b border-slate-800/50 bg-guardian-gold/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-guardian-gold to-guardian-orange flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{root.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-guardian-gold/20 text-guardian-gold text-[10px] font-bold uppercase">
                  You
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {children.length} referrals | {stats.sold} closed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral List */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
        <AnimatePresence>
          {filteredReferrals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-400"
            >
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No referrals match your search</p>
            </motion.div>
          ) : (
            filteredReferrals.map((referral, index) => (
              <ReferralListItem
                key={referral.id}
                referral={referral}
                isExpanded={expandedIds.has(referral.id)}
                onToggle={() => toggleExpand(referral.id)}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ReferralListItemProps {
  referral: ReferralNodeData;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

function ReferralListItem({ referral, isExpanded, onToggle, index }: ReferralListItemProps) {
  const config = STATUS_CONFIG[referral.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        config.borderColor,
        isExpanded ? 'bg-slate-800/50' : 'bg-slate-800/30 hover:bg-slate-800/50'
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        {/* Expand icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Avatar */}
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center',
            config.bgColor
          )}
        >
          <User className={cn('w-4 h-4', config.color)} />
        </div>

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{referral.name}</h4>
          <p className="text-xs text-slate-500">
            {new Date(referral.submittedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
            config.bgColor,
            config.color
          )}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{config.label}</span>
        </div>

        {/* Earnings for sold */}
        {referral.status === 'sold' && (
          <div className="flex items-center gap-1 text-emerald-400 font-semibold text-sm">
            <DollarSign className="w-4 h-4" />
            {REFERRAL_BONUS}
          </div>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-700/50">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                {referral.phone && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{referral.phone}</span>
                  </div>
                )}
                {referral.email && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300 truncate">{referral.email}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className={config.color}>{config.label}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        referral.status === 'submitted'
                          ? '25%'
                          : referral.status === 'contacted'
                          ? '50%'
                          : referral.status === 'quoted'
                          ? '75%'
                          : '100%',
                    }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'h-full rounded-full',
                      referral.status === 'sold'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : referral.status === 'quoted'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : referral.status === 'contacted'
                        ? 'bg-gradient-to-r from-sky-500 to-sky-400'
                        : 'bg-gradient-to-r from-slate-500 to-slate-400'
                    )}
                  />
                </div>
              </div>

              {/* Potential/actual earnings */}
              <div
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  referral.status === 'sold'
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-slate-900/50'
                )}
              >
                <span className="text-xs text-slate-400">
                  {referral.status === 'sold' ? 'Earned' : 'Potential Earnings'}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    referral.status === 'sold' ? 'text-emerald-400' : 'text-slate-300'
                  )}
                >
                  ${REFERRAL_BONUS}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ReferralListView;
