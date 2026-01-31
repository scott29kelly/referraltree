'use client';

import { useState } from 'react';
import { Loader2, UserPlus, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CreateRepInput, RepRole } from '@/types/database';

interface AddRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRepInput) => Promise<void>;
}

export default function AddRepModal({ isOpen, onClose, onSubmit }: AddRepModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RepRole>('rep');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({ name, email, role });
      setName('');
      setEmail('');
      setRole('rep');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rep');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          'bg-gradient-to-br from-slate-900/95 to-slate-900/90',
          'backdrop-blur-xl border-slate-700/50',
          'shadow-2xl shadow-black/50',
          'p-0 gap-0 overflow-hidden'
        )}
        showCloseButton={false}
      >
        {/* Decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

        {/* Header */}
        <DialogHeader className="p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white tracking-tight">
                Add New Rep
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                Create a new sales representative account
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl',
                  'bg-slate-800/80 border border-slate-700/50',
                  'text-white text-sm placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                  'transition-all duration-200',
                  'disabled:opacity-50'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@guardian.com"
                required
                disabled={isLoading}
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl',
                  'bg-slate-800/80 border border-slate-700/50',
                  'text-white text-sm placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                  'transition-all duration-200',
                  'disabled:opacity-50'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Shield className="w-4 h-4 text-slate-500" />
              </div>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as RepRole)}
                disabled={isLoading}
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl appearance-none cursor-pointer',
                  'bg-slate-800/80 border border-slate-700/50',
                  'text-white text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
                  'transition-all duration-200',
                  'disabled:opacity-50'
                )}
              >
                <option value="rep">Rep</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                'flex-1 py-3 rounded-xl',
                'bg-slate-800/80 border-slate-700/50',
                'text-slate-300 hover:text-white hover:bg-slate-700/80',
                'transition-all duration-200'
              )}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'flex-1 py-3 rounded-xl',
                'bg-gradient-to-r from-emerald-500 to-emerald-600',
                'text-white font-medium',
                'shadow-lg shadow-emerald-500/25',
                'hover:shadow-emerald-500/40 hover:scale-[1.02]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:hover:scale-100'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Rep'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
