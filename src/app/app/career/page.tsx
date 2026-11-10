"use client";

// Teacher › Career: the KHDA school directory (map + list), sample jobs and
// professional development, each attributed to where real listings would come from.
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Briefcase, ExternalLink, GraduationCap, List, Map as MapIcon, School as SchoolIcon, Search } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { useToast } from "@/components/s/kit";
import { OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";

const SchoolMap = dynamic(() => import("@/components/SchoolMap"), { ssr: false, loading: () => <div className="shimmer h-[340px] rounded-3xl" /> });

const JOBS = [
  { id: "j1", title: "Science teacher (Grade 6–8)", school: "Creek Science Academy (sample)", area: "Al Jaddaf", type: "Full time", posted: "3 days ago" },
  { id: "j2", title: "Head of STEM", school: "Marina Innovation School (sample)", area: "Dubai Marina", type: "Full time", posted: "1 week ago" },
  { id: "j3", title: "Robotics club coach", school: "Mirdif Future School (sample)", area: "Mirdif", type: "Part time", posted: "2 weeks ago" },
];
const PD = [
  { id: "d1", title: "Teaching with open data", by: "UAE Hackathon (TDRA) toolkit", hours: 6, photo: "/photos/code.jpg" },
  { id: "d2", title: "Inclusive classrooms", by: "School PD catalogue (sample)", hours: 4, photo: "/photos/classroom.jpg" },
  { id: "d3", title: "Coaching student MUN delegates", by: "MyMUN resources", hours: 3, photo: "/photos/conference.jpg" },
];

export default function Career() {
  const { state, me } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const [tab, setTab] = useState<"schools" | "jobs" | "pd">("schools");
  const [view, setView] = useState<"list" | "map">("list");
  const [q, setQ] = useState("");
  const schools = useMemo(() => SCHOOLS.filter((s) => `${s.name} ${s.area} ${s.curriculum}`.toLowerCase().includes(q.toLowerCase())), [q]);
  if (!me) return null;

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "مسيرتك" : "Your career"} sub={ar ? "استكشف المدارس والوظائف والتطوير المهني في الإمارات" : "Explore schools, roles and professional development, and connect with educators across the UAE."} />
      <div className="glass inline-flex rounded-full p-1" role="tablist">
        {([["schools", ar ? "المدارس" : "Schools", SCHOOLS.length], ["jobs", ar ? "الوظائف" : "Jobs", JOBS.length], ["pd", ar ? "التطوير المهني" : "Professional development", PD.length]] as const).map(([k, label, n]) => (
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

      {tab === "jobs" && (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {JOBS.map((j) => (
            <li key={j.id} className="glass rounded-[22px] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#121217] text-white"><Briefcase size={17} /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{j.title}</p><p className="text-xs text-[var(--muted)]">{j.school} · {j.area}</p><p className="mt-1 text-xs text-[var(--muted)]">{j.type} · {j.posted}</p></div>
              </div>
              <button className="btn-ghost mt-3 !min-h-9 w-full !bg-white text-sm" onClick={() => toast(ar ? "تم حفظ الوظيفة" : "Saved — we'll remind you before it closes")}>{ar ? "احفظ" : "Save"}</button>
            </li>
          ))}
        </ul>
      )}

      {tab === "pd" && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {PD.map((d) => (
            <li key={d.id} className="glass overflow-hidden rounded-[24px]">
              <img src={d.photo} alt="" className="h-28 w-full object-cover" />
              <div className="p-3.5"><p className="font-semibold">{d.title}</p><p className="text-xs text-[var(--muted)]"><GraduationCap size={11} className="inline" /> {d.by} · {d.hours} {ar ? "ساعات" : "hours"}</p></div>
            </li>
          ))}
        </ul>
      )}

      <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">{ar ? "المصادر:" : "Sourced from:"}
        {[["KHDA via Dubai Pulse", "https://www.dubaipulse.gov.ae"], ["MyMUN", "https://mymun.com/conferences/united-arab-emirates"], ["UAE Hackathon", "https://hackathon.ae"]].map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 rounded-full bg-white/60 px-2 py-0.5 underline">{n}<ExternalLink size={10} /></a>)}
      </p>
    </div>
  );
}
