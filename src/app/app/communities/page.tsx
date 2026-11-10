"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Lock, Search, ShieldCheck } from "lucide-react";
import { CommunityBadge, CommunityTile } from "@/components/s/cards";
import { EASE, useToast } from "@/components/s/kit";
import { COMMUNITIES, COMMUNITY_ACTIVITIES } from "@/lib/seed";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/hooks/use-debounce";
import { ageOf, useStore } from "@/lib/store";

const CATS = [["all", "All"], ["near", "Near me"], ["clubs", "School clubs"], ["stem", "STEM"], ["creative", "Creative"], ["sports", "Sports"], ["leadership", "Leadership"]] as const;

export default function Communities() {
  const { state, me, joinCommunity } = useStore();
  const toast = useToast();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  // filter after typing pauses, so the animated list doesn't reshuffle on every keystroke
  const dq = useDebounce(q.trim().toLowerCase(), 250);
  if (!me) return null;
  const age = ageOf(me);
  const joined = state.joined[me.id] ?? [];
  const matchesInterest = (c: (typeof COMMUNITIES)[number]) => c.interests.some((i) => me.interests.includes(i));
  const list = COMMUNITIES
    .filter((c) => cat === "all" || (cat === "near" ? c.emirate === "Dubai" : c.category === cat))
    .filter((c) => !dq || `${c.name} ${c.interests.join(" ")}`.toLowerCase().includes(dq))
    .sort((a, b) => Number(matchesInterest(b)) - Number(matchesInterest(a)) || Number(age >= b.minAge) - Number(age >= a.minAge));
  const featured = COMMUNITIES.filter((c) => age >= c.minAge && matchesInterest(c) && !joined.includes(c.id))[0] ?? COMMUNITIES.find((c) => age >= c.minAge)!;
  const next = COMMUNITY_ACTIVITIES.filter((a) => a.communityId === featured.id).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const mine = COMMUNITIES.filter((c) => joined.includes(c.id));

  return (
    <div className="space-y-4">
      <h1 className="text-[28px] font-bold tracking-tight">Communities</h1>
      <label className="relative block">
        <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 opacity-50" aria-hidden />
        <Input type="search" className="ps-11" placeholder="Search communities" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search communities" />
      </label>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Category">
        {CATS.map(([k, l]) => <button key={k} aria-pressed={cat === k} onClick={() => setCat(k)} className="chip chip-cat !min-h-10 !px-4 !text-[15px] !font-medium">{l}</button>)}
      </div>

      {/* featured (Figma "Featured this week") */}
      {!q && cat === "all" && (
        <Link href={`/app/communities/${featured.id}`} className="block">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} whileTap={{ scale: 0.99 }}
            className="relative h-[170px] overflow-hidden rounded-[26px] border border-white/70" style={{ background: `linear-gradient(135deg, ${featured.tint} 0%, #7B6A59 140%)` }}>
            {featured.image && (
               
              <img src={featured.image} alt="" className="absolute -right-4 -top-2 h-[190px] w-[190px] object-contain opacity-90 drop-shadow-[0_12px_14px_rgba(0,0,0,.2)]" />
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold">Featured for you</span>
            {next && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-[11px] font-bold text-white"><CalendarDays size={11} /> {new Date(next.startsAt).toLocaleDateString("en-GB", { weekday: "short" })} · {next.titleEn}</span>}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
              <CommunityBadge c={featured} size={46} />
              <div className="min-w-0 flex-1 text-white [text-shadow:0_1px_6px_rgba(0,0,0,.35)]">
                <p className="truncate text-xl font-bold">{featured.name}</p>
                <p className="text-[11px]">{featured.emirate} · {featured.members.toLocaleString()} members · {featured.online} online</p>
              </div>
              {joined.includes(featured.id) ? <span className="rounded-full bg-white/80 px-4 py-2 text-[13px] font-bold">Joined</span> :
                <button onClick={(e) => { e.preventDefault(); joinCommunity(featured.id); toast(`Joined ${featured.name}`); }} className="rounded-full bg-white px-4 py-2 text-[13px] font-bold">Join</button>}
            </div>
          </motion.section>
        </Link>
      )}

      {mine.length > 0 && !q && (
        <section>
          <h2 className="section-title mb-2 px-1">Your communities</h2>
          <ul className="space-y-2">
            {mine.map((c) => (
              <li key={c.id}>
                <Link href={`/app/communities/${c.id}`} className="glass flex items-center gap-3 rounded-[25px] px-2 py-1.5">
                  <CommunityBadge c={c} size={46} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[var(--muted)]">{c.emirate}</span>
                    <span className="block truncate font-bold">{c.name}</span>
                    <span className="block text-xs text-[var(--muted)]">{c.members.toLocaleString()} members</span>
                  </span>
                  {state.posts.some((p) => p.communityId === c.id && Date.now() - +new Date(p.createdAt) < 86_400_000) && <span className="me-3 h-2 w-2 rounded-full bg-blue-500" aria-label="New today" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="section-title">{q || cat !== "all" ? "Results" : "Trending near you"}</h2>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><ShieldCheck size={12} /> All moderated</span>
        </div>
        <motion.ul layout className="grid grid-cols-2 gap-2.5">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => (
              <motion.li key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.04 } }} exit={{ opacity: 0 }}>
                <CommunityTile c={c} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {age < 15 && <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white/40 p-3 text-xs text-[var(--muted)]"><Lock size={13} className="mt-0.5 shrink-0" /> You&apos;re in the under-15 tier: your school&apos;s clubs are open now; cross-school communities open at 15. This follows the UAE rules for under-15s online.</p>}
      </section>
    </div>
  );
}
