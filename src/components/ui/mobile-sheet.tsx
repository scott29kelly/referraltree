'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

interface MobileSheetContentProps {
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface MobileSheetHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

interface MobileSheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileSheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileSheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

const maxHeightClasses = {
  sm: 'max-h-[40vh]',
  md: 'max-h-[60vh]',
  lg: 'max-h-[75vh]',
  xl: 'max-h-[85vh]',
  full: 'max-h-[95vh]',
};

/**
 * MobileSheet - Root component for bottom sheet
 */
function MobileSheet({
  open,
  onOpenChange,
  children,
  trigger,
}: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      {children}
    </Sheet>
  );
}

/**
 * MobileSheetContent - The actual sheet content with Guardian styling
 */
function MobileSheetContent({
  children,
  className,
  showHandle = true,
  showCloseButton = false,
  maxHeight = 'lg',
}: MobileSheetContentProps) {
  return (
    <SheetContent
      side="bottom"
      showCloseButton={showCloseButton}
      className={cn(
        // Remove default styles and apply Guardian styling
        'rounded-t-3xl border-t border-slate-700/50',
        'bg-gradient-to-b from-slate-900 to-slate-950',
        'shadow-2xl shadow-black/50',
        'p-0 gap-0',
        maxHeightClasses[maxHeight],
        className
      )}
    >
      {/* Handle Indicator */}
      {showHandle && (
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>
      )}
      {children}
      {/* iOS Safe Area */}
      <div className="h-safe-area-inset-bottom bg-slate-900" />
    </SheetContent>
  );
}

/**
 * MobileSheetHeader - Header section with title and optional close button
 */
function MobileSheetHeader({
  children,
  className,
  icon,
  onClose,
}: MobileSheetHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 pb-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/10 flex items-center justify-center border border-guardian-gold/20">
            {icon}
          </div>
        )}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/**
 * MobileSheetTitle - Title component
 */
function MobileSheetTitle({ children, className }: MobileSheetTitleProps) {
  return (
    <SheetTitle
      className={cn(
        'text-xl font-bold text-white tracking-tight',
        className
      )}
    >
      {children}
    </SheetTitle>
  );
}

/**
 * MobileSheetDescription - Description/subtitle component
 */
function MobileSheetDescription({
  children,
  className,
}: MobileSheetDescriptionProps) {
  return (
    <SheetDescription
      className={cn('text-sm text-slate-400', className)}
    >
      {children}
    </SheetDescription>
  );
}

/**
 * MobileSheetBody - Scrollable body content
 */
function MobileSheetBody({ children, className }: MobileSheetBodyProps) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto px-6 pb-6',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MobileSheetFooter - Fixed footer for actions
 */
function MobileSheetFooter({ children, className }: MobileSheetFooterProps) {
  return (
    <div
      className={cn(
        'px-6 pb-6 pt-4 border-t border-slate-700/50 bg-slate-900/50',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MobileSheetClose - Close button wrapper
 */
function MobileSheetClose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SheetClose asChild className={className}>
      {children}
    </SheetClose>
  );
}

// Pre-built action buttons for common use cases
interface MobileSheetActionsProps {
  primaryLabel?: string;
  primaryAction?: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  primaryVariant?: 'gold' | 'emerald' | 'default';
  secondaryLabel?: string;
  secondaryAction?: () => void;
  className?: string;
}

function MobileSheetActions({
  primaryLabel = 'Confirm',
  primaryAction,
  primaryLoading = false,
  primaryDisabled = false,
  primaryVariant = 'gold',
  secondaryLabel = 'Cancel',
  secondaryAction,
  className,
}: MobileSheetActionsProps) {
  return (
    <MobileSheetFooter className={className}>
      <div className="flex gap-3">
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction}
            className="flex-1 py-3 rounded-xl bg-slate-800/80 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/80"
          >
            {secondaryLabel}
          </Button>
        )}
        <Button
          variant={primaryVariant}
          onClick={primaryAction}
          disabled={primaryDisabled || primaryLoading}
          className="flex-1 py-3 rounded-xl"
        >
          {primaryLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : (
            primaryLabel
          )}
        </Button>
      </div>
    </MobileSheetFooter>
  );
}

export {
  MobileSheet,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetTitle,
  MobileSheetDescription,
  MobileSheetBody,
  MobileSheetFooter,
  MobileSheetClose,
  MobileSheetActions,
};
