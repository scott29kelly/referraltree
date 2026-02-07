'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { getReferrals, getCustomers, getReps, updateReferralStatus } from '@/lib/data';
import BulkActions from '@/components/admin/BulkActions';
import ExportButton from '@/components/admin/ExportButton';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { TableSkeleton } from '@/components/ui/skeletons';
import { NoSearchResultsEmpty } from '@/components/ui/empty-state';
import { ViewToggle } from '@/components/referral-tree/ViewToggle';
import { ReferralNode } from '@/components/referral-tree';
import type { ReferralNodeData, ReferralStatus as TreeReferralStatus } from '@/components/referral-tree';
import { useViewPreference } from '@/hooks/useViewPreference';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  User,
  FileText,
  Network,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Referral, Customer, Rep, ReferralStatus } from '@/types/database';
import 'reactflow/dist/style.css';

type SortField = 'created_at' | 'status' | 'referee_name';
type SortDirection = 'asc' | 'desc';

const statusConfig: Record<ReferralStatus, { label: string; color: string; bg: string; glow: string }> = {
  submitted: { label: 'Submitted', color: 'text-slate-300', bg: 'bg-slate-600/80', glow: 'shadow-slate-500/20' },
  contacted: { label: 'Contacted', color: 'text-sky-300', bg: 'bg-sky-600/80', glow: 'shadow-sky-500/20' },
  quoted: { label: 'Quoted', color: 'text-amber-300', bg: 'bg-amber-600/80', glow: 'shadow-amber-500/20' },
  sold: { label: 'Sold', color: 'text-emerald-300', bg: 'bg-emerald-600/80', glow: 'shadow-emerald-500/20' },
};

const statusOrder: Record<ReferralStatus, number> = {
  submitted: 0,
  contacted: 1,
  quoted: 2,
  sold: 3,
};

const nodeTypes = {
  referral: ReferralNode,
};

const REFERRAL_BONUS = 125;

// Calculate tree layout grouping referrals by their referrer (customer)
function calculateAdminTreeLayout(
  referrals: Referral[],
  customerMap: Map<string, Customer>
): { nodes: Node<ReferralNodeData>[]; edges: Edge[] } {
  const nodes: Node<ReferralNodeData>[] = [];
  const edges: Edge[] = [];

  if (referrals.length === 0) return { nodes, edges };

  // Group referrals by referrer
  const referralsByCustomer = new Map<string, Referral[]>();
  referrals.forEach((r) => {
    const existing = referralsByCustomer.get(r.referrer_id) || [];
    existing.push(r);
    referralsByCustomer.set(r.referrer_id, existing);
  });

  const nodeWidth = 200;
  const horizontalGap = 40;
  const verticalGap = 180;

  const customerIds = Array.from(referralsByCustomer.keys());
  const totalCustomerWidth =
    customerIds.length * nodeWidth + (customerIds.length - 1) * horizontalGap;
  const customerStartX = -totalCustomerWidth / 2;

  customerIds.forEach((customerId, customerIndex) => {
    const customer = customerMap.get(customerId);
    const customerNodeId = `customer-${customerId}`;
    const customerX = customerStartX + customerIndex * (nodeWidth + horizontalGap);

    nodes.push({
      id: customerNodeId,
      type: 'referral',
      position: { x: customerX, y: 0 },
      data: {
        id: customerNodeId,
        name: customer?.name || 'Unknown',
        phone: customer?.phone || undefined,
        email: customer?.email || undefined,
        status: 'sold' as TreeReferralStatus,
        submittedAt: customer ? new Date(customer.created_at) : new Date(),
        isRoot: true,
      },
    });

    const customerReferrals = referralsByCustomer.get(customerId) || [];
    const refWidth =
      customerReferrals.length * nodeWidth +
      (customerReferrals.length - 1) * horizontalGap;
    const refStartX = customerX + nodeWidth / 2 - refWidth / 2;

    customerReferrals.forEach((referral, refIndex) => {
      const refX = refStartX + refIndex * (nodeWidth + horizontalGap);
      const referralNodeId = `referral-${referral.id}`;

      nodes.push({
        id: referralNodeId,
        type: 'referral',
        position: { x: refX, y: verticalGap },
        data: {
          id: referralNodeId,
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
        id: `edge-${customerNodeId}-${referralNodeId}`,
        source: customerNodeId,
        target: referralNodeId,
        type: 'smoothstep',
        animated: referral.status !== 'sold',
        style: { stroke: statusColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: statusColor },
      });
    });
  });

  return { nodes, edges };
}

function AdminReferralsPageInner() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // View toggle
  const [view, setView] = useViewPreference('tree');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const [mockReferralsData, customersData, repsData] = await Promise.all([
        getReferrals(),
        getCustomers(),
        getReps(),
      ]);
      
      // Also fetch API-submitted referrals
      let apiReferrals: Referral[] = [];
      try {
        const response = await fetch('/api/referrals');
        if (response.ok) {
          const data = await response.json();
          apiReferrals = data.referrals || [];
        }
      } catch (err) {
        console.error('Error fetching API referrals:', err);
      }
      
      // Combine API referrals (newer) with mock data, avoiding duplicates
      const apiIds = new Set(apiReferrals.map(r => r.id));
      const combinedReferrals = [
        ...apiReferrals,
        ...mockReferralsData.filter(r => !apiIds.has(r.id))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setReferrals(combinedReferrals);
      setCustomers(customersData);
      setReps(repsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create lookup maps
  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  );

  // Tree layout
  const { nodes: treeNodes, edges: treeEdges } = useMemo(
    () => calculateAdminTreeLayout(referrals, customerMap),
    [referrals, customerMap]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(treeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(treeEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateAdminTreeLayout(referrals, customerMap);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [referrals, customerMap, setNodes, setEdges]);

  const onTreeInit = useCallback((instance: any) => {
    setTimeout(() => instance.fitView({ padding: 0.3, duration: 800 }), 300);
  }, []);

  // Filter and sort
  const filteredReferrals = useMemo(() => {
    let result = [...referrals];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.referee_name.toLowerCase().includes(query) ||
          r.referee_email?.toLowerCase().includes(query) ||
          customerMap.get(r.referrer_id)?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter(
        (r) => new Date(r.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      result = result.filter(
        (r) => new Date(r.created_at) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'referee_name':
          comparison = a.referee_name.localeCompare(b.referee_name);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [referrals, searchQuery, statusFilter, dateRange, sortField, sortDirection, customerMap]);

  // Export data
  const exportData = useMemo(
    () =>
      filteredReferrals.map((r) => ({
        name: r.referee_name,
        email: r.referee_email || '',
        phone: r.referee_phone || '',
        status: r.status,
        value: r.value,
        referrer: customerMap.get(r.referrer_id)?.name || '',
        created_at: new Date(r.created_at).toLocaleDateString(),
      })),
    [filteredReferrals, customerMap]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredReferrals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReferrals.map((r) => r.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusChange = async (status: ReferralStatus) => {
    // Optimistically update UI
    setReferrals((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status } : r))
    );
    
    // Update each referral via API
    for (const id of selectedIds) {
      try {
        const apiResponse = await fetch('/api/referrals', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        if (!apiResponse.ok) {
          await updateReferralStatus(id, status);
        }
      } catch {
        await updateReferralStatus(id, status);
      }
    }
    setSelectedIds(new Set());
  };

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">All Referrals</h1>
              <p className="text-slate-400">Loading referrals...</p>
            </div>
          </div>
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Referrals</h1>
          </div>
          <p className="text-slate-400 ml-[52px]">
            {referrals.length} total referrals across all reps
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <ExportButton
            data={exportData}
            filename="referrals"
            headers={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status' },
              { key: 'value', label: 'Value' },
              { key: 'referrer', label: 'Referrer' },
              { key: 'created_at', label: 'Date' },
            ]}
          />
        </div>
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        {view === 'tree' ? (
          <motion.div
            key="tree-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-[600px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/30 overflow-hidden shadow-2xl shadow-black/20 relative">
              {referrals.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Network className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No referrals yet</p>
                  </div>
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onInit={onTreeInit}
                  nodeTypes={nodeTypes}
                  connectionLineType={ConnectionLineType.SmoothStep}
                  fitView
                  fitViewOptions={{ padding: 0.3 }}
                  minZoom={0.1}
                  maxZoom={1.5}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#334155" gap={20} size={1} className="opacity-30" />
                  <Controls
                    className="!bg-slate-800/80 !border-slate-700 !rounded-lg !shadow-xl"
                    showInteractive={false}
                  />
                </ReactFlow>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">
                  Status Legend
                </p>
                <div className="space-y-1.5">
                  <LegendItem color="slate" label="Submitted" />
                  <LegendItem color="sky" label="Contacted" />
                  <LegendItem color="amber" label="Quoted" />
                  <LegendItem color="emerald" label="Closed" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search referrals..."
            className={clsx(
              'w-full pl-11 pr-4 py-2.5 rounded-xl',
              'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50',
              'text-white text-sm placeholder-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
          className={clsx(
            'px-4 py-2.5 rounded-xl appearance-none cursor-pointer',
            'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50',
            'text-white text-sm',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
            'transition-all duration-200'
          )}
        >
          <option value="all">All Status</option>
          {(Object.keys(statusConfig) as ReferralStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusConfig[s].label}
            </option>
          ))}
        </select>

        {/* Date Range Picker */}
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onStatusChange={handleBulkStatusChange}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/50">
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {selectedIds.size === filteredReferrals.length &&
                    filteredReferrals.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('referee_name')}
                >
                  <div className="flex items-center gap-1">
                    Referral
                    <SortIcon field="referee_name" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Value
                </th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="created_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredReferrals.map((referral) => {
                const customer = customerMap.get(referral.referrer_id);
                const config = statusConfig[referral.status];

                return (
                  <tr
                    key={referral.id}
                    className={clsx(
                      'hover:bg-slate-700/20 transition-all duration-200',
                      selectedIds.has(referral.id) && 'bg-emerald-500/5'
                    )}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleSelect(referral.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {selectedIds.has(referral.id) ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-white font-medium">
                          {referral.referee_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-sm">
                      {customer?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={referral.status}
                        onChange={(e) =>
                          handleStatusChange(
                            referral.id,
                            e.target.value as ReferralStatus
                          )
                        }
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer',
                          'shadow-lg transition-all duration-200',
                          config.bg,
                          config.color,
                          config.glow
                        )}
                      >
                        {(Object.keys(statusConfig) as ReferralStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {statusConfig[s].label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-guardian-gold font-semibold earnings-number">
                        ${referral.value}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm">
                      {new Date(referral.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReferrals.length === 0 && (
          <NoSearchResultsEmpty
            query={searchQuery}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateRange({ start: '', end: '' });
            }}
            className="py-8"
          />
        )}

        <div className="px-4 py-3 border-t border-slate-700/30 bg-slate-800/30 text-sm text-slate-400 flex items-center justify-between">
          <span>Showing {filteredReferrals.length} of {referrals.length} referrals</span>
          {selectedIds.size > 0 && (
            <span className="text-emerald-400">{selectedIds.size} selected</span>
          )}
        </div>
      </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

export default function AdminReferralsPage() {
  return (
    <ReactFlowProvider>
      <AdminReferralsPageInner />
    </ReactFlowProvider>
  );
}
