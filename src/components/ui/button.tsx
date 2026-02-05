'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // Guardian Brand Variants
        gold: 'bg-guardian-gold text-guardian-navy font-semibold hover:bg-guardian-gold/90 shadow-lg shadow-guardian-gold/25 focus-visible:ring-guardian-gold/50',
        emerald:
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25',
        'emerald-outline':
          'border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500',
        // Premium Button Variants
        gradient:
          'btn-gradient-animated text-white font-semibold shadow-lg hover:shadow-xl focus-visible:ring-guardian-blue/50',
        glow: 'bg-guardian-blue text-white font-medium btn-glow-ring shadow-lg shadow-guardian-blue/30 focus-visible:ring-guardian-blue/50',
        'outline-glow':
          'border-2 border-guardian-blue/60 text-guardian-lightBlue bg-transparent hover:border-guardian-blue btn-outline-glow hover:bg-guardian-blue/10 focus-visible:ring-guardian-blue/50',
        navy: 'bg-gradient-to-br from-guardian-navy to-guardian-blue text-white font-semibold shadow-lg shadow-guardian-navy/30 hover:from-guardian-blue hover:to-guardian-navy focus-visible:ring-guardian-navy/50',
        premium:
          'btn-premium bg-gradient-to-r from-guardian-gold via-yellow-400 to-guardian-gold text-guardian-navy font-bold shadow-lg shadow-guardian-gold/40 focus-visible:ring-guardian-gold/50 relative overflow-hidden',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': 'size-6 rounded-md [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Ripple animation interface
interface RippleProps {
  x: number;
  y: number;
  id: number;
}

// Glow colors based on variant for the pulse effect
const glowColors: Record<string, string> = {
  default: 'rgba(255, 255, 255, 0.35)',
  destructive: 'rgba(239, 68, 68, 0.4)',
  outline: 'rgba(255, 255, 255, 0.2)',
  secondary: 'rgba(255, 255, 255, 0.25)',
  ghost: 'rgba(255, 255, 255, 0.15)',
  link: 'transparent',
  gold: 'rgba(255, 193, 7, 0.5)',
  emerald: 'rgba(16, 185, 129, 0.45)',
  'emerald-outline': 'rgba(16, 185, 129, 0.3)',
  gradient: 'rgba(59, 130, 246, 0.4)',
  glow: 'rgba(59, 130, 246, 0.5)',
  'outline-glow': 'rgba(59, 130, 246, 0.35)',
  navy: 'rgba(30, 58, 138, 0.45)',
  premium: 'rgba(255, 193, 7, 0.55)',
};

// Ripple colors based on variant
const rippleColors: Record<string, string> = {
  default: 'rgba(255, 255, 255, 0.35)',
  destructive: 'rgba(255, 255, 255, 0.3)',
  outline: 'rgba(100, 100, 100, 0.2)',
  secondary: 'rgba(255, 255, 255, 0.25)',
  ghost: 'rgba(150, 150, 150, 0.2)',
  link: 'transparent',
  gold: 'rgba(255, 255, 255, 0.4)',
  emerald: 'rgba(255, 255, 255, 0.35)',
  'emerald-outline': 'rgba(16, 185, 129, 0.3)',
  gradient: 'rgba(255, 255, 255, 0.35)',
  glow: 'rgba(255, 255, 255, 0.35)',
  'outline-glow': 'rgba(59, 130, 246, 0.3)',
  navy: 'rgba(255, 255, 255, 0.3)',
  premium: 'rgba(255, 255, 255, 0.5)',
};

interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  magnetic?: boolean;
  enableRipple?: boolean;
  enableGlow?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  loadingText,
  magnetic = false,
  enableRipple = true,
  enableGlow = true,
  children,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isLinkVariant = variant === 'link';

  // Ripple effect state
  const [ripples, setRipples] = React.useState<RippleProps[]>([]);
  const rippleIdRef = React.useRef(0);

  // Interaction states for animations
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Magnetic hover effect state
  const [magneticPosition, setMagneticPosition] = React.useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle ripple effect on click
  const handleRippleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableRipple && !isLinkVariant && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = rippleIdRef.current++;

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation completes
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    },
    [enableRipple, isLinkVariant, onClick]
  );

  // Magnetic effect handler
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) * 0.15;
      const y = (e.clientY - centerY) * 0.15;
      setMagneticPosition({ x, y });
    },
    [magnetic]
  );

  // Interaction handlers
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = React.useCallback(() => {
    setIsPressed(false);
    setIsHovered(false);
    if (magnetic) {
      setMagneticPosition({ x: 0, y: 0 });
    }
  }, [magnetic]);

  // Render shine overlay for premium variant
  const renderShineOverlay = variant === 'premium' && (
    <span className="btn-shine absolute inset-0 pointer-events-none" />
  );

  const glowColor = glowColors[variant || 'default'];
  const rippleColor = rippleColors[variant || 'default'];

  // If using asChild, render the Slot component without motion wrapper
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {renderShineOverlay}
            {children}
          </>
        )}
      </Slot>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size, className }),
        'relative overflow-hidden'
      )}
      disabled={isDisabled}
      onClick={handleRippleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Framer Motion animations
      initial={false}
      animate={{
        scale: isPressed && !isLinkVariant ? 0.97 : isHovered && !isLinkVariant ? 1.02 : 1,
        x: magnetic ? magneticPosition.x : 0,
        y: magnetic ? magneticPosition.y : 0,
        boxShadow:
          enableGlow && isHovered && !isLinkVariant
            ? `0 0 20px 2px ${glowColor}, 0 4px 15px -3px ${glowColor}`
            : '0 0 0px 0px transparent',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      }}
      whileTap={!isLinkVariant ? { scale: 0.97 } : undefined}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {/* Ripple effect container */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              backgroundColor: rippleColor,
            }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 250, height: 250, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Glow pulse effect overlay */}
      {enableGlow && !isLinkVariant && (
        <motion.span
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 12px 0px ${glowColor}`
              : 'inset 0 0 0px 0px transparent',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}

      {/* Pressed state overlay */}
      {!isLinkVariant && (
        <motion.span
          className="absolute inset-0 rounded-[inherit] pointer-events-none bg-black/0"
          initial={false}
          animate={{
            backgroundColor: isPressed ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)',
          }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Button content */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {renderShineOverlay}
            {children}
          </>
        )}
      </span>
    </motion.button>
  );
}

export { Button, buttonVariants };
