'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with smooth fade transitions and prevents white flash
 * - Maintains layout stability during navigation
 * - Smooth opacity transitions between pages
 * - Prevents jarring content shifts
 */
export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Trigger transition state on route change
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94], // smooth easing
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
