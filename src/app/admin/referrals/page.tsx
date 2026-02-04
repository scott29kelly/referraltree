'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getReferrals, getCustomers, getReps, updateReferralStatus } from '@/lib/data';
import BulkActions from '@/components/admin/BulkActions';
import ExportButton from '@/components/admin/ExportButton';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { TableSkeleton } from '@/components/ui/skeletons';
import { NoSearchResultsEmpty, ErrorEmpty } from '@/components/ui/empty-state';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  User,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Referral, Customer, Rep, ReferralStatus } from '@/types/database';

type SortField = 'created_at' | 'status' | 'referee_name';
type SortDirection = 'asc' | 'desc';

const statusConfig: Record<ReferralStatus, { label: string; color: string; bg: string; glow: string }> = {
  submitted: { label: 'Submitted', color: 'text-slate-300', bg: 'bg-slate-600/80', glow: 'shadow-slate-500/20' },
  contacted: { label: 'Contacted', color: 'text-sky-300', bg: 'bg-sky-600/80', glow: 'shadow-sky-500/20' },
  quoted: { label: 'Quoted', color: 'text-amber-300', bg: 'bg-amber-600/80', glow: 'shadow-amber-500/20' },
  sold: { label: 'Sold', color: 'text-emerald-300', bg: 'bg-emerald-600/80', glow: 'shadow-emerald-500/20' },
};

const statusOrder: Record<ReferralStatus, number> = {
  submitted: 0,
  contacted: 1,
  quoted: 2,
  sold: 3,
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [mockReferralsData, customersData, repsData] = await Promise.all([
        getReferrals(),
        getCustomers(),
        getReps(),
      ]);

      // Also fetch API-submitted referrals
      let apiReferrals: Referral[] = [];
      try {
        const response = await fetch('/api/referrals');
        if (response.ok) {
          const data = await response.json();
          apiReferrals = data.referrals || [];
        }
      } catch (err) {
        console.error('Error fetching API referrals:', err);
      }

      // Combine API referrals (newer) with mock data, avoiding duplicates
      const apiIds = new Set(apiReferrals.map(r => r.id));
      const combinedReferrals = [
        ...apiReferrals,
        ...mockReferralsData.filter(r => !apiIds.has(r.id))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReferrals(combinedReferrals);
      setCustomers(customersData);
      setReps(repsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load referrals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create lookup maps
  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  );

  // Filter and sort
  const filteredReferrals = useMemo(() => {
    let result = [...referrals];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.referee_name.toLowerCase().includes(query) ||
          r.referee_email?.toLowerCase().includes(query) ||
          customerMap.get(r.referrer_id)?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter(
        (r) => new Date(r.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      result = result.filter(
        (r) => new Date(r.created_at) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'referee_name':
          comparison = a.referee_name.localeCompare(b.referee_name);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [referrals, searchQuery, statusFilter, dateRange, sortField, sortDirection, customerMap]);

  // Export data
  const exportData = useMemo(
    () =>
      filteredReferrals.map((r) => ({
        name: r.referee_name,
        email: r.referee_email || '',
        phone: r.referee_phone || '',
        status: r.status,
        value: r.value,
        referrer: customerMap.get(r.referrer_id)?.name || '',
        created_at: new Date(r.created_at).toLocaleDateString(),
      })),
    [filteredReferrals, customerMap]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredReferrals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReferrals.map((r) => r.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusChange = async (status: ReferralStatus) => {
    // Optimistically update UI
    setReferrals((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status } : r))
    );
    
    // Update each referral via API
    for (const id of selectedIds) {
      try {
        const apiResponse = await fetch('/api/referrals', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        if (!apiResponse.ok) {
          await updateReferralStatus(id, status);
        }
      } catch {
        await updateReferralStatus(id, status);
      }
    }
    setSelectedIds(new Set());
  };

  const handleStatusChange = async (id: string, status: ReferralStatus) => {
    // Optimistically update UI
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      // Try API first (for demo referrals stored in JSON)
      const apiResponse = await fetch('/api/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!apiResponse.ok) {
        // If not in API, try mock data update
        await updateReferralStatus(id, status);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      loadData();
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">All Referrals</h1>
              <p className="text-slate-400">Loading referrals...</p>
            </div>
          </div>
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">All Referrals</h1>
              <p className="text-slate-400">View and manage all referrals</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8">
          <ErrorEmpty onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Referrals</h1>
          </div>
          <p className="text-slate-400 ml-[52px]">
            {referrals.length} total referrals across all reps
          </p>
        </div>
        <ExportButton
          data={exportData}
          filename="referrals"
          headers={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'status', label: 'Status' },
            { key: 'value', label: 'Value' },
            { key: 'referrer', label: 'Referrer' },
            { key: 'created_at', label: 'Date' },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search referrals..."
            className={clsx(
              'w-full pl-11 pr-4 py-2.5 rounded-xl',
              'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50',
              'text-white text-sm placeholder-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
          className={clsx(
            'px-4 py-2.5 rounded-xl appearance-none cursor-pointer',
            'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50',
            'text-white text-sm',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
            'transition-all duration-200'
          )}
        >
          <option value="all">All Status</option>
          {(Object.keys(statusConfig) as ReferralStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusConfig[s].label}
            </option>
          ))}
        </select>

        {/* Date Range Picker */}
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onStatusChange={handleBulkStatusChange}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/50">
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {selectedIds.size === filteredReferrals.length &&
                    filteredReferrals.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('referee_name')}
                >
                  <div className="flex items-center gap-1">
                    Referral
                    <SortIcon field="referee_name" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Value
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="created_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredReferrals.map((referral) => {
                const customer = customerMap.get(referral.referrer_id);
                const config = statusConfig[referral.status];

                return (
                  <tr
                    key={referral.id}
                    className={clsx(
                      'hover:bg-slate-700/20 transition-all duration-200',
                      selectedIds.has(referral.id) && 'bg-emerald-500/5'
                    )}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleSelect(referral.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {selectedIds.has(referral.id) ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-white font-medium">
                          {referral.referee_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-sm">
                      {customer?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={referral.status}
                        onChange={(e) =>
                          handleStatusChange(
                            referral.id,
                            e.target.value as ReferralStatus
                          )
                        }
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer',
                          'shadow-lg transition-all duration-200',
                          config.bg,
                          config.color,
                          config.glow
                        )}
                      >
                        {(Object.keys(statusConfig) as ReferralStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {statusConfig[s].label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-guardian-gold font-semibold">
                        ${referral.value}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm">
                      {new Date(referral.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReferrals.length === 0 && (
          <NoSearchResultsEmpty
            query={searchQuery}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateRange({ start: '', end: '' });
            }}
            className="py-8"
          />
        )}

        <div className="px-4 py-3 border-t border-slate-700/30 bg-slate-800/30 text-sm text-slate-400 flex items-center justify-between">
          <span>Showing {filteredReferrals.length} of {referrals.length} referrals</span>
          {selectedIds.size > 0 && (
            <span className="text-emerald-400">{selectedIds.size} selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
