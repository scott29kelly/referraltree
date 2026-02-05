'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { GuardianIcon } from '@/components/ui/guardian-logo';

interface CustomerHeaderProps {
  className?: string;
}

export default function CustomerHeader({ className }: CustomerHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={clsx(
      'sticky top-0 z-50 bg-guardian-navy/80 backdrop-blur-xl border-b border-guardian-gold/20',
      className
    )}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/demo" className="flex items-center gap-2">
            <GuardianIcon size="sm" variant="gold" />
            <span className="font-bold text-white font-display">Guardianship</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/demo"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-guardian-gold text-guardian-navy font-medium hover:bg-guardian-gold/90 transition-colors"
            >
              Rep Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-guardian-gold/20 mt-3 space-y-2">
            <Link
              href="/demo"
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-guardian-navy/50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-lg bg-guardian-gold text-guardian-navy font-medium text-center hover:bg-guardian-gold/90 transition-colors"
            >
              Rep Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
