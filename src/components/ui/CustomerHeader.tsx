'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { GuardianIcon } from '@/components/ui/guardian-logo';

interface CustomerHeaderProps {
  className?: string;
}

export default function CustomerHeader({ className }: CustomerHeaderProps) {
  return (
    <header className={clsx(
      'sticky top-0 z-50 bg-guardian-navy/80 backdrop-blur-xl border-b border-guardian-gold/20',
      className
    )}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/demo" className="flex items-center gap-2">
            <GuardianIcon size="sm" variant="gold" />
            <span className="font-bold text-white font-display">Guardianship</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
