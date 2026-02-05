'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const navRef = useRef<HTMLDivElement>(null);
  const [itemPositions, setItemPositions] = useState<
    { left: number; width: number }[]
  >([]);

  const colorClasses = {
    gold: {
      active: 'text-guardian-gold',
      activeBg: 'bg-guardian-gold/10',
      activeRing: 'ring-guardian-gold/20',
      glow: 'shadow-guardian-gold/30',
      pillBg: 'bg-guardian-gold/15',
      pillBorder: 'border-guardian-gold/30',
      glowColor: 'bg-guardian-gold/40',
    },
    emerald: {
      active: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10',
      activeRing: 'ring-emerald-500/20',
      glow: 'shadow-emerald-500/30',
      pillBg: 'bg-emerald-500/15',
      pillBorder: 'border-emerald-500/30',
      glowColor: 'bg-emerald-400/40',
    },
  };

  const colors = colorClasses[accentColor];
  const activeIndex = items
    .slice(0, 5)
    .findIndex((item) => pathname === item.href);

  useEffect(() => {
    const updatePositions = () => {
      if (navRef.current) {
        const navItems = navRef.current.querySelectorAll('[data-nav-item]');
        const positions = Array.from(navItems).map((item) => {
          const rect = item.getBoundingClientRect();
          const navRect = navRef.current!.getBoundingClientRect();
          return {
            left: rect.left - navRect.left,
            width: rect.width,
          };
        });
        setItemPositions(positions);
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [items]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 safe-area-bottom">
      <div
        ref={navRef}
        className="flex items-center justify-around px-2 py-2 relative"
      >
        <AnimatePresence>
          {activeIndex >= 0 && itemPositions.length > 0 && (
            <motion.div
              key="floating-pill"
              className={clsx(
                'absolute top-1.5 bottom-1.5 rounded-xl border',
                colors.pillBg,
                colors.pillBorder,
                `shadow-lg ${colors.glow}`
              )}
              initial={false}
              animate={{
                left: itemPositions[activeIndex]?.left ?? 0,
                width: itemPositions[activeIndex]?.width ?? 64,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
        </AnimatePresence>

        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-nav-item
              className={clsx(
                'relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[64px] z-10',
                isActive ? colors.active : 'text-slate-400'
              )}
            >
              <motion.div
                className="relative"
                whileTap={{
                  scale: 0.85,
                  transition: {
                    type: 'spring',
                    stiffness: 600,
                    damping: 15,
                  },
                }}
              >
                {isActive && (
                  <motion.div
                    className={clsx(
                      'absolute inset-0 rounded-full blur-md -z-10',
                      colors.glowColor
                    )}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: [0.4, 0.6, 0.4],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  <item.icon
                    className={clsx(
                      'w-5 h-5 transition-all duration-200',
                      isActive && 'drop-shadow-sm'
                    )}
                  />
                </motion.div>
              </motion.div>

              <motion.span
                className={clsx(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'font-semibold' : ''
                )}
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {item.label}
              </motion.span>

              <motion.div
                className="absolute inset-0 rounded-xl"
                whileTap={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: { duration: 0.1 },
                }}
              />
            </Link>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-slate-900" />
    </nav>
  );
}
