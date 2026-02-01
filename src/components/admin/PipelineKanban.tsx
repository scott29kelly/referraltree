'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Phone,
  FileCheck,
  CheckCircle,
  MoreHorizontal,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';
import type { Referral, ReferralStatus } from '@/types/database';

interface PipelineKanbanProps {
  referrals: Referral[];
  onStatusChange: (id: string, newStatus: ReferralStatus) => void;
  customerMap?: Map<string, string>;
  className?: string;
}

const columns: {
  id: ReferralStatus;
  label: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    icon: FileText,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    icon: Phone,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'quoted',
    label: 'Quoted',
    icon: FileCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'sold',
    label: 'Sold',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
];

export function PipelineKanban({
  referrals,
  onStatusChange,
  customerMap,
  className,
}: PipelineKanbanProps) {
  const [expandedColumn, setExpandedColumn] = useState<ReferralStatus | null>(null);

  const getReferralsByStatus = (status: ReferralStatus) =>
    referrals.filter((r) => r.status === status);

  const getNextStatuses = (currentStatus: ReferralStatus): ReferralStatus[] => {
    const statusOrder: ReferralStatus[] = ['submitted', 'contacted', 'quoted', 'sold'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder.filter((_, i) => i !== currentIndex);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Desktop: Full Kanban */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const items = getReferralsByStatus(column.id);
          return (
            <div
              key={column.id}
              className={clsx(
                'rounded-xl border p-4',
                column.borderColor,
                column.bgColor
              )}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4">
                <column.icon className={clsx('w-5 h-5', column.color)} />
                <h3 className={clsx('font-semibold', column.color)}>
                  {column.label}
                </h3>
                <span className={clsx(
                  'ml-auto text-sm px-2 py-0.5 rounded-full',
                  column.bgColor,
                  column.color
                )}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[200px]">
                <AnimatePresence>
                  {items.slice(0, 5).map((referral, index) => (
                    <motion.div
                      key={referral.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ReferralCard
                        referral={referral}
                        column={column}
                        customerName={customerMap?.get(referral.referrer_id)}
                        onStatusChange={onStatusChange}
                        availableStatuses={getNextStatuses(referral.status)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length > 5 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    +{items.length - 5} more
                  </p>
                )}
                {items.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No referrals
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Collapsible Columns */}
      <div className="lg:hidden space-y-3">
        {columns.map((column) => {
          const items = getReferralsByStatus(column.id);
          const isExpanded = expandedColumn === column.id;

          return (
            <div
              key={column.id}
              className={clsx(
                'rounded-xl border overflow-hidden transition-all',
                column.borderColor,
                column.bgColor
              )}
            >
              {/* Column Header (Clickable) */}
              <button
                onClick={() => setExpandedColumn(isExpanded ? null : column.id)}
                className="w-full flex items-center gap-3 p-4"
              >
                <column.icon className={clsx('w-5 h-5', column.color)} />
                <h3 className={clsx('font-semibold', column.color)}>
                  {column.label}
                </h3>
                <span className={clsx(
                  'text-sm px-2 py-0.5 rounded-full',
                  column.bgColor,
                  column.color
                )}>
                  {items.length}
                </span>
                <ChevronRight
                  className={clsx(
                    'ml-auto w-5 h-5 text-slate-400 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3">
                      {items.map((referral) => (
                        <ReferralCard
                          key={referral.id}
                          referral={referral}
                          column={column}
                          customerName={customerMap?.get(referral.referrer_id)}
                          onStatusChange={onStatusChange}
                          availableStatuses={getNextStatuses(referral.status)}
                        />
                      ))}
                      {items.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No referrals in this stage
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReferralCardProps {
  referral: Referral;
  column: typeof columns[0];
  customerName?: string;
  onStatusChange: (id: string, newStatus: ReferralStatus) => void;
  availableStatuses: ReferralStatus[];
}

function ReferralCard({
  referral,
  column,
  customerName,
  onStatusChange,
  availableStatuses,
}: ReferralCardProps) {
  return (
    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">
            {referral.referee_name}
          </p>
          {customerName && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              via {customerName}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-900 border-slate-700"
          >
            {availableStatuses.map((status) => {
              const targetColumn = columns.find((c) => c.id === status)!;
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(referral.id, status)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <targetColumn.icon className={clsx('w-4 h-4 mr-2', targetColumn.color)} />
                  Move to {targetColumn.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(referral.created_at).toLocaleDateString()}
        </span>
        {referral.referee_phone && (
          <span className="truncate">{referral.referee_phone}</span>
        )}
      </div>
    </div>
  );
}

export default PipelineKanban;
