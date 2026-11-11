"use client";

// The Figma interest picker as a reusable component: tall glass cards with a 3D object
// and a curved serif label, swiped or stepped, multi-select. Used by students for
// interests and by parents and teachers in onboarding.
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CurvedLabel, spring } from "./kit";

export type CarouselCard = { id: string; label: string; sub?: string; img: string; tint: string };

export function CardCarousel({ cards, selected, onToggle, ariaLabel }: { cards: CarouselCard[]; selected: string[]; onToggle: (id: string) => void; ariaLabel: string }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const nav = (d: number) => setIdx((i) => Math.max(0, Math.min(cards.length - 1, i + d)));
  const cur = cards[idx];

  return (
    <div onKeyDown={(e) => { if (e.key === "ArrowRight") nav(1); if (e.key === "ArrowLeft") nav(-1); }}>
      <div className="relative h-[400px] select-none" role="listbox" aria-label={ariaLabel} aria-multiselectable="true">
        <motion.div aria-hidden className="absolute left-1/2 top-[70px] h-[260px] w-[260px] -translate-x-1/2 rounded-full" animate={{ backgroundColor: cur.tint }} transition={{ duration: 0.5 }} style={{ filter: "blur(48px)", opacity: 0.55 }} />
        <motion.div className="absolute inset-0" drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
          onDragEnd={(_, i) => { if (i.offset.x < -50) nav(1); else if (i.offset.x > 50) nav(-1); }}>
          {cards.map((c, i) => {
            const d = i - idx;
            const on = selected.includes(c.id);
            return (
              <motion.button key={c.id} type="button" role="option" aria-selected={on} aria-label={c.label}
                onClick={() => (d !== 0 ? setIdx(i) : onToggle(c.id))}
                className="absolute left-1/2 top-[24px] origin-center"
                initial={false}
                animate={{ x: `calc(-50% + ${d * 200}px)`, scale: d === 0 ? 1 : 0.62, opacity: Math.abs(d) > 1 ? 0 : d === 0 ? 1 : 0.7, rotateY: d * -18, zIndex: 10 - Math.abs(d) }}
                transition={spring}
                style={{ width: 250, height: 344, perspective: 900 }}
                tabIndex={d === 0 ? 0 : -1}>
                <motion.div className="relative h-full w-full overflow-hidden rounded-[22px] border-2"
                  animate={{ borderColor: on ? "#121217" : "rgba(255,255,255,.75)", backgroundColor: on ? "rgba(255,255,255,.72)" : "rgba(255,255,255,.24)" }}
                  transition={{ duration: 0.25 }} style={{ backdropFilter: "blur(8px)" }}>
                  <img src={c.img} alt="" draggable={false} className="obj3d absolute left-1/2 top-6 h-[190px] w-[190px] -translate-x-1/2 object-contain" />
                  <div className="absolute inset-x-0 bottom-14 flex justify-center"><CurvedLabel text={c.label} width={230} size={c.label.length > 12 ? 28 : 36} curve={16} /></div>
                  {c.sub && <p className="absolute inset-x-4 bottom-4 text-center text-[13px] leading-snug text-black/70">{c.sub}</p>}
                  <AnimatePresence>
                    {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring} className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#121217] text-white"><Check size={17} strokeWidth={3} /></motion.span>}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
        <button type="button" aria-label="Previous" onClick={() => nav(-1)} disabled={idx === 0} className="absolute start-1 top-[180px] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/55 backdrop-blur transition-opacity disabled:opacity-0"><ChevronLeft size={20} className="rtl:rotate-180" /></button>
        <button type="button" aria-label="Next" onClick={() => nav(1)} disabled={idx === cards.length - 1} className="absolute end-1 top-[180px] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/55 backdrop-blur transition-opacity disabled:opacity-0"><ChevronRight size={20} className="rtl:rotate-180" /></button>
      </div>
      <div className="flex justify-center gap-1.5" aria-hidden>
        {cards.map((c, i) => <motion.span key={c.id} className="h-1.5 rounded-full bg-black/70" animate={{ width: i === idx ? 18 : 6, opacity: i === idx ? 1 : 0.25 }} />)}
      </div>
    </div>
  );
}
