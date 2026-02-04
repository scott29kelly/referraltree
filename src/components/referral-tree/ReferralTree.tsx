'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
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
import { DollarSign, Users, TrendingUp, Sparkles, Plus } from 'lucide-react';
import ReferralNode, { ReferralNodeData, ReferralStatus } from './ReferralNode';
import AddReferralForm from './AddReferralForm';
import { ViewToggle, type ViewMode } from './ViewToggle';
import { ReferralListView } from './ReferralListView';
import { useViewPreference } from '@/hooks/useViewPreference';
import { toast } from '@/components/ui/Toast';
import 'reactflow/dist/style.css';

// Custom node types
const nodeTypes = {
  referral: ReferralNode,
};

// Demo data - in production this comes from Supabase
const DEMO_REFERRALS: ReferralNodeData[] = [
  {
    id: 'root',
    name: 'Sarah Johnson',
    phone: '(215) 555-0123',
    email: 'sarah.johnson@email.com',
    status: 'sold',
    submittedAt: new Date('2024-01-15'),
    isRoot: true,
  },
  {
    id: 'ref-1',
    name: 'Mike Thompson',
    phone: '(215) 555-0456',
    status: 'sold',
    submittedAt: new Date('2024-02-01'),
    earnings: 125,
  },
  {
    id: 'ref-2',
    name: 'Lisa Chen',
    phone: '(215) 555-0789',
    status: 'quoted',
    submittedAt: new Date('2024-02-15'),
  },
  {
    id: 'ref-3',
    name: 'David Williams',
    phone: '(215) 555-0234',
    status: 'contacted',
    submittedAt: new Date('2024-03-01'),
  },
  {
    id: 'ref-4',
    name: 'Jennifer Adams',
    phone: '(215) 555-0567',
    status: 'submitted',
    submittedAt: new Date('2024-03-10'),
  },
  {
    id: 'ref-5',
    name: 'Robert Garcia',
    phone: '(215) 555-0890',
    status: 'sold',
    submittedAt: new Date('2024-03-05'),
    earnings: 125,
  },
];

const REFERRAL_BONUS = 125;

// Calculate tree layout
function calculateTreeLayout(referrals: ReferralNodeData[]): {
  nodes: Node<ReferralNodeData>[];
  edges: Edge[];
} {
  const root = referrals.find((r) => r.isRoot);
  const children = referrals.filter((r) => !r.isRoot);

  if (!root) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node<ReferralNodeData>[] = [];
  const edges: Edge[] = [];

  // Root node at top center
  nodes.push({
    id: root.id,
    type: 'referral',
    position: { x: 0, y: 0 },
    data: root,
  });

  // Calculate child positions in a fan layout
  const childCount = children.length;
  const horizontalSpacing = 220;
  const verticalSpacing = 180;
  const totalWidth = (childCount - 1) * horizontalSpacing;
  const startX = -totalWidth / 2;

  children.forEach((child, index) => {
    const x = startX + index * horizontalSpacing;
    const y = verticalSpacing;

    nodes.push({
      id: child.id,
      type: 'referral',
      position: { x, y },
      data: child,
    });

    edges.push({
      id: `edge-${root.id}-${child.id}`,
      source: root.id,
      target: child.id,
      type: 'smoothstep',
      animated: child.status !== 'sold',
      style: {
        stroke:
          child.status === 'sold'
            ? '#10b981'
            : child.status === 'quoted'
            ? '#f59e0b'
            : child.status === 'contacted'
            ? '#0ea5e9'
            : '#64748b',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color:
          child.status === 'sold'
            ? '#10b981'
            : child.status === 'quoted'
            ? '#f59e0b'
            : child.status === 'contacted'
            ? '#0ea5e9'
            : '#64748b',
      },
    });
  });

  return { nodes, edges };
}

interface ReferralTreeProps {
  referrals?: ReferralNodeData[];
  customerId?: string;
}

function ReferralTreeInner({ referrals: initialReferrals = DEMO_REFERRALS }: ReferralTreeProps) {
  const [referrals, setReferrals] = useState<ReferralNodeData[]>(initialReferrals);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useViewPreference('tree');

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => calculateTreeLayout(referrals),
    [referrals]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when referrals change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateTreeLayout(referrals);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [referrals, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle new referral submission
  const handleAddReferral = useCallback((newReferral: ReferralNodeData) => {
    setReferrals((prev) => [...prev, newReferral]);

    // Show celebration toast
    toast.celebration(
      'Referral Submitted!',
      `${newReferral.name} has been added to your tree. Earn $125 when they close!`
    );
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const children = referrals.filter((r) => !r.isRoot);
    const soldCount = children.filter((r) => r.status === 'sold').length;
    const totalEarnings = soldCount * REFERRAL_BONUS;
    const pendingCount = children.filter((r) => r.status !== 'sold').length;

    return {
      totalReferrals: children.length,
      soldCount,
      pendingCount,
      totalEarnings,
      potentialEarnings: pendingCount * REFERRAL_BONUS,
    };
  }, [referrals]);

  // Fit view on load
  const onInit = useCallback((instance: any) => {
    setTimeout(() => {
      instance.fitView({ padding: 0.3, duration: 800 });
    }, 300);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Stats Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="max-w-lg mx-auto">
          {/* View Toggle */}
          <div className="flex justify-center mb-4">
            <ViewToggle view={view} onChange={setView} />
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
                <AnimatedCounter value={stats.totalEarnings} />
              </span>
              <span className="text-sm text-emerald-300/70">earned</span>
            </motion.div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Users}
              value={stats.totalReferrals}
              label="Total Referrals"
              color="blue"
              delay={0.3}
            />
            <StatCard
              icon={Sparkles}
              value={stats.soldCount}
              label="Closed Deals"
              color="green"
              delay={0.4}
            />
            <StatCard
              icon={TrendingUp}
              value={`$${stats.potentialEarnings}`}
              label="Pending"
              color="amber"
              delay={0.5}
            />
          </div>
        </div>
      </motion.div>

      {/* View Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'tree' ? (
            <motion.div
              key="tree-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Tree Visualization */}
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
                      minZoom={0.3}
                      maxZoom={1.5}
                      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
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
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ReferralListView referrals={referrals} className="h-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Referral CTA - Always visible */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="absolute bottom-4 right-4 px-4 py-3 z-10
                     bg-gradient-to-r from-guardian-gold to-guardian-orange
                     hover:from-guardian-gold/90 hover:to-guardian-orange/90
                     text-guardian-navy font-semibold rounded-xl shadow-lg shadow-guardian-gold/30
                     flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Referral</span>
        </motion.button>
      </div>

      {/* Add Referral Form */}
      <AddReferralForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddReferral}
      />
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
  color: 'blue' | 'green' | 'amber';
  delay: number;
}) {
  const colorClasses = {
    blue: 'from-sky-500/20 to-sky-600/20 border-sky-500/30 text-sky-400',
    green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
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

// Animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>${displayValue}</>;
}

// Wrapped component with ReactFlowProvider
export default function ReferralTree(props: ReferralTreeProps) {
  return (
    <ReactFlowProvider>
      <ReferralTreeInner {...props} />
    </ReactFlowProvider>
  );
}
