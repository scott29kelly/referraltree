'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'slideScale';
  direction?: 'up' | 'down' | 'left' | 'right';
  blur?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

// Custom ease curve for smooth feel
const smoothEase = [0.25, 0.1, 0.25, 1] as const;

// Create page transition variants dynamically based on options
const createPageVariants = (
  variant: 'fade' | 'slide' | 'scale' | 'slideScale',
  direction: 'up' | 'down' | 'left' | 'right',
  blur: boolean
): Variants => {
  const directionOffset = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
  };

  const exitOffset = {
    up: { y: -12 },
    down: { y: 12 },
    left: { x: -12 },
    right: { x: 12 },
  };

  const baseInitial = {
    opacity: 0,
    filter: blur ? 'blur(8px)' : 'blur(0px)',
  };

  const baseEnter = {
    opacity: 1,
    filter: 'blur(0px)',
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      filter: { duration: 0.3 },
    },
  };

  const baseExit = {
    opacity: 0,
    filter: blur ? 'blur(4px)' : 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: smoothEase,
    },
  };

  switch (variant) {
    case 'fade':
      return {
        initial: baseInitial,
        enter: baseEnter,
        exit: baseExit,
      };

    case 'slide':
      return {
        initial: { ...baseInitial, ...directionOffset[direction] },
        enter: baseEnter,
        exit: { ...baseExit, ...exitOffset[direction] },
      };

    case 'scale':
      return {
        initial: { ...baseInitial, scale: 0.95 },
        enter: baseEnter,
        exit: { ...baseExit, scale: 0.98 },
      };

    case 'slideScale':
    default:
      return {
        initial: { ...baseInitial, ...directionOffset[direction], scale: 0.98 },
        enter: baseEnter,
        exit: { ...baseExit, ...exitOffset[direction], scale: 0.99 },
      };
  }
};

// Create stagger container variants with configurable delay
const createContainerVariants = (staggerDelay: number): Variants => ({
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: staggerDelay,
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: staggerDelay / 2,
      staggerDirection: -1,
      duration: 0.15,
    },
  },
});

// Child variants for staggered animations with blur effect
const childVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(4px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

// Legacy item variants (backward compatibility)
const itemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: smoothEase },
  },
};

/**
 * PageTransition - Wraps page content with smooth enter/exit animations
 * Uses path as key to trigger animations on navigation
 *
 * @param variant - Animation type: 'fade', 'slide', 'scale', or 'slideScale' (default)
 * @param direction - Direction for slide animations: 'up', 'down', 'left', 'right'
 * @param blur - Enable subtle blur effect during transitions (default: true)
 * @param staggerChildren - Enable staggered children animations
 * @param staggerDelay - Delay between staggered children (default: 0.05)
 */
export function PageTransition({
  children,
  className,
  variant = 'slideScale',
  direction = 'up',
  blur = true,
  staggerChildren = false,
  staggerDelay = 0.05,
}: PageTransitionProps) {
  const pathname = usePathname();

  if (staggerChildren) {
    const containerVariants = createContainerVariants(staggerDelay);

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={containerVariants}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  const pageVariants = createPageVariants(variant, direction, blur);

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
 * TransitionChild - Individual stagger item for PageTransition with staggerChildren
 */
export function TransitionChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - Simple fade-in animation on mount with optional blur
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  blur?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: blur ? 'blur(4px)' : 'blur(0px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.35,
        delay,
        ease: smoothEase,
        filter: { duration: 0.25, delay },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Staggers children animations with configurable delay
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const containerVariants = createContainerVariants(staggerDelay);

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
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Scale animation on mount with optional blur (great for cards)
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  blur?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: blur ? 'blur(4px)' : 'blur(0px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: blur ? 'blur(2px)' : 'blur(0px)' }}
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
 * SlideIn - Slide in from a direction with exit animation and optional blur
 */
export function SlideIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  blur?: boolean;
}) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  const exitOffset = {
    up: { y: -10 },
    down: { y: 10 },
    left: { x: -10 },
    right: { x: 10 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: blur ? 'blur(4px)' : 'blur(0px)', ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: blur ? 'blur(2px)' : 'blur(0px)', ...exitOffset[direction] }}
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
 * BlurIn - Fade in with prominent blur effect (great for modals/overlays)
 */
export function BlurIn({
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
      initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.99 }}
      transition={{
        duration: 0.4,
        delay,
        ease: smoothEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
