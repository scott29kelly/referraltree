'use client';

import { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReferralStatus } from '@/types/database';

interface BulkActionsProps {
  selectedCount: number;
  onStatusChange: (status: ReferralStatus) => void;
  onClearSelection: () => void;
}

const statusOptions: { value: ReferralStatus; label: string; color: string }[] = [
  { value: 'submitted', label: 'Submitted', color: 'bg-slate-600' },
  { value: 'contacted', label: 'Contacted', color: 'bg-sky-600' },
  { value: 'quoted', label: 'Quoted', color: 'bg-amber-600' },
  { value: 'sold', label: 'Sold', color: 'bg-emerald-600' },
];

export default function BulkActions({
  selectedCount,
  onStatusChange,
  onClearSelection,
}: BulkActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-white font-medium">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex-1 flex items-center gap-2">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white hover:bg-slate-700 transition-colors"
          >
            Change Status
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform',
                isDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-40 py-1 rounded-lg bg-slate-800 border border-slate-700 shadow-xl z-20">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onStatusChange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <span
                      className={clsx('w-2 h-2 rounded-full', option.color)}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
