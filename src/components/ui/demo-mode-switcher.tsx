'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Crown,
  Users,
  Check,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOut, clearAuthCookie } from '@/lib/auth';

type ViewType = 'rep' | 'admin' | 'customer';

interface ViewOption {
  id: ViewType;
  label: string;
  description: string;
  href: string;
  icon: typeof Shield;
  color: string;
  activeColor: string;
  bgColor: string;
  borderColor: string;
}

const viewOptions: ViewOption[] = [
  {
    id: 'rep',
    label: 'Rep',
    description: 'Sales rep experience',
    href: '/dashboard',
    icon: Shield,
    color: 'text-guardian-gold',
    activeColor: 'bg-guardian-gold',
    bgColor: 'bg-guardian-gold/10 border-guardian-gold/30',
    borderColor: 'border-guardian-gold/60',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Administrator experience',
    href: '/admin',
    icon: Crown,
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    borderColor: 'border-emerald-500/60',
  },
  {
    id: 'customer',
    label: 'Customer',
    description: 'Customer experience',
    href: '/demo',
    icon: Users,
    color: 'text-amber-400',
    activeColor: 'bg-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    borderColor: 'border-amber-500/60',
  },
];

function detectCurrentView(pathname: string, mode?: string | null): ViewType {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/dashboard')) return 'rep';
  if (pathname === '/login' && mode) {
    if (mode === 'admin') return 'admin';
    if (mode === 'rep') return 'rep';
  }
  return 'customer';
}

interface DemoModeSwitcherProps {
  variant?: 'sidebar' | 'header';
  isCollapsed?: boolean;
}

export function DemoModeSwitcher({ variant = 'sidebar', isCollapsed = false }: DemoModeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('customer');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = viewOptions.find((v) => v.id === currentView) || viewOptions[0];

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update current view when pathname changes
  useEffect(() => {
    const detected = detectCurrentView(pathname, modeParam);
    setCurrentView(detected);
  }, [pathname, modeParam]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSwitch = async (option: ViewOption) => {
    if (option.id === currentView) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    const target = option.id === 'customer' ? option.href : `/login?mode=${option.id}`;

    try {
      await signOut();
    } catch (error) {
      console.error('Failed to clear auth:', error);
    } finally {
      clearAuthCookie();
      router.push(target);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  // Dropdown menu (shared between variants)
  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: variant === 'header' ? -10 : 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: variant === 'header' ? -10 : 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={clsx(
            'absolute w-64 z-[100]',
            variant === 'header' ? 'top-full right-0 mt-2' : 'bottom-full left-0 mb-2'
          )}
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">
                  Switch Demo View
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="p-2">
              {viewOptions.map((option) => {
                const isActive = option.id === currentView;
                const Icon = option.icon;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSwitch(option)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                      isActive
                        ? `${option.bgColor} border`
                        : 'hover:bg-slate-800/50 border border-transparent'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? option.bgColor : 'bg-slate-800'
                      )}
                    >
                      <Icon
                        className={clsx(
                          'w-5 h-5',
                          isActive ? option.color : 'text-slate-400'
                        )}
                      />
                    </div>

                    {/* Label */}
                    <div className="flex-1 text-left">
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          isActive ? 'text-white' : 'text-slate-300'
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full flex items-center justify-center',
                          option.activeColor
                        )}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Header variant (for mobile)
  if (variant === 'header') {
    return (
      <div ref={containerRef} className="relative">
        {dropdownMenu}
        <button
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
            'bg-slate-800/80 transition-all duration-200',
            'border-2',
            currentOption.borderColor,
            isLoading && 'opacity-80 cursor-wait'
          )}
          title={`Switch view (currently ${currentOption.label})`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <>
              <currentOption.icon className={clsx('w-4 h-4', currentOption.color)} />
              <ChevronDown
                className={clsx(
                  'w-3 h-3 text-slate-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </button>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div ref={containerRef} className="relative">
      {dropdownMenu}
      
      {/* Toggle Button - adapts to collapsed state */}
      <motion.button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        title={isCollapsed ? `Switch view (${currentOption.label})` : undefined}
        className={clsx(
          'flex items-center rounded-xl transition-all duration-200',
          'bg-slate-800/50 hover:bg-slate-800',
          'border-2',
          currentOption.borderColor,
          isLoading && 'opacity-80 cursor-wait',
          // Collapsed: centered icon only
          isCollapsed ? 'w-full justify-center p-2.5' : 'w-full gap-2 px-4 py-2.5'
        )}
        whileHover={isLoading ? {} : { scale: 1.02 }}
        whileTap={isLoading ? {} : { scale: 0.98 }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        ) : isCollapsed ? (
          // Collapsed: just the icon
          <currentOption.icon className={clsx('w-5 h-5', currentOption.color)} />
        ) : (
          // Expanded: icon + label + chevron
          <>
            <currentOption.icon className={clsx('w-5 h-5', currentOption.color)} />
            <span className="flex-1 text-sm font-medium text-white text-left">
              {currentOption.label}
            </span>
            <ChevronUp
              className={clsx(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </motion.button>
    </div>
  );
}
