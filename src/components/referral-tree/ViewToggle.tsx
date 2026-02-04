'use client';

import { motion } from 'framer-motion';
import { Network, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'tree' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/50',
        className
      )}
    >
      <ToggleButton
        active={view === 'tree'}
        onClick={() => onChange('tree')}
        icon={Network}
        label="Tree View"
      />
      <ToggleButton
        active={view === 'list'}
        onClick={() => onChange('list')}
        icon={List}
        label="List View"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'text-guardian-navy'
          : 'text-slate-400 hover:text-white'
      )}
    >
      {active && (
        <motion.div
          layoutId="viewToggleBackground"
          className="absolute inset-0 bg-guardian-gold rounded-lg"
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </span>
    </button>
  );
}

export default ViewToggle;
