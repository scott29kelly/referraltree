'use client';

import { useEffect, useState, useCallback } from 'react';
import { getRepsWithStats, createRep, updateRep } from '@/lib/data';
import RepCard from '@/components/admin/RepCard';
import AddRepModal from '@/components/admin/AddRepModal';
import { Plus, Search, Users } from 'lucide-react';
import type { RepWithStats, CreateRepInput } from '@/types/database';

export default function RepsPage() {
  const [reps, setReps] = useState<RepWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReps = useCallback(async () => {
    try {
      const data = await getRepsWithStats();
      setReps(data);
    } catch (error) {
      console.error('Error loading reps:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReps();
  }, [loadReps]);

  const handleCreateRep = async (data: CreateRepInput) => {
    const newRep = await createRep(data);
    if (newRep) {
      await loadReps();
    }
  };

  const handleToggleActive = async (rep: RepWithStats) => {
    const updated = await updateRep(rep.id, { active: !rep.active });
    if (updated) {
      setReps((prev) =>
        prev.map((r) => (r.id === rep.id ? { ...r, active: !r.active } : r))
      );
    }
  };

  // Filter reps
  const filteredReps = reps.filter((rep) => {
    const matchesSearch =
      rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showInactive || rep.active;
    return matchesSearch && matchesActive;
  });

  // Stats
  const activeCount = reps.filter((r) => r.active).length;
  const totalEarnings = reps.reduce((sum, r) => sum + r.total_earnings, 0);
  const totalReferrals = reps.reduce((sum, r) => sum + r.total_referrals, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reps</h1>
          <p className="text-slate-400 mt-1">
            Manage your team and track performance
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Rep
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Reps</p>
              <p className="text-xl font-bold text-white stat-number">{reps.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-xl font-bold text-emerald-400 stat-number">{activeCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Referrals</p>
          <p className="text-xl font-bold text-white stat-number">{totalReferrals}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Earnings</p>
          <p className="text-xl font-bold text-guardian-gold earnings-number">
            ${totalEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reps..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-300">Show inactive</span>
        </label>
      </div>

      {/* Reps Grid */}
      {filteredReps.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {searchQuery ? 'No reps match your search' : 'No reps found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReps.map((rep) => (
            <RepCard
              key={rep.id}
              rep={rep}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Add Rep Modal */}
      <AddRepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRep}
      />
    </div>
  );
}
