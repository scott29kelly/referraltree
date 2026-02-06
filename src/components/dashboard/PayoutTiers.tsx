'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Lock,
  Unlock,
  Phone,
  CheckCircle,
  Gift,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export interface PayoutTiersProps {
  level2Unlocked: boolean;
  progress: {
    contacted: number;
    contactedRequired: number;
    closed: number;
    closedRequired: number;
  };
  className?: string;
  compact?: boolean;
}

export function PayoutTiers({
  level2Unlocked,
  progress,
  className,
  compact = false,
}: PayoutTiersProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  // Celebration animation when Level 2 is unlocked
  useEffect(() => {
    if (level2Unlocked && !hasShownCelebration) {
      // Check if this is a new unlock (not just a page load)
      const storageKey = 'guardianship-level2-celebrated';
      const wasCelebrated = localStorage.getItem(storageKey);

      if (!wasCelebrated) {
        // Fire confetti celebration
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#F49D00', '#E67E22', '#10b981'],
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#F49D00', '#E67E22', '#10b981'],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        frame();
        localStorage.setItem(storageKey, 'true');
      }

      setHasShownCelebration(true);
    }
  }, [level2Unlocked, hasShownCelebration]);

  const contactedPercent = Math.min((progress.contacted / progress.contactedRequired) * 100, 100);
  const closedPercent = Math.min((progress.closed / progress.closedRequired) * 100, 100);

  if (compact) {
    return (
      <div className={cn('rounded-xl border overflow-hidden', className)}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            'w-full flex items-center justify-between p-4 transition-colors',
            level2Unlocked
              ? 'bg-gradient-to-r from-guardian-gold/10 to-guardian-orange/5 border-guardian-gold/30'
              : 'bg-slate-800/50 hover:bg-slate-800'
          )}
        >
          <div className="flex items-center gap-3">
            {level2Unlocked ? (
              <Unlock className="w-5 h-5 text-guardian-gold" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
            <div className="text-left">
              <p className="font-semibold text-white text-sm">
                {level2Unlocked ? 'Bonus Tiers Active' : 'Unlock Bonus Tiers'}
              </p>
              <p className="text-xs text-slate-400">
                {level2Unlocked
                  ? 'Earn on 3 levels!'
                  : `${progress.contacted}/${progress.contactedRequired} contacted, ${progress.closed}/${progress.closedRequired} closed`}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform',
              showDetails && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <PayoutTiersContent
                level2Unlocked={level2Unlocked}
                progress={progress}
                contactedPercent={contactedPercent}
                closedPercent={closedPercent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        level2Unlocked
          ? 'bg-gradient-to-br from-guardian-gold/10 to-guardian-orange/5 border-guardian-gold/30'
          : 'bg-slate-800/50 border-slate-700/50',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {level2Unlocked ? (
            <>
              <Sparkles className="w-5 h-5 text-guardian-gold" />
              Multi-Level Bonuses Active
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 text-slate-400" />
              Unlock Bonus Tiers
            </>
          )}
        </h3>
        {level2Unlocked && (
          <span className="px-3 py-1 rounded-full bg-guardian-gold/20 text-guardian-gold text-xs font-semibold">
            UNLOCKED
          </span>
        )}
      </div>

      <PayoutTiersContent
        level2Unlocked={level2Unlocked}
        progress={progress}
        contactedPercent={contactedPercent}
        closedPercent={closedPercent}
      />
    </div>
  );
}

function PayoutTiersContent({
  level2Unlocked,
  progress,
  contactedPercent,
  closedPercent,
}: {
  level2Unlocked: boolean;
  progress: PayoutTiersProps['progress'];
  contactedPercent: number;
  closedPercent: number;
}) {
  return (
    <div className="p-4 space-y-4">
      {/* Tier Cards */}
      <div className="grid grid-cols-3 gap-3">
        <TierCard
          level={1}
          amount={125}
          description="Direct referrals"
          isActive={true}
          isHighlighted={false}
        />
        <TierCard
          level={2}
          amount={50}
          description="Referral of referral"
          isActive={level2Unlocked}
          isHighlighted={level2Unlocked}
        />
        <TierCard
          level={3}
          amount={10}
          description="Third level"
          isActive={level2Unlocked}
          isHighlighted={level2Unlocked}
        />
      </div>

      {/* Unlock Progress (if not unlocked) */}
      {!level2Unlocked && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Info className="w-4 h-4" />
            <span>Complete both requirements to unlock:</span>
          </div>

          {/* Contacted Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                10 Contacted Referrals
              </span>
              <span
                className={cn(
                  'font-medium',
                  contactedPercent >= 100 ? 'text-emerald-400' : 'text-slate-400'
                )}
              >
                {progress.contacted}/{progress.contactedRequired}
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
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                5 Closed Deals
              </span>
              <span
                className={cn(
                  'font-medium',
                  closedPercent >= 100 ? 'text-emerald-400' : 'text-slate-400'
                )}
              >
                {progress.closed}/{progress.closedRequired}
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
      )}
    </div>
  );
}

function TierCard({
  level,
  amount,
  description,
  isActive,
  isHighlighted,
}: {
  level: number;
  amount: number;
  description: string;
  isActive: boolean;
  isHighlighted: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: level * 0.1 }}
      className={cn(
        'relative p-3 rounded-xl text-center border',
        isActive
          ? isHighlighted
            ? 'bg-guardian-gold/10 border-guardian-gold/30'
            : 'bg-slate-900/50 border-slate-700/50'
          : 'bg-slate-900/30 border-slate-800/50 opacity-50'
      )}
    >
      {isHighlighted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-guardian-gold flex items-center justify-center"
        >
          <CheckCircle className="w-3 h-3 text-guardian-navy" />
        </motion.div>
      )}
      <p className="text-xs text-slate-500 mb-1">Level {level}</p>
      <p
        className={cn(
          'text-xl font-bold',
          isActive ? (isHighlighted ? 'text-guardian-gold' : 'text-emerald-400') : 'text-slate-500'
        )}
      >
        ${amount}
      </p>
      <p className="text-[10px] text-slate-400 mt-1">{description}</p>
    </motion.div>
  );
}

export default PayoutTiers;
