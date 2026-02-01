'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Users,
  FileText,
  BarChart3,
  Home,
  Search,
  User,
  ArrowRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'rep' | 'referral' | 'customer';
  title: string;
  subtitle?: string;
}

interface CommandSearchProps {
  reps?: Array<{ id: string; name: string; email: string }>;
  referrals?: Array<{ id: string; referee_name: string; status: string }>;
}

export function CommandSearch({ reps = [], referrals = [] }: CommandSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems = [
    { icon: Home, label: 'Overview', href: '/admin' },
    { icon: Users, label: 'Manage Reps', href: '/admin/reps' },
    { icon: FileText, label: 'All Referrals', href: '/admin/referrals' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-300 hover:border-slate-600/50 transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm flex-1 text-left">Search...</span>
        <kbd className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="bg-slate-900 border-slate-700">
          <CommandInput
            placeholder="Search reps, referrals, or navigate..."
            className="border-none focus:ring-0 text-white placeholder:text-slate-500"
          />
          <CommandList className="bg-slate-900 max-h-[400px]">
            <CommandEmpty className="py-6 text-center text-slate-400">
              No results found.
            </CommandEmpty>

            {/* Navigation */}
            <CommandGroup heading="Navigation" className="text-slate-500">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="text-slate-300 hover:bg-slate-800 cursor-pointer aria-selected:bg-slate-800"
                >
                  <item.icon className="w-4 h-4 mr-2 text-slate-400" />
                  {item.label}
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-500" />
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Reps */}
            {reps.length > 0 && (
              <>
                <CommandSeparator className="bg-slate-800" />
                <CommandGroup heading="Reps" className="text-slate-500">
                  {reps.slice(0, 5).map((rep) => (
                    <CommandItem
                      key={rep.id}
                      value={`rep ${rep.name} ${rep.email}`}
                      onSelect={() => runCommand(() => router.push(`/admin/reps/${rep.id}`))}
                      className="text-slate-300 hover:bg-slate-800 cursor-pointer aria-selected:bg-slate-800"
                    >
                      <User className="w-4 h-4 mr-2 text-emerald-400" />
                      <div className="flex-1">
                        <p>{rep.name}</p>
                        <p className="text-xs text-slate-500">{rep.email}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Referrals */}
            {referrals.length > 0 && (
              <>
                <CommandSeparator className="bg-slate-800" />
                <CommandGroup heading="Recent Referrals" className="text-slate-500">
                  {referrals.slice(0, 5).map((referral) => (
                    <CommandItem
                      key={referral.id}
                      value={`referral ${referral.referee_name}`}
                      onSelect={() => runCommand(() => router.push(`/admin/referrals?search=${encodeURIComponent(referral.referee_name)}`))}
                      className="text-slate-300 hover:bg-slate-800 cursor-pointer aria-selected:bg-slate-800"
                    >
                      <FileText className="w-4 h-4 mr-2 text-amber-400" />
                      <div className="flex-1">
                        <p>{referral.referee_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{referral.status}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

export default CommandSearch;
