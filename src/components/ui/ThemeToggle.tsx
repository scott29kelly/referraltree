'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = 'button',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          'text-slate-400 hover:text-white hover:bg-slate-800/50',
          'dark:text-slate-400 dark:hover:text-white',
          'light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/50',
          className
        )}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: resolvedTheme === 'dark' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </motion.div>
        {showLabel && (
          <span className="ml-2 text-sm">
            {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  }

  // Dropdown variant with system option
  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50', className)}>
      <ThemeOption
        theme="light"
        currentTheme={theme}
        onClick={() => setTheme('light')}
        icon={Sun}
        label="Light"
      />
      <ThemeOption
        theme="dark"
        currentTheme={theme}
        onClick={() => setTheme('dark')}
        icon={Moon}
        label="Dark"
      />
      <ThemeOption
        theme="system"
        currentTheme={theme}
        onClick={() => setTheme('system')}
        icon={Monitor}
        label="System"
      />
    </div>
  );
}

function ThemeOption({
  theme,
  currentTheme,
  onClick,
  icon: Icon,
  label,
}: {
  theme: Theme;
  currentTheme: Theme;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  const isActive = theme === currentTheme;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'text-guardian-navy'
          : 'text-slate-400 hover:text-white'
      )}
      title={label}
    >
      {isActive && (
        <motion.div
          layoutId="themeToggleBackground"
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

// Compact icon-only toggle
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-all',
        'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white',
        className
      )}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedTheme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        className="w-5 h-5"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.div>
    </button>
  );
}

export default ThemeToggle;
