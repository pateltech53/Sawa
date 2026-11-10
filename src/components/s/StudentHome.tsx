"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, animate } from "motion/react";
import { ArrowRight, Check, ChevronRight, KeyRound, Lock, LockOpen, Maximize2, Play, ShieldCheck, Sparkles, ThumbsUp } from "lucide-react";
import { FlowButton } from "@/components/ui/flow-button";
import { EASE, SectionHead, useToast } from "./kit";
import { Mascot } from "@/components/ui";
import { CommunityBadge, OppCard } from "./cards";
import { addDays, sameDay, startOfDay, useAgenda, type AgendaItem } from "@/lib/agenda";
import { COMMUNITIES, OPPORTUNITIES } from "@/lib/seed";
import { rankOpportunities } from "@/lib/match";
import { ageOf, useStore } from "@/lib/store";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

export function StudentHome() {
  const { state, me } = useStore();
  const { items, classroomConnected } = useAgenda();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  if (!me) return null;

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const open = items.filter((i) => !i.done && new Date(i.at) >= addDays(today, -1) && new Date(i.at) < weekEnd);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const dayItems = items.filter((i) => sameDay(new Date(i.at), day));
  const joined = COMMUNITIES.filter((c) => (state.joined[me.id] ?? []).includes(c.id));
  const matches = rankOpportunities(me, OPPORTUNITIES).filter((m) => m.score > 20).slice(0, 6);

  const needs = open.slice(0, 6);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <div className="min-w-0 space-y-5">
        {/* greeting */}
        <section className="glass glass-strong relative overflow-hidden rounded-[30px] p-5">
          <div className="pe-28">
            <p className="text-sm font-medium text-[var(--muted)]">{greeting()}, {me.name}</p>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.1] tracking-tight">
              <motion.span key={open.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="inline-block">{open.length}</motion.span> things need you this week
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">From {new Set(open.map((i) => i.source)).size || 1} sources, in one place</p>
          </div>
          <div className="pointer-events-none absolute -bottom-2 end-1"><Mascot size={118} /></div>
        </section>

        {/* weekly overview */}
        <section className="glass rounded-[28px] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="section-title">This week</h2>
              <p className="text-xs text-[var(--muted)]">{today.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
            </div>
            <Link href="/app/calendar" className="btn-ghost !min-h-9 !px-3 text-sm" aria-label="Open full calendar"><Maximize2 size={14} /> Calendar</Link>
          </div>
          <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Days">
            {days.map((d) => {
              const sel = sameDay(d, day);
              const n = items.filter((i) => sameDay(new Date(i.at), d) && !i.done);
              return (
                <button key={d.toISOString()} role="tab" aria-selected={sel} onClick={() => setDay(d)} className="relative flex h-[68px] flex-col items-center justify-center rounded-2xl">
                  {sel && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-[#121217]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className={`relative text-[10px] font-semibold uppercase leading-none ${sel ? "text-white/70" : "text-[var(--muted)]"}`}>{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                  <span className={`relative mt-1 text-lg font-bold leading-none ${sel ? "text-white" : ""}`}>{d.getDate()}</span>
                  <span className="relative mt-1.5 flex h-1.5 justify-center gap-0.5">{n.slice(0, 3).map((i) => <span key={i.id} className="h-1.5 w-1.5 rounded-full" style={{ background: sel ? "#fff" : i.color }} />)}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.ul key={day.toISOString()} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }} className="mt-3 space-y-1.5">
              {dayItems.length === 0 ? (
                <li className="rounded-2xl bg-white/40 px-3 py-3 text-sm text-[var(--muted)]">Nothing on {sameDay(day, today) ? "today" : day.toLocaleDateString("en-GB", { weekday: "long" })}.</li>
              ) : dayItems.map((i) => <AgendaRow key={i.id} i={i} />)}
            </motion.ul>
          </AnimatePresence>
        </section>

        {/* what needs you: clickable task cards */}
        <section>
          <SectionHead title="Needs you this week" action={<Link href="/app/calendar" className="link-info">See all</Link>} />
          {needs.length === 0 ? <p className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">You&apos;re all caught up.</p> : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {needs.map((i, k) => (
                <motion.li key={i.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04, ease: EASE }}><TaskCard i={i} /></motion.li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="min-w-0 space-y-5">
        <ClassroomCard connected={classroomConnected} items={items} />

        {/* matched opportunities */}
        <section>
          <SectionHead title="Matched for you" action={<Link href="/app/explore" className="link-info">See all</Link>} />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0" style={{ scrollSnapType: "x mandatory" }}>
            {matches.map((m, i) => (
              <motion.div key={m.o.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ease: EASE }} style={{ scrollSnapAlign: "start" }}>
                <OppCard m={m} compact />
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex justify-center"><FlowButton text="Explore all opportunities" href="/app/explore" size="sm" /></div>
        </section>

        {/* your communities: cross-school, as photo cards */}
        <section>
          <SectionHead title="Your communities" action={<Link href="/app/communities" className="link-info">Find more</Link>} />
          {joined.length === 0 ? (
            <Link href="/app/communities" className="glass flex items-center gap-3 rounded-[22px] p-4 text-sm"><Sparkles size={18} /> Join a community with students from other schools</Link>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5">
              {joined.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link href={`/app/communities/${c.id}`} className="group relative block h-[120px] overflow-hidden rounded-[22px]">
                    {c.photo ? <img src={c.photo} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <span className="absolute inset-0" style={{ background: c.tint }} />}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <span className="absolute inset-x-3 bottom-2.5 text-white"><span className="block text-sm font-bold leading-tight">{c.name}</span><span className="block text-[11px] text-white/80">{c.schools ?? 1} schools · {c.online ?? 0} online</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FeedGate />
      </div>
    </div>
  );
}

/** "Needs you" card: big tap target, colour-coded by source, check to complete. */
function TaskCard({ i }: { i: AgendaItem }) {
  const toast = useToast();
  const due = new Date(i.at);
  const inner = (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: i.color }}>{i.source}</span>
      <span className={`line-clamp-2 font-semibold leading-snug ${i.done ? "line-through opacity-50" : ""}`}>{i.title}</span>
      <span className="mt-1 text-xs text-[var(--muted)]">{due.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {due.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
    </span>
  );
  return (
    <div className="glass flex h-full items-start gap-3 rounded-[22px] p-3.5 transition hover:bg-white/60">
      {i.toggle ? (
        <button onClick={() => { i.toggle!(); if (!i.done) toast("Marked done"); }} aria-label={i.done ? "Mark not done" : "Mark done"} aria-pressed={i.done}
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${i.done ? "border-[#121217] bg-[#121217] text-white" : "border-black/25 hover:border-black"}`}>
          {i.done && <Check size={14} strokeWidth={3} />}
        </button>
      ) : (
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: `${i.color}22`, color: i.color }} title={`Mark done in ${i.source}`}><ChevronRight size={14} className="rtl:rotate-180" /></span>
      )}
      {i.href ? <Link href={i.href} className="flex min-w-0 flex-1 items-start gap-2">{inner}<ChevronRight size={16} className="mt-1 shrink-0 opacity-40 rtl:rotate-180" /></Link> : inner}
    </div>
  );
}

export function AgendaRow({ i, glass = false }: { i: AgendaItem; glass?: boolean }) {
  const toast = useToast();
  const body = (
    <>
      <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: i.color }} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${i.done ? "line-through opacity-50" : ""}`}>{i.title}</span>
        <span className="block truncate text-xs text-[var(--muted)]">{i.source} · {new Date(i.at).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
      </span>
    </>
  );
  return (
    <li className={`flex items-center gap-3 rounded-[20px] px-3 py-2.5 ${glass ? "glass" : "bg-white/45"}`}>
      {i.toggle ? (
        <button onClick={() => { i.toggle!(); if (!i.done) toast("Marked done"); }} aria-label={i.done ? "Mark not done" : "Mark done"} aria-pressed={i.done}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${i.done ? "border-[#121217] bg-[#121217] text-white" : "border-black/25 hover:border-black"}`}>
          {i.done && <Check size={14} strokeWidth={3} />}
        </button>
      ) : null}
      {i.href ? <Link href={i.href} className="flex min-w-0 flex-1 items-center gap-3">{body}<ChevronRight size={16} className="shrink-0 opacity-40 rtl:rotate-180" /></Link> : <span className="flex min-w-0 flex-1 items-center gap-3">{body}</span>}
    </li>
  );
}

function ClassroomCard({ connected, items }: { connected: boolean; items: AgendaItem[] }) {
  const gc = items.filter((i) => i.source === "Google Classroom" && !i.done);
  return (
    <Link href="/app/connections" className="block">
      <motion.section whileTap={{ scale: 0.99 }} className="glass flex items-center gap-3 rounded-[24px] p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2E9E6B] text-lg font-bold text-white">GC</span>
        <div className="min-w-0 flex-1">
          {connected ? (
            <>
              <p className="font-semibold">Google Classroom · {gc.length} due</p>
              <p className="truncate text-xs text-[var(--muted)]">{gc[0] ? `Next: ${gc[0].title}` : "Nothing due"} · demo connection</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Bring in your Google Classroom</p>
              <p className="text-xs text-[var(--muted)]">See assignments here and on your calendar</p>
            </>
          )}
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${connected ? "bg-[#2E9E6B]/15 text-[#1F7A50]" : "bg-[#121217] text-white"}`}>{connected ? "Connected" : "Connect"}</span>
      </motion.section>
    </Link>
  );
}

/* ── Figma "Feed Gate": one mindful feed session a day, unlocked by swiping ── */
function FeedGate() {
  const { state, me, unlockFeed, toggleHelpful } = useStore();
  const reduce = useReducedMotion();
  const unlocked = me ? state.feedUnlockedOn[me.id] === new Date().toDateString() : false;
  const [opening, setOpening] = useState(false);
  const x = useMotionValue(0);
  const TRACK = 220;
  const fill = useTransform(x, [0, TRACK], ["0%", "100%"]);
  const labelOpacity = useTransform(x, [0, TRACK * 0.6], [1, 0]);

  const posts = useMemo(() => {
    if (!me) return [];
    const joined = state.joined[me.id] ?? [];
    return state.posts.filter((p) => p.status === "approved" && joined.includes(p.communityId)).slice(0, 6);
  }, [state.posts, state.joined, me]);
  if (!me) return null;
  const u15 = ageOf(me) < 15;

  const release = () => {
    if (x.get() > TRACK * 0.85) {
      animate(x, TRACK, { duration: 0.15 });
      setOpening(true);
      setTimeout(() => { unlockFeed(); setOpening(false); }, reduce ? 50 : 900);
    } else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
  };

  if (unlocked) {
    return (
      <section>
        <SectionHead title="Community highlights" action={<span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><ShieldCheck size={12} /> Moderated</span>} />
        <ul className="space-y-2.5">
          {posts.length === 0 && <li className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">Join a community to see highlights here.</li>}
          {posts.map((p, i) => {
            const c = COMMUNITIES.find((x) => x.id === p.communityId)!;
            const helped = (state.helpfulBy[p.id] ?? []).includes(me.id);
            return (
              <motion.li key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease: EASE }} className="glass rounded-[24px] p-4">
                <div className="flex items-center gap-2.5">
                  <CommunityBadge c={c} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-[var(--muted)]">{p.author} · {p.role === "teacher" ? "Teacher" : p.role === "moderator" ? "Moderator" : "Member"}</p>
                  </div>
                  {p.kind === "announcement" && <span className="rounded-full bg-[#121217] px-2 py-0.5 text-[10px] font-bold uppercase text-white">Notice</span>}
                </div>
                <p className="mt-2.5 text-[15px] leading-relaxed">{p.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={() => toggleHelpful(p.id)} aria-pressed={helped} className={`chip ${helped ? "!bg-[#121217] !text-white" : ""}`}><ThumbsUp size={13} /> Helpful</button>
                  <Link href={`/app/communities/${c.id}`} className="link-info inline-flex items-center gap-1">Open <ArrowRight size={13} /></Link>
                </div>
              </motion.li>
            );
          })}
        </ul>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">That&apos;s today&apos;s session. No endless scroll, no follower counts.</p>
      </section>
    );
  }

  return (
    <section aria-label="Community highlights (locked)" className="relative pb-2 pt-3">
      <div className="relative mx-auto h-[250px] max-w-[360px]">
        <div className="absolute inset-x-6 top-5 h-[220px] rounded-[26px] border border-white/70 bg-white/25" />
        <div className="absolute inset-x-3 top-2.5 h-[230px] rounded-[26px] border border-white/70 bg-white/35" />
        <motion.div className="absolute inset-0 overflow-hidden rounded-[28px] border-[1.5px] border-white/90 bg-white/55 backdrop-blur-xl" style={{ boxShadow: "0 24px 50px rgba(115,77,230,.22)" }}
          animate={opening ? { scale: 0.96, opacity: 0.6 } : { scale: 1, opacity: 1 }}>
          <div aria-hidden className="absolute right-6 top-10 h-[190px] w-[190px] rounded-full opacity-50" style={{ background: "linear-gradient(90deg,#80C6F2,#4DA5F2)", filter: "blur(30px)" }} />
          <span className="absolute right-4 top-4 rounded-full border border-black/15 bg-white/70 px-3 py-1 text-[13px] font-semibold">{posts.length}/{posts.length || 0}</span>
          <h2 className="absolute left-6 top-10 text-[34px] font-bold leading-[1.15] tracking-tight">BEGIN<br />FEED?</h2>
          <span className="absolute bottom-5 left-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#121217]/90 px-4 text-[13px] font-semibold tracking-wide text-white"><KeyRound size={18} className="text-[#FFD27A]" /> KEY ×1</span>
          <motion.div className="absolute right-8 top-[70px]" animate={opening && !reduce ? { rotate: [-20, 10, 0], y: [0, -8, 0] } : {}} transition={{ duration: 0.6 }}>
            <span className="grid h-[96px] w-[96px] place-items-center rounded-[22px] text-white" style={{ background: "linear-gradient(180deg,#80CEF2 0%,#4D68F2 100%)", boxShadow: "0 12px 24px rgba(115,77,242,.45)", border: "1.5px solid rgba(255,255,255,.6)" }}>
              {opening ? <LockOpen size={44} /> : <Lock size={44} />}
            </span>
          </motion.div>
        </motion.div>
      </div>
      <div className="relative mx-auto mt-5 h-[60px] w-[280px] overflow-hidden rounded-[30px] bg-[#121217]/20 shadow-[0_12px_26px_rgba(77,51,204,.3)]">
        <motion.div className="absolute inset-y-0 left-0" style={{ width: fill, background: "linear-gradient(90deg,#9DBDF2,#2260D5)" }} />
        <motion.span style={{ opacity: labelOpacity }} className="pointer-events-none absolute inset-0 grid place-items-center ps-10 text-[18px] font-semibold tracking-[2px] text-white">UNLOCK</motion.span>
        <motion.button drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: TRACK }} dragElastic={0} dragMomentum={false} style={{ x }} onDragEnd={release}
          onClick={() => { if (reduce) { setOpening(true); setTimeout(() => { unlockFeed(); setOpening(false); }, 50); } }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); animate(x, TRACK, { duration: 0.3 }); setOpening(true); setTimeout(() => { unlockFeed(); setOpening(false); }, 600); } }}
          aria-label="Slide to open today's community highlights"
          className="absolute left-[10px] top-[10px] grid h-10 w-10 cursor-grab place-items-center rounded-full text-white active:cursor-grabbing" >
          <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "linear-gradient(90deg,#80B1F2,#4D84F2)", boxShadow: "inset 2px 0 5.8px rgba(0,0,0,.25)" }}><Play size={16} fill="currentColor" /></span>
        </motion.button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--muted)]"><Sparkles size={12} /> One short, moderated session a day{u15 ? " · school clubs only" : ""}</p>
    </section>
  );
}
