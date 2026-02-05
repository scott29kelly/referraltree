'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition } from '@/components/ui/page-transition';
import { BottomNav, BottomNavItem } from '@/components/ui/bottom-nav';
import {
  OfflineBanner,
  InstallPrompt,
  NetworkStatusIndicator,
} from '@/components/ui/pwa-indicators';
import {
  Shield,
  Home,
  Users,
  DollarSign,
  QrCode,
  LogOut,
  ChevronRight,
  User,
  Sparkles,
  Network,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tree', label: 'Network', icon: Network },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
];

const bottomNavItems: BottomNavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tree', label: 'Network', icon: Network },
  { href: '/dashboard/qr', label: 'Share', icon: QrCode },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
];

const textVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25, delay: 0.1 },
  },
  hidden: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 },
  },
};

const userMenuVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { rep, isLoading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col',
          'bg-gradient-to-b from-guardian-navy to-slate-900',
          'border-r border-guardian-gold/10'
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={clsx(
              'flex items-center gap-3 py-5 border-b border-slate-700/30',
              isCollapsed ? 'px-4 justify-center' : 'px-6'
            )}
          >
            <motion.div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 flex items-center justify-center border border-guardian-gold/30 shadow-lg shadow-guardian-gold/10 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-6 h-6 text-guardian-gold" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="logo-text"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={textVariants}
                  className="overflow-hidden"
                >
                  <h1 className="font-bold text-white tracking-tight">
                    Guardianship
                  </h1>
                  <p className="text-xs text-slate-400">Rep Dashboard</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="network-status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-3 border-b border-slate-700/30 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <NetworkStatusIndicator showLabel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <LayoutGroup>
            <nav
              className={clsx(
                'flex-1 py-5 space-y-1.5 relative',
                isCollapsed ? 'px-2' : 'px-4'
              )}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredIndex === index;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className="relative block"
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    {isHovered && !isActive && (
                      <motion.div
                        layoutId="navHoverBg"
                        className="absolute inset-0 bg-slate-800/50 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="navActiveBg"
                        className="absolute inset-0 bg-gradient-to-r from-guardian-gold/20 to-guardian-gold/5 border border-guardian-gold/20 rounded-xl shadow-lg shadow-guardian-gold/5"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="navActiveUnderline"
                        className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-guardian-gold/60 via-guardian-gold to-guardian-gold/60 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                    <motion.div
                      className={clsx(
                        'relative flex items-center gap-3 py-3 rounded-xl transition-colors duration-200',
                        isCollapsed ? 'px-3 justify-center' : 'px-4',
                        isActive
                          ? 'text-guardian-gold'
                          : 'text-slate-300 hover:text-white'
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          rotate: isActive ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{
                          scale: {
                            type: 'spring',
                            stiffness: 400,
                            damping: 20,
                          },
                          rotate: { duration: 0.4, ease: 'easeInOut' },
                        }}
                      >
                        <item.icon
                          className={clsx(
                            'w-5 h-5 flex-shrink-0',
                            isActive && 'drop-shadow-sm'
                          )}
                        />
                      </motion.div>
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.div
                            key={`text-${item.href}`}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={textVariants}
                            className="flex items-center flex-1"
                          >
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-auto"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className={clsx('px-4 py-2', isCollapsed && 'px-2')}>
            <motion.button
              onClick={toggleSidebar}
              className={clsx(
                'flex items-center gap-2 w-full py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors duration-200',
                isCollapsed ? 'px-3 justify-center' : 'px-4'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </motion.div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    key="collapse-text"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={textVariants}
                    className="text-sm font-medium"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div
            className={clsx(
              'py-4 border-t border-slate-700/30 bg-slate-900/50',
              isCollapsed ? 'px-2' : 'px-4'
            )}
          >
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="expanded-user"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                    whileHover={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User className="w-5 h-5 text-slate-300" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {rep?.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {rep?.email}
                      </p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={signOut}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-user"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex justify-center p-2">
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30"
                      whileHover={{ scale: 1.1 }}
                    >
                      <User className="w-5 h-5 text-slate-300" />
                    </motion.div>
                  </div>
                  <motion.button
                    onClick={signOut}
                    title="Sign Out"
                    className="flex items-center justify-center w-full p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-72'
        )}
      >
        <OfflineBanner />

        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-lg bg-guardian-gold/10 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-5 h-5 text-guardian-gold" />
              </motion.div>
              <span className="font-semibold text-white">Guardianship</span>
            </div>
            <div className="flex items-center gap-2">
              <NetworkStatusIndicator showLabel />
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-4 h-4 text-slate-400" />
                </motion.button>
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        key="overlay"
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                      <motion.div
                        key="menu"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={userMenuVariants}
                        className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <motion.div
                          className="p-3 border-b border-slate-700"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                        >
                          <p className="text-sm font-semibold text-white truncate">
                            {rep?.name || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {rep?.email}
                          </p>
                        </motion.div>
                        <div className="p-2">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Link
                              href="/demo"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-sm">
                                Exit to Customer View
                              </span>
                            </Link>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                signOut();
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Sign Out</span>
                            </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>

        <InstallPrompt variant="toast" />
      </div>

      <BottomNav items={bottomNavItems} accentColor="gold" />
    </div>
  );
}
