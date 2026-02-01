'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { clsx } from 'clsx';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: -1 },
];

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('All time');

  const handlePresetClick = (preset: typeof presets[0]) => {
    if (preset.days === -1) {
      // All time - clear the filter
      onChange?.({ start: '', end: '' });
      setSelectedPreset(preset.label);
      setOpen(false);
      return;
    }

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - preset.days);

    setSelectedPreset(preset.label);
    onChange?.({
      start: formatDateString(start),
      end: formatDateString(end),
    });
    setOpen(false);
  };

  const formatDateRange = () => {
    if (!value?.start && !value?.end) return selectedPreset;
    if (!value?.start || !value?.end) return selectedPreset;
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    return `${formatDate(value.start)} - ${formatDate(value.end)}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            'justify-start text-left font-normal min-w-[180px]',
            'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600',
            'text-slate-300',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
          <span className="truncate">{formatDateRange()}</span>
          <ChevronDown className="ml-auto h-4 w-4 text-slate-400 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-slate-900 border-slate-700"
        align="start"
      >
        <div className="p-3 space-y-1">
          <p className="text-xs font-medium text-slate-400 px-2 py-1">
            Select range
          </p>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedPreset === preset.label
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        {/* Custom date inputs */}
        <div className="border-t border-slate-800 p-3">
          <p className="text-xs font-medium text-slate-400 px-2 py-1 mb-2">
            Custom range
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => {
                onChange?.({ start: e.target.value, end: value?.end || '' });
                setSelectedPreset('Custom');
              }}
              className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => {
                onChange?.({ start: value?.start || '', end: e.target.value });
                setSelectedPreset('Custom');
              }}
              className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
