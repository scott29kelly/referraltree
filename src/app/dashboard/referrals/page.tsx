'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReferralsByRep, getCustomersByRep, updateReferralStatus } from '@/lib/data';
import ReferralTable from '@/components/dashboard/ReferralTable';
import type { Referral, Customer, ReferralStatus } from '@/types/database';

export default function ReferralsPage() {
  const { rep, isLoading: authLoading } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!rep) return;

    try {
      const [mockReferralsData, customersData] = await Promise.all([
        getReferralsByRep(rep.id),
        getCustomersByRep(rep.id),
      ]);

      // Fetch API referrals and filter by rep's customers
      let apiReferrals: Referral[] = [];
      try {
        const response = await fetch('/api/referrals');
        if (response.ok) {
          const data = await response.json();
          const customerIds = new Set(customersData.map(c => c.id));
          apiReferrals = (data.referrals || []).filter(
            (r: Referral) => customerIds.has(r.referrer_id)
          );
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
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  }, [rep]);

  useEffect(() => {
    if (rep) {
      loadData();
    }
  }, [rep, loadData]);

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

  // Create customer name lookup
  const customerNames = customers.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {} as Record<string, string>);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-96 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-slate-400 mt-1">
          Manage and track your referral pipeline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400">Submitted</p>
          <p className="text-2xl font-bold text-slate-300">
            {referrals.filter((r) => r.status === 'submitted').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-sm text-slate-400">Contacted</p>
          <p className="text-2xl font-bold text-sky-400">
            {referrals.filter((r) => r.status === 'contacted').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-slate-400">Quoted</p>
          <p className="text-2xl font-bold text-amber-400">
            {referrals.filter((r) => r.status === 'quoted').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-slate-400">Sold</p>
          <p className="text-2xl font-bold text-emerald-400">
            {referrals.filter((r) => r.status === 'sold').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-guardian-gold/10 border border-guardian-gold/20">
          <p className="text-sm text-slate-400">Total Earnings</p>
          <p className="text-2xl font-bold text-guardian-gold">
            ${(referrals.filter((r) => r.status === 'sold').length * 250).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <ReferralTable
        referrals={referrals}
        onStatusChange={handleStatusChange}
        showCustomer
        customerNames={customerNames}
      />
    </div>
  );
}
