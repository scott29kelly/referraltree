'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  Phone,
  Network,
  QrCode,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getRep, getCustomersByRep, getReferralsByRep, getDashboardStats } from '@/lib/data';
import { ReferralNode, type ReferralNodeData, type ReferralStatus as TreeReferralStatus } from '@/components/referral-tree';
import type { Rep, Customer, Referral, DashboardStats, ReferralStatus } from '@/types/database';
import 'reactflow/dist/style.css';

const nodeTypes = {
  referral: ReferralNode,
};

const REFERRAL_BONUS = 250;

// Calculate tree layout for this rep's network
function calculateTreeLayout(
  customers: Customer[],
  referrals: Referral[]
): { nodes: Node<ReferralNodeData>[]; edges: Edge[] } {
  const nodes: Node<ReferralNodeData>[] = [];
  const edges: Edge[] = [];

  if (customers.length === 0) return { nodes, edges };

  const referralsByCustomer = new Map<string, Referral[]>();
  referrals.forEach((r) => {
    const existing = referralsByCustomer.get(r.referrer_id) || [];
    existing.push(r);
    referralsByCustomer.set(r.referrer_id, existing);
  });

  const nodeWidth = 200;
  const horizontalGap = 40;
  const verticalGap = 160;

  const totalCustomerWidth = customers.length * nodeWidth + (customers.length - 1) * horizontalGap;
  const customerStartX = -totalCustomerWidth / 2;

  customers.forEach((customer, customerIndex) => {
    const customerX = customerStartX + customerIndex * (nodeWidth + horizontalGap);
    const customerY = 0;
    const customerId = `customer-${customer.id}`;

    nodes.push({
      id: customerId,
      type: 'referral',
      position: { x: customerX, y: customerY },
      data: {
        id: customerId,
        name: customer.name,
        phone: customer.phone || undefined,
        email: customer.email || undefined,
        status: 'sold' as TreeReferralStatus,
        submittedAt: new Date(customer.created_at),
        isRoot: true,
      },
    });

    const customerReferrals = referralsByCustomer.get(customer.id) || [];

    if (customerReferrals.length > 0) {
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
            status: referral.status as TreeReferralStatus,
            submittedAt: new Date(referral.created_at),
            isRoot: false,
            earnings: referral.status === 'sold' ? REFERRAL_BONUS : undefined,
          },
        });

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
          style: { stroke: statusColor, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: statusColor },
        });
      });
    }
  });

  return { nodes, edges };
}

function RepDetailInner() {
  const params = useParams();
  const repId = params.repId as string;

  const [rep, setRep] = useState<Rep | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'tree'>('overview');

  useEffect(() => {
    async function loadData() {
      try {
        const [repData, customersData, referralsData, statsData] = await Promise.all([
          getRep(repId),
          getCustomersByRep(repId),
          getReferralsByRep(repId),
          getDashboardStats(repId),
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

        setRep(repData);
        setCustomers(customersData);
        setReferrals(combinedReferrals);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading rep data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [repId]);

  // Tree layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => calculateTreeLayout(customers, referrals),
    [customers, referrals]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateTreeLayout(customers, referrals);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [customers, referrals, setNodes, setEdges]);

  const onInit = useCallback((instance: any) => {
    setTimeout(() => instance.fitView({ padding: 0.3, duration: 800 }), 300);
  }, []);

  // Calculate detailed stats
  const detailedStats = useMemo(() => {
    const byStatus = {
      submitted: referrals.filter((r) => r.status === 'submitted').length,
      contacted: referrals.filter((r) => r.status === 'contacted').length,
      quoted: referrals.filter((r) => r.status === 'quoted').length,
      sold: referrals.filter((r) => r.status === 'sold').length,
    };
    const totalEarnings = byStatus.sold * REFERRAL_BONUS;
    const pendingEarnings = (byStatus.submitted + byStatus.contacted + byStatus.quoted) * REFERRAL_BONUS;
    const conversionRate = referrals.length > 0 
      ? Math.round((byStatus.sold / referrals.length) * 100) 
      : 0;

    return { byStatus, totalEarnings, pendingEarnings, conversionRate };
  }, [referrals]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-64" />
        <div className="h-48 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!rep) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Rep not found</p>
        <Link href="/admin/reps" className="text-guardian-gold hover:underline mt-2 inline-block">
          Back to Reps
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/reps"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <div
              className={clsx(
                'w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg',
                rep.role === 'admin'
                  ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border-emerald-500/30'
                  : 'bg-gradient-to-br from-slate-600/40 to-slate-700/30 border-slate-600/30'
              )}
            >
              <User className={clsx('w-8 h-8', rep.role === 'admin' ? 'text-emerald-400' : 'text-slate-300')} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{rep.name}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {rep.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(rep.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                rep.role === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-700/50 text-slate-300 border-slate-600/30'
              )}
            >
              {rep.role}
            </span>
            <span
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                rep.active
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/20 text-red-400 border-red-500/20'
              )}
            >
              {rep.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <Link
          href={`/refer/${rep.id}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-guardian-gold/10 border border-guardian-gold/30 text-guardian-gold hover:bg-guardian-gold/20 transition-all"
        >
          <QrCode className="w-4 h-4" />
          View Referral Page
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Customers"
          value={customers.length}
          color="blue"
        />
        <StatCard
          icon={Trophy}
          label="Total Referrals"
          value={referrals.length}
          color="gold"
        />
        <StatCard
          icon={CheckCircle}
          label="Closed"
          value={detailedStats.byStatus.sold}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Earnings"
          value={`$${detailedStats.totalEarnings.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${detailedStats.conversionRate}%`}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        {(['overview', 'referrals', 'tree'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-guardian-gold/20 text-guardian-gold border border-guardian-gold/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            )}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'referrals' && 'All Referrals'}
            {tab === 'tree' && 'Network Tree'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Breakdown */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pipeline Breakdown</h3>
            <div className="space-y-3">
              <PipelineRow label="Submitted" count={detailedStats.byStatus.submitted} color="slate" />
              <PipelineRow label="Contacted" count={detailedStats.byStatus.contacted} color="sky" />
              <PipelineRow label="Quoted" count={detailedStats.byStatus.quoted} color="amber" />
              <PipelineRow label="Closed" count={detailedStats.byStatus.sold} color="emerald" />
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Referrals</h3>
            {referrals.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No referrals yet</p>
            ) : (
              <div className="space-y-3">
                {referrals.slice(0, 5).map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                  >
                    <div>
                      <p className="font-medium text-white">{referral.referee_name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={referral.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customers */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Customers ({customers.length})</h3>
            {customers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No customers assigned yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customers.map((customer) => {
                  const customerReferrals = referrals.filter((r) => r.referrer_id === customer.id);
                  return (
                    <div
                      key={customer.id}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30"
                    >
                      <p className="font-medium text-white">{customer.name}</p>
                      {customer.phone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {customerReferrals.length} referral{customerReferrals.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-sm font-medium text-slate-400">Name</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    No referrals yet
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                    <td className="p-4">
                      <p className="font-medium text-white">{referral.referee_name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-400">{referral.referee_phone || referral.referee_email || '-'}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tree' && (
        <div className="h-[500px] rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/50 overflow-hidden">
          {customers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Network className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No network data yet</p>
              </div>
            </div>
          ) : (
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
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#334155" gap={20} size={1} className="opacity-30" />
              <Controls className="!bg-slate-800/80 !border-slate-700 !rounded-lg" showInteractive={false} />
            </ReactFlow>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'gold' | 'purple';
}) {
  const colors = {
    blue: 'from-sky-500/20 to-sky-600/10 border-sky-500/20 text-sky-400',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    gold: 'from-guardian-gold/20 to-guardian-gold/10 border-guardian-gold/20 text-guardian-gold',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function PipelineRow({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colors[color]}`} />
        <span className="text-slate-300">{label}</span>
      </div>
      <span className="font-semibold text-white">{count}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const styles: Record<ReferralStatus, string> = {
    submitted: 'bg-slate-600 text-slate-300',
    contacted: 'bg-sky-600 text-sky-300',
    quoted: 'bg-amber-600 text-amber-300',
    sold: 'bg-emerald-600 text-emerald-300',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function RepDetailPage() {
  return (
    <ReactFlowProvider>
      <RepDetailInner />
    </ReactFlowProvider>
  );
}
