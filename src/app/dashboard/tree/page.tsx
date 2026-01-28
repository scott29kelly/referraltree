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
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';

const REFERRAL_BONUS = 250;

const statusConfig: Record<ReferralStatus, { bg: string; border: string; text: string; label: string; dot: string }> = {
  submitted: { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-300', label: 'Submitted', dot: 'bg-slate-500' },
  contacted: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-300', label: 'Contacted', dot: 'bg-sky-500' },
  quoted: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-300', label: 'Quoted', dot: 'bg-amber-500' },
  sold: { bg: 'bg-emerald-900/50', border: 'border-emerald-500', text: 'text-emerald-300', label: 'Closed', dot: 'bg-emerald-500' },
};

export default function TreePage() {
  const { rep, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!rep) return;

      try {
        const [customersData, referralsData] = await Promise.all([
          getCustomersByRep(rep.id),
          getReferralsByRep(rep.id),
        ]);

        // Also fetch API referrals
        let apiReferrals: Referral[] = [];
        try {
          const response = await fetch('/api/referrals');
          if (response.ok) {
            const data = await response.json();
            const customerIds = new Set(customersData.map((c) => c.id));
            apiReferrals = (data.referrals || []).filter(
              (r: Referral) => customerIds.has(r.referrer_id)
            );
          }
        } catch (err) {
          console.error('Error fetching API referrals:', err);
        }

        const apiIds = new Set(apiReferrals.map((r) => r.id));
        const combinedReferrals = [
          ...apiReferrals,
          ...referralsData.filter((r) => !apiIds.has(r.id)),
        ];

        setCustomers(customersData);
        setReferrals(combinedReferrals);
        
        // Auto-select first customer
        if (customersData.length > 0) {
          setSelectedCustomerId(customersData[0].id);
        }
      } catch (error) {
        console.error('Error loading tree data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (rep) {
      loadData();
    }
  }, [rep]);

  // Stats
  const stats = useMemo(() => {
    const soldCount = referrals.filter((r) => r.status === 'sold').length;
    const totalEarnings = soldCount * REFERRAL_BONUS;
    const pendingCount = referrals.filter((r) => r.status !== 'sold').length;

    return {
      totalCustomers: customers.length,
      totalReferrals: referrals.length,
      soldCount,
      totalEarnings,
      potentialEarnings: pendingCount * REFERRAL_BONUS,
    };
  }, [customers, referrals]);

  // Get referrals for selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedReferrals = referrals.filter(r => r.referrer_id === selectedCustomerId);

  // Get referral counts per customer
  const referralCounts = useMemo(() => {
    const counts: Record<string, { total: number; sold: number }> = {};
    customers.forEach(c => {
      const custReferrals = referrals.filter(r => r.referrer_id === c.id);
      counts[c.id] = {
        total: custReferrals.length,
        sold: custReferrals.filter(r => r.status === 'sold').length,
      };
    });
    return counts;
  }, [customers, referrals]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Network className="w-12 h-12 text-guardian-gold/50" />
          <p className="text-slate-400">Loading your network...</p>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <Network className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Network Yet</h2>
        <p className="text-slate-400 max-w-md mb-6">
          Once you have customers and they start referring others, your referral
          network will appear here.
        </p>
        <Link
          href="/dashboard/qr"
          className="px-4 py-2 bg-guardian-gold text-guardian-navy font-semibold rounded-xl hover:bg-guardian-gold/90 transition-colors"
        >
          Share Your QR Code
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Referral Network</h1>
            <p className="text-sm text-slate-400">
              Select a customer to view their referrals
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-full">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-bold text-emerald-400">
            ${stats.totalEarnings.toLocaleString()}
          </span>
          <span className="text-sm text-emerald-300/70">earned</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.totalCustomers} label="Customers" color="gold" />
        <StatCard icon={Network} value={stats.totalReferrals} label="Referrals" color="blue" />
        <StatCard icon={CheckCircle} value={stats.soldCount} label="Closed" color="green" />
        <StatCard icon={TrendingUp} value={`$${stats.potentialEarnings}`} label="Pending" color="amber" />
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h2 className="font-semibold text-white">Customers</h2>
              <p className="text-xs text-slate-500">{customers.length} total</p>
            </div>
            <div className="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
              {customers.map((customer) => {
                const counts = referralCounts[customer.id];
                const isSelected = customer.id === selectedCustomerId;
                
                return (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={clsx(
                      'w-full p-4 text-left transition-all',
                      isSelected
                        ? 'bg-guardian-gold/10 border-l-4 border-guardian-gold'
                        : 'hover:bg-slate-700/30 border-l-4 border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          isSelected 
                            ? 'bg-guardian-gold/20 text-guardian-gold' 
                            : 'bg-slate-700 text-slate-400'
                        )}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={clsx(
                            'font-medium',
                            isSelected ? 'text-guardian-gold' : 'text-white'
                          )}>
                            {customer.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {counts.total} referral{counts.total !== 1 ? 's' : ''} • {counts.sold} closed
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={clsx(
                        'w-5 h-5 transition-transform',
                        isSelected ? 'text-guardian-gold rotate-90' : 'text-slate-500'
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Referrals Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div
                key={selectedCustomerId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden"
              >
                {/* Selected Customer Header */}
                <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-guardian-gold/10 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-guardian-gold/20 flex items-center justify-center">
                      <User className="w-7 h-7 text-guardian-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-guardian-gold font-medium uppercase tracking-wider">Customer</p>
                      <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        {selectedCustomer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedCustomer.phone}
                          </span>
                        )}
                        {selectedCustomer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {selectedCustomer.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">
                        ${(referralCounts[selectedCustomer.id]?.sold || 0) * REFERRAL_BONUS}
                      </p>
                      <p className="text-xs text-slate-500">earned from referrals</p>
                    </div>
                  </div>
                </div>

                {/* Visual Flow */}
                <div className="p-5 border-b border-slate-700/50 bg-slate-900/30">
                  <div className="flex items-center justify-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-guardian-gold/20 border border-guardian-gold/30">
                      <p className="text-sm font-medium text-guardian-gold">{selectedCustomer.name}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-500" />
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600">
                        <p className="text-sm font-medium text-white">{selectedReferrals.length} Referrals</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-slate-500" />
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                        <p className="text-sm font-medium text-emerald-400">
                          {referralCounts[selectedCustomer.id]?.sold || 0} Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referrals List */}
                <div className="p-5">
                  <h4 className="text-sm font-medium text-slate-400 mb-4">
                    Referrals from {selectedCustomer.name}
                  </h4>
                  
                  {selectedReferrals.length === 0 ? (
                    <div className="text-center py-12">
                      <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No referrals yet</p>
                      <p className="text-sm text-slate-500">Share your QR code with this customer</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedReferrals.map((referral, index) => {
                        const config = statusConfig[referral.status];
                        return (
                          <motion.div
                            key={referral.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={clsx(
                              'p-4 rounded-xl border-2 transition-all hover:scale-[1.02]',
                              config.bg,
                              config.border
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                  <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{referral.referee_name}</p>
                                  {referral.referee_phone && (
                                    <p className="text-xs text-slate-500">{referral.referee_phone}</p>
                                  )}
                                </div>
                              </div>
                              {referral.status === 'sold' && (
                                <span className="text-emerald-400 font-bold">$250</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={clsx('w-2 h-2 rounded-full', config.dot)} />
                                <span className={clsx('text-sm font-medium', config.text)}>
                                  {config.label}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(referral.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-12 text-center">
                <Network className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a customer to view their referrals</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        {(Object.keys(statusConfig) as ReferralStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div className={clsx('w-3 h-3 rounded-full', statusConfig[status].dot)} />
            <span className="text-sm text-slate-400">{statusConfig[status].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: any; 
  value: string | number; 
  label: string;
  color: 'gold' | 'blue' | 'green' | 'amber';
}) {
  const colors = {
    gold: 'from-guardian-gold/20 to-guardian-gold/5 border-guardian-gold/20 text-guardian-gold',
    blue: 'from-sky-500/20 to-sky-500/5 border-sky-500/20 text-sky-400',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={clsx('p-4 rounded-xl bg-gradient-to-br border', colors[color])}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
