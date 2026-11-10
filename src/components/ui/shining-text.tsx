"use client";

// ShiningText (21st.dev): a light sweep across text. Colours are props so it works on
// the purple Ask Sawa stage; static under reduced motion.
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function ShiningText({ text, className, base = "#c9b6f7", shine = "#ffffff" }: { text: string; className?: string; base?: string; shine?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={cn("inline-block bg-[length:200%_100%] bg-clip-text font-medium text-transparent", className)}
      style={{ backgroundImage: `linear-gradient(110deg, ${base} 35%, ${shine} 50%, ${base} 75%, ${base})` }}
      initial={{ backgroundPosition: "200% 0" }}
      animate={reduce ? undefined : { backgroundPosition: "-200% 0" }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    >
      {text}
    </motion.span>
  );
}

export default ShiningText;
