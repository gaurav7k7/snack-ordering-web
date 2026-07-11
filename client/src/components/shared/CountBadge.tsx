import { motion, useReducedMotion } from 'framer-motion';

export function CountBadge({ count }: { count: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (count <= 0) return null;

  return (
    <motion.span
      key={count}
      initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
    >
      {count}
    </motion.span>
  );
}
