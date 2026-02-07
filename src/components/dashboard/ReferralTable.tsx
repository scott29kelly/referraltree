'use client';

import { useState, useMemo, Fragment } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Calendar,
  User,
  StickyNote,
} from 'lucide-react';
import { NoReferralsEmpty } from '@/components/ui/empty-state';
import type { Referral, ReferralStatus } from '@/types/database';

interface ReferralTableProps {
  referrals: Referral[];
  onStatusChange?: (id: string, status: ReferralStatus) => void;
  showCustomer?: boolean;
  customerNames?: Record<string, string>;
  className?: string;
}

type SortField = 'created_at' | 'status' | 'value' | 'referee_name';
type SortDirection = 'asc' | 'desc';

const statusOrder: Record<ReferralStatus, number> = {
  submitted: 0,
  contacted: 1,
  quoted: 2,
  sold: 3,
};

const statusConfig: Record<
  ReferralStatus,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  submitted: {
    label: 'Submitted',
    color: 'text-slate-300',
    bg: 'bg-slate-600/80',
    border: 'border-slate-500/30',
    glow: 'shadow-slate-500/10',
  },
  contacted: {
    label: 'Contacted',
    color: 'text-sky-300',
    bg: 'bg-sky-600/80',
    border: 'border-sky-500/30',
    glow: 'shadow-sky-500/20',
  },
  quoted: {
    label: 'Quoted',
    color: 'text-amber-300',
    bg: 'bg-amber-600/80',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  sold: {
    label: 'Sold',
    color: 'text-emerald-300',
    bg: 'bg-emerald-600/80',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Animation variants
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
};

const expandVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
  },
  visible: { 
    opacity: 1, 
    height: 'auto' as const,
    transition: {
      height: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: {
      height: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const },
      opacity: { duration: 0.1 },
    },
  },
};

const filterButtonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export default function ReferralTable({
  referrals,
  onStatusChange,
  showCustomer = false,
  customerNames = {},
  className,
}: ReferralTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...referrals];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'created_at':
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'referee_name':
          comparison = a.referee_name.localeCompare(b.referee_name);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [referrals, sortField, sortDirection, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: sortDirection === 'asc' ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    );
  };

  if (referrals.length === 0) {
    return (
      <motion.div
        data-referral-table
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={clsx(
          'rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30',
          'backdrop-blur-sm border border-slate-700/40',
          'shadow-2xl shadow-black/20',
          className
        )}
      >
        <NoReferralsEmpty className="py-8" />
      </motion.div>
    );
  }

  return (
    <motion.div
      data-referral-table
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        'rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30',
        'backdrop-blur-sm border border-slate-700/40 overflow-hidden',
        'shadow-2xl shadow-black/20',
        className
      )}
    >
      {/* Filters */}
      <div className="p-4 border-b border-slate-700/40 flex flex-wrap gap-2">
        <motion.button
          onClick={() => setStatusFilter('all')}
          variants={filterButtonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className={clsx(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
            statusFilter === 'all'
              ? 'bg-gradient-to-r from-guardian-gold to-guardian-gold/80 text-guardian-navy shadow-lg shadow-guardian-gold/20'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
          )}
        >
          All ({referrals.length})
        </motion.button>
        {(Object.keys(statusConfig) as ReferralStatus[]).map((status) => {
          const count = referrals.filter((r) => r.status === status).length;
          return (
            <motion.button
              key={status}
              onClick={() => setStatusFilter(status)}
              variants={filterButtonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                statusFilter === status
                  ? 'bg-gradient-to-r from-guardian-gold to-guardian-gold/80 text-guardian-navy shadow-lg shadow-guardian-gold/20'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
              )}
            >
              {statusConfig[status].label} ({count})
            </motion.button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/40 bg-slate-800/50">
              <th
                className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('referee_name')}
              >
                <div className="flex items-center gap-1">
                  Referral
                  <SortIcon field="referee_name" />
                </div>
              </th>
              {showCustomer && (
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </th>
              )}
              <th
                className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-1">
                  Value
                  <SortIcon field="value" />
                </div>
              </th>
              <th
                className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon field="created_at" />
                </div>
              </th>
            </tr>
          </thead>
          <motion.tbody 
            className="divide-y divide-slate-700/30"
            variants={tableContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAndSorted.map((referral, index) => {
              const isExpanded = expandedId === referral.id;
              const config = statusConfig[referral.status];

              return (
                <Fragment key={referral.id}>
                  <motion.tr
                    variants={rowVariants}
                    className="group hover:bg-slate-700/20 cursor-pointer transition-colors duration-200"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : referral.id)
                    }
                    whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                    layout
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <User className="w-5 h-5 text-slate-400" />
                        </motion.div>
                        <div>
                          <span className="text-white font-semibold">
                            {referral.referee_name}
                          </span>
                          {referral.referee_email && (
                            <p className="text-xs text-slate-500 truncate max-w-[180px]">
                              {referral.referee_email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {showCustomer && (
                      <td className="px-5 py-4 text-slate-300 font-medium text-sm">
                        {customerNames[referral.referrer_id] || 'Unknown'}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {onStatusChange ? (
                        <motion.select
                          value={referral.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange(
                              referral.id,
                              e.target.value as ReferralStatus
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.02 }}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer',
                            'shadow-lg transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-white/20',
                            config.bg,
                            config.color,
                            config.border,
                            config.glow
                          )}
                        >
                          {(Object.keys(statusConfig) as ReferralStatus[]).map(
                            (s) => (
                              <option key={s} value={s}>
                                {statusConfig[s].label}
                              </option>
                            )
                          )}
                        </motion.select>
                      ) : (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-lg inline-block',
                            config.bg,
                            config.color,
                            config.border,
                            config.glow
                          )}
                        >
                          {config.label}
                        </motion.span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-guardian-gold font-bold earnings-number">
                      ${referral.value}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-2">
                        {formatDate(referral.created_at)}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                  
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.tr
                        key={`expanded-${referral.id}`}
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-slate-800/40"
                      >
                        <td colSpan={showCustomer ? 5 : 4} className="overflow-hidden">
                          <motion.div 
                            className="px-5 py-5"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {referral.referee_phone && (
                                <motion.div 
                                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/20"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 }}
                                  whileHover={{ scale: 1.02, borderColor: 'rgba(100, 116, 139, 0.4)' }}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-600/30 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm">
                                    {referral.referee_phone}
                                  </span>
                                </motion.div>
                              )}
                              {referral.referee_email && (
                                <motion.div 
                                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/20"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                  whileHover={{ scale: 1.02, borderColor: 'rgba(100, 116, 139, 0.4)' }}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-600/30 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <span className="text-slate-300 text-sm truncate">
                                    {referral.referee_email}
                                  </span>
                                </motion.div>
                              )}
                              <motion.div 
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/20"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                whileHover={{ scale: 1.02, borderColor: 'rgba(100, 116, 139, 0.4)' }}
                              >
                                <div className="w-8 h-8 rounded-lg bg-slate-600/30 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-slate-300 text-sm">
                                  Updated: {formatDate(referral.updated_at)}
                                </span>
                              </motion.div>
                              {referral.notes && (
                                <motion.div 
                                  className="md:col-span-3 flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-guardian-gold/10 to-guardian-gold/5 border border-guardian-gold/20"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-guardian-gold/20 flex items-center justify-center flex-shrink-0">
                                    <StickyNote className="w-4 h-4 text-guardian-gold" />
                                  </div>
                                  <span className="text-slate-300 text-sm leading-relaxed">
                                    {referral.notes}
                                  </span>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Results count */}
      <motion.div 
        className="px-5 py-3 border-t border-slate-700/40 bg-slate-800/30 text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Showing {filteredAndSorted.length} of {referrals.length} referrals
      </motion.div>
    </motion.div>
  );
}
