'use client';

import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { ReferralStatus } from '@/types/database';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusConfig: Record<ReferralStatus, { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }> = {
  submitted: { label: 'Submitted', variant: 'submitted' },
  contacted: { label: 'Contacted', variant: 'contacted' },
  quoted: { label: 'Quoted', variant: 'quoted' },
  sold: { label: 'Sold', variant: 'sold' },
};

interface StatusBadgeProps {
  status: ReferralStatus;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('px-3 py-1', className)}>
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {config.label}
    </Badge>
  );
}

// Helper function to get status label
export function getStatusLabel(status: ReferralStatus): string {
  return statusConfig[status].label;
}

// All status values for iteration
export const allStatuses: ReferralStatus[] = ['submitted', 'contacted', 'quoted', 'sold'];

export default StatusBadge;
