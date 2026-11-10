"use client";

import { motion, useReducedMotion } from "motion/react";

/** Page transition for every in-app screen. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
