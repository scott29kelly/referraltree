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
  UserPlus,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';

const REFERRAL_BONUS = 125;

const statusConfig: Record<ReferralStatus, { bg: string; border: string; text: string; glow: string; label: string }> = {
  submitted: { bg: 'bg-slate-800/60', border: 'border-slate-500/40', text: 'text-slate-300', glow: '', label: 'Submitted' },
  contacted: { bg: 'bg-sky-950/60', border: 'border-sky-500/40', text: 'text-sky-300', glow: 'shadow-sky-500/10', label: 'Contacted' },
  quoted: { bg: 'bg-amber-950/60', border: 'border-amber-500/40', text: 'text-amber-300', glow: 'shadow-amber-500/10', label: 'Quoted' },
  sold: { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-300', glow: 'shadow-emerald-500/20', label: 'Closed' },
};

interface TreeNode {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  type: 'rep' | 'customer' | 'referral';
  status?: ReferralStatus;
  children: TreeNode[];
  earnings: number;
  referredBy?: string;
  dateSubmitted?: string;
  notes?: string | null;
}

export default function TreePage() {
  const { rep, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
        
        const allIds = new Set<string>(['rep']);
        customersData.forEach(c => allIds.add(`customer-${c.id}`));
        setExpandedNodes(allIds);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (rep) loadData();
  }, [rep]);

  const tree = useMemo((): TreeNode | null => {
    if (!rep) return null;

    const customerByName = new Map<string, Customer>();
    customers.forEach(c => customerByName.set(c.name.toLowerCase().trim(), c));

    const customerById = new Map<string, Customer>();
    customers.forEach(c => customerById.set(c.id, c));

    const referralsByReferrer = new Map<string, Referral[]>();
    referrals.forEach(r => {
      const existing = referralsByReferrer.get(r.referrer_id) || [];
      existing.push(r);
      referralsByReferrer.set(r.referrer_id, existing);
    });

    function buildReferralNode(referral: Referral, visited: Set<string>): TreeNode {
      const matchingCustomer = customerByName.get(referral.referee_name.toLowerCase().trim());
      const children: TreeNode[] = [];
      
      if (matchingCustomer && !visited.has(matchingCustomer.id)) {
        visited.add(matchingCustomer.id);
        const theirReferrals = referralsByReferrer.get(matchingCustomer.id) || [];
        theirReferrals.forEach(r => {
          if (!visited.has(r.id)) {
            visited.add(r.id);
            children.push(buildReferralNode(r, visited));
          }
        });
      }

      const referrer = customerById.get(referral.referrer_id);
      
      return {
        id: `referral-${referral.id}`,
        name: referral.referee_name,
        phone: referral.referee_phone,
        email: referral.referee_email,
        type: matchingCustomer ? 'customer' : 'referral',
        status: referral.status,
        children,
        earnings: (referral.status === 'sold' ? REFERRAL_BONUS : 0) + children.reduce((sum, c) => sum + c.earnings, 0),
        referredBy: referrer?.name,
        dateSubmitted: referral.created_at,
        notes: referral.notes,
      };
    }

    const customerNodes: TreeNode[] = customers.map(customer => {
      const visited = new Set<string>([customer.id]);
      const custReferrals = referralsByReferrer.get(customer.id) || [];
      
      const children = custReferrals.map(r => {
        visited.add(r.id);
        return buildReferralNode(r, visited);
      });

      return {
        id: `customer-${customer.id}`,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        type: 'customer' as const,
        children,
        earnings: children.reduce((sum, c) => sum + c.earnings, 0),
      };
    });

    return {
      id: 'rep',
      name: rep.name,
      type: 'rep',
      children: customerNodes,
      earnings: customerNodes.reduce((sum, c) => sum + c.earnings, 0),
    };
  }, [rep, customers, referrals]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  const stats = useMemo(() => {
    const soldCount = referrals.filter((r) => r.status === 'sold').length;
    return { totalCustomers: customers.length, totalReferrals: referrals.length, soldCount, totalEarnings: soldCount * REFERRAL_BONUS };
  }, [customers, referrals]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 flex items-center justify-center animate-pulse">
            <Network className="w-8 h-8 text-guardian-gold" />
          </div>
          <p className="text-slate-400">Loading your network...</p>
        </div>
      </div>
    );
  }

  if (!tree || customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
          <Network className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Network Yet</h2>
        <p className="text-slate-400 mb-6 max-w-md">Start building your referral network by sharing your QR code with customers.</p>
        <Link href="/dashboard/qr" className="px-6 py-3 bg-gradient-to-r from-guardian-gold to-amber-500 text-guardian-navy font-semibold rounded-xl hover:shadow-lg hover:shadow-guardian-gold/25 transition-all">
          Share QR Code
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10 border border-guardian-gold/30 flex items-center justify-center">
                <Shield className="w-7 h-7 text-guardian-gold" />
              </div>
              <div>
                <p className="text-sm text-guardian-gold font-medium">{rep?.name}'s Network</p>
                <h1 className="text-2xl font-bold text-white">Referral Tree</h1>
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-emerald-300/70">Total Earned</p>
              <p className="text-3xl font-bold text-emerald-400">${stats.totalEarnings.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Users, value: stats.totalCustomers, label: 'Customers', color: 'guardian-gold' },
            { icon: Network, value: stats.totalReferrals, label: 'Referrals', color: 'sky' },
            { icon: CheckCircle, value: stats.soldCount, label: 'Closed', color: 'emerald' },
            { icon: TrendingUp, value: `$${(stats.totalReferrals - stats.soldCount) * 125}`, label: 'Pending', color: 'amber' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={clsx(
                'p-4 rounded-xl border backdrop-blur-sm',
                stat.color === 'guardian-gold' && 'bg-guardian-gold/10 border-guardian-gold/20',
                stat.color === 'sky' && 'bg-sky-500/10 border-sky-500/20',
                stat.color === 'emerald' && 'bg-emerald-500/10 border-emerald-500/20',
                stat.color === 'amber' && 'bg-amber-500/10 border-amber-500/20',
              )}
            >
              <stat.icon className={clsx(
                'w-5 h-5 mb-2',
                stat.color === 'guardian-gold' && 'text-guardian-gold',
                stat.color === 'sky' && 'text-sky-400',
                stat.color === 'emerald' && 'text-emerald-400',
                stat.color === 'amber' && 'text-amber-400',
              )} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tree Container */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-700/50 backdrop-blur-sm p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Start directly with customers, skip the rep node */}
          {tree.children.map(customerNode => (
            <TreeNodeCard key={customerNode.id} node={customerNode} expanded={expandedNodes} onToggle={toggleNode} depth={0} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-8 flex-wrap text-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-slate-400">
            <span className="w-4 h-4 rounded-lg bg-guardian-gold/30 border border-guardian-gold" /> Rep
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <span className="w-4 h-4 rounded-lg bg-sky-500/30 border border-sky-500" /> Customer
          </span>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(statusConfig).map(([key, config]) => (
            <span key={key} className="flex items-center gap-1.5 text-slate-500">
              <span className={clsx('w-2.5 h-2.5 rounded-full', config.border.replace('border-', 'bg-').replace('/40', ''))} />
              {config.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNodeCard({ node, expanded, onToggle, depth }: { node: TreeNode; expanded: Set<string>; onToggle: (id: string) => void; depth: number }) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const config = node.status ? statusConfig[node.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.05 }}
    >
      <button
        onClick={() => hasChildren && onToggle(node.id)}
        className={clsx(
          'w-full text-left rounded-2xl border backdrop-blur-sm transition-all duration-300',
          'hover:shadow-xl hover:-translate-y-0.5',
          hasChildren && 'cursor-pointer',
          !hasChildren && 'cursor-default',
          node.type === 'rep' && 'bg-gradient-to-r from-guardian-gold/20 via-guardian-gold/10 to-transparent border-guardian-gold/40 shadow-lg shadow-guardian-gold/10',
          node.type === 'customer' && !node.status && 'bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/30',
          node.type === 'customer' && node.status && `${config?.bg} ${config?.border} shadow-lg ${config?.glow}`,
          node.type === 'referral' && `${config?.bg} ${config?.border} shadow-lg ${config?.glow}`,
        )}
        style={{ marginLeft: depth * 32, maxWidth: `calc(100% - ${depth * 32}px)` }}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Expand Icon */}
            <div className="flex-shrink-0 mt-1">
              {hasChildren ? (
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  isExpanded ? 'bg-white/10' : 'bg-white/5'
                )}>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              ) : (
                <div className="w-8" />
              )}
            </div>

            {/* Avatar */}
            <div className={clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border',
              node.type === 'rep' && 'bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10 border-guardian-gold/30',
              node.type === 'customer' && 'bg-gradient-to-br from-sky-500/30 to-sky-500/10 border-sky-500/30',
              node.type === 'referral' && 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/30',
            )}>
              {node.type === 'rep' && <Shield className="w-7 h-7 text-guardian-gold" />}
              {node.type === 'customer' && <User className="w-7 h-7 text-sky-400" />}
              {node.type === 'referral' && <UserPlus className="w-7 h-7 text-slate-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={clsx(
                  'text-[10px] font-bold uppercase px-2 py-1 rounded-md',
                  node.type === 'rep' && 'bg-guardian-gold text-guardian-navy',
                  node.type === 'customer' && !node.status && 'bg-sky-500 text-white',
                  node.type === 'customer' && node.status && 'bg-emerald-500 text-white',
                  node.type === 'referral' && 'bg-slate-600 text-slate-200',
                )}>
                  {node.type === 'rep' ? 'Sales Rep' : node.type === 'customer' && node.status ? '✓ Converted' : node.type}
                </span>
                {node.status && (
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-md bg-black/20', config?.text)}>
                    {config?.label}
                  </span>
                )}
                {node.earnings > 0 && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />${node.earnings}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{node.name}</h3>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {node.phone && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{node.phone}</span>
                  </div>
                )}
                {node.email && (
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{node.email}</span>
                  </div>
                )}
                {node.dateSubmitted && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(node.dateSubmitted).toLocaleDateString()}</span>
                  </div>
                )}
                {node.referredBy && (
                  <div className="flex items-center gap-2 text-sky-400">
                    <User className="w-3.5 h-3.5" />
                    <span>via {node.referredBy}</span>
                  </div>
                )}
              </div>

              {node.notes && (
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 italic">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>"{node.notes}"</span>
                </div>
              )}

              {hasChildren && (
                <p className="mt-3 text-xs text-slate-500">
                  {node.children.length} referral{node.children.length !== 1 ? 's' : ''} in network
                </p>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 pl-4 border-l-2 border-slate-700/30 ml-8"
          >
            {node.children.map(child => (
              <TreeNodeCard key={child.id} node={child} expanded={expanded} onToggle={onToggle} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
