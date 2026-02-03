'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
  accentColor?: 'gold' | 'emerald';
}

export function BottomNav({ items, accentColor = 'gold' }: BottomNavProps) {
  const pathname = usePathname();

  const colorClasses = {
    gold: {
      active: 'text-guardian-gold',
      activeBg: 'bg-guardian-gold/10',
      activeRing: 'ring-guardian-gold/20',
    },
    emerald: {
      active: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10',
      activeRing: 'ring-emerald-500/20',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive
                  ? `${colors.active} ${colors.activeBg} ring-1 ${colors.activeRing}`
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/50'
              )}
            >
              <item.icon className={clsx('w-5 h-5', isActive && 'drop-shadow-sm')} />
              <span className={clsx('text-[10px] font-medium', isActive ? 'font-semibold' : '')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-slate-900" />
    </nav>
  );
}
