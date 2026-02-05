'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardStats, getActivitiesByRep, getReferralsByRep } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { QRCodeSheet } from '@/components/dashboard/QRCodeSheet';
import { DashboardPageSkeleton } from '@/components/ui/skeletons';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Clock, CheckCircle, QrCode, ArrowRight, Network, Plus } from 'lucide-react';
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
          pending_earnings: statsData.pending_earnings + (apiSubmitted * 125),
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

  // Calculate earnings breakdown
  const totalEarnings = stats?.total_earnings || 0;
  const pendingEarnings = stats?.pending_earnings || 0;
  const paidOut = totalEarnings - pendingEarnings;

  return (
    <div className="space-y-6">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Good {getGreeting()}, {rep?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 mt-1">
            Here&apos;s how your referrals are performing
          </p>
        </div>
        
        {/* QR Code Sheet Trigger */}
        {rep && (
          <QRCodeSheet repId={rep.id} repName={rep.name}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-guardian-gold to-amber-500 text-slate-900 font-semibold hover:from-guardian-gold/90 hover:to-amber-500/90 transition-all shadow-lg shadow-guardian-gold/20">
              <QrCode className="w-5 h-5" />
              <span>Share My Link</span>
            </button>
          </QRCodeSheet>
        )}
      </div>

      {/* Wallet Card - Hero Section */}
      <WalletCard
        totalEarnings={totalEarnings}
        pendingEarnings={pendingEarnings}
        paidOut={paidOut}
        nextMilestone={125}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stats-grid">
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
          title="Conversion"
          value={stats?.total_referrals ? `${Math.round((stats.sold / stats.total_referrals) * 100)}%` : '0%'}
          subtitle="sold / total"
          icon={ArrowRight}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/tree"
          className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Network className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">My Network</h3>
            <p className="text-sm text-slate-400">View your referral tree</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/referrals"
          className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">All Referrals</h3>
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
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No referrals yet</p>
              {rep && (
                <QRCodeSheet repId={rep.id} repName={rep.name}>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-guardian-gold/10 text-guardian-gold border border-guardian-gold/20 hover:bg-guardian-gold/20 transition-colors">
                    <Plus className="w-4 h-4" />
                    Share your link to get started
                  </button>
                </QRCodeSheet>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
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

// Helper to get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
