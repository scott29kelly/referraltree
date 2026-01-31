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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

          <div className="space-y-2">
            <Label htmlFor="rep-name" className="text-slate-300">
              Full Name
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="rep-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
                className={cn(
                  'pl-11 py-3 h-auto rounded-xl',
                  'bg-slate-800/80 border-slate-700/50',
                  'text-white placeholder-slate-500',
                  'focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50'
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rep-email" className="text-slate-300">
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="rep-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@guardian.com"
                required
                disabled={isLoading}
                className={cn(
                  'pl-11 py-3 h-auto rounded-xl',
                  'bg-slate-800/80 border-slate-700/50',
                  'text-white placeholder-slate-500',
                  'focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50'
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rep-role" className="text-slate-300">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RepRole)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="rep-role"
                className={cn(
                  'w-full h-auto py-3 rounded-xl',
                  'bg-slate-800/80 border-slate-700/50',
                  'text-white',
                  'focus:ring-emerald-500/50 focus:border-emerald-500/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <SelectValue placeholder="Select role" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700/50">
                <SelectItem value="rep" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                  Rep
                </SelectItem>
                <SelectItem value="admin" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
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
              variant="emerald"
              disabled={isLoading}
              className={cn(
                'flex-1 py-3 rounded-xl',
                'transition-all duration-200'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
