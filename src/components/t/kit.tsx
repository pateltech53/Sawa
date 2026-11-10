"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Sheet } from "@/components/s/kit";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const useAr = () => useStore().state.lang === "ar";

/** Shared panel surface for the teacher workspace (t-card on the silk background). */
export function Panel({ children, className = "", as: As = "section", ...rest }: { children: React.ReactNode; className?: string; as?: "section" | "div" | "article" | "li" } & React.HTMLAttributes<HTMLElement>) {
  return <As className={cn("t-card p-4 sm:p-5", className)} {...rest}>{children}</As>;
}

export function PanelHead({ title, sub, action, id }: { title: string; sub?: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-[17px] font-bold tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-grey">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHead({ title, sub, right, eyebrow }: { title: string; sub?: string; right?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="label-xs mb-1">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-grey">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/** Data provenance label. Quiet by design: a coloured dot and a word. */
export function SourceBadge({ status, label }: { status: "live" | "mock" | "sample" | "awaiting" | "imported"; label?: string }) {
  const ar = useAr();
  const map = {
    live: { dot: "bg-aegreen-600", en: "Live", ar: "مباشر" },
    imported: { dot: "bg-aegreen-600", en: "Official data", ar: "بيانات رسمية" },
    mock: { dot: "bg-sawa", en: "Simulated", ar: "محاكاة" },
    sample: { dot: "bg-aegold-500", en: "Sample", ar: "عينة" },
    awaiting: { dot: "bg-zinc-400", en: "Not connected", ar: "غير متصل" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/50 px-2 py-0.5 text-[11px] font-semibold text-grey">
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} aria-hidden /> {label ?? (ar ? map.ar : map.en)}
    </span>
  );
}

export function Stat({ value, label, tone = "ink", href }: { value: React.ReactNode; label: string; tone?: "ink" | "blue" | "green" | "red"; href?: string }) {
  const tones = { ink: "text-ink", blue: "text-sawa", green: "text-aegreen-700", red: "text-aered-600" };
  const inner = (
    <>
      <span className={cn("block text-[26px] font-bold leading-none tracking-tight tabular-nums", tones[tone])}>{value}</span>
      <span className="mt-1.5 block text-[12px] font-medium leading-tight text-grey">{label}</span>
    </>
  );
  const cls = "block t-row p-3.5";
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

/** Segmented tabs with a sliding indicator. */
export function Tabs<T extends string>({ tabs, value, onChange, className = "", label }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; label: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div role="tablist" aria-label={label} className={cn("lg no-scrollbar flex gap-1 overflow-x-auto !rounded-full p-1.5", className)}>
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button key={t.id} role="tab" aria-selected={active} type="button" onClick={() => onChange(t.id)}
            className={cn("relative flex-none whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", active ? "text-white" : "text-ink/65 hover:text-ink")}>
            {active && <motion.span layoutId={`tab-${id}`} className="lg lg-dark absolute inset-0 !rounded-full" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30, mass: 0.9 }} />}
            <span className="relative flex items-center gap-1.5">
              {t.label}
              {t.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/20" : "bg-black/5")}>{t.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="t-card flex flex-col items-center px-5 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-ink/70"><Icon size={22} /></span>
      <p className="mt-3 font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-grey">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} aria-hidden />;
}

/** Confirmation before any consequential action (sending to students, submitting to the school, etc.). */
export function useConfirm() {
  const [req, setReq] = useState<{ title: string; body: React.ReactNode; confirm: string; run: () => void } | null>(null);
  const ar = useAr();
  const ui = (
    <Sheet open={!!req} onClose={() => setReq(null)} title={req?.title}>
      <div className="space-y-4">
        <div className="text-[15px] text-[var(--ink-2)]">{req?.body}</div>
        <div className="flex gap-2">
          <button className="btn-ghost !bg-white" onClick={() => setReq(null)}>{ar ? "إلغاء" : "Cancel"}</button>
          <button className="btn-ink flex-1" onClick={() => { req?.run(); setReq(null); }}>{req?.confirm}</button>
        </div>
      </div>
    </Sheet>
  );
  return { ask: setReq, ui };
}

export function Meter({ value, max = 100, color = "var(--blue)", label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/8" role="meter" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

export function Initials({ name, size = 36, color }: { name: string; size?: number; color?: string }) {
  const initials = name.replace(/\(.*?\)/g, "").replace(/^(Mr|Ms|Mrs|Dr)\s+/, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full border-2 border-white font-bold text-ink" style={{ width: size, height: size, fontSize: size * 0.36, background: color ?? `hsl(${hue} 35% 87%)` }}>
      {initials}
    </span>
  );
}
