"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Bookmark, Check, Clock, Lock, MapPin, Users } from "lucide-react";
import { useStore, ageOf } from "@/lib/store";
import { useToast } from "./kit";
import { TYPE_LABEL, type Match } from "@/lib/match";
import type { Community } from "@/lib/types";

export const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export function SaveButton({ opId, dark = false }: { opId: string; dark?: boolean }) {
  const { state, me, toggleSave } = useStore();
  const toast = useToast();
  const on = (state.saved[me?.id ?? ""] ?? []).includes(opId);
  return (
    <motion.button whileTap={{ scale: 0.85 }} aria-pressed={on} aria-label={on ? "Remove from saved" : "Save opportunity"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(opId); toast(on ? "Removed from saved" : "Saved — it's on your calendar"); }}
      className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur transition ${dark ? "bg-black/70 text-white" : "bg-white/70"}`}>
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        <Bookmark size={17} fill={on ? "currentColor" : "none"} />
      </motion.span>
    </motion.button>
  );
}

/** Large opportunity card — Figma interest-card language: tinted glass, 3D object, clear facts. */
export function OppCard({ m, compact = false }: { m: Match; compact?: boolean }) {
  const o = m.o;
  return (
    <Link href={`/app/opportunities/${o.id}`} className={`group block shrink-0 ${compact ? "w-[236px]" : "w-full"}`}>
      <motion.article whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="glass relative overflow-hidden rounded-[26px]">
        <div className="relative h-[132px] overflow-hidden" style={{ background: `linear-gradient(180deg, ${o.tint ?? "#ddd"}cc 0%, ${o.tint ?? "#ddd"}55 100%)` }}>
          {o.photo ? (
            <><img src={o.photo} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /></>
          ) : o.image ? (
            <img src={o.image} alt="" className="absolute -bottom-3 right-3 h-[130px] w-[130px] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,.18)] transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <span className="absolute bottom-4 right-5 font-[family-name:var(--font-serif)] text-[44px] leading-none text-black/70">{TYPE_LABEL[o.type]}</span>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">{TYPE_LABEL[o.type]}</span>
          <span className="absolute bottom-3 left-3 rounded-full bg-[#121217] px-2.5 py-1 text-[12px] font-bold text-white">{m.score}% match</span>
          <div className="absolute right-3 top-3"><SaveButton opId={o.id} /></div>
        </div>
        <div className="p-3.5">
          <h3 className="line-clamp-2 font-semibold leading-snug">{o.titleEn}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {fmtShort(o.startsAt)}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {m.distance === 0 ? "Your school" : `${m.distance} km`}</span>
          </p>
          {!compact && m.reasons[0] && <p className="mt-2 text-xs font-medium text-iris-700">Why: {m.reasons.slice(0, 2).join(" · ")}</p>}
        </div>
      </motion.article>
    </Link>
  );
}

/** Community tile: photo-led, cross-school. */
export function CommunityTile({ c }: { c: Community }) {
  const { state, me, joinCommunity } = useStore();
  const toast = useToast();
  const locked = ageOf(me ?? undefined) < c.minAge;
  const joined = (state.joined[me?.id ?? ""] ?? []).includes(c.id);
  return (
    <Link href={`/app/communities/${c.id}`} className="block h-full">
      <motion.article whileTap={{ scale: 0.98 }} className="glass flex h-full flex-col overflow-hidden rounded-[24px]">
        <div className="relative h-[96px] shrink-0" style={{ background: c.tint }}>
          {c.photo && <img src={c.photo} alt="" className="h-full w-full object-cover" />}
          <span className="absolute start-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold"><MapPin size={10} /> {c.emirate}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-tight">{c.name}</h3>
          <p className="flex items-center gap-1 text-[11px] text-[var(--muted)]"><Users size={12} /> {c.schools ?? 1} schools · {c.members.toLocaleString()}</p>
          <div className="mt-auto pt-1">
            {locked ? (
              <span className="flex h-8 items-center justify-center gap-1 rounded-[18px] bg-white/45 text-xs font-bold text-[var(--muted)]"><Lock size={12} /> Opens at {c.minAge}</span>
            ) : joined ? (
              <span className="flex h-8 items-center justify-center gap-1 rounded-[18px] bg-white/60 text-xs font-bold"><Check size={13} /> Joined</span>
            ) : (
              <button onClick={(e) => { e.preventDefault(); joinCommunity(c.id); toast(`Joined ${c.name}`); }} className="h-8 w-full rounded-[18px] bg-[#121217] text-xs font-bold text-white transition active:scale-95">Join</button>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export function CommunityBadge({ c, size = 50 }: { c: Community; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white" style={{ width: size, height: size, background: c.tint ?? "#ddd", boxShadow: "inset 0 0 4px 2px rgba(0,0,0,.12), 0 4px 4px rgba(0,0,0,.12)" }}>
      {c.photo ? (
        <img src={c.photo} alt="" className="h-full w-full object-cover" />
      ) : c.image ? (
        <img src={c.image} alt="" className="h-[82%] w-[82%] object-contain" />
      ) : (
        <span className="font-[family-name:var(--font-serif)] font-normal text-black/75" style={{ fontSize: size * 0.5 }}>{c.name.replace(/^Al Noor /, "")[0]}</span>
      )}
    </span>
  );
}
