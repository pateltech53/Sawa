"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Layers, List, Map as MapIcon, Search, ShieldCheck } from "lucide-react";
import { DiscoverDeck } from "@/components/s/DiscoverDeck";
import { OppCard } from "@/components/s/cards";
import { LISTING_SOURCES, OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { rankOpportunities } from "@/lib/match";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/hooks/use-debounce";
import { ageOf, tierOf, useStore } from "@/lib/store";

const SchoolMap = dynamic(() => import("@/components/SchoolMap"), { ssr: false, loading: () => <div className="shimmer h-[340px] rounded-3xl" /> });

const FILTERS = [
  ["all", "All"], ["competition", "Competitions"], ["hackathon", "Hackathons"], ["workshop", "Workshops"], ["volunteering", "Volunteering"],
  ["leadership", "Leadership"], ["club", "Clubs"], ["event", "Events"], ["mun", "MUN"], ["saved", "Saved"],
] as const;

export default function Explore() {
  const { state, me } = useStore();
  const [f, setF] = useState<string>("all");
  const [q, setQ] = useState("");
  // filter after typing pauses, so the animated list doesn't reshuffle on every keystroke
  const dq = useDebounce(q.trim().toLowerCase(), 250);
  const [mode, setMode] = useState<"discover" | "list" | "map">("discover");
  const ranked = useMemo(() => (me ? rankOpportunities(me, OPPORTUNITIES) : []), [me]);
  if (!me) return null;
  const saved = state.saved[me.id] ?? [];
  const list = ranked.filter((m) => (f === "all" ? true : f === "saved" ? saved.includes(m.o.id) : m.o.type === f))
    .filter((m) => !dq || `${m.o.titleEn} ${m.o.organiser} ${m.o.interests.join(" ")}`.toLowerCase().includes(dq));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Opportunities</h1>
        <p className="text-sm text-[var(--muted)]">Ranked for you by interests, age and distance — reasons on every card.</p>
      </div>
      <div className="flex gap-2">
        <label className="relative block flex-1">
          <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 opacity-50" aria-hidden />
          <Input type="search" className="ps-11" placeholder="Search opportunities" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search opportunities" />
        </label>
        <div className="glass flex shrink-0 rounded-full p-1" role="tablist" aria-label="View">
          {([["discover", Layers, "Discover"], ["list", List, "List"], ["map", MapIcon, "Map"]] as const).map(([k, Icon, l]) => (
            <button key={k} role="tab" aria-selected={mode === k} aria-label={l} onClick={() => setMode(k)} className={`grid h-10 w-10 place-items-center rounded-full transition ${mode === k ? "bg-[#121217] text-white" : ""}`}><Icon size={17} /></button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by type">
        {FILTERS.map(([k, l]) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className="chip chip-cat !py-2">{l}{k === "saved" && saved.length ? ` · ${saved.length}` : ""}</button>
        ))}
      </div>
      <p className="flex items-center gap-1.5 px-1 text-xs text-[var(--muted)]"><ShieldCheck size={13} /> {tierOf(me) === "u15" ? `Age ${ageOf(me)}: outside-school activities go to your guardian first.` : `Age ${ageOf(me)}: you can register directly.`}</p>

      {mode === "discover" ? (
        <DiscoverDeck key={f + dq} matches={list} />
      ) : mode === "map" ? (
        <div className="space-y-2">
          <SchoolMap schools={SCHOOLS} opportunities={list.map((m) => m.o)} homeSchoolId={me.schoolId} lang="en" />
          <p className="text-xs text-[var(--muted)]">Sample schools in KHDA dataset format. Gold marks your school.</p>
        </div>
      ) : (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((m, i) => (
              <motion.li key={m.o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.04 } }} exit={{ opacity: 0, scale: 0.96 }}>
                <OppCard m={m} />
              </motion.li>
            ))}
          </AnimatePresence>
          {list.length === 0 && <li className="glass rounded-[22px] p-5 text-sm text-[var(--muted)]">{f === "saved" ? "Nothing saved yet. Tap the bookmark on any opportunity." : "No opportunities match that search."}</li>}
        </motion.ul>
      )}

      <section aria-labelledby="sources" className="glass rounded-[24px] p-4">
        <h2 id="sources" className="text-sm font-bold">Sourced from</h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">Listings are samples modelled on these sources. In the pilot Sawa syncs them, with each school&apos;s approval.</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {LISTING_SOURCES.map((s) => (
            <li key={s.name}><a href={s.url} target="_blank" rel="noreferrer" title={s.what} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold transition hover:bg-white">{s.name} <ExternalLink size={10} /></a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
