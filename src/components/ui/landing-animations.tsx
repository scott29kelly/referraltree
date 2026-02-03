'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// AnimatedText - Word-by-word or character-by-character reveal
// ============================================================================

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  mode?: 'words' | 'characters';
  once?: boolean;
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  staggerDelay = 0.05,
  mode = 'words',
  once = true,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const items = mode === 'words' ? text.split(' ') : text.split('');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex flex-wrap', className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
          style={{ marginRight: mode === 'words' ? '0.25em' : undefined }}
        >
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================================================
// AnimatedCounter - Counting number animation
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  className,
  duration = 2,
  delay = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000,
  });
  const displayValue = useTransform(springValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (v) => {
      setDisplay(v);
    });
    return unsubscribe;
  }, [displayValue]);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        motionValue.set(value);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasAnimated, motionValue, value, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================================================
// GradientMesh - Animated SVG gradient background
// ============================================================================

interface GradientMeshProps {
  className?: string;
  colors?: string[];
}

export function GradientMesh({
  className,
  colors = ['#D4A656', '#10b981', '#0ea5e9', '#8b5cf6'],
}: GradientMeshProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="mesh-gradient-1" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3">
              <animate
                attributeName="stop-opacity"
                values="0.3;0.5;0.3"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-gradient-2" cx="70%" cy="60%" r="40%">
            <stop offset="0%" stopColor={colors[1]} stopOpacity="0.25">
              <animate
                attributeName="stop-opacity"
                values="0.25;0.4;0.25"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-gradient-3" cx="80%" cy="20%" r="35%">
            <stop offset="0%" stopColor={colors[2]} stopOpacity="0.2">
              <animate
                attributeName="stop-opacity"
                values="0.2;0.35;0.2"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-gradient-4" cx="20%" cy="80%" r="45%">
            <stop offset="0%" stopColor={colors[3]} stopOpacity="0.15">
              <animate
                attributeName="stop-opacity"
                values="0.15;0.3;0.15"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors[3]} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Animated circles with gradient fills */}
        <circle cx="300" cy="300" r="400" fill="url(#mesh-gradient-1)">
          <animate
            attributeName="cx"
            values="300;350;300"
            dur="8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="300;250;300"
            dur="10s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="700" cy="600" r="350" fill="url(#mesh-gradient-2)">
          <animate
            attributeName="cx"
            values="700;650;700"
            dur="9s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="600;650;600"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="800" cy="200" r="300" fill="url(#mesh-gradient-3)">
          <animate
            attributeName="cx"
            values="800;750;800"
            dur="11s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="800" r="380" fill="url(#mesh-gradient-4)">
          <animate
            attributeName="cy"
            values="800;750;800"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      
      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ============================================================================
// ScrollReveal - whileInView wrapper
// ============================================================================

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 30,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// BentoCard - Asymmetric card with hover effects
// ============================================================================

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'wide';
  color?: 'gold' | 'emerald' | 'sky' | 'purple' | 'neutral';
  delay?: number;
  interactive?: boolean;
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
  large: 'col-span-1 row-span-2 md:col-span-2 md:row-span-2',
  wide: 'col-span-1 md:col-span-2 row-span-1',
};

const colorClasses = {
  gold: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40',
  sky: 'from-sky-500/10 to-sky-500/5 border-sky-500/20 hover:border-sky-500/40',
  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40',
  neutral: 'from-slate-500/10 to-slate-500/5 border-slate-500/20 hover:border-slate-500/40',
};

const glowClasses = {
  gold: 'group-hover:shadow-amber-500/20',
  emerald: 'group-hover:shadow-emerald-500/20',
  sky: 'group-hover:shadow-sky-500/20',
  purple: 'group-hover:shadow-purple-500/20',
  neutral: 'group-hover:shadow-slate-500/10',
};

export function BentoCard({
  children,
  className,
  size = 'medium',
  color = 'neutral',
  delay = 0,
  interactive = true,
}: BentoCardProps) {
  return (
    <ScrollReveal delay={delay} className={cn(sizeClasses[size], className)}>
      <motion.div
        className={cn(
          'group relative h-full rounded-2xl md:rounded-3xl',
          'bg-gradient-to-br border backdrop-blur-sm',
          'transition-all duration-500',
          colorClasses[color],
          interactive && [
            'cursor-pointer',
            'hover:scale-[1.02]',
            'shadow-xl shadow-black/20',
            glowClasses[color],
            'group-hover:shadow-2xl',
          ]
        )}
        whileHover={interactive ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="relative h-full p-5 md:p-6 lg:p-8 overflow-hidden">
          {children}
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

// ============================================================================
// FloatingElement - Parallax floating decoration
// ============================================================================

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export function FloatingElement({
  children,
  className,
  speed = 1,
  direction = 'up',
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const movement = (scrollProgress - 0.5) * 100 * speed * (direction === 'down' ? -1 : 1);
        setOffset(movement);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ y: offset }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// GlowButton - Enhanced CTA button with glow effect
// ============================================================================

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'gold' | 'emerald';
  onClick?: () => void;
  href?: string;
  as?: 'button' | 'a';
}

export function GlowButton({
  children,
  className,
  variant = 'gold',
  onClick,
  href,
  as = 'button',
}: GlowButtonProps) {
  const gradients = {
    gold: 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500',
  };

  const glows = {
    gold: 'shadow-amber-500/30 hover:shadow-amber-500/50',
    emerald: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
  };

  const Component = as === 'a' ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'px-6 py-4 rounded-xl font-semibold text-white',
        'bg-gradient-to-r transition-all duration-300',
        'shadow-lg',
        gradients[variant],
        glows[variant],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// TrustBadge - Small pill badge for social proof
// ============================================================================

interface TrustBadgeProps {
  children: ReactNode;
  className?: string;
}

export function TrustBadge({ children, className }: TrustBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-slate-800/80 border border-slate-700/50',
        'text-sm text-slate-300 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// AnimatedIcon - Icon with subtle pulse/bounce animation
// ============================================================================

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  animation?: 'pulse' | 'bounce' | 'float';
}

export function AnimatedIcon({
  children,
  className,
  animation = 'float',
}: AnimatedIconProps) {
  const animations = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    bounce: {
      y: [0, -8, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    float: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  return (
    <motion.div className={className} animate={animations[animation]}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// StepConnector - Animated line between steps
// ============================================================================

interface StepConnectorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function StepConnector({
  className,
  orientation = 'horizontal',
}: StepConnectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        orientation === 'horizontal' ? 'w-full h-px' : 'w-px h-full',
        className
      )}
    >
      <motion.div
        className={cn(
          'absolute bg-gradient-to-r from-amber-500/50 via-amber-400/80 to-amber-500/50',
          orientation === 'horizontal' ? 'h-full w-full' : 'w-full h-full'
        )}
        initial={{ scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 }}
        animate={isInView ? { scaleX: 1, scaleY: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}
