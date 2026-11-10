"use client";

import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award, Bookmark, BookmarkCheck, Briefcase, Building, CalendarDays, Check, Clock, GraduationCap, Info, List, Map as MapIcon, MapPin, Search, ShieldCheck,
  Sparkles, Star, UserPlus, Users, X,
} from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { FilterBar, applyFilters, type Filter, type FilterFieldDef } from "@/components/ui/filter-token-bar";
import { EmptyState, Initials, PageHead, Panel, PanelHead, SourceBadge, Tabs } from "@/components/t/kit";
import { fmtDate, relDays } from "@/lib/i18n";
import { OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { EDUCATORS, JOBS, PD, T_COMMUNITIES } from "@/lib/seed-teacher";
import { useStore } from "@/lib/store";
import type { School } from "@/lib/types";

const SchoolMap = dynamic(() => import("@/components/SchoolMap"), { ssr: false, loading: () => <div className="shimmer h-[340px] rounded-3xl" /> });

type Tab = "schools" | "jobs" | "learning" | "network";
const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])].sort();
const ratingOf = (s: School) => s.rating?.replace(/\s*\(sample\)/, "");

const schoolFields: FilterFieldDef[] = [
  { id: "curriculum", label: "Curriculum", icon: <GraduationCap size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }, { value: "is_not", label: "is not", multi: true }], options: uniq(SCHOOLS.map((s) => s.curriculum)).map((v) => ({ value: v, label: v })) },
  { id: "area", label: "Area", icon: <MapPin size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }], options: uniq(SCHOOLS.map((s) => s.area)).map((v) => ({ value: v, label: v })) },
  { id: "rating", label: "KHDA rating", icon: <Star size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }], options: uniq(SCHOOLS.map(ratingOf)).map((v) => ({ value: v, label: v })) },
  { id: "sector", label: "Sector", icon: <Building size={13} />, operators: [{ value: "is", label: "is" }], options: [{ value: "Private", label: "Private" }, { value: "Public", label: "Public" }] },
  { id: "hiring", label: "Hiring", icon: <Briefcase size={13} />, operators: [{ value: "is", label: "is" }], options: [{ value: "yes", label: "Has open roles" }] },
];

function GrowthInner() {
  const { state } = useStore();
  const params = useSearchParams();
  const ar = state.lang === "ar";
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "schools");
  const [schoolId, setSchoolId] = useState<string | null>(params.get("open"));

  return (
    <div className="space-y-4">
      <PageHead
        title={ar ? "مسارك المهني" : "Your career"}
        sub={ar ? "استكشف المدارس، الوظائف، التطوير المهني، وتواصل مع معلمين في الإمارات." : "Explore schools, roles and professional development, and connect with educators across the UAE."}
      />
      <Tabs<Tab> label={ar ? "أقسام" : "Sections"} value={tab} onChange={setTab} tabs={[
        { id: "schools", label: ar ? "المدارس" : "Schools", count: SCHOOLS.length },
        { id: "jobs", label: ar ? "الوظائف" : "Jobs", count: JOBS.length },
        { id: "learning", label: ar ? "التطوير المهني" : "Professional development" },
        { id: "network", label: ar ? "الشبكة" : "Network" },
      ]} />
      {tab === "schools" && <Schools onOpen={setSchoolId} />}
      {tab === "jobs" && <Jobs onSchool={setSchoolId} />}
      {tab === "learning" && <Learning />}
      {tab === "network" && <Network />}
      <SchoolSheet id={schoolId} onClose={() => setSchoolId(null)} />
    </div>
  );
}

function Schools({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, me } = useStore();
  const ar = state.lang === "ar";
  const [filters, setFilters] = useState<Filter[]>([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"list" | "map">("list");
  const imported = SCHOOLS.filter((s) => s.id.startsWith("khda-")).length;
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle ? SCHOOLS.filter((s) => `${s.name} ${s.nameAr} ${s.area} ${s.curriculum} ${(s.specialities ?? []).join(" ")}`.toLowerCase().includes(needle)) : SCHOOLS;
    const rank = (x: School) => (x.id === me?.schoolId ? 0 : x.id.startsWith("khda-") ? 1 : 2);
    return applyFilters([...base].sort((x, y) => rank(x) - rank(y)), filters, (s, f) => (f === "curriculum" ? s.curriculum : f === "area" ? s.area : f === "rating" ? ratingOf(s) : f === "sector" ? s.sector : f === "hiring" ? (JOBS.some((j) => j.schoolId === s.id) ? "yes" : "no") : undefined));
  }, [filters, q, me?.schoolId]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-aegold-50 px-3 py-2 text-[13px] text-aegold-900">
        <Info size={15} aria-hidden /> {imported ? (ar ? `${imported} مدرسة من بيانات KHDA (2015-16). تحقق من التقييم الأحدث على موقع KHDA.` : `${imported} schools from KHDA data (2015-16 workbook, ratings from the 2014-15 inspection). Check KHDA for current ratings.`) : ar ? "مدارس عينة بصيغة دليل KHDA. التقييمات والرسوم هنا ليست حقيقية." : "Sample schools in KHDA directory format. Ratings and fees here are not real. Import the KHDA dataset to replace them."}
      </div>
      <div className="t-card flex flex-col gap-2 rounded-[22px] p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-grey" aria-hidden />
          <input className="input !min-h-10 !rounded-xl !bg-white/80 ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ar ? "ابحث باسم المدرسة أو المنطقة أو التخصص" : "Search by school, area or speciality"} aria-label={ar ? "بحث عن مدرسة" : "Search schools"} />
        </label>
        <FilterBar fields={schoolFields} value={filters} onChange={setFilters} aria-label={ar ? "تصفية المدارس" : "Filter schools"} emptyLabel={ar ? "تصفية" : "Filter"} addLabel={ar ? "تصفية" : "Filter"} clearLabel={ar ? "مسح" : "Clear"} />
        <div className="flex gap-1" role="group" aria-label={ar ? "طريقة العرض" : "View"}>
          <button className="chip !p-2" aria-pressed={mode === "list"} onClick={() => setMode("list")} aria-label={ar ? "قائمة" : "List"}><List size={16} /></button>
          <button className="chip !p-2" aria-pressed={mode === "map"} onClick={() => setMode("map")} aria-label={ar ? "خريطة" : "Map"}><MapIcon size={16} /></button>
        </div>
      </div>
      {mode === "map" && <SchoolMap schools={list} opportunities={OPPORTUNITIES} homeSchoolId={me?.schoolId ?? ""} lang={state.lang} />}
      {list.length === 0 ? <EmptyState icon={Building} title={ar ? "لا مدارس مطابقة" : "No schools match"} action={<button className="btn-ghost" onClick={() => { setFilters([]); setQ(""); }}>{ar ? "مسح" : "Clear"}</button>} /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((s) => {
            const jobs = JOBS.filter((j) => j.schoolId === s.id).length;
            const saved = state.tSavedSchools.includes(s.id);
            return (
              <li key={s.id}>
                <button onClick={() => onOpen(s.id)} className="t-card flex h-full w-full flex-col items-stretch p-4 text-start lg-lift">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0"><span className="block font-semibold">{ar ? s.nameAr : s.name}</span><span className="block text-[12px] text-grey">{s.area} · {s.curriculum} · {s.grades ?? "-"}</span></span>
                    {saved && <BookmarkCheck size={17} className="shrink-0 text-sawa" aria-label={ar ? "محفوظ" : "Saved"} />}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[12px]">
                    {s.rating && <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2 py-0.5 font-semibold"><Star size={11} aria-hidden /> {s.rating}</span>}
                    {s.sector && <span className="rounded-full bg-white/75 px-2 py-0.5">{s.sector}</span>}
                    {jobs > 0 && <span className="rounded-full bg-sawa/12 px-2 py-0.5 font-semibold text-sawa">{jobs} {ar ? "وظائف" : jobs > 1 ? "open roles" : "open role"}</span>}
                    {s.id === me?.schoolId && <span className="rounded-full bg-ink px-2 py-0.5 font-semibold text-white">{ar ? "مدرستك" : "Your school"}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SchoolSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, me, toggleSavedSchool } = useStore();
  const ar = state.lang === "ar";
  const L = state.lang;
  const s = SCHOOLS.find((x) => x.id === id);
  if (!s) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const jobs = JOBS.filter((j) => j.schoolId === s.id);
  const peers = EDUCATORS.filter((e) => e.schoolId === s.id);
  const ops = OPPORTUNITIES.filter((o) => o.schoolId === s.id);
  const saved = state.tSavedSchools.includes(s.id);
  const row = (k: string, v?: string | number) => (
    <div className="flex items-start justify-between gap-3 border-b border-black/5 py-2 text-sm last:border-0">
      <dt className="text-grey">{k}</dt>
      <dd className="text-end font-semibold">{v ?? <span className="font-normal italic text-grey">{ar ? "غير متوفر في البيانات" : "Not in dataset"}</span>}</dd>
    </div>
  );
  return (
    <Sheet open={!!id} onClose={onClose} title={ar ? s.nameAr : s.name}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><SourceBadge status={s.id.startsWith("khda-") ? "imported" : "sample"} /> <span className="text-[12px] text-grey">{s.source}</span></div>
        <dl className="rounded-2xl bg-white px-3">
          {row(ar ? "المنطقة" : "Area", s.area)}
          {row(ar ? "المنهج" : "Curriculum", s.curriculum)}
          {row(ar ? "القطاع" : "Sector", s.sector)}
          {row(ar ? "الصفوف" : "Grades", s.grades)}
          {row(ar ? "تقييم KHDA" : "KHDA rating", s.rating ? `${s.rating}${s.ratingYear ? ` · ${s.ratingYear}` : ""}` : undefined)}
          {row(ar ? "الرسوم" : "Fees", s.feeRange)}
          {row(ar ? "عدد الطلاب" : "Students", s.students)}
          {row(ar ? "التأسيس" : "Established", s.established)}
          {row(ar ? "الرواتب وشروط العمل" : "Salaries & conditions", undefined)}
        </dl>
        {!!s.specialities?.length && <div className="flex flex-wrap gap-1.5">{s.specialities.map((x) => <span key={x} className="chip">{x}</span>)}</div>}
        {jobs.length > 0 && (
          <div><p className="label-xs mb-1.5">{ar ? "وظائف مفتوحة" : "Open roles"}</p>
            <ul className="space-y-1">{jobs.map((j) => <li key={j.id} className="rounded-xl bg-white px-3 py-2 text-sm"><b>{j.title}</b><span className="block text-[12px] text-grey">{j.contract} · {ar ? "يغلق" : "closes"} {relDays(j.closesAt, L)} · {j.source}</span></li>)}</ul>
          </div>
        )}
        {(peers.length > 0 || ops.length > 0) && (
          <p className="text-[13px] text-grey">{peers.length > 0 && (ar ? `${peers.length} معلمين على سوا هنا. ` : `${peers.length} educator${peers.length > 1 ? "s" : ""} on Sawa here. `)}{ops.length > 0 && (ar ? `تستضيف ${ops.length} فرص للطلاب.` : `Hosts ${ops.length} student opportunities.`)}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href={`/app/ask?q=${encodeURIComponent(`I've received a job offer from ${s.name.replace(" (sample)", "")}. Can you help me understand whether this school would be a good career move?`)}`} className="btn-ink"><Sparkles size={16} aria-hidden /> {ar ? "حلّل عرض عمل هنا" : "Check a job offer here"}</Link>
          <button className="btn-ghost !bg-white" onClick={() => toggleSavedSchool(s.id)} aria-pressed={saved}>{saved ? <BookmarkCheck size={16} className="text-sawa" aria-hidden /> : <Bookmark size={16} aria-hidden />} {saved ? (ar ? "محفوظة" : "Saved") : ar ? "احفظ" : "Save school"}</button>
        </div>
        {s.id === me?.schoolId && <p className="text-center text-[12px] text-grey">{ar ? "هذه مدرستك الحالية." : "This is your current school."}</p>}
      </div>
    </Sheet>
  );
}

function Jobs({ onSchool }: { onSchool: (id: string) => void }) {
  const { state, toggleSavedJob } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const L = state.lang;
  const [onlyMine, setOnlyMine] = useState(true);
  const list = JOBS.filter((j) => !onlyMine || j.subject === "Science" || j.subject === "Computing");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="rounded" /> {ar ? "تناسب تخصصي (علوم، حوسبة)" : "Match my subjects (Science, Computing)"}</label>
        <SourceBadge status="sample" label={ar ? "إعلانات عينة" : "Sample postings"} />
      </div>
      <ul className="space-y-2">
        {list.map((j) => {
          const s = SCHOOLS.find((x) => x.id === j.schoolId)!;
          const saved = state.tSavedJobs.includes(j.id);
          return (
            <li key={j.id} className="t-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{j.title}</p>
                  <button className="text-[13px] text-sawa hover:underline" onClick={() => onSchool(s.id)}>{ar ? s.nameAr : s.name}</button>
                  <p className="text-[12px] text-grey">{s.area} · {s.curriculum} · {j.contract} · {ar ? "البدء" : "starts"} {j.start}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${+new Date(j.closesAt) - Date.now() < 10 * 86_400_000 ? "bg-sawa/15 text-sawa" : "t-row"}`}><Clock size={11} className="me-1 inline" aria-hidden />{ar ? "يغلق" : "Closes"} {relDays(j.closesAt, L)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost !min-h-9 !bg-white text-sm" aria-pressed={saved} onClick={() => { toggleSavedJob(j.id); toast(saved ? (ar ? "أُزيل" : "Removed") : ar ? "حُفظت الوظيفة" : "Job saved"); }}>{saved ? <BookmarkCheck size={15} className="text-sawa" aria-hidden /> : <Bookmark size={15} aria-hidden />} {saved ? (ar ? "محفوظة" : "Saved") : ar ? "احفظ" : "Save"}</button>
                <Link className="btn-ghost !min-h-9 !bg-white text-sm" href={`/app/ask?q=${encodeURIComponent(`I'm considering the ${j.title} role at ${s.name.replace(" (sample)", "")}. What should I know and what should I ask?`)}`}><Sparkles size={15} className="text-sawa" aria-hidden /> {ar ? "اسأل SAWA AI" : "Ask SAWA AI"}</Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-grey">{ar ? "لا يعرض سوا رواتب أو شروط عمل غير منشورة رسمياً." : "Sawa never shows salaries or contract terms that aren't officially published. Ask the school's HR directly."}</p>
    </div>
  );
}

function Learning() {
  const { state, togglePd, addReminder } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const L = state.lang;
  const mine = PD.filter((p) => state.tPd.includes(p.id));
  const hours = mine.reduce((n, p) => n + p.hours, 0);
  return (
    <div className="space-y-3">
      <Panel className="flex flex-wrap items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white"><Award size={22} aria-hidden /></span>
        <div className="flex-1"><p className="font-semibold">{ar ? `${hours} ساعة تطوير مهني مسجلة` : `${hours} PD hours planned this year`}</p><p className="text-[13px] text-grey">{mine.length ? mine.map((p) => p.title).join(" · ") : ar ? "سجّل في برنامج لبدء سجلك." : "Enrol in a programme to start your record."}</p></div>
      </Panel>
      <ul className="grid gap-3 md:grid-cols-2">
        {PD.map((p) => {
          const on = state.tPd.includes(p.id);
          return (
            <li key={p.id} className="t-card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2"><p className="font-semibold">{p.title}</p>{p.certificate && <ShieldCheck size={16} className="shrink-0 text-aegreen-700" aria-label={ar ? "شهادة" : "Certificate"} />}</div>
              <p className="mt-1 text-[13px] text-[var(--ink-2)]">{p.about}</p>
              <p className="mt-2 text-[12px] text-grey"><CalendarDays size={11} className="me-1 inline" aria-hidden />{fmtDate(p.startsAt, L)} · {p.hours}h · {p.format.replace("_", " ")} · {p.cost}</p>
              <p className="text-[12px] text-grey">{p.provider}</p>
              <div className="mt-auto flex gap-2 pt-3">
                <button className={on ? "btn-ghost !min-h-9 !bg-white text-sm" : "btn-ink !min-h-9 text-sm"} onClick={() => { togglePd(p.id); if (!on) addReminder(`PD: ${p.title}`, p.startsAt); toast(on ? (ar ? "أُلغي التسجيل" : "Enrolment cancelled") : ar ? "سُجّلت وأُضيف تذكير" : "Enrolled · reminder added"); }}>{on ? <><Check size={15} aria-hidden /> {ar ? "مسجّل" : "Enrolled"}</> : ar ? "سجّل" : "Enrol"}</button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-grey">{ar ? "برامج عينة. في التجربة: تُربط بقوائم وزارة التربية والتعليم وKHDA." : "Sample programmes. In the pilot these come from MOE and KHDA professional-development listings."}</p>
    </div>
  );
}

function Network() {
  const { state, requestConnection, acceptConnection, removeConnection, toggleTCommunity } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const [subject, setSubject] = useState<string>("All");
  const subjects = ["All", ...uniq(EDUCATORS.flatMap((e) => e.subjects))];
  const list = EDUCATORS.filter((e) => subject === "All" || e.subjects.includes(subject as never));
  const OPEN: Record<string, [string, string]> = { resource_swap: ["Resource swaps", "تبادل الموارد"], mentoring: ["Mentoring", "الإرشاد"], co_teaching: ["Co-teaching", "التدريس المشترك"], competitions: ["Competition coaching", "تدريب المسابقات"] };
  const connect = (id: string) => {
    requestConnection(id);
    toast(ar ? "أُرسل طلب التواصل" : "Connection request sent");
    setTimeout(() => { acceptConnection(id); toast(ar ? "قُبل طلبك (محاكاة)" : "Request accepted (simulated)"); }, 2200);
  };
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel>
        <PanelHead title={ar ? "معلمون في الإمارات" : "Educators across the UAE"} sub={ar ? "يظهر الاسم والمدرسة والمواد فقط" : "Only name, school and subjects are visible"} />
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">{subjects.map((s) => <button key={s} className="chip" aria-pressed={subject === s} onClick={() => setSubject(s)}>{s === "All" ? (ar ? "الكل" : "All") : s}</button>)}</div>
        <ul className="space-y-2">
          {list.map((e) => {
            const st = state.tConnections[e.id];
            const school = SCHOOLS.find((x) => x.id === e.schoolId);
            return (
              <li key={e.id} className="flex flex-wrap items-start gap-3 t-row p-3">
                <Initials name={e.name} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{ar ? e.nameAr : e.name}</p>
                  <p className="text-[12px] text-grey">{e.subjects.join(", ")} · {ar ? "الصفوف" : "Grades"} {e.grades} · {e.years} {ar ? "سنوات" : "yrs"} · {school?.name}</p>
                  <p className="mt-1 text-[13px]">{e.bio}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">{e.openTo.map((o) => <span key={o} className="rounded-full bg-sawa/12 px-2 py-0.5 text-[11px] font-semibold text-sawa">{OPEN[o][ar ? 1 : 0]}</span>)}</div>
                </div>
                {st === "connected" ? (
                  <button className="chip !py-1.5" onClick={() => removeConnection(e.id)} aria-label={ar ? "إلغاء التواصل" : `Disconnect from ${e.name}`}><Check size={14} aria-hidden /> {ar ? "متصل" : "Connected"} <X size={12} className="opacity-50" aria-hidden /></button>
                ) : st === "pending" ? (
                  <span className="chip !py-1.5 opacity-70"><Clock size={14} aria-hidden /> {ar ? "بانتظار" : "Pending"}</span>
                ) : (
                  <button className="btn-ink !min-h-9 !px-3.5 text-sm" onClick={() => connect(e.id)}><UserPlus size={15} aria-hidden /> {ar ? "تواصل" : "Connect"}</button>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
      <div className="space-y-4">
        <Panel>
          <PanelHead title={ar ? "مجتمعات مهنية" : "Professional communities"} sub={ar ? "مُشرف عليها، لا تُشارك بيانات طلاب" : "Moderated. No student data is shared."} />
          <ul className="space-y-2">
            {T_COMMUNITIES.map((c) => {
              const on = state.tCommunities.includes(c.id);
              return (
                <li key={c.id} className="t-row p-3">
                  <div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{ar ? c.nameAr : c.name}</p><p className="text-[12px] text-grey"><Users size={11} className="me-1 inline" aria-hidden />{c.members.toLocaleString()} · {c.emirate}</p></div>
                    <button className={on ? "chip !py-1.5" : "btn-ink !min-h-9 !px-3 text-sm"} aria-pressed={on} onClick={() => { toggleTCommunity(c.id); toast(on ? (ar ? "غادرت" : "Left community") : ar ? "انضممت" : "Joined"); }}>{on ? (ar ? "عضو" : "Joined") : ar ? "انضم" : "Join"}</button>
                  </div>
                  <p className="mt-1 text-[13px]">{c.about}</p>
                </li>
              );
            })}
          </ul>
        </Panel>
        <p className="px-1 text-[12px] text-grey">{ar ? "المراسلة المباشرة بين المعلمين تأتي في التجربة، بعد موافقة المدرسة." : "Direct messaging between teachers comes in the pilot, after school approval. Connections here are simulated."}</p>
      </div>
    </div>
  );
}

export default function Growth() {
  return <Suspense><GrowthInner /></Suspense>;
}
