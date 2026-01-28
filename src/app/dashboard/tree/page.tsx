'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Handle,
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
  ChevronDown,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Customer, Referral, ReferralStatus } from '@/types/database';
import 'reactflow/dist/style.css';

const REFERRAL_BONUS = 250;

// Custom Rep Node
function RepNode({ data }: { data: any }) {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-guardian-gold/30 to-guardian-gold/10 border-2 border-guardian-gold shadow-lg shadow-guardian-gold/20 min-w-[200px]">
      <Handle type="source" position={Position.Bottom} className="!bg-guardian-gold !w-3 !h-3" />
      <div className="text-[10px] text-guardian-gold font-bold uppercase tracking-wider mb-2">Sales Rep</div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-guardian-gold/30 flex items-center justify-center">
          <Shield className="w-6 h-6 text-guardian-gold" />
        </div>
        <div>
          <p className="font-bold text-white text-lg">{data.name}</p>
          <p className="text-sm text-slate-400">{data.customerCount} customers</p>
        </div>
      </div>
    </div>
  );
}

// Custom Customer Node
function CustomerNode({ data }: { data: any }) {
  const { customer, referralCount, soldCount, isExpanded, onToggle } = data;
  
  return (
    <div
      onClick={onToggle}
      className={clsx(
        'px-5 py-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 min-w-[180px]',
        'bg-gradient-to-br from-sky-900/80 to-sky-950/80 border-sky-500/60',
        'shadow-lg shadow-sky-500/10'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-sky-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-sky-500 !w-3 !h-3" />
      
      <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-2">Customer</div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/30 flex items-center justify-center">
          <User className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">{customer.name}</p>
          <p className="text-xs text-slate-400">{referralCount} referrals • {soldCount} closed</p>
        </div>
        {referralCount > 0 && (
          isExpanded ? <ChevronDown className="w-5 h-5 text-sky-400" /> : <ChevronRight className="w-5 h-5 text-slate-500" />
        )}
      </div>
      {soldCount > 0 && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
          ${soldCount * REFERRAL_BONUS}
        </div>
      )}
    </div>
  );
}

// Custom Referral Node
function ReferralNode({ data }: { data: any }) {
  const { referral } = data;
  
  const statusConfig: Record<ReferralStatus, { bg: string; border: string; text: string; label: string }> = {
    submitted: { bg: 'from-slate-700/90 to-slate-800/90', border: 'border-slate-500', text: 'text-slate-300', label: 'Submitted' },
    contacted: { bg: 'from-sky-800/90 to-sky-900/90', border: 'border-sky-400', text: 'text-sky-300', label: 'Contacted' },
    quoted: { bg: 'from-amber-800/90 to-amber-900/90', border: 'border-amber-400', text: 'text-amber-300', label: 'Quoted' },
    sold: { bg: 'from-emerald-800/90 to-emerald-900/90', border: 'border-emerald-400', text: 'text-emerald-300', label: 'Closed' },
  };
  
  const config = statusConfig[referral.status as ReferralStatus];
  
  return (
    <div className={clsx(
      'px-4 py-3 rounded-xl border-2 min-w-[150px]',
      `bg-gradient-to-br ${config.bg} ${config.border}`,
      'shadow-md'
    )}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      
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
        <span className={clsx('text-xs font-medium', config.text)}>{config.label}</span>
        {referral.status === 'sold' && (
          <span className="text-emerald-400 font-bold text-sm">$250</span>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  rep: RepNode,
  customer: CustomerNode,
  referral: ReferralNode,
};

// Dagre layout
function getLayoutedElements(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - 100, y: pos.y - 50 },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function TreeViewInner() {
  const { rep, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const { fitView } = useReactFlow();
  const initialLoad = useRef(true);

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
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!rep) return { initialNodes: nodes, initialEdges: edges };

    // Rep node
    nodes.push({
      id: 'rep',
      type: 'rep',
      position: { x: 0, y: 0 },
      data: { name: rep.name, customerCount: customers.length },
    });

    // Customer nodes
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
          soldCount: customerReferrals.filter(r => r.status === 'sold').length,
          isExpanded,
          onToggle: () => toggleCustomer(customer.id),
        },
      });

      // Edge from rep to customer
      edges.push({
        id: `edge-rep-${customer.id}`,
        source: 'rep',
        target: `customer-${customer.id}`,
        type: 'smoothstep',
        style: { stroke: '#0ea5e9', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
      });

      // Referral nodes if expanded
      if (isExpanded) {
        customerReferrals.forEach((referral) => {
          nodes.push({
            id: `referral-${referral.id}`,
            type: 'referral',
            position: { x: 0, y: 0 },
            data: { referral },
          });

          const statusColors: Record<ReferralStatus, string> = {
            submitted: '#64748b',
            contacted: '#0ea5e9',
            quoted: '#f59e0b',
            sold: '#10b981',
          };

          edges.push({
            id: `edge-${customer.id}-${referral.id}`,
            source: `customer-${customer.id}`,
            target: `referral-${referral.id}`,
            type: 'smoothstep',
            animated: referral.status !== 'sold',
            style: { stroke: statusColors[referral.status], strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: statusColors[referral.status] },
          });
        });
      }
    });

    // Apply dagre layout
    if (nodes.length > 0) {
      return getLayoutedElements(nodes, edges);
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [rep, customers, referrals, expandedCustomers, toggleCustomer]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update and fit view when layout changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Fit view after layout update
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

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
    <div className="flex flex-col h-[calc(100vh-120px)] -m-4 lg:-m-6">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">My Referral Network</h1>
            <p className="text-xs text-slate-400">Click customers to expand/collapse</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <span className="text-slate-400"><Users className="w-4 h-4 inline mr-1" />{stats.totalCustomers}</span>
            <span className="text-slate-400"><Network className="w-4 h-4 inline mr-1" />{stats.totalReferrals}</span>
            <span className="text-emerald-400"><CheckCircle className="w-4 h-4 inline mr-1" />{stats.soldCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-400">${stats.totalEarnings}</span>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} size={1} className="opacity-30" />
          <Controls className="!bg-slate-800/80 !border-slate-700 !rounded-lg" showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/80 flex items-center justify-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-guardian-gold/50 border border-guardian-gold" /> Rep</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-900/50 border border-sky-500" /> Customer</span>
        <span className="w-px h-3 bg-slate-700" />
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Submitted</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Contacted</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Quoted</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Closed</span>
      </div>
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
