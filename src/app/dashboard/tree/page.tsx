'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getCustomersByRep, getReferralsByRep } from '@/lib/data';
import {
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Network,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Phone,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';

const REFERRAL_BONUS = 250;

const statusColors: Record<ReferralStatus, string> = {
  submitted: 'border-slate-500 bg-slate-800/80',
  contacted: 'border-sky-500 bg-sky-950/80',
  quoted: 'border-amber-500 bg-amber-950/80',
  sold: 'border-emerald-500 bg-emerald-950/80',
};

const statusLabels: Record<ReferralStatus, string> = {
  submitted: 'Submitted',
  contacted: 'Contacted', 
  quoted: 'Quoted',
  sold: 'Closed',
};

export default function TreePage() {
  const { rep, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      if (!rep) return;
      try {
        const [customersData, referralsData] = await Promise.all([
          getCustomersByRep(rep.id),
          getReferralsByRep(rep.id),
        ]);

        let apiReferrals: Referral[] = [];
        try {
          const response = await fetch('/api/referrals');
          if (response.ok) {
            const data = await response.json();
            const customerIds = new Set(customersData.map((c) => c.id));
            apiReferrals = (data.referrals || []).filter((r: Referral) => customerIds.has(r.referrer_id));
          }
        } catch {}

        const apiIds = new Set(apiReferrals.map((r) => r.id));
        setCustomers(customersData);
        setReferrals([...apiReferrals, ...referralsData.filter((r) => !apiIds.has(r.id))]);
        setExpandedCustomers(new Set(customersData.map(c => c.id)));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (rep) loadData();
  }, [rep]);

  const referralsByCustomer = useMemo(() => {
    const map: Record<string, Referral[]> = {};
    customers.forEach(c => { map[c.id] = referrals.filter(r => r.referrer_id === c.id); });
    return map;
  }, [customers, referrals]);

  const stats = useMemo(() => {
    const soldCount = referrals.filter((r) => r.status === 'sold').length;
    return {
      totalCustomers: customers.length,
      totalReferrals: referrals.length,
      soldCount,
      totalEarnings: soldCount * REFERRAL_BONUS,
    };
  }, [customers, referrals]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Network className="w-12 h-12 text-guardian-gold/50 animate-pulse" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Network className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Network Yet</h2>
        <p className="text-slate-400 mb-4">Add customers to see your referral network.</p>
        <Link href="/dashboard/qr" className="px-4 py-2 bg-guardian-gold text-guardian-navy font-semibold rounded-xl">
          Share QR Code
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Referral Network</h1>
            <p className="text-sm text-slate-400">Click customers to expand/collapse</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-bold text-emerald-400">${stats.totalEarnings}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-guardian-gold/10 border border-guardian-gold/20">
          <Users className="w-5 h-5 text-guardian-gold mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
          <p className="text-xs text-slate-400">Customers</p>
        </div>
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <Network className="w-5 h-5 text-sky-400 mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-400">Referrals</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-400 mb-1" />
          <p className="text-2xl font-bold text-white">{stats.soldCount}</p>
          <p className="text-xs text-slate-400">Closed</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-1" />
          <p className="text-2xl font-bold text-white">${(stats.totalReferrals - stats.soldCount) * 250}</p>
          <p className="text-xs text-slate-400">Pending</p>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
        {/* Rep */}
        <div className="flex flex-col items-center">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 border-2 border-guardian-gold">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-guardian-gold/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-guardian-gold" />
              </div>
              <div>
                <p className="text-xs text-guardian-gold font-semibold uppercase">Sales Rep</p>
                <p className="font-bold text-white text-lg">{rep?.name}</p>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="w-px h-8 bg-slate-600" />
          
          {/* Customers row */}
          <div className="flex gap-8 items-start">
            {customers.map((customer) => {
              const custReferrals = referralsByCustomer[customer.id] || [];
              const isExpanded = expandedCustomers.has(customer.id);
              const soldCount = custReferrals.filter(r => r.status === 'sold').length;

              return (
                <div key={customer.id} className="flex flex-col items-center">
                  {/* Connector from horizontal line */}
                  <div className="w-px h-4 bg-slate-600" />
                  
                  {/* Customer card */}
                  <button
                    onClick={() => {
                      setExpandedCustomers(prev => {
                        const next = new Set(prev);
                        next.has(customer.id) ? next.delete(customer.id) : next.add(customer.id);
                        return next;
                      });
                    }}
                    className="px-5 py-4 rounded-xl bg-sky-900/50 border-2 border-sky-500/50 hover:border-sky-400 transition-all min-w-[200px] text-left relative"
                  >
                    {soldCount > 0 && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                        ${soldCount * 250}
                      </span>
                    )}
                    <p className="text-xs text-sky-400 font-semibold uppercase mb-1">Customer</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-slate-400">{custReferrals.length} referrals</p>
                      </div>
                      {custReferrals.length > 0 && (
                        isExpanded ? <ChevronDown className="w-5 h-5 text-sky-400" /> : <ChevronRight className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Referrals */}
                  <AnimatePresence>
                    {isExpanded && custReferrals.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-px h-6 bg-slate-600" />
                        <div className="flex gap-3 flex-wrap justify-center max-w-md">
                          {custReferrals.map((ref) => (
                            <div
                              key={ref.id}
                              className={clsx(
                                'px-4 py-3 rounded-xl border-2 w-40',
                                statusColors[ref.status]
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <p className="font-medium text-white text-sm truncate flex-1">{ref.referee_name}</p>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-300">{statusLabels[ref.status]}</span>
                                {ref.status === 'sold' && <span className="text-emerald-400 font-bold text-sm">$250</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-slate-400">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500" /> Submitted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-500" /> Contacted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Quoted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Closed</span>
      </div>
    </div>
  );
}
