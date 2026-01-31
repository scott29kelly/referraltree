'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/page-transition';
import {
  Users,
  FileText,
  Search,
  Inbox,
  AlertCircle,
  FolderOpen,
  Wifi,
  RefreshCw,
  Plus,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// Empty State Illustrations (using Lucide icons)
// ============================================

interface IllustrationProps {
  className?: string;
}

function NoDataIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700/30 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/30 shadow-2xl shadow-black/20">
        <Inbox className="w-12 h-12 text-slate-400" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-slate-700/50 border border-slate-600/30 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-slate-500" />
      </div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-lg bg-slate-700/30 border border-slate-600/20" />
    </div>
  );
}

function NoReferralsIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-guardian-gold/10 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-guardian-gold/10 to-guardian-gold/5 flex items-center justify-center border border-guardian-gold/20 shadow-2xl shadow-guardian-gold/5">
        <Users className="w-12 h-12 text-guardian-gold/70" />
      </div>
      
      {/* Decorative dots */}
      <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-guardian-gold/20 border border-guardian-gold/30" />
      <div className="absolute -bottom-1 left-4 w-3 h-3 rounded-full bg-guardian-gold/15" />
      <div className="absolute top-4 -left-2 w-2 h-2 rounded-full bg-guardian-gold/10" />
    </div>
  );
}

function NoSearchResultsIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 flex items-center justify-center border border-sky-500/20 shadow-2xl shadow-sky-500/5">
        <Search className="w-12 h-12 text-sky-400/70" />
      </div>
      
      {/* Question marks */}
      <div className="absolute -top-1 -right-1 text-sky-400/40 font-bold text-lg">?</div>
      <div className="absolute bottom-2 -left-2 text-sky-400/30 font-bold text-sm">?</div>
    </div>
  );
}

function NoFilesIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
        <FolderOpen className="w-12 h-12 text-emerald-400/70" />
      </div>
      
      {/* Decorative files */}
      <div className="absolute -top-2 right-4 w-5 h-6 rounded bg-emerald-500/20 border border-emerald-500/30" />
      <div className="absolute -top-4 right-6 w-5 h-6 rounded bg-emerald-500/15 border border-emerald-500/20" />
    </div>
  );
}

function ErrorIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/5">
        <AlertCircle className="w-12 h-12 text-red-400/70" />
      </div>
      
      {/* Lightning bolts */}
      <div className="absolute -top-1 -right-1 text-red-400/40 text-lg">⚡</div>
    </div>
  );
}

function OfflineIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-2xl" />
      
      {/* Main icon container */}
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/5">
        <Wifi className="w-12 h-12 text-amber-400/70" />
        {/* Offline slash */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-0.5 bg-amber-400/70 rotate-45 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

type EmptyStateVariant = 
  | 'no-data'
  | 'no-referrals'
  | 'no-search-results'
  | 'no-files'
  | 'error'
  | 'offline'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'gold' | 'emerald';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const illustrations: Record<Exclude<EmptyStateVariant, 'custom'>, React.FC<IllustrationProps>> = {
  'no-data': NoDataIllustration,
  'no-referrals': NoReferralsIllustration,
  'no-search-results': NoSearchResultsIllustration,
  'no-files': NoFilesIllustration,
  'error': ErrorIllustration,
  'offline': OfflineIllustration,
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon: CustomIcon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Illustration = variant === 'custom' ? null : illustrations[variant];

  return (
    <FadeIn
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {/* Illustration or Custom Icon */}
      {variant === 'custom' && CustomIcon ? (
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/30 shadow-2xl shadow-black/20">
            <CustomIcon className="w-10 h-10 text-slate-400" />
          </div>
        </div>
      ) : Illustration ? (
        <div className="mb-6">
          <Illustration />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </FadeIn>
  );
}

// ============================================
// Pre-configured Empty States
// ============================================

export function NoReferralsEmpty({ 
  onAction,
  className,
}: { 
  onAction?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="no-referrals"
      title="No referrals yet"
      description="Share your QR code or referral link to start earning $250 for every closed deal."
      action={onAction ? {
        label: 'Share QR Code',
        onClick: onAction,
        variant: 'gold',
      } : undefined}
      className={className}
    />
  );
}

export function NoSearchResultsEmpty({
  query,
  onClear,
  className,
}: {
  query?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="no-search-results"
      title="No results found"
      description={query 
        ? `We couldn't find anything matching "${query}". Try adjusting your search.`
        : "No matches found for your search criteria."
      }
      secondaryAction={onClear ? {
        label: 'Clear Search',
        onClick: onClear,
      } : undefined}
      className={className}
    />
  );
}

export function ErrorEmpty({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description="We encountered an error loading this content. Please try again."
      secondaryAction={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
      className={className}
    />
  );
}

export function OfflineEmpty({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="offline"
      title="You're offline"
      description="Check your internet connection and try again."
      secondaryAction={onRetry ? {
        label: 'Retry',
        onClick: onRetry,
      } : undefined}
      className={className}
    />
  );
}

export function NoActivityEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      variant="no-data"
      title="No recent activity"
      description="Activity will appear here as referrals move through the pipeline."
      className={className}
    />
  );
}
