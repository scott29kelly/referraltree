'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield,
  Home,
  Users,
  DollarSign,
  QrCode,
  Menu,
  X,
  LogOut,
  ChevronRight,
  User,
  Sparkles,
  Network,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tree', label: 'My Network', icon: Network },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { rep, isLoading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-72',
          'bg-gradient-to-b from-guardian-navy to-slate-900',
          'border-r border-guardian-gold/10',
          'transform transition-transform duration-300 ease-out lg:transform-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/30">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 flex items-center justify-center border border-guardian-gold/30 shadow-lg shadow-guardian-gold/10">
              <Shield className="w-6 h-6 text-guardian-gold" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">Guardianship</h1>
              <p className="text-xs text-slate-400">Rep Dashboard</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={clsx(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-guardian-gold/20 to-guardian-gold/5 text-guardian-gold border border-guardian-gold/20 shadow-lg shadow-guardian-gold/5'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon className={clsx('w-5 h-5', isActive && 'drop-shadow-sm')} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/30 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
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
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-guardian-gold/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-guardian-gold" />
              </div>
              <span className="font-semibold text-white">Guardianship</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
