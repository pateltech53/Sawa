"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  BadgeCheck, CalendarClock, Coins, ExternalLink, HandCoins, Heart, MapPin, Search, Send, ShieldCheck, Sparkles, Tag, Telescope, Timer, Trophy, Users,
} from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { FilterBar, type Filter, type FilterFieldDef } from "@/components/ui/filter-token-bar";
import { EmptyState, PageHead, Panel, PanelHead, SourceBadge, Tabs, useConfirm } from "@/components/t/kit";
import { fmtDate, relDays } from "@/lib/i18n";
import { INTERESTS, OPPORTUNITIES } from "@/lib/seed";
import { CLASSES } from "@/lib/seed-teacher";
import { useStore } from "@/lib/store";
import { ageOfRoster, classById, eligibility } from "@/lib/teacher";
import type { Opportunity } from "@/lib/types";

const TYPES: [Opportunity["type"], string, string][] = [
  ["competition", "Competition", "مسابقة"], ["hackathon", "Hackathon", "هاكاثون"], ["workshop", "Workshop", "ورشة"], ["mun", "Model UN", "نموذج الأمم المتحدة"],
  ["volunteering", "Volunteering", "تطوع"], ["leadership", "Leadership", "قيادة"], ["club", "Club", "نادٍ"], ["event", "Event", "فعالية"],
];

const fields: FilterFieldDef[] = [
  { id: "type", label: "Type", icon: <Trophy size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }, { value: "is_not", label: "is not", multi: true }], options: TYPES.map(([v, l]) => ({ value: v, label: l })) },
  { id: "age", label: "Open to age", icon: <Users size={13} />, operators: [{ value: "is_any", label: "includes", multi: true }], options: [11, 12, 13, 14, 15, 16, 17, 18].map((a) => ({ value: String(a), label: `${a}` })) },
  { id: "cost", label: "Cost", icon: <Coins size={13} />, operators: [{ value: "is", label: "is" }], options: [{ value: "free", label: "Free" }, { value: "paid", label: "Has a fee" }] },
  { id: "interest", label: "Interest", icon: <Tag size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }], options: INTERESTS.map((i) => ({ value: i.id, label: i.en })) },
  { id: "deadline", label: "Deadline", icon: <Timer size={13} />, operators: [{ value: "is", label: "within" }], options: [{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }] },
  { id: "consent", label: "Guardian consent", icon: <ShieldCheck size={13} />, operators: [{ value: "is", label: "is" }], options: [{ value: "yes", label: "Required (under 15)" }, { value: "no", label: "Not required" }] },
];

function matches(o: Opportunity, f: Filter) {
  if (!f.values.length) return true;
  const not = f.operator.startsWith("is_not");
  let hit = false;
  if (f.field === "type") hit = f.values.includes(o.type);
  if (f.field === "age") hit = f.values.some((a) => +a >= o.minAge && (!o.maxAge || +a <= o.maxAge));
  if (f.field === "cost") hit = f.values.includes(!o.fee || /free/i.test(o.fee) ? "free" : "paid");
  if (f.field === "interest") hit = o.interests.some((i) => f.values.includes(i));
  if (f.field === "deadline") hit = !!o.deadline && +new Date(o.deadline) - Date.now() < +f.values[0] * 86_400_000 && +new Date(o.deadline) > Date.now();
  if (f.field === "consent") hit = f.values.includes(o.needsConsent ? "yes" : "no");
  return not ? !hit : hit;
}

type View = "discover" | "tracking";

function OppsInner() {
  const { state, me } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const ar = state.lang === "ar";
  const L = state.lang;
  const [classId, setClassId] = useState(params.get("class") ?? CLASSES[0].id);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));
  const [view, setView] = useState<View>("discover");
  useEffect(() => { if (me && me.role !== "teacher") router.replace("/app/explore"); }, [me, router]);
  const cls = classById(classId)!;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return OPPORTUNITIES
      .filter((o) => filters.every((f) => matches(o, f)))
      .filter((o) => !needle || `${o.titleEn} ${o.titleAr} ${o.organiser} ${o.descEn}`.toLowerCase().includes(needle))
      .map((o) => ({ o, e: eligibility(o, cls) }))
      .sort((a, b) => b.e.matched.length - a.e.matched.length || +new Date(a.o.deadline ?? a.o.startsAt) - +new Date(b.o.deadline ?? b.o.startsAt));
  }, [filters, q, cls]);

  if (!me || me.role !== "teacher") return null;

  return (
    <div className="space-y-4">
      <PageHead
        title={ar ? "فرص لطلابك" : "Opportunities for your students"}
        sub={ar ? "مسابقات وهاكاثونات وورش في الإمارات. رشّح الطلاب المناسبين أو اطلب رعاية المدرسة." : "Competitions, hackathons and workshops across the UAE. Recommend them to the right students, or ask your school to sponsor a team."}
        right={<SourceBadge status="sample" label={ar ? "قائمة عينة" : "Sample listings"} />}
      />
      <Tabs<View> label={ar ? "عرض" : "View"} value={view} onChange={setView} tabs={[
        { id: "discover", label: ar ? "اكتشف" : "Discover" },
        { id: "tracking", label: ar ? "المتابعة" : "Recommended & sponsored", count: state.tRecs.length + state.tSponsor.length },
      ]} />

      {view === "discover" ? (
        <>
          <div className="t-card space-y-2.5 rounded-[22px] p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="label-xs me-1">{ar ? "طابق مع" : "Match against"}</span>
              {CLASSES.map((c) => <button key={c.id} className="chip !py-1.5" aria-pressed={classId === c.id} onClick={() => setClassId(c.id)}>{ar ? c.nameAr : c.name}</button>)}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-grey" aria-hidden />
                <input className="input !min-h-10 !rounded-xl !bg-white/80 ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ar ? "ابحث عن فرصة أو جهة" : "Search opportunities or organisers"} aria-label={ar ? "بحث" : "Search opportunities"} />
              </label>
              <FilterBar fields={fields} value={filters} onChange={setFilters} aria-label={ar ? "تصفية الفرص" : "Filter opportunities"} emptyLabel={ar ? "تصفية" : "Filter"} addLabel={ar ? "تصفية" : "Filter"} clearLabel={ar ? "مسح" : "Clear"} />
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyState icon={Telescope} title={ar ? "لا فرص مطابقة" : "No opportunities match"} text={ar ? "خفّف المرشحات أو جرّب صفاً آخر." : "Loosen the filters or try another class."} action={<button className="btn-ghost" onClick={() => { setFilters([]); setQ(""); }}>{ar ? "مسح" : "Clear filters"}</button>} />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map(({ o, e }, i) => {
                const rec = state.tRecs.find((r) => r.opportunityId === o.id && r.classId === cls.id);
                const sp = state.tSponsor.find((s) => s.opportunityId === o.id);
                const closed = o.deadline && +new Date(o.deadline) < Date.now();
                return (
                  <motion.li key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}>
                    <button onClick={() => setOpenId(o.id)} className="t-card group flex h-full w-full flex-col items-stretch p-4 text-start lg-lift">
                      <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: o.tint }}>{o.image ? <img src={o.image} alt="" className="h-10 w-10 object-contain" /> : <Trophy size={20} aria-hidden />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-snug">{ar ? o.titleAr : o.titleEn}</span>
                          <span className="block text-[12px] text-grey">{o.organiser} · {o.emirate}</span>
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
                        <span className="rounded-full bg-white/70 px-2 py-0.5 font-semibold">{ar ? "العمر" : "Ages"} {o.minAge}{o.maxAge ? `-${o.maxAge}` : "+"}</span>
                        {o.teamSize && <span className="rounded-full bg-white/70 px-2 py-0.5">{o.teamSize}</span>}
                        {o.fee && <span className="rounded-full bg-white/70 px-2 py-0.5">{o.fee}</span>}
                        {o.deadline && <span className={`rounded-full px-2 py-0.5 font-semibold ${closed ? "bg-zinc-200 text-zinc-600" : +new Date(o.deadline) - Date.now() < 7 * 86_400_000 ? "bg-sawa/15 text-sawa" : "t-row"}`}>{closed ? (ar ? "أُغلق" : "Closed") : `${ar ? "يغلق" : "Closes"} ${relDays(o.deadline, L)}`}</span>}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[12.5px]">
                        <span><b className="text-sawa">{e.eligible.length}</b>/{e.students.length} {ar ? "مؤهلون" : "eligible"} · <b className="text-sawa">{e.matched.length}</b> {ar ? "مهتمون" : "interested"}</span>
                        <span className="flex gap-1">
                          {rec && <span className="rounded-full bg-aegreen-100 px-2 py-0.5 text-[11px] font-semibold text-aegreen-800">{ar ? "رُشّح" : "Recommended"}</span>}
                          {sp && <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-semibold text-ink">{ar ? "رعاية" : "Sponsorship"}: {sp.status}</span>}
                        </span>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <Tracking onOpen={(id) => { setView("discover"); setOpenId(id); }} />
      )}

      <OppSheet id={openId} classId={classId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function Tracking({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, decideSponsorship } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const L = state.lang;
  if (!state.tRecs.length && !state.tSponsor.length)
    return <EmptyState icon={Heart} title={ar ? "لم ترشّح شيئاً بعد" : "Nothing recommended yet"} text={ar ? "افتح فرصة واختر الطلاب لترشيحها لهم." : "Open an opportunity and pick students to recommend it to. You'll track it here."} />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel>
        <PanelHead title={ar ? "الترشيحات" : "Recommendations"} />
        <ul className="space-y-1.5">
          {state.tRecs.map((r) => {
            const o = OPPORTUNITIES.find((x) => x.id === r.opportunityId)!;
            const c = classById(r.classId)!;
            const reg = r.studentIds.filter((sid) => state.registered[sid]?.includes(o.id)).length;
            const pend = state.approvals.filter((a) => a.opportunityId === o.id && a.status === "pending" && r.studentIds.includes(a.childId)).length;
            return (
              <li key={r.id}><button onClick={() => onOpen(o.id)} className="w-full t-row px-3 py-2.5 text-start">
                <p className="font-semibold">{ar ? o.titleAr : o.titleEn}</p>
                <p className="text-[12px] text-grey">{ar ? c.nameAr : c.name} · {r.studentIds.length} {ar ? "طلاب" : "students"} · {fmtDate(r.at, L)} · {reg} {ar ? "سجّلوا" : "registered"}{pend ? ` · ${pend} ${ar ? "بانتظار ولي الأمر" : "awaiting guardian"}` : ""}</p>
              </button></li>
            );
          })}
          {!state.tRecs.length && <li className="text-sm text-grey">-</li>}
        </ul>
      </Panel>
      <Panel>
        <PanelHead title={ar ? "طلبات الرعاية" : "Sponsorship requests"} sub={ar ? "تُرسل إلى إدارة المدرسة" : "Sent to your school leadership"} />
        <ul className="space-y-2">
          {state.tSponsor.map((s) => {
            const o = OPPORTUNITIES.find((x) => x.id === s.opportunityId)!;
            return (
              <li key={s.id} className="t-row p-3">
                <div className="flex items-center justify-between gap-2"><p className="font-semibold">{ar ? o.titleAr : o.titleEn}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.status === "approved" ? "bg-aegreen-100 text-aegreen-800" : s.status === "declined" ? "bg-aered-100 text-aered-800" : "bg-aegold-100 text-aegold-800"}`}>{s.status}</span>
                </div>
                <ol className="mt-2 space-y-1 border-s-2 border-black/10 ps-3 text-[12px]">
                  {s.history.map((h, i) => <li key={i}><b>{h.status}</b> · {fmtDate(h.at, L, true)} · {h.by === "principal (simulated)" ? (ar ? "المدير (محاكاة)" : h.by) : ar ? "أنت" : "you"}</li>)}
                </ol>
                {s.status === "submitted" && (
                  <div className="mt-2 flex gap-1.5">
                    <button className="chip !py-1 text-[12px]" onClick={() => { decideSponsorship(s.id, true); toast(ar ? "وافق المدير (محاكاة)" : "Principal approved (simulated)"); }}>{ar ? "محاكاة موافقة المدير" : "Simulate principal approval"}</button>
                  </div>
                )}
              </li>
            );
          })}
          {!state.tSponsor.length && <li className="text-sm text-grey">-</li>}
        </ul>
      </Panel>
    </div>
  );
}

function OppSheet({ id, classId, onClose }: { id: string | null; classId: string; onClose: () => void }) {
  const { state, recommend, requestSponsorship, addReminder } = useStore();
  const toast = useToast();
  const { ask, ui } = useConfirm();
  const ar = state.lang === "ar";
  const L = state.lang;
  const o = OPPORTUNITIES.find((x) => x.id === id);
  const cls = classById(classId)!;
  const e = o ? eligibility(o, cls) : null;
  const [picked, setPicked] = useState<string[] | null>(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"main" | "sponsor">("main");
  const [budget, setBudget] = useState("");
  const [reason, setReason] = useState("");
  const close = () => { setPicked(null); setNote(""); setMode("main"); setBudget(""); setReason(""); onClose(); };
  if (!o || !e) return <Sheet open={false} onClose={close}>{null}</Sheet>;
  const sel = picked ?? e.matched.map((s) => s.id);
  const under15 = e.eligible.filter((s) => sel.includes(s.id) && ageOfRoster(s) < 15).length;
  const existingSp = state.tSponsor.find((s) => s.opportunityId === o.id);

  return (
    <>
      <Sheet open={!!id} onClose={close} title={ar ? o.titleAr : o.titleEn}>
        {mode === "main" ? (
          <div className="space-y-4">
            <p className="text-[15px]">{o.detailsEn ?? o.descEn}</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                [Users, ar ? "الفئة العمرية" : "Age range", `${o.minAge}${o.maxAge ? `-${o.maxAge}` : "+"}`],
                [CalendarClock, ar ? "آخر موعد للتسجيل" : "Registration closes", o.deadline ? `${fmtDate(o.deadline, L)} (${relDays(o.deadline, L)})` : ar ? "غير محدد" : "Not stated"],
                [Users, ar ? "حجم الفريق" : "Team size", o.teamSize ?? (ar ? "غير محدد" : "Not stated")],
                [Coins, ar ? "التكلفة" : "Cost", o.fee ?? (ar ? "غير محدد" : "Not stated")],
                [MapPin, ar ? "المكان" : "Where", `${o.organiser}, ${o.emirate}`],
                [ShieldCheck, ar ? "موافقة ولي الأمر" : "Guardian consent", o.needsConsent ? (ar ? "مطلوبة لمن دون 15" : "Required under 15") : ar ? "غير مطلوبة" : "Not required"],
              ].map(([I, k, v]) => {
                const Icon = I as typeof Users;
                return <div key={k as string} className="rounded-xl bg-white px-3 py-2"><dt className="flex items-center gap-1 text-[11px] text-grey"><Icon size={11} aria-hidden /> {k as string}</dt><dd className="font-semibold">{v as string}</dd></div>;
              })}
            </dl>
            <p className="flex flex-wrap items-center gap-2 text-[12px] text-grey"><SourceBadge status="sample" /> {ar ? "رابط التسجيل غير مباشر في النموذج." : "Registration link is not live in the prototype."} <span className="inline-flex items-center gap-0.5 opacity-60"><ExternalLink size={11} aria-hidden /> {ar ? "التسجيل" : "Register"}</span></p>

            <div className="rounded-2xl bg-white p-3">
              <p className="text-sm font-semibold">{ar ? `رشّح لطلاب ${cls.nameAr}` : `Recommend to students in ${cls.name}`}</p>
              <p className="text-[12px] text-grey">{e.eligible.length}/{e.students.length} {ar ? "مؤهلون حسب العمر" : "meet the age rules"} · {ar ? "محدد مسبقاً: من تطابق اهتماماتهم" : "pre-selected: students whose interests match"}</p>
              {e.eligible.length === 0 ? <p className="mt-2 text-sm text-aered-700">{ar ? "لا يوجد طلاب مؤهلون في هذا الصف." : "No one in this class meets the age rules."}</p> : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {e.eligible.map((s) => {
                    const on = sel.includes(s.id);
                    const love = e.matched.some((m) => m.id === s.id);
                    return <li key={s.id}><button className="chip !py-1.5" aria-pressed={on} onClick={() => setPicked(on ? sel.filter((x) => x !== s.id) : [...sel, s.id])}>{love && <Heart size={12} className={on ? "" : "text-sawa"} aria-hidden />}{ar ? s.nameAr : s.name} <span className="opacity-60">{ageOfRoster(s)}</span></button></li>;
                  })}
                </ul>
              )}
              <textarea className="input mt-3 min-h-20 !bg-zinc-50" maxLength={240} value={note} onChange={(ev) => setNote(ev.target.value)} placeholder={ar ? "ملاحظة شخصية (اختياري): لماذا يناسبهم؟" : "Personal note (optional): why it suits them"} />
              {under15 > 0 && o.needsConsent && <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink"><ShieldCheck size={13} aria-hidden /> {ar ? `${under15} دون 15 سنة: سيحتاجون موافقة ولي الأمر عند التسجيل.` : `${under15} under 15: their guardian approves before they're registered.`}</p>}
              <button className="btn-ink mt-3 w-full" disabled={!sel.length} onClick={() => ask({
                title: ar ? "إرسال الترشيح؟" : "Send recommendation?",
                body: ar ? `ستظهر لـ ${sel.length} طلاب في «اليوم». الطلاب يقررون التسجيل بأنفسهم.` : `It appears in ${sel.length} students' Today with your note. They choose whether to register.`,
                confirm: ar ? "أرسل" : "Recommend",
                run: () => { recommend(o.id, cls.id, sel, note.trim()); toast(ar ? "أُرسل الترشيح" : `Recommended to ${sel.length} students`); close(); },
              })}><Send size={16} aria-hidden /> {ar ? "رشّح" : "Recommend"} ({sel.length})</button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button className="btn-ghost !bg-white" disabled={!!existingSp} onClick={() => setMode("sponsor")}><HandCoins size={16} aria-hidden /> {existingSp ? (ar ? `الرعاية: ${existingSp.status}` : `Sponsorship ${existingSp.status}`) : ar ? "اطلب رعاية المدرسة" : "Ask school to sponsor"}</button>
              <button className="btn-ghost !bg-white" disabled={!o.deadline} onClick={() => { addReminder(`${o.titleEn}: registration closes`, new Date(+new Date(o.deadline!) - 2 * 86_400_000).toISOString()); toast(ar ? "أُضيف تذكير" : "Reminder set for 2 days before the deadline"); }}><BadgeCheck size={16} aria-hidden /> {ar ? "ذكّرني قبل الموعد" : "Remind me before it closes"}</button>
            </div>
            <a href={`/app/ask?q=${encodeURIComponent(`Is ${o.titleEn} a good fit for my Grade ${cls.grade} students, and how should I prepare a team?`)}`} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-sawa"><Sparkles size={14} className="text-sawa" aria-hidden /> {ar ? "اسأل SAWA AI عن هذه الفرصة" : "Ask SAWA AI about this"}</a>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={(ev) => {
            ev.preventDefault();
            if (!reason.trim()) return;
            ask({
              title: ar ? "إرسال طلب الرعاية؟" : "Send sponsorship request?",
              body: ar ? "يُرسل إلى إدارة المدرسة للموافقة. يمكنك متابعته من «المتابعة»." : "It goes to your school leadership for approval. Track it under Recommended & sponsored.",
              confirm: ar ? "أرسل" : "Send request",
              run: () => { requestSponsorship({ opportunityId: o.id, classId: cls.id, students: sel.length || e.matched.length, budget: budget.trim() || (o.fee ?? "Not stated"), reason: reason.trim() }); toast(ar ? "أُرسل الطلب" : "Sponsorship request sent"); close(); },
            });
          }}>
            <p className="text-sm text-grey">{ar ? "اطلب من المدرسة تغطية الرسوم أو النقل أو المستلزمات." : "Ask your school to cover fees, transport or kit, and to put the school's name behind the team."}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white px-3 py-2 text-sm"><p className="text-[11px] text-grey">{ar ? "الطلاب" : "Students"}</p><p className="font-semibold">{sel.length || e.matched.length}</p></div>
              <label className="block rounded-xl bg-white px-3 py-2 text-sm"><span className="text-[11px] text-grey">{ar ? "الميزانية المطلوبة" : "Budget needed"}</span><input className="w-full bg-transparent font-semibold outline-none" placeholder={o.fee ?? "AED"} value={budget} onChange={(ev) => setBudget(ev.target.value)} /></label>
            </div>
            <label className="block text-sm font-semibold">{ar ? "لماذا؟" : "Why this matters"}<textarea required className="input mt-1 min-h-24 !bg-white" value={reason} onChange={(ev) => setReason(ev.target.value)} maxLength={400} placeholder={ar ? "مثال: يطوّر مهارات البرمجة ويمثّل المدرسة" : "e.g. Builds coding skills, links to our Grade 8 forces unit and represents the school"} /></label>
            <div className="flex gap-2"><button type="button" className="btn-ghost !bg-white" onClick={() => setMode("main")}>{ar ? "رجوع" : "Back"}</button><button className="btn-ink flex-1" disabled={!reason.trim()}><HandCoins size={16} aria-hidden /> {ar ? "أرسل الطلب" : "Send request"}</button></div>
          </form>
        )}
      </Sheet>
      {ui}
    </>
  );
}

export default function TeacherOpportunities() {
  return <Suspense><OppsInner /></Suspense>;
}
