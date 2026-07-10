import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
