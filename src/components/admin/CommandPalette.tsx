'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  BarChart3,
  UserPlus,
  Download,
  Search,
  Settings,
  LogOut,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Command,
  Keyboard,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  onAddRep?: () => void;
  onExport?: () => void;
  onSignOut?: () => void;
}

export default function CommandPalette({
  onAddRep,
  onExport,
  onSignOut,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Navigation actions
  const navigationItems = [
    {
      label: 'Admin Overview',
      icon: Home,
      href: '/admin',
      shortcut: 'G O',
    },
    {
      label: 'Manage Reps',
      icon: Users,
      href: '/admin/reps',
      shortcut: 'G R',
    },
    {
      label: 'All Referrals',
      icon: FileText,
      href: '/admin/referrals',
      shortcut: 'G F',
    },
    {
      label: 'Reports',
      icon: BarChart3,
      href: '/admin/reports',
      shortcut: 'G P',
    },
    {
      label: 'Switch to Rep View',
      icon: ArrowLeftRight,
      href: '/dashboard',
      shortcut: 'G D',
    },
  ];

  // Quick action items
  const actionItems = [
    {
      label: 'Add New Rep',
      icon: UserPlus,
      action: onAddRep,
      shortcut: 'A R',
      variant: 'emerald' as const,
    },
    {
      label: 'Export Data',
      icon: Download,
      action: onExport,
      shortcut: 'A E',
    },
  ];

  // Stats quick links
  const statsItems = [
    {
      label: 'View Total Referrals',
      icon: TrendingUp,
      href: '/admin/referrals',
    },
    {
      label: 'View Earnings',
      icon: DollarSign,
      href: '/admin/reports',
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-slate-800/50 border border-slate-700/50',
          'text-slate-400 text-sm',
          'hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
        )}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <div className="hidden sm:flex items-center gap-1 ml-auto pl-4">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-medium text-slate-300">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-medium text-slate-300">
            K
          </kbd>
        </div>
      </button>

      {/* Command Dialog */}
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        title="Command Palette"
        description="Search for commands and quick actions"
      >
        <CommandInput 
          placeholder="Type a command or search..." 
          className="border-b border-slate-700/50"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-6 text-center text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <Search className="w-6 h-6 text-slate-500" />
              <span>No results found.</span>
            </div>
          </CommandEmpty>

          {/* Navigation Group */}
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg',
                  'data-[selected=true]:bg-slate-800 data-[selected=true]:text-white',
                  'text-slate-300'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut className="text-slate-500">
                    {item.shortcut}
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-slate-700/50" />

          {/* Quick Actions Group */}
          <CommandGroup heading="Quick Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => {
                  if (item.action) {
                    runCommand(item.action);
                  }
                }}
                disabled={!item.action}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg',
                  'data-[selected=true]:bg-slate-800 data-[selected=true]:text-white',
                  item.variant === 'emerald' 
                    ? 'text-emerald-400 data-[selected=true]:text-emerald-300' 
                    : 'text-slate-300',
                  !item.action && 'opacity-50'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  item.variant === 'emerald' 
                    ? 'bg-emerald-500/20' 
                    : 'bg-slate-800/80'
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut className="text-slate-500">
                    {item.shortcut}
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-slate-700/50" />

          {/* Stats Quick Links */}
          <CommandGroup heading="Quick Stats">
            {statsItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => runCommand(() => router.push(item.href))}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg',
                  'data-[selected=true]:bg-slate-800 data-[selected=true]:text-white',
                  'text-slate-300'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-slate-700/50" />

          {/* Settings & Account */}
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => {
                if (onSignOut) {
                  runCommand(onSignOut);
                }
              }}
              disabled={!onSignOut}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg',
                'data-[selected=true]:bg-red-500/10 data-[selected=true]:text-red-400',
                'text-slate-300',
                !onSignOut && 'opacity-50'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-400" />
              </div>
              <span className="flex-1">Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Keyboard className="w-3 h-3" />
              <span>Navigate</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-700 text-[10px] font-mono">↑↓</kbd>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Select</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-700 text-[10px] font-mono">↵</kbd>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Close</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-700 text-[10px] font-mono">ESC</kbd>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Command className="w-3 h-3" />
            <span>Command Palette</span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}

export { CommandPalette };
