"use client";

// Teacher › Career: the KHDA school directory (map + list), sample jobs and
// professional development, each attributed to where real listings would come from.
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExternalLink, GraduationCap, List, Map as MapIcon, School as SchoolIcon, Search } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { useToast } from "@/components/s/kit";
import { OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";

const SchoolMap = dynamic(() => import("@/components/SchoolMap"), { ssr: false, loading: () => <div className="shimmer h-[340px] rounded-3xl" /> });

/** Workshops teachers can join for their own development (sample, attributed). */
const WORKSHOPS = [
  { id: "ws-1", title: "Teaching with open data", titleAr: "التدريس بالبيانات المفتوحة", by: "UAE Hackathon (TDRA) toolkit", at: 5, hours: 3, place: "Online", photo: "/photos/code.jpg" },
  { id: "ws-2", title: "Inclusive classrooms in practice", titleAr: "الفصول الدامجة عملياً", by: "School PD catalogue (sample)", at: 8, hours: 2, place: "Al Noor · Room 12", photo: "/photos/classroom.jpg" },
  { id: "ws-3", title: "Coaching student MUN delegates", titleAr: "تدريب مندوبي نموذج الأمم المتحدة", by: "MyMUN resources", at: 12, hours: 2, place: "Online", photo: "/photos/conference.jpg" },
  { id: "ws-4", title: "Robotics kits for beginners", titleAr: "حقائب الروبوتات للمبتدئين", by: "UAE Young Roboticists mentors", at: 15, hours: 3, place: "Marina Innovation School", photo: "/photos/circuit.jpg" },
];

export default function Career() {
  const { state, me } = useStore();
  const toast = useToast();
  const { toggleEventSignup } = useStore();
  const joined = state.eventSignups[me?.id ?? ""] ?? [];
  const studentEvents = OPPORTUNITIES.filter((o) => ["competition", "hackathon", "mun", "workshop"].includes(o.type)).slice(0, 6);
  const ar = state.lang === "ar";
  const [tab, setTab] = useState<"pd" | "students" | "schools">("pd");
  const [view, setView] = useState<"list" | "map">("list");
  const [q, setQ] = useState("");
  const schools = useMemo(() => SCHOOLS.filter((s) => `${s.name} ${s.area} ${s.curriculum}`.toLowerCase().includes(q.toLowerCase())), [q]);
  if (!me) return null;

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "الفعاليات والورش" : "Events and workshops"} sub={ar ? "ورش لتطويرك، وفعاليات تأخذ إليها طلابك، ومدارس الإمارات" : "Workshops for your own growth, events to bring your classes to, and schools across the UAE"} />
      <div className="glass inline-flex rounded-full p-1" role="tablist">
        {([["pd", ar ? "لك" : "For you", WORKSHOPS.length], ["students", ar ? "لطلابك" : "For your students", studentEvents.length], ["schools", ar ? "المدارس" : "Schools", SCHOOLS.length]] as const).map(([k, label, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === k ? "bg-[#121217] text-white" : "text-[var(--ink-2)]"}`}>{label} <span className="opacity-60">{n}</span></button>
        ))}
      </div>

      {tab === "schools" && (
        <>
          <p className="rounded-2xl bg-aegold-50 px-3 py-2 text-xs text-aegold-800">{ar ? "بيانات المدارس من مجموعة KHDA المفتوحة (عينة). تحقق من KHDA للتقييمات الحالية." : "School rows follow the KHDA open dataset format (Dubai Pulse, sample rows). Check KHDA for current ratings."}</p>
          <div className="flex items-center gap-2">
            <label className="relative flex-1"><Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" /><input className="input !ps-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ar ? "ابحث بالمدرسة أو المنطقة أو المنهج" : "Search by school, area or curriculum"} aria-label="Search schools" /></label>
            <button className="btn-ghost !min-h-12 !px-3" aria-pressed={view === "map"} aria-label={view === "list" ? "Map view" : "List view"} onClick={() => setView(view === "list" ? "map" : "list")}>{view === "list" ? <MapIcon size={18} /> : <List size={18} />}</button>
          </div>
          {view === "map" && <SchoolMap schools={schools} opportunities={OPPORTUNITIES} homeSchoolId={me.schoolId} lang={state.lang} />}
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((s) => (
              <li key={s.id} className="glass rounded-[22px] p-3.5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/80"><SchoolIcon size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{ar ? s.nameAr : s.name}</p>
                    <p className="text-xs text-[var(--muted)]">{s.area} · {s.curriculum}</p>
                    {s.id === me.schoolId && <span className="mt-1 inline-block rounded-full bg-[#121217] px-2 py-0.5 text-[10px] font-bold text-white">{ar ? "مدرستك" : "Your school"}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "pd" && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSHOPS.map((w) => {
            const on = joined.includes(`ws:${w.id}`);
            const when = new Date(Date.now() + w.at * 86_400_000);
            return (
              <li key={w.id} className="glass flex flex-col overflow-hidden rounded-[24px]">
                <img src={w.photo} alt="" className="h-32 w-full object-cover" />
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold leading-snug">{ar ? w.titleAr : w.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{when.toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short" })} · {w.hours} {ar ? "ساعات" : "hours"} · {w.place}</p>
                  <p className="text-xs text-[var(--muted)]"><GraduationCap size={11} className="inline" /> {w.by}</p>
                  <button className={`mt-auto pt-3`} onClick={() => { toggleEventSignup(`ws:${w.id}`); toast(on ? (ar ? "أُلغي الحجز" : "Place released") : ar ? "تم حجز مقعدك · يُحتسب ضمن ساعات التطوير" : "Seat booked · counts toward your PD hours"); }}>
                    <span className={`${on ? "btn-ghost !bg-white" : "btn-ink"} !min-h-10 w-full text-sm`}>{on ? (ar ? "محجوز · إلغاء" : "Booked · undo") : ar ? "انضم" : "Join"}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "students" && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studentEvents.map((o) => {
            const on = joined.includes(`bring:${o.id}`);
            return (
              <li key={o.id} className="glass flex overflow-hidden rounded-[24px]">
                {o.photo && <img src={o.photo} alt="" className="w-28 shrink-0 object-cover" />}
                <div className="flex min-w-0 flex-1 flex-col p-3.5">
                  <p className="font-semibold leading-snug">{ar ? o.titleAr : o.titleEn}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{new Date(o.startsAt).toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short" })} · {ar ? "الأعمار" : "Ages"} {o.minAge}–{o.maxAge ?? 18}</p>
                  {o.source && <p className="text-[11px] text-[var(--muted)]">{ar ? "على غرار" : "Modelled on"} {o.source}</p>}
                  <button className="mt-auto pt-2.5 text-start" onClick={() => { toggleEventSignup(`bring:${o.id}`); toast(on ? (ar ? "أُلغي" : "Removed") : ar ? "أُرسلت الدعوة لصفوفك وأولياء الأمور" : "Invited your classes — parents get the consent request"); }}>
                    <span className={`${on ? "btn-ghost !bg-white" : "btn-ink"} !min-h-9 text-xs`}>{on ? (ar ? "صفوفك مدعوّة · إلغاء" : "Classes invited · undo") : ar ? "ادعُ صفوفك" : "Bring your classes"}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">{ar ? "المصادر:" : "Sourced from:"}
        {[["KHDA via Dubai Pulse", "https://www.dubaipulse.gov.ae"], ["MyMUN", "https://mymun.com/conferences/united-arab-emirates"], ["UAE Hackathon", "https://hackathon.ae"]].map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 rounded-full bg-white/60 px-2 py-0.5 underline">{n}<ExternalLink size={10} /></a>)}
      </p>
    </div>
  );
}
