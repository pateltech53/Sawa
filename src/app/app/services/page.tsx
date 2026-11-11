"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bus, CalendarX2, ChevronLeft, ChevronRight, FileCheck2, FileSignature, GraduationCap, Library, Search, Sparkles, ArrowRightLeft, ScrollText, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";

const LOOK: Record<string, { icon: LucideIcon; photo?: string; tint: string; minutes: number }> = {
  "svc-school-file": { icon: FileCheck2, photo: "/photos/forms.jpg", tint: "#B68A35", minutes: 2 },
  "svc-reregistration": { icon: FileSignature, photo: "/photos/writing.jpg", tint: "#4073FF", minutes: 1 },
  "svc-transport": { icon: Bus, tint: "#D9822B", minutes: 3 },
  "svc-certificate": { icon: ScrollText, photo: "/photos/apple-books.jpg", tint: "#8C59F2", minutes: 1 },
  "svc-transfer": { icon: ArrowRightLeft, photo: "/photos/classroom.jpg", tint: "#2E9E6B", minutes: 4 },
  "svc-results": { icon: GraduationCap, tint: "#C23EA5", minutes: 1 },
  "svc-absence": { icon: CalendarX2, tint: "#7B6A59", minutes: 1 },
  "svc-ebooks": { icon: Library, photo: "/photos/books.jpg", tint: "#2C58E6", minutes: 1 },
};

function ServicesInner() {
  const { state, me } = useStore();
  const ar = state.lang === "ar";
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(params.get("open"));
  const mine = state.requests.filter((r) => r.requesterId === me?.id);
  const list = SERVICES.filter((s) => !q || `${s.nameEn} ${s.nameAr} ${s.ownerSystem}`.toLowerCase().includes(q.toLowerCase()));
  const systems = new Set(SERVICES.map((s) => s.ownerSystem)).size;

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "مركز الخدمات" : "Service hub"} sub={ar ? `${SERVICES.length} خدمات من ${systems} أنظمة — دخول واحد` : `${SERVICES.length} services from ${systems} systems — one login`} />
      <label className="relative block">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 opacity-50" size={18} />
        <input className="input !ps-11" placeholder={ar ? "ابحث عن خدمة…" : "Search services…"} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      {mine.length > 0 && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "طلباتي" : "My requests"}</h2>
          <ul className="space-y-2">
            {mine.map((r) => {
              const s = SERVICES.find((x) => x.id === r.serviceId)!;
              return (
                <li key={r.id}>
                  <Link href={`/app/requests/${r.id}`} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
                    <span className="font-semibold">{ar ? s.nameAr : s.nameEn}</span>
                    <Pill tone={r.status === "done" ? "green" : "gold"}>{r.status === "done" ? (ar ? "مكتمل" : "Done") : r.status === "in_review" ? (ar ? "قيد المراجعة" : "In review") : ar ? "مُرسل" : "Submitted"}</Pill>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <ServiceCarousel list={list} ar={ar} open={open} setOpen={setOpen} />
    </div>
  );
}

/** Services as a swipeable deck of tall cards (like the interest picker), not a flat menu. */
function ServiceCarousel({ list, ar, open, setOpen }: { list: typeof SERVICES; ar: boolean; open: string | null; setOpen: (v: string | null) => void }) {
  const ref = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 260 * (document.dir === "rtl" ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  return (
    <section aria-label={ar ? "الخدمات" : "Services"}>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="section-title">{ar ? "كل الخدمات" : "All services"}</h2>
        <div className="flex gap-1.5">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/60" onClick={() => scroll(-1)} aria-label={ar ? "السابق" : "Previous"}><ChevronLeft size={18} className="rtl:rotate-180" /></button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/60" onClick={() => scroll(1)} aria-label={ar ? "التالي" : "Next"}><ChevronRight size={18} className="rtl:rotate-180" /></button>
        </div>
      </div>
      <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" style={{ scrollPaddingInline: 16 }}>
        {list.map((s, i) => {
          const look = LOOK[s.id] ?? { icon: Sparkles, tint: "#121217", minutes: 2 };
          return (
            <motion.li key={s.id} initial={reduce ? false : { opacity: 0, y: 18, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: Math.min(i, 5) * 0.05, type: "spring", stiffness: 240, damping: 24 }}
              className="w-[240px] shrink-0 snap-start sm:w-[260px]">
              <article className={`glass flex h-[340px] flex-col overflow-hidden rounded-[28px] ${s.isDemoFlow ? "ring-2 ring-[#121217]" : ""}`}>
                <div className="relative h-[130px] shrink-0" style={{ background: look.tint }}>
                  {look.photo && <img src={look.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  <span className="absolute start-3 top-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-[#121217]"><look.icon size={20} /></span>
                  {s.isDemoFlow && <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#121217] px-2.5 py-1 text-[11px] font-bold text-white"><Sparkles size={11} /> {ar ? "مسار كامل" : "Full journey"}</span>}
                  <span className="absolute bottom-3 start-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold">{s.ownerSystem}</span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold leading-snug">{ar ? s.nameAr : s.nameEn}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{ar ? s.descAr : s.descEn}</p>
                  <p className="mt-auto flex items-center gap-2 pt-2 text-xs font-semibold text-[var(--ink-2)]"><span className="rounded-full bg-[#1F7A50]/15 px-2 py-0.5 text-[#1F7A50]">{s.fields.length}/{s.fields.length} {ar ? "معبّأ" : "pre-filled"}</span> ~{look.minutes} {ar ? "دقيقة" : "min"}</p>
                  {s.href ? (
                    <Link href={s.href} className="btn-ink mt-3 !min-h-10 w-full text-sm">{ar ? "ابدأ" : "Start"} <ArrowRight size={15} className="rtl:rotate-180" /></Link>
                  ) : open === s.id ? (
                    <p className="mt-3 rounded-2xl bg-white/80 p-2.5 text-xs">{ar ? "تُربط هذه الخدمة خلال التجربة مع " : "Connects in the pilot via "}<b>{s.ownerSystem}</b>.</p>
                  ) : (
                    <button className="btn-ghost mt-3 !min-h-10 w-full !bg-white text-sm" onClick={() => setOpen(s.id)}>{ar ? "تفاصيل" : "Details"}</button>
                  )}
                </div>
              </article>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Services() {
  return <Suspense><ServicesInner /></Suspense>;
}
