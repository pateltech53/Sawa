"use client";

import { MotionConfig } from "motion/react";
import { StoreProvider } from "@/lib/store";
import { DomTranslator } from "@/components/shell/DomTranslator";

/** App-wide client providers. MotionConfig makes every motion animation honour the OS reduced-motion setting. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>{children}<DomTranslator /></StoreProvider>
    </MotionConfig>
  );
}
