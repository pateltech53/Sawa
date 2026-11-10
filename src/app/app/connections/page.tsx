"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CircleSlash, Eye, Info, Loader2, RefreshCw, Unplug } from "lucide-react";
import { EASE, Sheet, spring, useToast } from "@/components/s/kit";
import { CLASSROOM_COURSES, CLASSROOM_WORK } from "@/lib/seed";
import { useStore } from "@/lib/store";

const APPS = [
  { key: "gclassroom", name: "Google Classroom", short: "GC", color: "#2E9E6B", desc: "Classes, assignments and due dates", demo: true },
  { key: "managebac", name: "ManageBac", short: "MB", color: "#D9822B", desc: "Not used at your school", unavailable: true },
  { key: "lms", name: "Smart Learning Portal", short: "LMS", color: "#5185DE", desc: "Connected through your school login", viaSchool: true },
  { key: "minhaji", name: "Minhaji e-books", short: "MH", color: "#8C59F2", desc: "Connected through your school login", viaSchool: true },
] as const;

const STATUS: Record<string, [string, string]> = {
  assigned: ["Assigned", "bg-[#5185DE]/12 text-[#2d5aa8]"], submitted: ["Turned in", "bg-[#2E9E6B]/15 text-[#1F7A50]"],
  returned: ["Returned", "bg-black/8 text-[var(--ink-2)]"], missing: ["Missing", "bg-[#D0453B]/12 text-[#a3271f]"],
};

export default function Connections() {
  const { state, me, connectIntegration, disconnectIntegration } = useStore();
  const toast = useToast();
  const [flow, setFlow] = useState<null | string>(null);
  if (!me) return null;
  const connected = state.integrations[me.id] ?? {};
  const gc = connected.gclassroom;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/app/profile" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/45"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">School apps</h1>
          <p className="text-sm text-[var(--muted)]">One place for the systems your school already uses.</p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {APPS.map((a) => {
          const on = "viaSchool" in a || Boolean(connected[a.key]);
          return (
            <li key={a.key} className="glass flex items-center gap-3 rounded-[24px] p-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white" style={{ background: a.color }}>{a.short}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{a.name}</span>
                <span className="block text-xs text-[var(--muted)]">{"viaSchool" in a ? a.desc : on ? `Connected (demo) · ${new Date(connected[a.key].connectedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : a.desc}</span>
              </span>
              {"viaSchool" in a ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2E9E6B]/15 px-3 py-1.5 text-xs font-bold text-[#1F7A50]"><Check size={12} /> On</span>
              ) : "unavailable" in a ? (
                <span className="rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">Not available</span>
              ) : on ? (
                <button className="btn-ghost !min-h-9 !px-3 text-xs" onClick={() => { disconnectIntegration(a.key); toast(`${a.name} disconnected — its items were removed`); }}><Unplug size={13} /> Disconnect</button>
              ) : (
                <button className="btn-ink !min-h-9 !px-4 text-xs" onClick={() => setFlow(a.key)}>Connect</button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-2 rounded-2xl bg-white/40 p-3 text-xs text-[var(--muted)]"><Info size={13} className="mt-0.5 shrink-0" /> Prototype: connections use sample data and never sign in to a real Google or ManageBac account. In the pilot, the school administrator approves each app.</p>

      <AnimatePresence>
        {gc && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="section-title">Your classes</h2>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><RefreshCw size={11} /> Synced just now (demo)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CLASSROOM_COURSES.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-[20px] bg-white/55">
                  <div className="h-2" style={{ background: c.color }} />
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight">{c.name}</p>
                    <p className="text-xs text-[var(--muted)]">{c.teacher} · {c.room}</p>
                    <p className="mt-1.5 text-xs font-semibold">{CLASSROOM_WORK.filter((w) => w.courseId === c.id && w.status === "assigned").length} to do</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <h2 className="section-title px-1 pt-2">Classwork</h2>
            <ul className="space-y-2">
              {[...CLASSROOM_WORK].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).map((w) => {
                const c = CLASSROOM_COURSES.find((x) => x.id === w.courseId)!;
                const [label, cls] = STATUS[w.status];
                return (
                  <li key={w.id} className="glass flex items-center gap-3 rounded-[20px] px-3 py-2.5">
                    <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{w.title}</span>
                      <span className="block truncate text-xs text-[var(--muted)]">{c.name} · due {new Date(w.dueAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}{w.grade ? ` · ${w.grade}` : ""}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{label}</span>
                  </li>
                );
              })}
            </ul>
            <p className="px-1 text-xs text-[var(--muted)]">Assignments also appear on your Home and Calendar. To submit work, open Classroom — Sawa reads, it never submits for you.</p>
          </motion.section>
        )}
      </AnimatePresence>

      <ConnectFlow appKey={flow} onClose={() => setFlow(null)} onConnected={(k, n) => { connectIntegration(k); toast(`${n} connected (demo)`); }} />
    </div>
  );
}

function ConnectFlow({ appKey, onClose, onConnected }: { appKey: string | null; onClose: () => void; onConnected: (k: string, name: string) => void }) {
  const app = APPS.find((a) => a.key === appKey);
  const [stage, setStage] = useState<"consent" | "sync" | "done">("consent");
  const [synced, setSynced] = useState(0);
  useEffect(() => { if (appKey) { setStage("consent"); setSynced(0); } }, [appKey]);
  useEffect(() => {
    if (stage !== "sync") return;
    const id = setInterval(() => setSynced((s) => { if (s >= CLASSROOM_COURSES.length) { clearInterval(id); return s; } return s + 1; }), 420);
    return () => clearInterval(id);
  }, [stage]);
  useEffect(() => { if (stage === "sync" && synced >= CLASSROOM_COURSES.length) { const t = setTimeout(() => { setStage("done"); if (app) onConnected(app.key, app.name); }, 450); return () => clearTimeout(t); } }, [stage, synced, app, onConnected]);
  if (!app) return null;
  return (
    <Sheet open={!!appKey} onClose={onClose} title={stage === "done" ? "All set" : `Connect ${app.name}`}>
      <AnimatePresence mode="wait">
        {stage === "consent" && (
          <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE }} className="space-y-3">
            <span className="inline-flex rounded-full bg-[#B68A35]/15 px-3 py-1 text-xs font-bold text-[#7d5d1f]">Demo connection · sample data</span>
            <div className="rounded-[20px] bg-white p-4">
              <p className="mb-2 flex items-center gap-2 font-semibold"><Eye size={16} /> Sawa will be able to read</p>
              <ul className="space-y-1.5 text-sm">{["Your class names and teachers", "Assignments and due dates", "Whether work is turned in or returned"].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="shrink-0 text-[#2E9E6B]" /> {t}</li>)}</ul>
            </div>
            <div className="rounded-[20px] bg-white p-4">
              <p className="mb-2 flex items-center gap-2 font-semibold"><CircleSlash size={16} /> Sawa will never</p>
              <ul className="space-y-1.5 text-sm text-[var(--ink-2)]">{["Submit or edit your work", "Post in your classes", "See other students' work or grades"].map((t) => <li key={t}>· {t}</li>)}</ul>
            </div>
            <p className="text-xs text-[var(--muted)]">You can disconnect any time; Sawa then deletes the copied items.</p>
            <button className="btn-ink w-full" onClick={() => setStage("sync")}>Allow and connect</button>
          </motion.div>
        )}
        {stage === "sync" && (
          <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 py-2">
            <p className="flex items-center gap-2 font-semibold"><Loader2 size={18} className="animate-spin" /> Syncing your classes…</p>
            <ul className="space-y-2">
              {CLASSROOM_COURSES.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0.35 }} animate={{ opacity: i < synced ? 1 : 0.35 }} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  {i < synced ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}><Check size={16} className="text-[#2E9E6B]" /></motion.span> : <span className="h-4 w-4 rounded-full border-2 border-black/15" />}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
        {stage === "done" && (
          <motion.div key="d" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#2E9E6B] text-white"><Check size={30} strokeWidth={3} /></motion.span>
            <p className="text-[15px]">{CLASSROOM_COURSES.length} classes and {CLASSROOM_WORK.length} assignments are now on your Home and Calendar.</p>
            <button className="btn-ink w-full" onClick={onClose}>View my classes</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}
