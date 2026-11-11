"use client";

// An Ask Sawa task in the chat: the plan as steps, one confirm, then each step ticks
// off and the result appears in place, with a link if there's more to see.
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import type { AgentTask } from "@/lib/agent-tasks";

export function TaskCard({ task, ar }: { task: AgentTask; ar: boolean }) {
  const [phase, setPhase] = useState<"ready" | "running" | "done" | "dismissed">("ready");
  const [step, setStep] = useState(-1);
  const [out, setOut] = useState<{ result: string; href?: string; linkLabel?: string } | null>(null);

  const go = () => {
    setPhase("running");
    task.steps.forEach((_, i) => setTimeout(() => setStep(i), 350 * (i + 1)));
    setTimeout(() => { setOut(task.run()); setStep(task.steps.length); setPhase("done"); }, 350 * (task.steps.length + 1));
  };

  return (
    <div className="w-full max-w-[92%] rounded-[24px] rounded-es-md bg-white/95 p-4 text-[#121217] shadow-[0_16px_34px_-18px_rgba(0,0,0,.6)]">
      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#5C29BF]"><Sparkles size={12} /> {ar ? "سوا · مهمة" : "Sawa · task"}</p>
      <p className="text-[17px] font-semibold leading-snug">{task.title}</p>
      {task.summary && <p className="mt-0.5 text-sm text-[var(--muted)]">{task.summary}</p>}

      {task.steps.length > 0 && !task.blocked && (
        <ol className="mt-3 space-y-1.5">
          {task.steps.map((s, i) => {
            const state = phase === "ready" ? "todo" : step >= i ? "done" : step === i - 1 ? "doing" : "todo";
            return (
              <li key={s.label} className="flex items-center gap-2.5">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${state === "done" ? "bg-[#1F7A50] text-white" : "bg-black/8"}`}>
                  {state === "done" ? <Check size={12} strokeWidth={3} /> : state === "doing" ? <Loader2 size={12} className="animate-spin" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm">{s.label}<span className="text-xs text-[var(--muted)]"> · {s.system}</span></span>
              </li>
            );
          })}
        </ol>
      )}

      {task.blocked ? (
        <div className="mt-3 rounded-[16px] bg-[#B68A35]/12 p-3 text-sm">
          <p className="flex gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#7d5d1f]" /> {task.blocked.reason}</p>
          {task.blocked.fix && <Link href={task.blocked.fix.href} className="btn-ink mt-2.5 !min-h-9 text-sm">{task.blocked.fix.label} <ArrowRight size={15} className="rtl:rotate-180" /></Link>}
        </div>
      ) : phase === "ready" ? (
        <div className="mt-3 flex gap-2">
          <button className="btn-ink flex-1 !min-h-10 text-sm" onClick={go}>{task.confirm}</button>
          <button className="btn-ghost !min-h-10 !bg-white text-sm" onClick={() => setPhase("dismissed")}>{ar ? "ليس الآن" : "Not now"}</button>
        </div>
      ) : phase === "dismissed" ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{ar ? "حسناً، لم يتغير شيء." : "OK — nothing was changed."}</p>
      ) : phase === "done" && out ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-[16px] bg-[#1F7A50]/10 p-3 text-sm">
          <p className="flex gap-2 font-medium"><Check size={16} className="mt-0.5 shrink-0 text-[#1F7A50]" strokeWidth={3} /> {out.result}</p>
          {out.href && <Link href={out.href} className="mt-2 inline-flex items-center gap-1 font-semibold text-[#2c58e6]">{out.linkLabel} <ArrowRight size={14} className="rtl:rotate-180" /></Link>}
        </motion.div>
      ) : null}
      <p className="mt-2 text-[10px] text-[var(--muted)]">{ar ? "ينفّذ سوا فقط بعد تأكيدك · محاكاة" : "Sawa only acts after you confirm · simulated systems"}</p>
    </div>
  );
}
