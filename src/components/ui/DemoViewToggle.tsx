'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Crown, Users, Eye, ChevronDown, ArrowLeftRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { signIn, signOut, setAuthCookie, clearAuthCookie } from '@/lib/auth';

type ViewMode = 'customer' | 'rep' | 'admin';

const views: { mode: ViewMode; label: string; icon: typeof Crown; color: string; href: string }[] = [
  { mode: 'customer', label: 'Customer', icon: Eye, color: 'text-sky-400', href: '/demo' },
  { mode: 'rep', label: 'Rep', icon: Users, color: 'text-guardian-gold', href: '/dashboard' },
  { mode: 'admin', label: 'Admin', icon: Crown, color: 'text-emerald-400', href: '/admin' },
];

// Demo accounts for seamless view switching
const DEMO_EMAILS: Record<ViewMode, string> = {
  customer: '',
  rep: 'sarah@guardian.com',
  admin: 'alex@guardian.com',
};

function getCurrentView(pathname: string): ViewMode {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/dashboard')) return 'rep';
  return 'customer';
}

export default function DemoViewToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentView = getCurrentView(pathname);
  const current = views.find((v) => v.mode === currentView)!;

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSwitch = async (view: typeof views[number]) => {
    setOpen(false);
    if (view.mode === currentView) return;

    // Customer view: just navigate, no auth needed
    if (view.mode === 'customer') {
      router.push('/demo');
      return;
    }

    // Switching to rep or admin: sign out, then auto-sign-in as the correct demo user
    setSwitching(true);
    try {
      // Clear current session
      await signOut();
      clearAuthCookie();

      // Auto-sign-in as the target demo user
      const email = DEMO_EMAILS[view.mode];
      const result = await signIn(email, 'demo');

      if (result.success && result.rep) {
        setAuthCookie(result.rep.id, result.rep.role);
        router.push(view.href);
      } else {
        // Fallback: send to login page with role hint
        router.push(`/login?role=${view.mode}`);
      }
    } catch (error) {
      console.error('Failed to switch view:', error);
      router.push(`/login?role=${view.mode}`);
    } finally {
      setSwitching(false);
    }
  };

  // Don't show on the login page itself
  if (pathname === '/login') return null;

  return (
    <div ref={ref} className="fixed top-3 right-3 z-[100]">
      <button
        onClick={() => !switching && setOpen(!open)}
        disabled={switching}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-slate-800/90 backdrop-blur-xl border border-slate-700/50',
          'hover:bg-slate-700/90 transition-all duration-200',
          'shadow-lg shadow-black/20',
          switching && 'opacity-80 cursor-wait'
        )}
      >
        {switching ? (
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        ) : (
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
        )}
        <current.icon className={clsx('w-4 h-4', current.color)} />
        <span className="text-sm font-medium text-white hidden sm:inline">{current.label}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-1.5">
            {views.map((view) => {
              const isActive = view.mode === currentView;
              return (
                <button
                  key={view.mode}
                  onClick={() => handleSwitch(view)}
                  className={clsx(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'
                  )}
                >
                  <view.icon className={clsx('w-4 h-4', view.color)} />
                  <span className="text-sm font-medium">{view.label} View</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
