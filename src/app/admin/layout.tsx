'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAdmin } from '@/hooks/useAuth';
import { PageTransition } from '@/components/ui/page-transition';
import CommandPalette from '@/components/admin/CommandPalette';
import { BottomNav, BottomNavItem } from '@/components/ui/bottom-nav';
import {
  Shield,
  Home,
  Users,
  FileText,
  BarChart3,
  LogOut,
  ChevronRight,
  User,
  Crown,
  Sparkles,
  ArrowLeftRight,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/reps', label: 'Reps', icon: Users },
  { href: '/admin/referrals', label: 'All Referrals', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const bottomNavItems: BottomNavItem[] = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/reps', label: 'Reps', icon: Users },
  { href: '/admin/referrals', label: 'Referrals', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard', label: 'Rep View', icon: ArrowLeftRight },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { rep, isLoading, signOut } = useRequireAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 animate-pulse">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-layout="admin" className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop Only */}
      <aside
        className={clsx(
          'hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col',
          'bg-gradient-to-b from-slate-900 to-slate-950',
          'border-r border-emerald-500/10',
          'transition-all duration-300 ease-out',
          isCollapsed ? 'w-[72px]' : 'w-72'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={clsx(
            'flex items-center gap-3 py-5 border-b border-slate-800/50',
            isCollapsed ? 'px-4 justify-center' : 'px-6'
          )}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-white tracking-tight font-display">Guardianship</h1>
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-emerald-400" />
                  <p className="text-xs text-emerald-400 font-medium">Admin Panel</p>
                </div>
              </div>
            )}
          </div>

          {/* Command Palette - Desktop */}
          {!isCollapsed && (
            <div className="px-4 py-3 border-b border-slate-800/30">
              <CommandPalette onSignOut={signOut} />
            </div>
          )}

          {/* Navigation */}
          <nav className={clsx('flex-1 py-5 space-y-1.5', isCollapsed ? 'px-2' : 'px-4')}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={clsx(
                    'group flex items-center gap-3 py-3 rounded-xl transition-all duration-200',
                    isCollapsed ? 'px-3 justify-center' : 'px-4',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
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

          {/* Switch to Rep View */}
          <div className={clsx('py-3', isCollapsed ? 'px-2' : 'px-4')}>
            <Link
              href="/dashboard"
              title={isCollapsed ? 'Switch to Rep View' : undefined}
              className={clsx(
                'flex items-center gap-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 border border-slate-800/50 hover:border-slate-700/50',
                isCollapsed ? 'px-3 justify-center' : 'px-4'
              )}
            >
              <ArrowLeftRight className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">Switch to Rep View</span>}
            </Link>
          </div>

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
            'py-4 border-t border-slate-800/50 bg-slate-900/50',
            isCollapsed ? 'px-2' : 'px-4'
          )}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {rep?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-emerald-400 font-medium">Administrator</p>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30">
                    <User className="w-5 h-5 text-emerald-400" />
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
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-semibold text-white">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette onSignOut={signOut} />
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                >
                  <Crown className="w-4 h-4 text-emerald-400" />
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white truncate">{rep?.name || 'Admin'}</p>
                        <p className="text-xs text-emerald-400">Administrator</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/demo"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Exit to Customer View</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          <span className="text-sm">Switch to Rep View</span>
                        </Link>
                        <button
                          onClick={() => { setShowUserMenu(false); signOut(); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
      <BottomNav items={bottomNavItems} accentColor="emerald" />
    </div>
  );
}
