'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardStats, getActivitiesByRep, getReferralsByRep } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { DashboardPageSkeleton } from '@/components/ui/skeletons';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Clock, CheckCircle, DollarSign, QrCode, ArrowRight, Network } from 'lucide-react';
import type { DashboardStats, Activity, Referral } from '@/types/database';

export default function DashboardPage() {
  const { rep, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!rep) return;

      try {
        const [statsData, activitiesData, referralsData] = await Promise.all([
          getDashboardStats(rep.id),
          getActivitiesByRep(rep.id, 5),
          getReferralsByRep(rep.id),
        ]);

        // Fetch API referrals for this rep's customers
        let apiReferrals: Referral[] = [];
        let apiSubmitted = 0;
        try {
          const response = await fetch('/api/referrals');
          if (response.ok) {
            const data = await response.json();
            // Note: API referrals are all visible to admin. For rep view, we show all new ones.
            apiReferrals = data.referrals || [];
            apiSubmitted = apiReferrals.filter((r: Referral) => r.status === 'submitted').length;
          }
        } catch (err) {
          console.error('Error fetching API referrals:', err);
        }

        // Update stats with API referrals
        const updatedStats = {
          ...statsData,
          total_referrals: statsData.total_referrals + apiReferrals.length,
          submitted: statsData.submitted + apiSubmitted,
          pending_earnings: statsData.pending_earnings + (apiSubmitted * 250),
        };

        // Combine referrals for recent list
        const combined = [...apiReferrals, ...referralsData]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setStats(updatedStats);
        setActivities(activitiesData);
        setRecentReferrals(combined.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (rep) {
      loadData();
    }
  }, [rep]);

  if (isLoading || loading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {rep?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s how your referrals are performing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Referrals"
          value={stats?.total_referrals || 0}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Pending"
          value={stats ? stats.submitted + stats.contacted + stats.quoted : 0}
          subtitle={`${stats?.quoted || 0} quoted`}
          icon={Clock}
          variant="blue"
        />
        <StatsCard
          title="Sold"
          value={stats?.sold || 0}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Earnings"
          value={`$${(stats?.total_earnings || 0).toLocaleString()}`}
          subtitle={`$${(stats?.pending_earnings || 0).toLocaleString()} pending`}
          icon={DollarSign}
          variant="gold"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/tree"
          className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Network className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">My Network</h3>
            <p className="text-sm text-slate-400">View referral tree</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/qr"
          className="flex items-center gap-4 p-5 rounded-xl bg-guardian-navy border border-guardian-gold/20 hover:border-guardian-gold/40 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-guardian-gold/10 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-guardian-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Share Your QR Code</h3>
            <p className="text-sm text-slate-400">Get your unique referral link</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-guardian-gold group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/referrals"
          className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">View All Referrals</h3>
            <p className="text-sm text-slate-400">Manage your pipeline</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Activity & Recent Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities} />

        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Referrals</h3>
            <Link
              href="/dashboard/referrals"
              className="text-sm text-guardian-gold hover:underline"
            >
              View all
            </Link>
          </div>
          {recentReferrals.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No referrals yet</p>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                >
                  <div>
                    <p className="font-medium text-white">
                      {referral.referee_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={referral.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
