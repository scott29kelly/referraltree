'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition } from '@/components/ui/page-transition';
import { BottomNav, BottomNavItem } from '@/components/ui/bottom-nav';
import {
  Shield,
  Home,
  Users,
  DollarSign,
  QrCode,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles,
  Network,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tree', label: 'Network', icon: Network },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
];

// Bottom nav shows condensed version
const bottomNavItems: BottomNavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tree', label: 'Network', icon: Network },
  { href: '/dashboard/qr', label: 'Share', icon: QrCode },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { rep, isLoading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 flex items-center justify-center border border-guardian-gold/20 animate-pulse">
              <Shield className="w-8 h-8 text-guardian-gold" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-guardian-gold animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop Only */}
      <aside
        className={clsx(
          'hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col',
          'bg-gradient-to-b from-guardian-navy to-slate-900',
          'border-r border-guardian-gold/10',
          'transition-all duration-300 ease-out',
          isCollapsed ? 'w-[72px]' : 'w-72'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={clsx(
            'flex items-center gap-3 py-5 border-b border-slate-700/30',
            isCollapsed ? 'px-4 justify-center' : 'px-6'
          )}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 flex items-center justify-center border border-guardian-gold/30 shadow-lg shadow-guardian-gold/10 flex-shrink-0">
              <Shield className="w-6 h-6 text-guardian-gold" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-white tracking-tight">Guardianship</h1>
                <p className="text-xs text-slate-400">Rep Dashboard</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={clsx('flex-1 py-5 space-y-1.5', isCollapsed ? 'px-2' : 'px-4')}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={clsx(
                    'group flex items-center gap-3 py-3 rounded-xl transition-all duration-200',
                    isCollapsed ? 'px-3 justify-center' : 'px-4',
                    isActive
                      ? 'bg-gradient-to-r from-guardian-gold/20 to-guardian-gold/5 text-guardian-gold border border-guardian-gold/20 shadow-lg shadow-guardian-gold/5'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'drop-shadow-sm')} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className={clsx('px-4 py-2', isCollapsed && 'px-2')}>
            <button
              onClick={toggleSidebar}
              className={clsx(
                'flex items-center gap-2 w-full py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200',
                isCollapsed ? 'px-3 justify-center' : 'px-4'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* User Section */}
          <div className={clsx(
            'py-4 border-t border-slate-700/30 bg-slate-900/50',
            isCollapsed ? 'px-2' : 'px-4'
          )}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30 flex-shrink-0">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {rep?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{rep?.email}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="flex items-center justify-center w-full p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-72'
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-guardian-gold/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-guardian-gold" />
              </div>
              <span className="font-semibold text-white">Guardianship</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 truncate max-w-[120px]">
                {rep?.name?.split(' ')[0]}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav items={bottomNavItems} accentColor="gold" />
    </div>
  );
}
