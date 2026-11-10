"use client";

// Shared notice pieces for parent and teacher home screens.
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { Card, Pill, SourceTag } from "@/components/ui";
import { fmtDate, relDays, t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Notice } from "@/lib/types";

/** Gold-edged proactive alert with "Why am I seeing this?" (F5). */
export function ProactiveCard({ n }: { n: Notice }) {
  const { state } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const [why, setWhy] = useState(false);
  return (
    <Card strong className="relative overflow-hidden border-aegold-300!" as="article">
      <div className="absolute inset-y-0 start-0 w-1.5 bg-aegold-500" />
      <div className="flex items-start gap-3">
        <span className="jelly h-10 w-10 shrink-0 rounded-xl"><Sparkles size={18} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><SourceTag source="Sawa" /><Pill tone="gold">{ar ? "استباقي" : "Proactive"}</Pill></div>
          <h2 className="mt-1.5 font-bold leading-snug">{ar ? n.titleAr : n.titleEn}</h2>
          <p className="mt-1 text-sm text-[var(--ink-2)]">{ar ? n.bodyAr : n.bodyEn}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {n.action && <Link href={n.action.href} className="btn-ink !min-h-10 text-sm">{ar ? n.action.labelAr : n.action.labelEn} <ArrowRight size={16} className="rtl:rotate-180" /></Link>}
            {n.reasonEn && (
              <button className="btn-ghost !min-h-10 text-sm" aria-expanded={why} onClick={() => setWhy(!why)}>
                {t(L, "whySee")} <ChevronDown size={14} className={why ? "rotate-180" : ""} />
              </button>
            )}
          </div>
          {why && <p className="mt-2 rounded-2xl bg-white/70 p-3 text-xs text-[var(--ink-2)] pop">{ar ? n.reasonAr : n.reasonEn}</p>}
        </div>
      </div>
    </Card>
  );
}

export function Row({ n, onToggle }: { n: Notice; onToggle: () => void }) {
  const { state, me, myChildren } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const done = n.status === "done";
  const forChild = me?.role === "parent" && n.userId !== me.id ? myChildren.find((c) => c.id === n.userId) : undefined;
  return (
    <li className={`glass flex items-start gap-3 rounded-3xl p-3.5 transition ${done ? "opacity-55" : ""}`}>
      <button onClick={onToggle} aria-label={done ? t(L, "done") : t(L, "markDone")} className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${done ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}>
        {done && <Check size={15} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceTag source={n.sourceSystem} />
          {n.priority === 1 && !done && <Pill tone="red">{ar ? "عاجل" : "Urgent"}</Pill>}
          {forChild && <Pill>{ar ? forChild.nameAr : forChild.name}</Pill>}
        </div>
        <p className={`mt-1 font-semibold leading-snug ${done ? "line-through" : ""}`}>{ar ? n.titleAr : n.titleEn}</p>
        <p className="whitespace-pre-line text-sm text-[var(--muted)]">{ar ? n.bodyAr : n.bodyEn}</p>
        {n.action && <Link className="mt-1 inline-block text-sm font-semibold underline" href={n.action.href}>{ar ? n.action.labelAr : n.action.labelEn}</Link>}
      </div>
      {n.dueAt && <span className="shrink-0 text-end text-xs font-semibold text-[var(--ink-2)]">{relDays(n.dueAt, L)}<br /><span className="font-normal text-[var(--muted)]">{fmtDate(n.dueAt, L)}</span></span>}
    </li>
  );
}
