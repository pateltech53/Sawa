"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Bell, Check, ChevronLeft, ChevronRight, ExternalLink, Plus } from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { addDays, KIND_COLOR, sameDay, startOfDay, startOfWeek, useAgenda, type AgendaItem } from "@/lib/agenda";
import { useStore } from "@/lib/store";

type View = "month" | "week" | "agenda";
const LEGEND: [string, string][] = [["Schoolwork", KIND_COLOR.assignment], ["Exams", KIND_COLOR.exam], ["Events", KIND_COLOR.event], ["Opportunities", KIND_COLOR.opportunity], ["Communities", KIND_COLOR.community], ["Reminders", KIND_COLOR.reminder]];

export default function CalendarPage() {
  const { items } = useAgenda();
  const { addReminder } = useStore();
  const toast = useToast();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [dir, setDir] = useState(0);
  const [open, setOpen] = useState<AgendaItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const today = startOfDay(new Date());

  const move = (d: number) => {
    setDir(d);
    const c = new Date(cursor);
    if (view === "month") c.setMonth(c.getMonth() + d, 1);
    else c.setDate(c.getDate() + d * 7);
    setCursor(c);
  };

  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)), [cursor]);
  const on = (d: Date) => items.filter((i) => sameDay(new Date(i.at), d));
  const dayList = on(selected);
  const upcoming = items.filter((i) => new Date(i.at) >= today);
  const title_ = view === "month" ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${weekDays[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDays[6].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/app/today" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/45"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
        <h1 className="flex-1 text-[26px] font-bold tracking-tight">Calendar</h1>
        <button className="btn-ink !min-h-10 !px-4 text-sm" onClick={() => setAdding(true)}><Plus size={16} /> Reminder</button>
      </div>

      <div className="glass flex rounded-full p-1" role="tablist" aria-label="Calendar view">
        {(["month", "week", "agenda"] as View[]).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className="relative flex-1 rounded-full py-2 text-sm font-semibold capitalize">
            {view === v && <motion.span layoutId="cal-tab" className="absolute inset-0 rounded-full bg-[#121217]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className={`relative ${view === v ? "text-white" : ""}`}>{v}</span>
          </button>
        ))}
      </div>

      {view !== "agenda" && (
        <section className="glass overflow-hidden rounded-[28px] p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => move(-1)} aria-label="Previous" className="grid h-9 w-9 place-items-center rounded-full bg-white/60"><ChevronLeft size={18} className="rtl:rotate-180" /></button>
            <div className="text-center">
              <p className="font-semibold" aria-live="polite">{title_}</p>
              {!sameDay(cursor, today) && <button className="text-xs font-semibold text-[#3b6fca]" onClick={() => { setCursor(today); setSelected(today); }}>Today</button>}
            </div>
            <button onClick={() => move(1)} aria-label="Next" className="grid h-9 w-9 place-items-center rounded-full bg-white/60"><ChevronRight size={18} className="rtl:rotate-180" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-[var(--muted)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div key={`${view}-${cursor.toDateString()}`} custom={dir}
              initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-7 gap-1" role="grid">
              {(view === "month" ? monthDays : weekDays).map((d) => {
                const list = on(d);
                const sel = sameDay(d, selected);
                const out = view === "month" && d.getMonth() !== cursor.getMonth();
                return (
                  <button key={d.toISOString()} role="gridcell" aria-selected={sel} aria-label={`${d.toDateString()}, ${list.length} items`} onClick={() => setSelected(d)}
                    className={`relative flex flex-col items-center rounded-2xl ${view === "week" ? "py-3" : "py-1.5"} ${out ? "opacity-35" : ""}`}>
                    {sel && <motion.span layoutId="cal-sel" className="absolute inset-0 rounded-2xl bg-[#121217]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className={`relative text-[15px] font-semibold ${sel ? "text-white" : sameDay(d, today) ? "text-[#3b6fca]" : ""}`}>{d.getDate()}</span>
                    <span className="relative mt-1 flex h-1.5 gap-0.5">{list.slice(0, 3).map((i) => <span key={i.id} className="h-1.5 w-1.5 rounded-full" style={{ background: sel ? "#fff" : i.color, opacity: i.done ? 0.35 : 1 }} />)}</span>
                    {view === "week" && <span className={`relative mt-1 text-[10px] ${sel ? "text-white/70" : "text-[var(--muted)]"}`}>{list.length || ""}</span>}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {LEGEND.map(([l, c]) => <span key={l} className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</span>)}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-2 px-1">{view === "agenda" ? "Upcoming" : selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</h2>
        <AnimatePresence mode="wait">
          <motion.ul key={view === "agenda" ? "agenda" : selected.toDateString()} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            {(view === "agenda" ? upcoming : dayList).map((i, k) => (
              <li key={i.id}>
                {view === "agenda" && (k === 0 || !sameDay(new Date(upcoming[k - 1].at), new Date(i.at))) && (
                  <p className="label-xs mb-1.5 mt-3 px-1">{new Date(i.at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}</p>
                )}
                <button onClick={() => setOpen(i)} className="glass flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-start">
                  <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: i.color }} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-semibold ${i.done ? "line-through opacity-50" : ""}`}>{i.title}</span>
                    <span className="block truncate text-xs text-[var(--muted)]">{new Date(i.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {i.source}</span>
                  </span>
                  {i.done && <Check size={16} className="text-[#2E9E6B]" />}
                </button>
              </li>
            ))}
            {(view === "agenda" ? upcoming : dayList).length === 0 && <li className="glass rounded-[20px] p-4 text-sm text-[var(--muted)]">Nothing scheduled.</li>}
          </motion.ul>
        </AnimatePresence>
      </section>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title}>
        {open && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="chip !bg-white"><span className="h-2 w-2 rounded-full" style={{ background: open.color }} />{open.source}</span>
              <span className="chip !bg-white">{new Date(open.at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {open.detail && <p className="whitespace-pre-line text-[15px] text-[var(--ink-2)]">{open.detail}</p>}
            <div className="grid gap-2 pt-1">
              {open.toggle && <button className="btn-ink" onClick={() => { open.toggle!(); toast(open.done ? "Marked not done" : "Marked done"); setOpen(null); }}><Check size={16} /> {open.done ? "Mark not done" : "Mark done"}</button>}
              {open.href && <Link href={open.href} className="btn-ghost !bg-white"><ExternalLink size={16} /> Open</Link>}
              <button className="btn-ghost !bg-white" onClick={() => { const at = new Date(new Date(open.at).getTime() - 86_400_000); addReminder(`Prepare: ${open.title}`, (at > new Date() ? at : new Date(Date.now() + 3_600_000)).toISOString(), open.href); toast("Reminder set for the day before"); setOpen(null); }}><Bell size={16} /> Remind me the day before</button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New reminder">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; const d = new Date(selected); d.setHours(16, 0, 0, 0); addReminder(title.trim(), d.toISOString()); toast("Reminder added"); setTitle(""); setAdding(false); }}>
          <label className="block text-sm font-semibold">On {selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })} at 4pm
            <input autoFocus className="input mt-1 !bg-white" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Pack robotics kit" />
          </label>
          <button className="btn-ink w-full" disabled={!title.trim()}>Add reminder</button>
        </form>
      </Sheet>
    </div>
  );
}
