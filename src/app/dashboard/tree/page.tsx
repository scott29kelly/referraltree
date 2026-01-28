'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import { useAuth } from '@/hooks/useAuth';
import { getReferralsByRep, getCustomersByRep } from '@/lib/data';
import { ReferralNode, type ReferralNodeData, type ReferralStatus } from '@/components/referral-tree';
import { DollarSign, Users, TrendingUp, Sparkles, Network, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Referral, Customer } from '@/types/database';
import 'reactflow/dist/style.css';

const nodeTypes = {
  referral: ReferralNode,
};

const REFERRAL_BONUS = 250;

// Calculate hierarchical tree layout
function calculateTreeLayout(
  customers: Customer[],
  referrals: Referral[]
): { nodes: Node<ReferralNodeData>[]; edges: Edge[] } {
  const nodes: Node<ReferralNodeData>[] = [];
  const edges: Edge[] = [];

  if (customers.length === 0) return { nodes, edges };

  // Build referral lookup by referrer (customer) ID
  const referralsByCustomer = new Map<string, Referral[]>();
  referrals.forEach((r) => {
    const existing = referralsByCustomer.get(r.referrer_id) || [];
    existing.push(r);
    referralsByCustomer.set(r.referrer_id, existing);
  });

  // Layout constants
  const nodeWidth = 200;
  const nodeHeight = 120;
  const horizontalGap = 40;
  const verticalGap = 160;

  // Position customers in a row at the top
  const totalCustomerWidth = customers.length * nodeWidth + (customers.length - 1) * horizontalGap;
  const customerStartX = -totalCustomerWidth / 2;

  customers.forEach((customer, customerIndex) => {
    const customerX = customerStartX + customerIndex * (nodeWidth + horizontalGap);
    const customerY = 0;
    const customerId = `customer-${customer.id}`;

    // Add customer node as root
    nodes.push({
      id: customerId,
      type: 'referral',
      position: { x: customerX, y: customerY },
      data: {
        id: customerId,
        name: customer.name,
        phone: customer.phone || undefined,
        email: customer.email || undefined,
        status: 'sold' as ReferralStatus, // Customers are already "closed"
        submittedAt: new Date(customer.created_at),
        isRoot: true,
      },
    });

    // Get this customer's referrals
    const customerReferrals = referralsByCustomer.get(customer.id) || [];

    if (customerReferrals.length > 0) {
      // Calculate positions for referrals in a fan below the customer
      const referralWidth = customerReferrals.length * nodeWidth + (customerReferrals.length - 1) * horizontalGap;
      const referralStartX = customerX + nodeWidth / 2 - referralWidth / 2;

      customerReferrals.forEach((referral, refIndex) => {
        const refX = referralStartX + refIndex * (nodeWidth + horizontalGap);
        const refY = customerY + verticalGap;
        const referralId = `referral-${referral.id}`;

        nodes.push({
          id: referralId,
          type: 'referral',
          position: { x: refX, y: refY },
          data: {
            id: referralId,
            name: referral.referee_name,
            phone: referral.referee_phone || undefined,
            email: referral.referee_email || undefined,
            status: referral.status as ReferralStatus,
            submittedAt: new Date(referral.created_at),
            isRoot: false,
            earnings: referral.status === 'sold' ? REFERRAL_BONUS : undefined,
          },
        });

        // Add edge from customer to referral
        const statusColor =
          referral.status === 'sold'
            ? '#10b981'
            : referral.status === 'quoted'
            ? '#f59e0b'
            : referral.status === 'contacted'
            ? '#0ea5e9'
            : '#64748b';

        edges.push({
          id: `edge-${customerId}-${referralId}`,
          source: customerId,
          target: referralId,
          type: 'smoothstep',
          animated: referral.status !== 'sold',
          style: {
            stroke: statusColor,
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: statusColor,
          },
        });
      });
    }
  });

  return { nodes, edges };
}

function TreeViewInner() {
  const { rep, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!rep) return;

      try {
        const [referralsData, customersData] = await Promise.all([
          getReferralsByRep(rep.id),
          getCustomersByRep(rep.id),
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

        // Combine and dedupe referrals
        const apiIds = new Set(apiReferrals.map((r) => r.id));
        const combined = [
          ...apiReferrals,
          ...referralsData.filter((r) => !apiIds.has(r.id)),
        ];

        setCustomers(customersData);
        setReferrals(combined);
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

  // Calculate layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => calculateTreeLayout(customers, referrals),
    [customers, referrals]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateTreeLayout(customers, referrals);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [customers, referrals, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fit view on load
  const onInit = useCallback((instance: any) => {
    setTimeout(() => {
      instance.fitView({ padding: 0.3, duration: 800 });
    }, 300);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const soldCount = referrals.filter((r) => r.status === 'sold').length;
    const totalEarnings = soldCount * REFERRAL_BONUS;
    const pendingCount = referrals.filter((r) => r.status !== 'sold').length;

    return {
      totalCustomers: customers.length,
      totalReferrals: referrals.length,
      soldCount,
      pendingCount,
      totalEarnings,
      potentialEarnings: pendingCount * REFERRAL_BONUS,
    };
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

  if (customers.length === 0 && referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <Network className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Network Yet</h2>
        <p className="text-slate-400 max-w-md mb-6">
          Once you have customers and they start referring others, your referral
          network will appear here as an interactive tree.
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
    <div className="flex flex-col h-[calc(100vh-120px)] -m-4 lg:-m-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Stats Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back link and title */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">My Referral Network</h1>
              <p className="text-xs text-slate-400">
                Visualize your customers and their referrals
              </p>
            </div>
          </div>

          {/* Earnings highlight */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 
                         bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 
                         border border-emerald-500/30 rounded-full"
            >
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">
                ${stats.totalEarnings.toLocaleString()}
              </span>
              <span className="text-sm text-emerald-300/70">earned</span>
            </motion.div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              icon={Users}
              value={stats.totalCustomers}
              label="Customers"
              color="gold"
              delay={0.3}
            />
            <StatCard
              icon={Network}
              value={stats.totalReferrals}
              label="Referrals"
              color="blue"
              delay={0.4}
            />
            <StatCard
              icon={Sparkles}
              value={stats.soldCount}
              label="Closed"
              color="green"
              delay={0.5}
            />
            <StatCard
              icon={TrendingUp}
              value={`$${stats.potentialEarnings}`}
              label="Pending"
              color="amber"
              delay={0.6}
            />
          </div>
        </div>
      </motion.div>

      {/* Tree Visualization */}
      <div className="flex-1 relative">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={onInit}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                proOptions={{ hideAttribution: true }}
                className="touch-pan-y"
              >
                <Background
                  color="#334155"
                  gap={20}
                  size={1}
                  className="opacity-30"
                />
                <Controls
                  className="!bg-slate-800/80 !border-slate-700 !rounded-lg !shadow-xl"
                  showInteractive={false}
                />
              </ReactFlow>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur-sm 
                     border border-slate-700/50 rounded-lg shadow-xl"
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">
            Status Legend
          </p>
          <div className="space-y-1.5">
            <LegendItem color="slate" label="Submitted" />
            <LegendItem color="sky" label="Contacted" />
            <LegendItem color="amber" label="Quoted" />
            <LegendItem color="emerald" label="Closed" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  delay,
}: {
  icon: any;
  value: number | string;
  label: string;
  color: 'blue' | 'green' | 'amber' | 'gold';
  delay: number;
}) {
  const colorClasses = {
    blue: 'from-sky-500/20 to-sky-600/20 border-sky-500/30 text-sky-400',
    green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
    gold: 'from-guardian-gold/20 to-guardian-gold/10 border-guardian-gold/30 text-guardian-gold',
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className={`p-3 rounded-lg bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="font-bold text-lg">{value}</span>
      </div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

// Legend item component
function LegendItem({ color, label }: { color: string; label: string }) {
  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[color]}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

// Wrapped component with ReactFlowProvider
export default function TreePage() {
  return (
    <ReactFlowProvider>
      <TreeViewInner />
    </ReactFlowProvider>
  );
}
