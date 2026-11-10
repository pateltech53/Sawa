"use client";

import { MotionConfig } from "motion/react";
import { StoreProvider } from "@/lib/store";

/** App-wide client providers. MotionConfig makes every motion animation honour the OS reduced-motion setting. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>{children}</StoreProvider>
    </MotionConfig>
  );
}
