"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Small count shown on the icon, e.g. pending approvals */
  badge?: number;
};

const LABEL_WIDTH = 76;

type BottomNavBarProps = {
  items: BottomNavItem[];
  /** Index of the current page; -1 when none matches */
  activeIndex: number;
  className?: string;
  stickyBottom?: boolean;
};

/**
 * Pill navigation from 21st.dev: the active tab expands to show its label.
 * Adapted for Sawa: real links (Next.js), aria-current, badges, brand colours, RTL and reduced motion.
 */
export function BottomNavBar({ items, activeIndex, className, stickyBottom = false }: BottomNavBarProps) {
  const reduce = useReducedMotion();
  return (
    <motion.nav
      initial={reduce ? false : { scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      aria-label="Main"
      className={cn(
        "glass glass-strong flex h-[60px] min-w-[300px] max-w-[95vw] items-center gap-1 rounded-full p-2",
        stickyBottom && "fixed inset-x-0 bottom-4 z-40 mx-auto w-fit",
        className,
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-11 min-w-11 items-center rounded-full px-3 transition-colors duration-200",
              isActive
                ? "bg-blue-500/12 text-blue-700"
                : "text-ink/70 hover:bg-white/70 hover:text-ink",
            )}
          >
            <motion.span whileTap={{ scale: 0.92 }} className="relative grid place-items-center">
              <Icon size={22} strokeWidth={2.1} aria-hidden />
              {item.badge ? (
                <span className="absolute -end-2 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {item.badge}
                </span>
              ) : null}
            </motion.span>
            <motion.span
              initial={false}
              animate={{ width: isActive ? LABEL_WIDTH : 0, opacity: isActive ? 1 : 0, marginInlineStart: isActive ? 8 : 0 }}
              transition={reduce ? { duration: 0 } : { width: { type: "spring", stiffness: 350, damping: 32 }, opacity: { duration: 0.19 }, marginInlineStart: { duration: 0.19 } }}
              className="flex items-center overflow-hidden"
              aria-hidden
            >
              <span className="truncate whitespace-nowrap text-[13px] font-semibold leading-none" title={item.label}>
                {item.label}
              </span>
            </motion.span>
          </Link>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
