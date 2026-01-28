'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus, Mail, User, Shield } from 'lucide-react';
import { clsx } from 'clsx';
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Add New Rep</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4" />
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
                className={clsx(
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
                className={clsx(
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
                className={clsx(
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

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={clsx(
                'flex-1 py-3 px-4 rounded-xl',
                'bg-slate-800/80 border border-slate-700/50',
                'text-slate-300 font-medium text-sm',
                'hover:bg-slate-700/80 hover:text-white',
                'transition-all duration-200',
                'disabled:opacity-50'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                'flex-1 py-3 px-4 rounded-xl',
                'bg-gradient-to-r from-emerald-500 to-emerald-600',
                'text-white font-medium text-sm',
                'shadow-lg shadow-emerald-500/25',
                'hover:shadow-emerald-500/40 hover:scale-[1.02]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:hover:scale-100',
                'flex items-center justify-center gap-2'
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
