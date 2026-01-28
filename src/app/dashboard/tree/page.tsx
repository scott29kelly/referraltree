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
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';

const REFERRAL_BONUS = 250;

const statusColors: Record<ReferralStatus, { border: string; bg: string; text: string }> = {
  submitted: { border: 'border-slate-500', bg: 'bg-slate-800/80', text: 'text-slate-300' },
  contacted: { border: 'border-sky-500', bg: 'bg-sky-950/80', text: 'text-sky-300' },
  quoted: { border: 'border-amber-500', bg: 'bg-amber-950/80', text: 'text-amber-300' },
  sold: { border: 'border-emerald-500', bg: 'bg-emerald-950/80', text: 'text-emerald-300' },
};

const statusLabels: Record<ReferralStatus, string> = {
  submitted: 'Submitted',
  contacted: 'Contacted',
  quoted: 'Quoted',
  sold: 'Closed',
};

// Tree node representing either a customer or a referral
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
        const allReferrals = [...apiReferrals, ...referralsData.filter((r) => !apiIds.has(r.id))];
        
        setCustomers(customersData);
        setReferrals(allReferrals);
        
        // Expand all by default
        const allIds = new Set<string>();
        allIds.add('rep');
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

  // Build the tree structure
  // Check if a referral has become a customer (by matching name)
  const tree = useMemo((): TreeNode | null => {
    if (!rep) return null;

    // Create a map of customer names to their data for matching referrals who became customers
    const customerByName = new Map<string, Customer>();
    customers.forEach(c => customerByName.set(c.name.toLowerCase().trim(), c));

    // Create a map of referrals by referrer_id
    const referralsByReferrer = new Map<string, Referral[]>();
    referrals.forEach(r => {
      const existing = referralsByReferrer.get(r.referrer_id) || [];
      existing.push(r);
      referralsByReferrer.set(r.referrer_id, existing);
    });

    // Get customer name by ID for "referred by" lookup
    const customerById = new Map<string, Customer>();
    customers.forEach(c => customerById.set(c.id, c));

    // Recursive function to build referral chain
    function buildReferralNode(referral: Referral, visited: Set<string>): TreeNode {
      const nodeId = `referral-${referral.id}`;
      
      // Check if this referral became a customer (has same name as a customer)
      const matchingCustomer = customerByName.get(referral.referee_name.toLowerCase().trim());
      const children: TreeNode[] = [];
      
      if (matchingCustomer && !visited.has(matchingCustomer.id)) {
        // This referral became a customer - get their referrals
        visited.add(matchingCustomer.id);
        const theirReferrals = referralsByReferrer.get(matchingCustomer.id) || [];
        theirReferrals.forEach(r => {
          if (!visited.has(r.id)) {
            visited.add(r.id);
            children.push(buildReferralNode(r, visited));
          }
        });
      }

      // Get who referred this person
      const referrer = customerById.get(referral.referrer_id);
      
      return {
        id: nodeId,
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

    // Build customer nodes
    const customerNodes: TreeNode[] = customers.map(customer => {
      const visited = new Set<string>([customer.id]);
      const custReferrals = referralsByReferrer.get(customer.id) || [];
      
      const children = custReferrals.map(r => {
        visited.add(r.id);
        return buildReferralNode(r, visited);
      });

      const soldCount = children.filter(c => c.status === 'sold').length;
      const childEarnings = children.reduce((sum, c) => sum + c.earnings, 0);

      return {
        id: `customer-${customer.id}`,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        type: 'customer' as const,
        children,
        earnings: childEarnings,
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

  if (!tree || customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Network className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Network Yet</h2>
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
            <p className="text-sm text-slate-400">Click any node to expand/collapse the referral chain</p>
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
          <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
          <p className="text-xs text-slate-400">Customers</p>
        </div>
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-400">Referrals</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-2xl font-bold text-white">{stats.soldCount}</p>
          <p className="text-xs text-slate-400">Closed</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-2xl font-bold text-white">${(stats.totalReferrals - stats.soldCount) * 250}</p>
          <p className="text-xs text-slate-400">Pending</p>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 overflow-x-auto">
        <TreeNodeComponent 
          node={tree} 
          expanded={expandedNodes} 
          onToggle={toggleNode}
          depth={0}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-slate-400 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-guardian-gold/30 border-2 border-guardian-gold" /> Sales Rep
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-sky-900/50 border-2 border-sky-500" /> Customer
        </span>
        <span className="w-px h-4 bg-slate-700" />
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500" /> Submitted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-500" /> Contacted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Quoted</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Closed</span>
      </div>
    </div>
  );
}

// Recursive tree node component
function TreeNodeComponent({ 
  node, 
  expanded, 
  onToggle, 
  depth 
}: { 
  node: TreeNode; 
  expanded: Set<string>; 
  onToggle: (id: string) => void;
  depth: number;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col">
      {/* Node card */}
      <button
        onClick={() => hasChildren && onToggle(node.id)}
        className={clsx(
          'flex items-start gap-3 px-3 py-2.5 rounded-lg border-2 transition-all text-left max-w-md',
          hasChildren && 'cursor-pointer hover:border-opacity-100',
          !hasChildren && 'cursor-default',
          node.type === 'rep' && 'bg-gradient-to-r from-guardian-gold/20 to-guardian-gold/5 border-guardian-gold',
          node.type === 'customer' && !node.status && 'bg-sky-900/50 border-sky-500/50',
          node.type === 'customer' && node.status && statusColors[node.status].bg + ' ' + statusColors[node.status].border,
          node.type === 'referral' && node.status && statusColors[node.status].bg + ' ' + statusColors[node.status].border,
        )}
        style={{ marginLeft: depth * 20 }}
      >
        {/* Expand icon */}
        {hasChildren ? (
          <div className="flex-shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* Icon */}
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          node.type === 'rep' && 'bg-guardian-gold/30',
          node.type === 'customer' && 'bg-sky-500/20',
          node.type === 'referral' && 'bg-slate-700/50',
        )}>
          {node.type === 'rep' && <Shield className="w-4 h-4 text-guardian-gold" />}
          {node.type === 'customer' && <User className="w-4 h-4 text-sky-400" />}
          {node.type === 'referral' && <UserPlus className="w-4 h-4 text-slate-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={clsx(
              'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
              node.type === 'rep' && 'bg-guardian-gold text-guardian-navy',
              node.type === 'customer' && !node.status && 'bg-sky-500 text-white',
              node.type === 'customer' && node.status && 'bg-emerald-500 text-white',
              node.type === 'referral' && 'bg-slate-600 text-slate-200',
            )}>
              {node.type === 'rep' ? 'Rep' : node.type === 'customer' && node.status ? 'Converted' : node.type}
            </span>
            {node.status && (
              <span className={clsx('text-[9px] font-medium', statusColors[node.status].text)}>
                {statusLabels[node.status]}
              </span>
            )}
            {node.earnings > 0 && (
              <span className="text-[10px] font-bold text-emerald-400">${node.earnings}</span>
            )}
          </div>
          
          <p className="font-semibold text-white text-sm leading-tight">{node.name}</p>
          
          {/* Details row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500">
            {node.phone && (
              <span>📞 {node.phone}</span>
            )}
            {node.email && (
              <span>✉️ {node.email}</span>
            )}
            {node.dateSubmitted && (
              <span>📅 {new Date(node.dateSubmitted).toLocaleDateString()}</span>
            )}
            {node.referredBy && (
              <span className="text-sky-400">👤 Referred by {node.referredBy}</span>
            )}
          </div>
          
          {node.notes && (
            <p className="text-[10px] text-slate-400 mt-1 italic truncate">"{node.notes}"</p>
          )}
          
          {hasChildren && (
            <p className="text-[10px] text-slate-500 mt-1">
              {node.children.length} referral{node.children.length !== 1 ? 's' : ''} below
            </p>
          )}
        </div>
      </button>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1 border-l-2 border-slate-700/50 ml-3"
          >
            {node.children.map(child => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                expanded={expanded}
                onToggle={onToggle}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
