"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Count shown on the button, e.g. unread notifications */
  badge?: number;
  /** Panel content. Receives `close` so links and actions can dismiss the menu. */
  render: (close: () => void) => React.ReactNode;
};

type BottomMenuProps = {
  items: BottomMenuItem[];
  /** Where the panel opens relative to the toolbar */
  placement?: "top" | "bottom";
  /** Panel alignment along the toolbar */
  align?: "center" | "end";
  className?: string;
};

/**
 * Morphing toolbar menu from 21st.dev: one panel that resizes and cross-fades between views.
 * Adapted for Sawa: items come from props, panel can open below (header) or above (dock),
 * Escape / outside click close it, buttons expose aria-expanded, and motion respects reduced-motion.
 * The panel content is measured in place (no hidden duplicate), so stateful content such as a search box renders once.
 */
export function BottomMenu({ items, placement = "top", align = "center", className }: BottomMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // offsetSize: measure layout size, not the scaled box, so the panel never settles too small mid-animation
  const [measureRef, bounds] = useMeasure({ offsetSize: true });
  const [view, setView] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const panelId = useId();
  const close = () => setView(null);

  useEffect(() => {
    if (!view) return;
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setView(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [view]);

  const active = items.find((i) => i.key === view);
  const below = placement === "bottom";

  return (
    <div ref={containerRef} className={cn("relative flex flex-col items-center", className)}>
      <AnimatePresence>
        {active && (
          <motion.div
            key="panel"
            id={panelId}
            role="dialog"
            aria-label={active.label}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.9, scaleX: 0.95, height: 0, width: 0 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1, height: bounds.height || "auto", width: bounds.width || "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.9, scaleX: 0.95, height: 0, width: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.3, ease: [0.45, 0, 0.25, 1] }}
            style={{ transformOrigin: `${align === "end" ? "right" : "center"} ${below ? "top" : "bottom"}` }}
            className={cn(
              "absolute z-50 overflow-hidden rounded-[20px] border border-white/90 bg-popover shadow-[0_24px_60px_-24px_rgba(18,18,23,.45)] backdrop-blur-xl",
              below ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]",
              align === "end" ? "end-0" : "left-1/2 -translate-x-1/2",
            )}
          >
            <div ref={measureRef} className="w-max">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={active.key}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
                  className="p-1.5"
                >
                  {active.render(close)}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div role="toolbar" className="glass glass-strong z-10 flex items-center gap-0.5 rounded-[20px] p-1">
        {items.map(({ key, label, icon: Icon, badge }) => {
          const on = view === key;
          return (
            <button
              key={key}
              type="button"
              aria-label={label}
              title={label}
              aria-expanded={on}
              aria-controls={on ? panelId : undefined}
              onClick={() => setView(on ? null : key)}
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-[16px] transition-colors sm:h-11 sm:w-11",
                on ? "bg-blue-500/12 text-blue-700" : "text-ink/70 hover:bg-white/80 hover:text-ink",
              )}
            >
              <Icon size={21} strokeWidth={2.1} aria-hidden />
              {badge ? (
                <span className="absolute end-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-pink-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Shared row style for links and buttons inside a BottomMenu panel. */
export const menuRow =
  "group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-start text-[15px] text-ink/80 transition-colors hover:bg-blue-50 hover:text-ink focus-visible:bg-blue-50";

export default BottomMenu;
