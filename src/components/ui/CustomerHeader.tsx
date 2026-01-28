'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Home, Users, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

interface CustomerHeaderProps {
  onAddReferralClick?: () => void;
}

export default function CustomerHeader({ onAddReferralClick }: CustomerHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleAddReferral = useCallback(() => {
    setIsMenuOpen(false);
    if (onAddReferralClick) {
      onAddReferralClick();
    } else {
      // Scroll to bottom where the add referral button typically is
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [onAddReferralClick]);

  const menuItems: MenuItem[] = [
    { label: 'Home', href: '/demo', icon: Home },
    { label: 'My Referrals', href: pathname.startsWith('/referrals') ? pathname : '/referrals/demo-customer', icon: Users },
    { label: 'Add Referral', icon: UserPlus, action: handleAddReferral },
    { label: 'Login', href: '/login', icon: LogIn },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/demo" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600
                         flex items-center justify-center shadow-lg shadow-amber-500/20
                         group-hover:shadow-amber-500/40 transition-shadow"
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-lg font-bold text-white">Guardianship</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = item.href && pathname === item.href;
              const Icon = item.icon;

              if (item.action) {
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                               text-slate-300 hover:text-amber-400 hover:bg-slate-800/50
                               transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center
                       rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/50
                       transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-slate-900 border-l border-slate-800 md:hidden"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800/50">
                <span className="text-lg font-semibold text-white">Menu</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={closeMenu}
                  className="w-10 h-10 flex items-center justify-center
                             rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/50
                             transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = item.href && pathname === item.href;
                  const Icon = item.icon;

                  if (item.action) {
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   text-slate-300 hover:text-amber-400 hover:bg-slate-800/50
                                   transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    );
                  }

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href!}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                          ${isActive
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800/50'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                          ${isActive ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
                <p className="text-xs text-slate-500 text-center">
                  Earn $250 for every closed referral
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
