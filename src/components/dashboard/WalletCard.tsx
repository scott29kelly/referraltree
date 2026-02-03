'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clsx } from 'clsx';

interface WalletCardProps {
  totalEarnings: number;
  pendingEarnings: number;
  paidOut: number;
  nextMilestone?: number;
  className?: string;
}

export function WalletCard({
  totalEarnings,
  pendingEarnings,
  paidOut,
  nextMilestone = 250,
  className,
}: WalletCardProps) {
  // Calculate progress to next milestone
  const progressToNext = pendingEarnings % nextMilestone;
  const progressPercent = (progressToNext / nextMilestone) * 100;
  const dealsToNextPayout = Math.ceil((nextMilestone - progressToNext) / 250);

  return (
    <Card className={clsx(
      'bg-gradient-to-br from-guardian-navy via-slate-900 to-slate-950',
      'border-guardian-gold/20 overflow-hidden relative',
      className
    )}>
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-guardian-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-guardian-gold" />
            My Wallet
          </CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Total Earnings - Hero Number */}
        <div className="text-center py-4">
          <p className="text-sm text-slate-400 mb-1">Total Earnings</p>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="flex items-center justify-center gap-1"
          >
            <DollarSign className="w-8 h-8 text-guardian-gold" />
            <CountingNumber value={totalEarnings} className="text-5xl font-bold text-white" />
          </motion.div>
        </div>

        {/* Pending vs Paid Split */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <p className="text-xl font-bold text-amber-400">
              ${pendingEarnings.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Paid Out</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">
              ${paidOut.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress to Next Payout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Progress to next ${nextMilestone}
            </span>
            <span className="text-guardian-gold font-medium">
              ${progressToNext} / ${nextMilestone}
            </span>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-guardian-gold to-amber-400 relative"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {dealsToNextPayout > 0 && (
            <p className="text-xs text-slate-500 text-center">
              {dealsToNextPayout} more deal{dealsToNextPayout > 1 ? 's' : ''} to reach ${nextMilestone} payout
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Animated counting number component
function CountingNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

export default WalletCard;
