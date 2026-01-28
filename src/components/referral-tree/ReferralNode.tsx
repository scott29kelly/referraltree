'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, CheckCircle2, Clock, MessageSquare, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

// Status configuration with Guardian brand colors
const STATUS_CONFIG = {
  submitted: {
    bg: 'bg-slate-800/90',
    border: 'border-slate-600',
    glow: 'shadow-slate-500/20',
    icon: Clock,
    label: 'Submitted',
    pulse: false,
  },
  contacted: {
    bg: 'bg-sky-900/90',
    border: 'border-sky-500',
    glow: 'shadow-sky-500/30',
    icon: Phone,
    label: 'Contacted',
    pulse: true,
  },
  quoted: {
    bg: 'bg-amber-900/90',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/40',
    icon: MessageSquare,
    label: 'Quoted',
    pulse: true,
  },
  sold: {
    bg: 'bg-emerald-900/90',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
    icon: CheckCircle2,
    label: 'Closed!',
    pulse: false,
  },
} as const;

export type ReferralStatus = keyof typeof STATUS_CONFIG;

export interface ReferralNodeData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: ReferralStatus;
  submittedAt: Date;
  isRoot?: boolean;
  earnings?: number;
}

interface ReferralNodeProps extends NodeProps<ReferralNodeData> {}

const ReferralNode = memo(({ data, selected }: ReferralNodeProps) => {
  const config = STATUS_CONFIG[data.status];
  const StatusIcon = config.icon;
  const isRoot = data.isRoot;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: Math.random() * 0.3,
      }}
      className="relative"
    >
      {/* Incoming handle (not for root) */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-600"
        />
      )}

      {/* Main card */}
      <div
        className={cn(
          'relative min-w-[180px] rounded-xl border-2 backdrop-blur-sm',
          'transition-all duration-300 ease-out',
          config.bg,
          config.border,
          selected && 'ring-2 ring-white/50',
          isRoot ? 'shadow-2xl scale-110' : `shadow-lg ${config.glow}`,
          config.pulse && 'animate-pulse-subtle'
        )}
      >
        {/* Sold celebration particles */}
        <AnimatePresence>
          {data.status === 'sold' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 50,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 50,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-emerald-400"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Root badge */}
        {isRoot && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5
                       bg-gradient-to-r from-amber-500 to-amber-600
                       rounded-full text-[10px] font-bold text-white uppercase tracking-wider
                       shadow-lg shadow-amber-500/30"
          >
            You
          </motion.div>
        )}

        {/* Card content */}
        <div className="p-4">
          {/* Avatar and name */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-gradient-to-br',
                isRoot
                  ? 'from-amber-400 to-amber-600'
                  : 'from-slate-500 to-slate-700'
              )}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate text-sm">
                {data.name}
              </h3>
              {data.phone && (
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {data.phone}
                </p>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg',
              'text-xs font-medium',
              data.status === 'sold'
                ? 'bg-emerald-500/20 text-emerald-300'
                : data.status === 'quoted'
                ? 'bg-amber-500/20 text-amber-300'
                : data.status === 'contacted'
                ? 'bg-sky-500/20 text-sky-300'
                : 'bg-slate-500/20 text-slate-300'
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </div>

          {/* Earnings indicator for sold */}
          {data.status === 'sold' && data.earnings && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="mt-2 flex items-center justify-center gap-1
                         text-emerald-400 font-bold text-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>{data.earnings}</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar for non-root nodes */}
        {!isRoot && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 rounded-b-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width:
                  data.status === 'submitted'
                    ? '25%'
                    : data.status === 'contacted'
                    ? '50%'
                    : data.status === 'quoted'
                    ? '75%'
                    : '100%',
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full',
                data.status === 'sold'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : data.status === 'quoted'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : data.status === 'contacted'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-400'
                  : 'bg-gradient-to-r from-slate-500 to-slate-400'
              )}
            />
          </div>
        )}
      </div>

      {/* Outgoing handle (for root and all nodes) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-600"
      />
    </motion.div>
  );
});

ReferralNode.displayName = 'ReferralNode';

export default ReferralNode;
