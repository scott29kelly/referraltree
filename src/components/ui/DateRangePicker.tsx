'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';

interface DateRange {
  start: string;
  end: string;
}

interface Preset {
  label: string;
  getValue: () => DateRange;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getStartOfWeek(): string {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return date.toISOString().split('T')[0];
}

function getStartOfMonth(): string {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

function getStartOfQuarter(): string {
  const date = new Date();
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
}

function getStartOfYear(): string {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
}

const presets: Preset[] = [
  {
    label: 'Today',
    getValue: () => ({ start: getToday(), end: getToday() }),
  },
  {
    label: 'This Week',
    getValue: () => ({ start: getStartOfWeek(), end: getToday() }),
  },
  {
    label: 'This Month',
    getValue: () => ({ start: getStartOfMonth(), end: getToday() }),
  },
  {
    label: 'This Quarter',
    getValue: () => ({ start: getStartOfQuarter(), end: getToday() }),
  },
  {
    label: 'This Year',
    getValue: () => ({ start: getStartOfYear(), end: getToday() }),
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({ start: getDateOffset(-6), end: getToday() }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({ start: getDateOffset(-29), end: getToday() }),
  },
  {
    label: 'Last 90 Days',
    getValue: () => ({ start: getDateOffset(-89), end: getToday() }),
  },
  {
    label: 'All Time',
    getValue: () => ({ start: '', end: '' }),
  },
];

function formatDateDisplay(date: string): string {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getActivePreset(value: DateRange): string | null {
  for (const preset of presets) {
    const presetValue = preset.getValue();
    if (presetValue.start === value.start && presetValue.end === value.end) {
      return preset.label;
    }
  }
  return null;
}

export default function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(value.start);
  const [customEnd, setCustomEnd] = useState(value.end);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePreset = getActivePreset(value);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInButton = containerRef.current?.contains(target);
      const clickedInDropdown = dropdownRef.current?.contains(target);
      if (!clickedInButton && !clickedInDropdown) {
        setIsOpen(false);
        setShowCustom(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (preset: Preset) => {
    onChange(preset.getValue());
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    onChange({ start: customStart, end: customEnd });
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleClear = () => {
    onChange({ start: '', end: '' });
    setCustomStart('');
    setCustomEnd('');
  };

  const displayText = () => {
    if (!value.start && !value.end) {
      return 'All Time';
    }
    if (activePreset && activePreset !== 'All Time') {
      return activePreset;
    }
    const start = formatDateDisplay(value.start);
    const end = formatDateDisplay(value.end);
    if (start === end) return start;
    return `${start} - ${end}`;
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl',
          'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50',
          'text-white text-sm font-medium',
          'hover:bg-slate-700/80 hover:border-slate-600/50',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          'transition-all duration-200',
          isOpen && 'ring-2 ring-emerald-500/50 border-emerald-500/50'
        )}
      >
        <Calendar className="w-4 h-4 text-emerald-400" />
        <span className="min-w-[120px] text-left">{displayText()}</span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Selected Range Badge (when filtered) */}
      {(value.start || value.end) && (
        <button
          onClick={handleClear}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors"
          title="Clear filter"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Dropdown via Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className={clsx(
            'fixed z-[9999]',
            'min-w-[280px] p-2 rounded-2xl',
            'bg-slate-900 backdrop-blur-xl',
            'border border-slate-700/50',
            'shadow-2xl shadow-black/40',
            'animate-[fade-in_0.15s_ease-out]'
          )}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {!showCustom ? (
            <>
              {/* Preset Options */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {presets.slice(0, 8).map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={clsx(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      activePreset === preset.label
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-300 border border-transparent hover:bg-slate-700/50 hover:text-white'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* All Time Button */}
              <button
                onClick={() => handlePresetClick(presets[8])}
                className={clsx(
                  'w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 mb-2',
                  activePreset === 'All Time'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-300 border border-transparent hover:bg-slate-700/50 hover:text-white'
                )}
              >
                All Time
              </button>

              {/* Divider */}
              <div className="h-px bg-slate-700/50 my-2" />

              {/* Custom Range Button */}
              <button
                onClick={() => {
                  setCustomStart(value.start);
                  setCustomEnd(value.end);
                  setShowCustom(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Custom Range
              </button>
            </>
          ) : (
            <>
              {/* Custom Range Picker */}
              <div className="space-y-3 p-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-slate-800/80 border border-slate-700/50',
                      'text-white placeholder-slate-500',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                      'transition-all duration-200'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 rounded-xl text-sm',
                      'bg-slate-800/80 border border-slate-700/50',
                      'text-white placeholder-slate-500',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                      'transition-all duration-200'
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowCustom(false)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCustomApply}
                    className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
