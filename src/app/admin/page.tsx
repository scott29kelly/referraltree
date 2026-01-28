'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats, getRepsWithStats, getActivities } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { Users, TrendingUp, DollarSign, CheckCircle, ArrowRight, Trophy } from 'lucide-react';
import type { AdminStats, RepWithStats, Activity } from '@/types/database';

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topReps, setTopReps] = useState<RepWithStats[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, repsData, activitiesData] = await Promise.all([
          getAdminStats(),
          getRepsWithStats(),
          getActivities(5),
        ]);

        setStats(statsData);
        // Sort by earnings and take top 5
        setTopReps(
          repsData
            .filter((r) => r.active)
            .sort((a, b) => b.total_earnings - a.total_earnings)
            .slice(0, 5)
        );
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
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

      {/* Pipeline Overview */}
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline Status</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-300">
              {stats?.submitted || 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">Submitted</div>
            <div className="h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all"
                style={{
                  width: `${
                    stats?.total_referrals
                      ? ((stats.submitted / stats.total_referrals) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-400">
              {stats?.contacted || 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">Contacted</div>
            <div className="h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{
                  width: `${
                    stats?.total_referrals
                      ? ((stats.contacted / stats.total_referrals) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">
              {stats?.quoted || 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">Quoted</div>
            <div className="h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${
                    stats?.total_referrals
                      ? ((stats.quoted / stats.total_referrals) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {stats?.sold || 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">Sold</div>
            <div className="h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${
                    stats?.total_referrals
                      ? ((stats.sold / stats.total_referrals) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
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
