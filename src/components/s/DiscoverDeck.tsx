"use client";

// Opportunities "Discover": a swipeable photo card stack (pattern from 21st.dev
// ImageSwiper, rebuilt on motion so cards carry real content). Swipe right or tap
// the bookmark to save, left to skip, tap the card to open. Arrow keys work too.
import { uiLocale } from "@/lib/tr";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { Bookmark, Clock, Info, MapPin, RotateCcw, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "./kit";
import { TYPE_LABEL, type Match } from "@/lib/match";

export function DiscoverDeck({ matches }: { matches: Match[] }) {
  const { state, me, toggleSave } = useStore();
  const toast = useToast();
  const [idx, setIdx] = useState(0);
  const [exitDir, setExitDir] = useState<1 | -1>(1);
  const saved = state.saved[me?.id ?? ""] ?? [];
  const deck = matches.slice(idx, idx + 3);

  const decide = (dir: 1 | -1) => {
    const m = matches[idx];
    if (!m) return;
    setExitDir(dir);
    if (dir === 1 && !saved.includes(m.o.id)) { toggleSave(m.o.id); toast("Saved — it's on your calendar"); }
    setIdx((i) => i + 1);
  };

  return (
    <div className="mx-auto w-full max-w-[400px]" onKeyDown={(e) => { if (e.key === "ArrowRight") decide(1); if (e.key === "ArrowLeft") decide(-1); }}>
      <div className="relative h-[460px]" role="region" aria-label="Discover opportunities. Use left and right arrow keys to skip or save." tabIndex={0}>
        <AnimatePresence custom={exitDir}>
          {deck.length === 0 && (
            <motion.div key="end" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass absolute inset-0 grid place-items-center rounded-[30px] p-6 text-center">
              <div>
                <p className="text-lg font-bold">You&apos;ve seen them all</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{saved.length} saved. Check the Saved filter or start again.</p>
                <button className="btn-ink mt-4" onClick={() => setIdx(0)}><RotateCcw size={16} /> Start again</button>
              </div>
            </motion.div>
          )}
          {deck.map((m, i) => <DeckCard key={m.o.id} m={m} depth={i} onDecide={decide} />).reverse()}
        </AnimatePresence>
      </div>
      {deck.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={() => decide(-1)} aria-label="Skip" className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_10px_24px_-12px_rgba(18,18,23,.5)] transition active:scale-90"><X size={24} /></button>
          <Link href={`/app/opportunities/${matches[idx].o.id}`} aria-label="Open details" className="grid h-12 w-12 place-items-center rounded-full bg-white/70 transition active:scale-90"><Info size={20} /></Link>
          <button onClick={() => decide(1)} aria-label="Save" className="grid h-14 w-14 place-items-center rounded-full bg-[#121217] text-white shadow-[0_10px_24px_-10px_rgba(18,18,23,.7)] transition active:scale-90"><Bookmark size={22} /></button>
        </div>
      )}
      <p className="mt-2 text-center text-xs text-[var(--muted)]">{Math.min(idx + 1, matches.length)} of {matches.length} · swipe right to save, left to skip</p>
    </div>
  );
}

function DeckCard({ m, depth, onDecide }: { m: Match; depth: number; onDecide: (d: 1 | -1) => void }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const saveOpacity = useTransform(x, [30, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, -30], [1, 0]);
  const top = depth === 0;
  const onEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 600) onDecide(1);
    else if (info.offset.x < -110 || info.velocity.x < -600) onDecide(-1);
  };
  const o = m.o;
  return (
    <motion.article
      className="absolute inset-0 overflow-hidden rounded-[30px] bg-[#121217] text-white shadow-[0_24px_50px_-24px_rgba(18,18,23,.8)]"
      style={{ x: top ? x : 0, rotate: top ? rotate : 0, zIndex: 10 - depth, touchAction: "pan-y" }}
      initial={{ scale: 0.92, y: 22, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: 1 }}
      variants={{ out: (dir: 1 | -1) => ({ x: dir * 420, rotate: dir * 18, opacity: 0, transition: { duration: reduce ? 0 : 0.32 } }) }}
      exit="out"
      drag={top ? "x" : false}
      dragSnapToOrigin
      onDragEnd={onEnd}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      aria-hidden={!top}
    >
      {o.photo ? <img src={o.photo} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" /> : <div className="absolute inset-0" style={{ background: o.tint }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
      {top && <motion.span style={{ opacity: saveOpacity }} className="absolute start-5 top-5 rotate-[-10deg] rounded-xl border-2 border-white px-3 py-1 text-lg font-extrabold tracking-wide">SAVE</motion.span>}
      {top && <motion.span style={{ opacity: skipOpacity }} className="absolute end-5 top-5 rotate-[10deg] rounded-xl border-2 border-white/80 px-3 py-1 text-lg font-extrabold tracking-wide text-white/90">SKIP</motion.span>}
      <span className="absolute end-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold text-[#121217]">{m.score}%</span>
      <div className="absolute inset-x-5 bottom-5">
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">{TYPE_LABEL[o.type]}</span>
        <h3 className="mt-2 text-2xl font-bold leading-tight">{o.titleEn}</h3>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-white/80"><span className="inline-flex items-center gap-1"><Clock size={13} />{new Date(o.startsAt).toLocaleDateString(uiLocale(), { weekday: "short", day: "numeric", month: "short" })}</span><span className="inline-flex items-center gap-1"><MapPin size={13} />{m.distance === 0 ? "Your school" : `${m.distance} km`}</span></p>
        {m.reasons[0] && <p className="mt-2 text-sm text-white/90">Why: {m.reasons.slice(0, 2).join(" · ")}</p>}
        {o.source && <p className="mt-2 text-[11px] text-white/60">Modelled on {o.source} · sample</p>}
      </div>
    </motion.article>
  );
}
