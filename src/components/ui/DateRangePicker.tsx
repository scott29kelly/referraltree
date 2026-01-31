'use client';

import * as React from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangeValue {
  start: string;
  end: string;
}

interface Preset {
  label: string;
  getValue: () => DateRangeValue;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  className?: string;
}

// Date utility functions
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
];

function formatDateDisplay(date: string): string {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getActivePreset(value: DateRangeValue): string | null {
  for (const preset of presets) {
    const presetValue = preset.getValue();
    if (presetValue.start === value.start && presetValue.end === value.end) {
      return preset.label;
    }
  }
  return null;
}

function stringToDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  return new Date(dateStr + 'T00:00:00');
}

function dateToString(date: Date | undefined): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export default function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<'presets' | 'calendar'>('presets');

  const activePreset = getActivePreset(value);

  // Convert string dates to DateRange for Calendar
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (!value.start && !value.end) return undefined;
    return {
      from: stringToDate(value.start),
      to: stringToDate(value.end),
    };
  }, [value.start, value.end]);

  const handlePresetClick = (preset: Preset) => {
    onChange(preset.getValue());
    setIsOpen(false);
    setView('presets');
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      onChange({
        start: dateToString(range.from),
        end: dateToString(range.to),
      });
      // Close popover if both dates are selected
      if (range.from && range.to) {
        setTimeout(() => {
          setIsOpen(false);
          setView('presets');
        }, 150);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ start: '', end: '' });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setView('presets');
    }
  };

  const displayText = () => {
    if (!value.start && !value.end) {
      return 'All Time';
    }
    if (activePreset) {
      return activePreset;
    }
    const start = formatDateDisplay(value.start);
    const end = formatDateDisplay(value.end);
    if (start === end) return start;
    if (!end) return `From ${start}`;
    return `${start} - ${end}`;
  };

  const hasValue = value.start || value.end;

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-auto min-w-[200px] justify-start gap-2 px-4 py-2.5',
              'bg-slate-800/80 backdrop-blur-sm border-slate-700/50',
              'text-white text-sm font-medium',
              'hover:bg-slate-700/80 hover:border-slate-600/50',
              'focus:ring-2 focus:ring-emerald-500/50',
              isOpen && 'ring-2 ring-emerald-500/50 border-emerald-500/50'
            )}
          >
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="flex-1 text-left">{displayText()}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            'w-auto p-0',
            'bg-slate-900 border-slate-700/50',
            'shadow-2xl shadow-black/40'
          )}
          align="start"
          sideOffset={8}
        >
          {view === 'presets' ? (
            <div className="p-3">
              {/* Preset Grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
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
                onClick={() => {
                  onChange({ start: '', end: '' });
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-3',
                  !value.start && !value.end
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-300 border border-transparent hover:bg-slate-700/50 hover:text-white'
                )}
              >
                All Time
              </button>

              {/* Divider */}
              <div className="h-px bg-slate-700/50 my-3" />

              {/* Custom Range Button */}
              <button
                onClick={() => setView('calendar')}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Custom Range
              </button>
            </div>
          ) : (
            <div className="p-3">
              {/* Back Button */}
              <button
                onClick={() => setView('presets')}
                className="mb-3 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                ← Back to presets
              </button>

              {/* Calendar */}
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                defaultMonth={dateRange?.from || new Date()}
                className="rounded-lg"
              />

              {/* Selected Range Display */}
              {(value.start || value.end) && (
                <div className="mt-3 p-2 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  <span className="text-emerald-400">Selected:</span>{' '}
                  {value.start ? formatDateDisplay(value.start) : '—'} to{' '}
                  {value.end ? formatDateDisplay(value.end) : '—'}
                </div>
              )}

              {/* Apply Button */}
              {value.start && value.end && (
                <Button
                  variant="emerald"
                  className="w-full mt-3"
                  onClick={() => {
                    setIsOpen(false);
                    setView('presets');
                  }}
                >
                  Apply Range
                </Button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Clear Button */}
      {hasValue && (
        <button
          onClick={handleClear}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors z-10"
          title="Clear filter"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}

// Also export as named export for flexibility
export { DateRangePicker };
