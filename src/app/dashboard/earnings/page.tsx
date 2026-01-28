'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReferralsByRep, getCustomersByRep } from '@/lib/data';
import StatsCard from '@/components/dashboard/StatsCard';
import EarningsChart from '@/components/dashboard/EarningsChart';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { Referral, Customer } from '@/types/database';

export default function EarningsPage() {
  const { rep, isLoading: authLoading } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!rep) return;

    try {
      const [referralsData, customersData] = await Promise.all([
        getReferralsByRep(rep.id),
        getCustomersByRep(rep.id),
      ]);

      setReferrals(referralsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  }, [rep]);

  useEffect(() => {
    if (rep) {
      loadData();
    }
  }, [rep, loadData]);

  // Calculate stats
  const soldReferrals = referrals.filter((r) => r.status === 'sold');
  const pendingReferrals = referrals.filter((r) => r.status !== 'sold');
  const totalEarned = soldReferrals.reduce((sum, r) => sum + r.value, 0);
  const totalPending = pendingReferrals.reduce((sum, r) => sum + r.value, 0);

  // Create customer name lookup
  const customerNames = customers.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {} as Record<string, string>);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-40 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-slate-400 mt-1">Track your referral earnings</p>
      </div>

      {/* Big Earnings Display */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 border border-guardian-gold/30">
        <p className="text-sm text-guardian-gold mb-2">Total Earned</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl lg:text-6xl font-bold text-white">
            ${totalEarned.toLocaleString()}
          </span>
          <span className="text-lg text-guardian-gold/70">USD</span>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          From {soldReferrals.length} successful referrals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Earned"
          value={`$${totalEarned.toLocaleString()}`}
          icon={DollarSign}
          variant="gold"
        />
        <StatsCard
          title="Pending"
          value={`$${totalPending.toLocaleString()}`}
          subtitle={`${pendingReferrals.length} referrals`}
          icon={Clock}
          variant="blue"
        />
        <StatsCard
          title="Sold Referrals"
          value={soldReferrals.length}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Avg per Referral"
          value={`$${soldReferrals.length > 0 ? Math.round(totalEarned / soldReferrals.length) : 0}`}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Chart */}
      <EarningsChart referrals={referrals} />

      {/* Sold Referrals List */}
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Sold Referrals</h3>
          <p className="text-sm text-slate-400">Your successful closings</p>
        </div>

        {soldReferrals.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No sold referrals yet. Keep pushing!
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {soldReferrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {referral.referee_name}
                    </p>
                    <p className="text-sm text-slate-400">
                      Referred by {customerNames[referral.referrer_id] || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-guardian-gold">
                    ${referral.value}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(referral.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
