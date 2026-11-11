"use client";

// Teacher › Students: roster plus events. A teacher can host an event, invite whole
// classes (it lands in their students' calendars) and ask the school to sponsor it,
// with a status timeline like the parent request journey.
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, Check, CircleDollarSign, MapPin, PartyPopper, Send, Users } from "lucide-react";
import { Avatar, Sheet, useToast } from "@/components/s/kit";
import { PageTitle } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { ageOf, useStore } from "@/lib/store";
import type { TeacherEvent } from "@/lib/types";

const CLASSES = ["8A", "8B", "9A"];
const STEPS = ["requested", "reviewing", "approved"] as const;

function StudentsInner() {
  const { state, me, createEvent, inviteClasses, requestSponsorship, advanceSponsorship } = useStore();
  const params = useSearchParams();
  const toast = useToast();
  const ar = state.lang === "ar";
  const L = state.lang;
  const [sheet, setSheet] = useState<null | { kind: "new" } | { kind: "invite" | "sponsor"; ev: TeacherEvent }>(null);
  const [form, setForm] = useState({ title: "", date: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10), place: "", classes: ["8A"] as string[] });
  const [amount, setAmount] = useState(800);
  const [reason, setReason] = useState("");
  const [pick, setPick] = useState<string[]>([]);
  const [filter, setFilter] = useState(params.get("class") ?? "All");

  useEffect(() => { if (params.get("new") === "event") setSheet({ kind: "new" }); }, [params]);
  if (!me) return null;

  const roster = state.profiles.filter((p) => p.role === "student" && p.schoolId === me.schoolId);
  const events = state.events.filter((e) => e.hostId === me.id);
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="space-y-5">
      <PageTitle title={ar ? "الطلاب والفعاليات" : "Students & events"} sub={ar ? "ادعُ صفوفاً كاملة واطلب رعاية المدرسة" : "Invite whole classes and ask the school to sponsor"} right={<button className="btn-ink !min-h-10 text-sm" onClick={() => setSheet({ kind: "new" })}><CalendarPlus size={15} /> {ar ? "فعالية جديدة" : "New event"}</button>} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <section aria-labelledby="events" className="space-y-3">
          <h2 id="events" className="section-title px-1">{ar ? "فعالياتك" : "Your events"}</h2>
          {events.map((e) => (
            <article key={e.id} className="glass rounded-[26px] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#121217] text-white" style={state.schoolBrand ? { background: state.schoolBrand.accent } : undefined}><PartyPopper size={20} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug">{e.title}</h3>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--muted)]"><span>{fmtDate(e.startsAt, L, true)}</span><span className="inline-flex items-center gap-1"><MapPin size={11} />{e.place}</span><span className="inline-flex items-center gap-1"><Users size={11} />{e.classes.join(", ")}</span></p>
                </div>
              </div>
              {e.sponsorship && (
                <div className="mt-3 rounded-[18px] bg-white/65 p-3">
                  <p className="text-xs font-semibold">{ar ? "طلب رعاية" : "Sponsorship request"} · AED {e.sponsorship.amountAed} · <span className="text-[var(--muted)]">{e.sponsorship.reason}</span></p>
                  <ol className="mt-2 flex items-center gap-1" aria-label={ar ? "حالة الطلب" : "Request status"}>
                    {STEPS.map((s, i) => {
                      const reached = STEPS.indexOf(e.sponsorship!.status) >= i;
                      return (
                        <li key={s} className="flex flex-1 items-center gap-1">
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${reached ? "bg-[#1F7A50] text-white" : "bg-black/10"}`}>{reached ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                          <span className={`text-[11px] font-semibold capitalize ${reached ? "" : "text-[var(--muted)]"}`}>{s}</span>
                          {i < 2 && <span className={`h-0.5 flex-1 rounded ${STEPS.indexOf(e.sponsorship!.status) > i ? "bg-[#1F7A50]" : "bg-black/10"}`} />}
                        </li>
                      );
                    })}
                  </ol>
                  {e.sponsorship.status !== "approved" && <button className="mt-2 text-xs font-semibold text-blue-700 underline" onClick={() => { advanceSponsorship(e.id); toast(ar ? "تحديث من الإدارة (محاكاة)" : "Update from the school office (simulated)"); }}>{ar ? "محاكاة رد الإدارة" : "Simulate the school's reply"}</button>}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost !min-h-9 !bg-white text-sm" onClick={() => { setPick([]); setSheet({ kind: "invite", ev: e }); }}><Send size={14} /> {ar ? "دعوة صفوف" : "Invite classes"}</button>
                {!e.sponsorship && <button className="btn-ghost !min-h-9 !bg-white text-sm" onClick={() => { setReason(""); setSheet({ kind: "sponsor", ev: e }); }}><CircleDollarSign size={14} /> {ar ? "اطلب رعاية" : "Ask the school to sponsor"}</button>}
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="roster" className="glass rounded-[26px] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="roster" className="section-title">{ar ? "الطلاب" : "Students"}</h2>
            <div className="flex gap-1">{["All", ...CLASSES].map((c) => <button key={c} className="chip !px-2.5 !py-1 !text-xs" aria-pressed={filter === c} onClick={() => setFilter(c)}>{c === "All" ? (ar ? "الكل" : "All") : c}</button>)}</div>
          </div>
          <ul className="divide-y divide-black/5">
            {roster.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={s.name} userId={s.id} size={38} />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{ar ? s.nameAr : s.name}</span><span className="block text-xs text-[var(--muted)]">{ar ? "الصف" : "Grade"} {s.grade} · {ageOf(s)} {ar ? "سنة" : "yrs"}</span></span>
                <span className="text-xs font-semibold text-[var(--muted)]">{["8A", "8A", "8B"][i % 3]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "عينة من القائمة. في التجربة: من نظام معلومات الطلبة." : "Sample roster. In the pilot: from the student information system."}</p>
        </section>
      </div>

      <Sheet open={sheet?.kind === "new"} onClose={() => setSheet(null)} title={ar ? "فعالية جديدة" : "New event"}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!form.title.trim()) return; createEvent({ title: form.title.trim(), startsAt: new Date(form.date + "T13:00:00").toISOString(), place: form.place || (ar ? "المدرسة" : "School"), classes: form.classes }); setSheet(null); toast(ar ? "تم إنشاء الفعالية وإرسال الدعوات" : `Event created · invited ${form.classes.join(", ")}`); setForm({ ...form, title: "", place: "" }); }}>
          <label className="block text-sm font-semibold">{ar ? "العنوان" : "Title"}<input className="input mt-1 !bg-white" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={ar ? "مثال: يوم البرمجة" : "e.g. Coding day for Grade 8"} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm font-semibold">{ar ? "التاريخ" : "Date"}<input type="date" className="input mt-1 !bg-white" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="block text-sm font-semibold">{ar ? "المكان" : "Place"}<input className="input mt-1 !bg-white" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Lab 2" /></label>
          </div>
          <fieldset><legend className="text-sm font-semibold">{ar ? "دعوة الصفوف" : "Invite classes"}</legend><div className="mt-1 flex gap-2">{CLASSES.map((c) => <button type="button" key={c} className="chip" aria-pressed={form.classes.includes(c)} onClick={() => setForm({ ...form, classes: toggle(form.classes, c) })}>{c}</button>)}</div></fieldset>
          <button className="btn-ink w-full" disabled={!form.title.trim() || form.classes.length === 0}><CalendarPlus size={16} /> {ar ? "إنشاء ودعوة" : "Create and invite"}</button>
        </form>
      </Sheet>

      <Sheet open={sheet?.kind === "invite"} onClose={() => setSheet(null)} title={ar ? "دعوة صفوف" : "Invite classes"}>
        {sheet?.kind === "invite" && (
          <div className="space-y-3">
            <p className="text-sm">{sheet.ev.title}</p>
            <div className="flex gap-2">{CLASSES.filter((c) => !sheet.ev.classes.includes(c)).map((c) => <button key={c} className="chip" aria-pressed={pick.includes(c)} onClick={() => setPick(toggle(pick, c))}>{c}</button>)}</div>
            {CLASSES.every((c) => sheet.ev.classes.includes(c)) && <p className="text-sm text-[var(--muted)]">{ar ? "تمت دعوة كل صفوفك." : "All your classes are already invited."}</p>}
            <button className="btn-ink w-full" disabled={!pick.length} onClick={() => { inviteClasses(sheet.ev.id, pick); setSheet(null); toast(ar ? "أُرسلت الدعوات" : `Invited ${pick.join(", ")} — it's in their calendars`); }}><Send size={15} /> {ar ? "أرسل الدعوة" : "Send invite"}</button>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet?.kind === "sponsor"} onClose={() => setSheet(null)} title={ar ? "طلب رعاية من المدرسة" : "Ask the school to sponsor"}>
        {sheet?.kind === "sponsor" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); requestSponsorship(sheet.ev.id, amount, reason || (ar ? "مستلزمات الفعالية" : "Event materials")); setSheet(null); toast(ar ? "أُرسل طلب الرعاية" : "Sponsorship request sent"); }}>
            <p className="text-sm">{sheet.ev.title}</p>
            <label className="block text-sm font-semibold">{ar ? "المبلغ (درهم)" : "Amount (AED)"}<input type="number" min={50} step={50} className="input mt-1 !bg-white" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label>
            <label className="block text-sm font-semibold">{ar ? "لماذا؟" : "What it pays for"}<input className="input mt-1 !bg-white" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={ar ? "مثال: أدوات وطباعة" : "e.g. Kits and printing for 6 teams"} /></label>
            <button className="btn-ink w-full"><CircleDollarSign size={16} /> {ar ? "أرسل الطلب" : "Send request"}</button>
          </form>
        )}
      </Sheet>
    </div>
  );
}

export default function Students() {
  return <Suspense><StudentsInner /></Suspense>;
}
