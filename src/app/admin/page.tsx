'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats, getRepsWithStats, getActivities, getReferrals, getCustomers } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { PipelineKanban } from '@/components/admin/PipelineKanban';
import { AdminPageSkeleton } from '@/components/ui/skeletons';
import { Users, TrendingUp, DollarSign, CheckCircle, ArrowRight, Trophy, Kanban } from 'lucide-react';
import type { AdminStats, RepWithStats, Activity, Referral, Customer, ReferralStatus } from '@/types/database';

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topReps, setTopReps] = useState<RepWithStats[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [customerMap, setCustomerMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, repsData, activitiesData, referralsData, customersData] = await Promise.all([
          getAdminStats(),
          getRepsWithStats(),
          getActivities(5),
          getReferrals(),
          getCustomers(),
        ]);

        // Fetch API referrals to update stats
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

        const apiSubmitted = apiReferrals.filter((r) => r.status === 'submitted').length;

        // Update stats with API referrals
        const updatedStats = {
          ...statsData,
          total_referrals: statsData.total_referrals + apiReferrals.length,
          submitted: statsData.submitted + apiSubmitted,
          pending_earnings: statsData.pending_earnings + (apiSubmitted * 125),
        };

        // Build customer map for kanban
        const custMap = new Map<string, string>();
        customersData.forEach((c: Customer) => custMap.set(c.id, c.name));

        // Combine referrals
        const allReferrals = [...apiReferrals, ...referralsData].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setStats(updatedStats);
        setTopReps(
          repsData
            .filter((r) => r.active)
            .sort((a, b) => b.total_earnings - a.total_earnings)
            .slice(0, 5)
        );
        setActivities(activitiesData);
        setReferrals(allReferrals);
        setCustomerMap(custMap);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReferralStatus) => {
    // Optimistic update
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    // TODO: Persist to backend
    // try {
    //   await updateReferralStatus(id, newStatus);
    // } catch (error) {
    //   // Revert on failure
    // }
  };

  if (loading) {
    return <AdminPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1">Company-wide performance metrics</p>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Referrals"
          value={stats?.total_referrals || 0}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate || 0}%`}
          subtitle="sold / total"
          icon={TrendingUp}
          variant="blue"
        />
        <StatsCard
          title="Total Sold"
          value={stats?.sold || 0}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Total Paid Out"
          value={`$${(stats?.total_paid_out || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="gold"
        />
      </div>

      {/* Pipeline Kanban */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-emerald-400" />
            Pipeline
          </h2>
          <Link
            href="/admin/referrals"
            className="text-sm text-emerald-400 hover:underline"
          >
            View all referrals →
          </Link>
        </div>
        <PipelineKanban
          referrals={referrals}
          onStatusChange={handleStatusChange}
          customerMap={customerMap}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/reps"
          className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Manage Reps</h3>
            <p className="text-sm text-slate-400">
              {stats?.active_reps || 0} active of {stats?.total_reps || 0} total
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/referrals"
          className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">All Referrals</h3>
            <p className="text-sm text-slate-400">
              View and manage all {stats?.total_referrals || 0} referrals
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Top Performers & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
            <Link
              href="/admin/reps"
              className="text-sm text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {topReps.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No reps yet</p>
          ) : (
            <div className="space-y-3">
              {topReps.map((rep, index) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0
                          ? 'bg-guardian-gold/20 text-guardian-gold'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {index === 0 ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{rep.name}</p>
                      <p className="text-xs text-slate-500">
                        {rep.total_sold} sold of {rep.total_referrals} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">
                      ${rep.total_earnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
