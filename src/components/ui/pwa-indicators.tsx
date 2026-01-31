'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WifiOff,
  Cloud,
  Download,
  X,
  RefreshCw,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

/**
 * OfflineIndicator - Shows network status and pending sync actions
 */
interface OfflineIndicatorProps {
  className?: string;
  showPendingSync?: boolean;
  compact?: boolean;
}

export function OfflineIndicator({
  className,
  showPendingSync = true,
  compact = false,
}: OfflineIndicatorProps) {
  const { isOnline, pendingSync, isSyncing, syncNow } = usePWA();

  // Don't render if online and no pending sync
  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'backdrop-blur-sm border',
          !isOnline
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-slate-800/80 border-slate-700/50 text-slate-300',
          compact && 'px-2 py-1.5',
          className
        )}
      >
        {/* Status Icon */}
        <div
          className={cn(
            'w-6 h-6 rounded-lg flex items-center justify-center',
            !isOnline ? 'bg-amber-500/20' : 'bg-slate-700'
          )}
        >
          {!isOnline ? (
            <WifiOff className="w-3.5 h-3.5" />
          ) : (
            <Cloud className="w-3.5 h-3.5" />
          )}
        </div>

        {/* Status Text */}
        <div className="flex flex-col">
          <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {!isOnline ? 'Offline' : 'Online'}
          </span>
          {showPendingSync && pendingSync > 0 && (
            <span className="text-[10px] text-slate-400">
              {pendingSync} pending {pendingSync === 1 ? 'action' : 'actions'}
            </span>
          )}
        </div>

        {/* Sync Button - Only show when online with pending actions */}
        {isOnline && pendingSync > 0 && (
          <button
            onClick={() => syncNow()}
            disabled={isSyncing}
            className={cn(
              'ml-auto p-1.5 rounded-lg',
              'bg-emerald-500/20 text-emerald-400',
              'hover:bg-emerald-500/30 transition-colors',
              'disabled:opacity-50'
            )}
            title="Sync now"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * OfflineBanner - Full-width banner for offline status
 */
interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOnline, pendingSync, isSyncing, syncNow } = usePWA();

  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          'w-full overflow-hidden',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2',
            !isOnline
              ? 'bg-amber-500/10 border-b border-amber-500/30'
              : 'bg-emerald-500/10 border-b border-emerald-500/30'
          )}
        >
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-400" />
            )}
            <span className={cn(
              'text-sm font-medium',
              !isOnline ? 'text-amber-300' : 'text-emerald-300'
            )}>
              {!isOnline
                ? 'You are offline. Changes will sync when you reconnect.'
                : `${pendingSync} pending ${pendingSync === 1 ? 'action' : 'actions'} to sync`}
            </span>
          </div>

          {isOnline && pendingSync > 0 && (
            <Button
              size="sm"
              variant="emerald"
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="h-7 text-xs"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync Now
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * InstallPrompt - PWA install prompt banner/card
 */
interface InstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'toast';
  onDismiss?: () => void;
}

export function InstallPrompt({
  className,
  variant = 'banner',
  onDismiss,
}: InstallPromptProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);

  // Check localStorage for dismissed state
  React.useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    const result = await promptInstall();
    setInstalling(false);

    if (!result) {
      // User declined, don't show again for this session
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  if (variant === 'toast') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={cn(
            'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] z-50',
            className
          )}
        >
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-2xl shadow-black/50">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">Install Guardianship</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add to your home screen for quick access and offline support.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="emerald"
                    onClick={handleInstall}
                    disabled={installing}
                    className="h-8 text-xs"
                  >
                    {installing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1.5" />
                        Install
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-8 text-xs text-slate-400"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
          'border border-emerald-500/20 p-4',
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Install App</h3>
            <p className="text-sm text-slate-400 mt-1">
              Install Guardianship on your device for faster access and offline support.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="emerald"
                size="sm"
                onClick={handleInstall}
                disabled={installing}
              >
                {installing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </>
                )}
              </Button>
              <button
                onClick={handleDismiss}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: banner
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          'w-full overflow-hidden bg-gradient-to-r from-emerald-500/10 to-emerald-600/5',
          'border-b border-emerald-500/20',
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-sm font-medium text-white">
                Install Guardianship
              </span>
              <span className="hidden sm:inline text-sm text-slate-400 ml-2">
                for quick access and offline support
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="emerald"
              onClick={handleInstall}
              disabled={installing}
              className="h-8"
            >
              {installing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </>
              )}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NetworkStatusIndicator - Simple online/offline dot indicator
 */
interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function NetworkStatusIndicator({
  className,
  showLabel = false,
}: NetworkStatusIndicatorProps) {
  const { isOnline } = usePWA();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          isOnline ? 'bg-emerald-400' : 'bg-amber-400',
          isOnline ? 'animate-pulse' : ''
        )}
      />
      {showLabel && (
        <span className={cn(
          'text-xs font-medium',
          isOnline ? 'text-emerald-400' : 'text-amber-400'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}

