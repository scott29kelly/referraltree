'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Custom ease curve for smooth feel
const smoothEase = 'easeOut' as const;

// Smooth fade and slide animation variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

// Stagger children animation for content
const containerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.05,
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: smoothEase,
    },
  },
};

/**
 * PageTransition - Wraps page content with smooth enter/exit animations
 * Uses path as key to trigger animations on navigation
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * FadeIn - Simple fade-in animation on mount
 */
export function FadeIn({ 
  children, 
  className,
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.35, 
        delay,
        ease: smoothEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Staggers children animations
 */
export function StaggerContainer({ 
  children, 
  className,
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Individual stagger item (use inside StaggerContainer)
 */
export function StaggerItem({ 
  children, 
  className,
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Scale animation on mount (great for cards)
 */
export function ScaleIn({ 
  children, 
  className,
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.25, 
        delay,
        ease: smoothEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Slide in from a direction
 */
export function SlideIn({ 
  children, 
  className,
  direction = 'up',
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.35, 
        delay,
        ease: smoothEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
