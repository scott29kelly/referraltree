'use client';

import Link from 'next/link';
import { Shield, Menu } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface CustomerHeaderProps {
  className?: string;
}

export default function CustomerHeader({ className }: CustomerHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={clsx(
      'sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50',
      className
    )}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/demo" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Guardianship</span>
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
              className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 transition-colors"
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
          <nav className="md:hidden pt-4 pb-2 border-t border-slate-800/50 mt-3 space-y-2">
            <Link
              href="/demo"
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium text-center hover:bg-amber-400 transition-colors"
            >
              Rep Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
