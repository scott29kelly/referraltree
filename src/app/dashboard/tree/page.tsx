'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Phone,
  Calendar,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';

const REFERRAL_BONUS = 250;

const statusConfig: Record<ReferralStatus, { bg: string; border: string; text: string; label: string; dot: string; line: string }> = {
  submitted: { bg: 'bg-slate-800', border: 'border-slate-500', text: 'text-slate-300', label: 'Submitted', dot: 'bg-slate-500', line: '#64748b' },
  contacted: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-300', label: 'Contacted', dot: 'bg-sky-500', line: '#0ea5e9' },
  quoted: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-300', label: 'Quoted', dot: 'bg-amber-500', line: '#f59e0b' },
  sold: { bg: 'bg-emerald-900/50', border: 'border-emerald-500', text: 'text-emerald-300', label: 'Closed', dot: 'bg-emerald-500', line: '#10b981' },
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
        // Expand all by default
        setExpandedCustomers(new Set(customersData.map(c => c.id)));
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

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const soldCount = referrals.filter((r) => r.status === 'sold').length;
    return {
      totalCustomers: customers.length,
      totalReferrals: referrals.length,
      soldCount,
      totalEarnings: soldCount * REFERRAL_BONUS,
      potentialEarnings: (referrals.length - soldCount) * REFERRAL_BONUS,
    };
  }, [customers, referrals]);

  // Group referrals by customer
  const referralsByCustomer = useMemo(() => {
    const map: Record<string, Referral[]> = {};
    customers.forEach(c => {
      map[c.id] = referrals.filter(r => r.referrer_id === c.id);
    });
    return map;
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
              Visual map of your customers and their referrals
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

      {/* Network Tree */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6 overflow-x-auto">
        {/* Rep Node (Root) */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative px-6 py-4 rounded-2xl bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10 border-2 border-guardian-gold shadow-lg shadow-guardian-gold/20"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-guardian-gold text-guardian-navy text-[10px] font-bold rounded-full uppercase tracking-wider">
              Sales Rep
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-guardian-gold/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-guardian-gold" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{rep?.name}</p>
                <p className="text-sm text-slate-400">{stats.totalCustomers} customers</p>
              </div>
            </div>
          </motion.div>

          {/* Connector line from Rep to Customers */}
          <div className="w-0.5 h-8 bg-gradient-to-b from-guardian-gold to-slate-600" />

          {/* Customers Row */}
          <div className="flex items-start gap-8 flex-wrap justify-center">
            {customers.map((customer, customerIndex) => {
              const customerReferrals = referralsByCustomer[customer.id] || [];
              const isExpanded = expandedCustomers.has(customer.id);
              const soldCount = customerReferrals.filter(r => r.status === 'sold').length;

              return (
                <motion.div
                  key={customer.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: customerIndex * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Horizontal connector to customer */}
                  <div className="w-0.5 h-4 bg-slate-600" />

                  {/* Customer Node */}
                  <button
                    onClick={() => toggleCustomer(customer.id)}
                    className={clsx(
                      'relative px-5 py-4 rounded-xl border-2 transition-all hover:scale-105',
                      'bg-gradient-to-br from-sky-900/50 to-sky-950/50 border-sky-500/50',
                      'shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20',
                      'min-w-[200px]'
                    )}
                  >
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Customer
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-sky-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-slate-400">
                          {customerReferrals.length} referral{customerReferrals.length !== 1 ? 's' : ''} • {soldCount} closed
                        </p>
                      </div>
                      {customerReferrals.length > 0 && (
                        isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-sky-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        )
                      )}
                    </div>
                    {soldCount > 0 && (
                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                        ${soldCount * REFERRAL_BONUS}
                      </div>
                    )}
                  </button>

                  {/* Referrals under this customer */}
                  {isExpanded && customerReferrals.length > 0 && (
                    <div className="flex flex-col items-center">
                      {/* Vertical connector */}
                      <div className="w-0.5 h-6 bg-slate-600" />
                      
                      {/* Horizontal branch line */}
                      {customerReferrals.length > 1 && (
                        <div 
                          className="h-0.5 bg-slate-600" 
                          style={{ 
                            width: `${Math.min(customerReferrals.length * 180, 600)}px` 
                          }} 
                        />
                      )}

                      {/* Referral nodes */}
                      <div className="flex items-start gap-4 flex-wrap justify-center mt-2">
                        {customerReferrals.map((referral, refIndex) => {
                          const config = statusConfig[referral.status];
                          return (
                            <motion.div
                              key={referral.id}
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: refIndex * 0.05 }}
                              className="flex flex-col items-center"
                            >
                              {/* Connector to referral */}
                              {customerReferrals.length > 1 && (
                                <div className="w-0.5 h-3" style={{ backgroundColor: config.line }} />
                              )}
                              
                              {/* Referral Node */}
                              <div
                                className={clsx(
                                  'relative px-4 py-3 rounded-xl border-2 min-w-[160px]',
                                  config.bg,
                                  config.border,
                                  'shadow-md transition-all hover:scale-105'
                                )}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white text-sm truncate">{referral.referee_name}</p>
                                    {referral.referee_phone && (
                                      <p className="text-[10px] text-slate-500 truncate">{referral.referee_phone}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className={clsx('w-2 h-2 rounded-full', config.dot)} />
                                    <span className={clsx('text-xs font-medium', config.text)}>
                                      {config.label}
                                    </span>
                                  </div>
                                  {referral.status === 'sold' && (
                                    <span className="text-emerald-400 font-bold text-sm">$250</span>
                                  )}
                                </div>
                                
                                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(referral.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-guardian-gold/30 border border-guardian-gold" />
          <span className="text-sm text-slate-400">Sales Rep</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-sky-900/50 border border-sky-500" />
          <span className="text-sm text-slate-400">Customer</span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        {(Object.keys(statusConfig) as ReferralStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={clsx('w-2.5 h-2.5 rounded-full', statusConfig[status].dot)} />
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
