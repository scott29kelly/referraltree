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
  Position,
} from 'reactflow';
import dagre from 'dagre';
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
  ChevronDown,
  User,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';
import 'reactflow/dist/style.css';

const REFERRAL_BONUS = 250;

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Custom Customer Node
function CustomerNode({ data }: { data: any }) {
  const { customer, referralCount, isExpanded, onToggle } = data;
  
  return (
    <div
      className={clsx(
        'relative px-4 py-3 rounded-xl border-2 min-w-[200px]',
        'bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5',
        'border-guardian-gold/50 shadow-lg shadow-guardian-gold/20',
        'cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-guardian-gold/30'
      )}
      onClick={onToggle}
    >
      <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-guardian-gold text-guardian-navy text-[10px] font-bold rounded-full uppercase tracking-wider">
        Customer
      </div>
      
      <div className="flex items-center gap-3 mt-1">
        <div className="w-10 h-10 rounded-xl bg-guardian-gold/30 flex items-center justify-center">
          <User className="w-5 h-5 text-guardian-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{customer.name}</p>
          {customer.phone && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {customer.phone}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-xs">{referralCount}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Referral Node
function ReferralNodeComponent({ data }: { data: any }) {
  const { referral } = data;
  
  const statusConfig: Record<ReferralStatus, { bg: string; border: string; text: string; label: string }> = {
    submitted: { bg: 'from-slate-700/90 to-slate-800/90', border: 'border-slate-500/50', text: 'text-slate-300', label: 'Submitted' },
    contacted: { bg: 'from-sky-900/90 to-sky-950/90', border: 'border-sky-500/50', text: 'text-sky-300', label: 'Contacted' },
    quoted: { bg: 'from-amber-900/90 to-amber-950/90', border: 'border-amber-500/50', text: 'text-amber-300', label: 'Quoted' },
    sold: { bg: 'from-emerald-900/90 to-emerald-950/90', border: 'border-emerald-500/50', text: 'text-emerald-300', label: 'Closed' },
  };
  
  const config = statusConfig[referral.status as ReferralStatus];
  
  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-xl border-2 min-w-[180px]',
        `bg-gradient-to-br ${config.bg}`,
        config.border,
        'shadow-lg transition-all duration-200 hover:scale-105'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{referral.referee_name}</p>
          {referral.referee_phone && (
            <p className="text-[11px] text-slate-400 truncate">{referral.referee_phone}</p>
          )}
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', config.text, 'bg-black/20')}>
          {config.label}
        </span>
        {referral.status === 'sold' && (
          <span className="text-emerald-400 font-bold text-sm">$250</span>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  customer: CustomerNode,
  referral: ReferralNodeComponent,
};

function TreeViewInner() {
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
        
        // Auto-expand all customers initially
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

  const toggleCustomer = useCallback((customerId: string) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  }, []);

  // Build nodes and edges
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create customer nodes
    customers.forEach((customer) => {
      const customerReferrals = referrals.filter(r => r.referrer_id === customer.id);
      const isExpanded = expandedCustomers.has(customer.id);
      
      nodes.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        position: { x: 0, y: 0 },
        data: {
          customer,
          referralCount: customerReferrals.length,
          isExpanded,
          onToggle: () => toggleCustomer(customer.id),
        },
      });

      // Add referral nodes if expanded
      if (isExpanded) {
        customerReferrals.forEach((referral) => {
          nodes.push({
            id: `referral-${referral.id}`,
            type: 'referral',
            position: { x: 0, y: 0 },
            data: { referral },
          });

          const statusColor =
            referral.status === 'sold' ? '#10b981' :
            referral.status === 'quoted' ? '#f59e0b' :
            referral.status === 'contacted' ? '#0ea5e9' : '#64748b';

          edges.push({
            id: `edge-${customer.id}-${referral.id}`,
            source: `customer-${customer.id}`,
            target: `referral-${referral.id}`,
            type: 'smoothstep',
            animated: referral.status !== 'sold',
            style: { stroke: statusColor, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: statusColor },
          });
        });
      }
    });

    // Apply dagre layout
    if (nodes.length > 0) {
      const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges, 'LR');
      return { layoutedNodes: ln, layoutedEdges: le };
    }

    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [customers, referrals, expandedCustomers, toggleCustomer]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onInit = useCallback((instance: any) => {
    setTimeout(() => instance.fitView({ padding: 0.2, duration: 500 }), 100);
  }, []);

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
    <div className="flex flex-col h-[calc(100vh-120px)] -m-4 lg:-m-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">My Referral Network</h1>
                <p className="text-xs text-slate-400">
                  Click customers to expand/collapse their referrals
                </p>
              </div>
            </div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-full"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-lg font-bold text-emerald-400">
                ${stats.totalEarnings.toLocaleString()}
              </span>
              <span className="text-sm text-emerald-300/70">earned</span>
            </motion.div>
          </div>

          {/* Compact Stats */}
          <div className="flex flex-wrap gap-3">
            <StatPill icon={Users} value={stats.totalCustomers} label="Customers" />
            <StatPill icon={Network} value={stats.totalReferrals} label="Referrals" />
            <StatPill icon={CheckCircle} value={stats.soldCount} label="Closed" />
            <StatPill icon={TrendingUp} value={`$${stats.potentialEarnings}`} label="Pending" />
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} size={1} className="opacity-30" />
          <Controls className="!bg-slate-800/80 !border-slate-700 !rounded-lg" showInteractive={false} />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">
            Status
          </p>
          <div className="flex flex-wrap gap-3">
            <LegendItem color="slate" label="Submitted" />
            <LegendItem color="sky" label="Contacted" />
            <LegendItem color="amber" label="Quoted" />
            <LegendItem color="emerald" label="Closed" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="font-semibold text-white">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[color]}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

export default function TreePage() {
  return (
    <ReactFlowProvider>
      <TreeViewInner />
    </ReactFlowProvider>
  );
}
