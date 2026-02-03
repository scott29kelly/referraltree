'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { UserPlus, RefreshCw, CheckCircle } from 'lucide-react';
import { NoActivityEmpty } from '@/components/ui/empty-state';
import type { Activity } from '@/types/database';

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'referral_created':
      return UserPlus;
    case 'status_changed':
      return RefreshCw;
    case 'referral_sold':
      return CheckCircle;
    default:
      return RefreshCw;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'referral_created':
      return 'bg-sky-500/20 text-sky-400';
    case 'status_changed':
      return 'bg-amber-500/20 text-amber-400';
    case 'referral_sold':
      return 'bg-emerald-500/20 text-emerald-400';
    default:
      return 'bg-slate-700 text-slate-400';
  }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
};

const iconVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.15,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
};

export default function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={clsx('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <NoActivityEmpty className="py-4" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx('rounded-xl bg-slate-800/50 border border-slate-700/50 p-6', className)}
    >
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold text-white mb-4"
      >
        Recent Activity
      </motion.h3>
      
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          const isSold = activity.type === 'referral_sold';

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="flex items-start gap-3 group cursor-default"
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <motion.div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  'transition-shadow duration-300',
                  colorClass,
                  isSold && 'shadow-lg shadow-emerald-500/20'
                )}
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <motion.div
                  animate={isSold ? { 
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.p 
                  className="text-sm text-white group-hover:text-white/90 transition-colors"
                >
                  {activity.description}
                </motion.p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.customer_name && (
                    <motion.span 
                      className="text-xs text-slate-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      {activity.customer_name}
                    </motion.span>
                  )}
                  <motion.span 
                    className="text-xs text-slate-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    {formatTimeAgo(activity.timestamp)}
                  </motion.span>
                </div>
              </div>

              {/* Subtle indicator line on hover */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-slate-600 to-transparent"
                initial={{ opacity: 0, scaleY: 0 }}
                whileHover={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
