'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getReferrals, getRepsWithStats } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import ExportButton from '@/components/admin/ExportButton';
import EarningsChart from '@/components/dashboard/EarningsChart';
import DateRangePicker from '@/components/ui/DateRangePicker';
import {
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Referral, RepWithStats } from '@/types/database';

export default function ReportsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [reps, setReps] = useState<RepWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  const loadData = useCallback(async () => {
    try {
      const [mockReferralsData, repsData] = await Promise.all([
        getReferrals(),
        getRepsWithStats(),
      ]);
      
      // Fetch API referrals
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
      
      // Combine and dedupe
      const apiIds = new Set(apiReferrals.map(r => r.id));
      const combined = [
        ...apiReferrals,
        ...mockReferralsData.filter(r => !apiIds.has(r.id))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setReferrals(combined);
      setReps(repsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter referrals by date range
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const created = new Date(r.created_at);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : new Date();
      return created >= startDate && created <= endDate;
    });
  }, [referrals, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const submitted = filteredReferrals.filter((r) => r.status === 'submitted').length;
    const contacted = filteredReferrals.filter((r) => r.status === 'contacted').length;
    const quoted = filteredReferrals.filter((r) => r.status === 'quoted').length;
    const sold = filteredReferrals.filter((r) => r.status === 'sold').length;
    const total = filteredReferrals.length;
    const revenue = sold * 125;
    const conversionRate = total > 0 ? ((sold / total) * 100).toFixed(1) : '0';

    return {
      total,
      submitted,
      contacted,
      quoted,
      sold,
      revenue,
      conversionRate,
    };
  }, [filteredReferrals]);

  // Combined export data - all report data in one export
  const combinedExportData = useMemo(() => {
    const period = dateRange.start && dateRange.end
      ? `${dateRange.start} to ${dateRange.end}`
      : 'All Time';

    return [
      // Metrics section
      { type: 'Metric', name: 'Total Referrals', value: metrics.total, period },
      { type: 'Metric', name: 'Submitted', value: metrics.submitted, period },
      { type: 'Metric', name: 'Contacted', value: metrics.contacted, period },
      { type: 'Metric', name: 'Quoted', value: metrics.quoted, period },
      { type: 'Metric', name: 'Sold', value: metrics.sold, period },
      { type: 'Metric', name: 'Revenue', value: `$${metrics.revenue}`, period },
      { type: 'Metric', name: 'Conversion Rate', value: `${metrics.conversionRate}%`, period },
      // Separator row
      { type: '---', name: '---', value: '---', period: '---' },
      // Rep performance section
      ...reps.map((rep) => ({
        type: 'Rep Performance',
        name: rep.name,
        value: rep.total_referrals,
        period: `Sold: ${rep.total_sold} | Earnings: $${rep.total_earnings}`,
      })),
    ];
  }, [metrics, dateRange, reps]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-slate-800/80 rounded-xl animate-pulse" />
            <div className="h-4 w-48 bg-slate-800/60 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-800/80 rounded-xl animate-pulse" />
        </div>
        {/* Skeleton Date Picker */}
        <div className="h-14 bg-slate-800/60 rounded-2xl animate-pulse" />
        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
        {/* Skeleton Chart */}
        <div className="h-80 bg-slate-800/60 rounded-2xl animate-pulse" />
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
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          </div>
          <p className="text-slate-400 ml-[52px]">
            Analytics and performance metrics
          </p>
        </div>
        {/* Single Export Button - Combined Data */}
        <ExportButton
          data={combinedExportData}
          filename="guardian-report"
          headers={[
            { key: 'type', label: 'Type' },
            { key: 'name', label: 'Name' },
            { key: 'value', label: 'Value' },
            { key: 'period', label: 'Details' },
          ]}
        />
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">Filter by date:</span>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Referrals"
          value={metrics.total}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          variant="blue"
        />
        <StatsCard
          title="Sold"
          value={metrics.sold}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Revenue"
          value={`$${metrics.revenue.toLocaleString()}`}
          icon={DollarSign}
          variant="gold"
        />
      </div>

      {/* Pipeline Breakdown */}
      <div className="rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 p-6 shadow-2xl shadow-black/20">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          Pipeline Breakdown
        </h3>
        <div className="space-y-5">
          {[
            { label: 'Submitted', value: metrics.submitted, color: 'bg-slate-500', glow: 'shadow-slate-500/30' },
            { label: 'Contacted', value: metrics.contacted, color: 'bg-sky-500', glow: 'shadow-sky-500/30' },
            { label: 'Quoted', value: metrics.quoted, color: 'bg-amber-500', glow: 'shadow-amber-500/30' },
            { label: 'Sold', value: metrics.sold, color: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-700 ease-out shadow-lg',
                    item.color,
                    item.glow
                  )}
                  style={{
                    width: `${metrics.total > 0 ? (item.value / metrics.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Chart */}
      <EarningsChart referrals={filteredReferrals} />

      {/* Rep Performance Table */}
      <div className="rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-5 border-b border-slate-700/30 bg-slate-800/30">
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-guardian-gold/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-guardian-gold" />
            </div>
            Rep Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/40">
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Rep
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sold
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conv. Rate
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {reps
                .sort((a, b) => b.total_earnings - a.total_earnings)
                .map((rep, index) => (
                  <tr
                    key={rep.id}
                    className={clsx(
                      'hover:bg-slate-700/20 transition-all duration-200',
                      index === 0 && 'bg-guardian-gold/5'
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <div className="w-6 h-6 rounded-full bg-guardian-gold/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-guardian-gold">1</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{rep.name}</p>
                          <p className="text-xs text-slate-500">{rep.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold',
                          rep.role === 'admin'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700/50 text-slate-300'
                        )}
                      >
                        {rep.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">
                      {rep.total_referrals}
                    </td>
                    <td className="px-5 py-4 text-emerald-400 font-semibold">
                      {rep.total_sold}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {rep.total_referrals > 0
                        ? ((rep.total_sold / rep.total_referrals) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td className="px-5 py-4 text-guardian-gold font-semibold earnings-number">
                      ${rep.total_earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {reps.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No reps found</p>
          </div>
        )}
      </div>
    </div>
  );
}
