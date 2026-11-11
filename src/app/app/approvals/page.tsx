"use client";

// Parent › Family: everything about the child in one tab — approvals to decide, current
// grades, the child's week, school events to sign them up for, and school enquiries.
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { SegmentedControl } from "glisse";
import { ArrowDownRight, ArrowUpRight, Bus, Camera, CalendarDays, Check, CreditCard, Fingerprint, MapPin, MessageSquareReply, Trophy, X } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { Mascot } from "@/components/ui";
import { Avatar, useToast } from "@/components/s/kit";
import { fmtDate, relDays } from "@/lib/i18n";
import { GRADES, OPPORTUNITIES, SCHOOLS, SCHOOL_EVENTS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Approval } from "@/lib/types";

const KIND = {
  trip: { icon: Bus, en: "School trip", ar: "رحلة مدرسية", tint: "#2E9E6B" },
  fees: { icon: CreditCard, en: "Fees", ar: "الرسوم", tint: "#9C2E85" },
  media: { icon: Camera, en: "Permission", ar: "إذن", tint: "#2C58E6" },
  opportunity: { icon: Trophy, en: "Outside school", ar: "خارج المدرسة", tint: "#5C29BF" },
} as const;

function view(a: Approval, ar: boolean) {
  const o = a.opportunityId ? OPPORTUNITIES.find((x) => x.id === a.opportunityId) : undefined;
  const school = o ? SCHOOLS.find((s) => s.id === o.schoolId) : undefined;
  return {
    kind: KIND[a.kind ?? "opportunity"],
    title: (ar ? a.titleAr : a.titleEn) ?? (o ? (ar ? o.titleAr : o.titleEn) : ""),
    detail: (ar ? a.detailAr : a.detailEn) ?? (o ? `${ar ? o.descAr : o.descEn} · ${ar ? school?.nameAr : school?.name}` : ""),
    when: a.dueAt ?? o?.startsAt,
    from: a.fromEn,
  };
}

type Tab = "approvals" | "grades" | "calendar" | "events" | "enquiries";

function FamilyInner() {
  const { state, me, myChildren, decide, visibleNotices, toggleEventSignup } = useStore();
  const toast = useToast();
  const params = useSearchParams();
  const L = state.lang;
  const ar = L === "ar";
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) ?? "approvals");
  if (!me) return null;
  const child = myChildren[0];
  const mine = state.approvals.filter((a) => a.guardianId === me.id);
  const pending = mine.filter((a) => a.status === "pending").sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const past = mine.filter((a) => a.status !== "pending");
  const signups = state.eventSignups[me.id] ?? [];
  const enquiries = state.enquiries.filter((e) => e.ownerId === me.id);
  const avg = Math.round(GRADES.reduce((n, g) => n + g.mark, 0) / GRADES.length);

  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  const childItems = [
    ...visibleNotices.filter((n) => n.userId === child?.id && n.dueAt && n.status === "open").map((n) => ({ id: n.id, title: ar ? n.titleAr : n.titleEn, at: n.dueAt!, src: n.sourceSystem })),
    ...SCHOOL_EVENTS.filter((e) => signups.includes(`${child?.id}:${e.id}`)).map((e) => ({ id: e.id, title: ar ? e.titleAr : e.title, at: e.at, src: ar ? "فعالية" : "Event" })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="space-y-4">
      {child && (
        <header className="flex items-center gap-3">
          <Avatar name={child.name} userId={child.id} size={52} verified />
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] leading-tight">{ar ? `عائلة ${child.nameAr}` : `${child.name.split(" ")[0]}'s family hub`}</h1>
            <p className="text-sm text-[var(--muted)]">{ar ? `الصف ${child.grade} · ${pending.length} بانتظار قرارك` : `Grade ${child.grade} · ${pending.length} waiting for your decision`}</p>
          </div>
        </header>
      )}

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <SegmentedControl
          className="min-w-[520px]"
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          items={[
            { value: "approvals", label: `${ar ? "الموافقات" : "Approvals"}${pending.length ? ` · ${pending.length}` : ""}` },
            { value: "grades", label: ar ? "الدرجات" : "Grades" },
            { value: "calendar", label: ar ? "التقويم" : "Calendar" },
            { value: "events", label: ar ? "الفعاليات" : "Events" },
            { value: "enquiries", label: ar ? "الاستفسارات" : "Enquiries" },
          ]}
        />
      </div>

      {tab === "approvals" && (
        <>
          {pending.length === 0 && <div className="glass flex flex-col items-center rounded-[28px] p-6 text-center"><Mascot mood="celebrate" size={130} /><p className="mt-2 font-semibold">{ar ? "لا شيء بانتظارك" : "Nothing waiting for you"}</p></div>}
          <ul className="grid gap-3 md:grid-cols-2">
            {pending.map((a, i) => {
              const v = view(a, ar);
              const c = state.profiles.find((p) => p.id === a.childId)!;
              return (
                <motion.li key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}>
                  <Card strong className="h-full">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white" style={{ background: v.kind.tint }}><v.kind.icon size={19} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--muted)]">{ar ? v.kind.ar : v.kind.en} · {ar ? c.nameAr : c.name}{v.from ? ` · ${v.from}` : ""}</p>
                        <h2 className="text-[17px] font-semibold leading-snug">{v.title}</h2>
                      </div>
                      {v.when && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">{relDays(v.when, L)}</span>}
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink-2)]">{v.detail}</p>
                    <div className="mt-4 flex gap-2">
                      <button className="btn-ink flex-1" onClick={() => { decide(a.id, true); toast(ar ? "تمت الموافقة" : "Approved and signed (simulated)"); }}><Fingerprint size={16} /> {ar ? "موافقة" : "Approve"}</button>
                      <button className="btn-ghost !bg-white" onClick={() => { decide(a.id, false); toast(ar ? "تم الرفض" : "Declined"); }}><X size={16} /> {ar ? "رفض" : "Decline"}</button>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </ul>
          {past.length > 0 && (
            <Card>
              <h2 className="section-title mb-2">{ar ? "السجل" : "History"}</h2>
              <ul className="space-y-2 text-sm">
                {past.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2">
                    <span className="min-w-0 truncate">{view(a, ar).title}</span>
                    <Pill tone={a.status === "approved" ? "green" : "red"}>{a.status === "approved" ? <><Check size={12} /> {ar ? "موافق" : "Approved"}</> : ar ? "مرفوض" : "Declined"} · {fmtDate(a.decidedAt, L)}</Pill>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {tab === "grades" && (
        <section className="grid gap-3 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <Card strong className="flex flex-col justify-between">
            <p className="text-sm text-[var(--muted)]">{ar ? "المعدل هذا الفصل" : "Average this term"}</p>
            <p className="h-display text-[64px] leading-none tabular-nums">{avg}<span className="text-2xl">%</span></p>
            <p className="text-xs text-[var(--muted)]">{ar ? "من بوابة التعلّم الذكي · عينة" : "From the Smart Learning Portal · sample"}</p>
          </Card>
          <Card>
            <ul className="divide-y divide-black/5">
              {GRADES.map((g) => {
                const up = g.mark >= g.prev;
                return (
                  <li key={g.subject} className="flex items-center gap-3 py-3">
                    <span className="min-w-0 flex-1"><span className="block font-semibold">{ar ? g.subjectAr : g.subject}</span><span className="block truncate text-xs text-[var(--muted)]">{g.last} · {g.teacher}</span></span>
                    <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-black/8 sm:block"><span className="block h-full rounded-full bg-[#121217]" style={{ width: `${g.mark}%` }} /></span>
                    <span className="w-10 text-end text-lg font-semibold tabular-nums">{g.mark}</span>
                    <span className={`inline-flex w-[72px] items-center justify-end gap-0.5 text-xs font-semibold ${up ? "text-[#1F7A50]" : "text-[#a3271f]"}`}>{up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(g.mark - g.prev)} {ar ? "عن الماضي" : "vs last"}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}

      {tab === "calendar" && (
        <Card>
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((d, i) => {
              const n = childItems.filter((x) => new Date(x.at).toDateString() === d.toDateString()).length;
              return (
                <div key={i} className={`flex h-[68px] flex-col items-center justify-center rounded-2xl ${i === 0 ? "bg-[#121217] text-white" : "bg-white/60"}`}>
                  <span className="text-[10px] font-semibold uppercase opacity-70">{d.toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short" })}</span>
                  <span className="text-lg font-semibold leading-none">{d.getDate()}</span>
                  <span className="mt-1 flex h-1.5 gap-0.5">{Array.from({ length: Math.min(n, 3) }).map((_, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-[#121217]"}`} />)}</span>
                </div>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1.5">
            {childItems.length === 0 && <li className="text-sm text-[var(--muted)]">{ar ? "لا شيء مجدول." : "Nothing scheduled."}</li>}
            {childItems.map((x) => (
              <li key={x.id} className="flex items-center gap-3 rounded-[18px] bg-white/65 px-3 py-2.5">
                <CalendarDays size={16} className="shrink-0 text-[var(--muted)]" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{x.title}</span><span className="block text-xs text-[var(--muted)]">{x.src} · {fmtDate(x.at, L, true)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "events" && child && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOOL_EVENTS.map((e) => {
            const key = `${child.id}:${e.id}`;
            const on = signups.includes(key);
            return (
              <li key={e.id} className="glass overflow-hidden rounded-[26px]">
                <div className="relative h-36"><img src={e.photo} alt="" className="h-full w-full object-cover" />{e.consent && <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold">{ar ? "يحتاج موافقتك" : "Needs your consent"}</span>}</div>
                <div className="p-4">
                  <h3 className="font-semibold leading-snug">{ar ? e.titleAr : e.title}</h3>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-[var(--muted)]"><span>{fmtDate(e.at, L, true)}</span><span className="inline-flex items-center gap-1"><MapPin size={11} />{e.place}</span></p>
                  <p className="text-xs text-[var(--muted)]">{e.by}</p>
                  <button className={`mt-3 w-full ${on ? "btn-ghost !bg-white" : "btn-ink"} !min-h-10 text-sm`} onClick={() => { toggleEventSignup(key); toast(on ? (ar ? "أُلغي التسجيل" : "Signed out") : ar ? `تم تسجيل ${child.nameAr}${e.consent ? " مع موافقتك" : ""}` : `${child.name} is signed up${e.consent ? " — your consent is recorded" : ""}`); }}>
                    {on ? <><Check size={15} /> {ar ? "مسجّلة · إلغاء" : "Signed up · undo"}</> : ar ? `سجّل ${child.nameAr}` : `Sign ${child.name.split(" ")[0]} up`}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "enquiries" && (
        <Card>
          {enquiries.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{ar ? "لا استفسارات بعد. من الرئيسية: «الاستفسار عن نقل المدرسة»." : "No enquiries yet. From Home, open ‘Ask about switching schools’."} <Link href="/app/today" className="link-info">{ar ? "الرئيسية" : "Home"}</Link></p>
          ) : (
            <ul className="space-y-2">
              {enquiries.map((e) => {
                const s = SCHOOLS.find((x) => x.id === e.schoolId);
                return (
                  <li key={e.id} className="rounded-[18px] bg-white/70 p-3">
                    <p className="font-semibold">{ar ? s?.nameAr : s?.name.replace(" (sample)", "")}</p>
                    <p className="text-xs text-[var(--muted)]">{ar ? "استفسار عن الأيام المفتوحة" : "Open day enquiry"} · {fmtDate(e.at, L, true)}</p>
                    {e.reply ? <p className="mt-2 flex gap-2 rounded-xl bg-[#1F7A50]/10 p-2.5 text-sm"><MessageSquareReply size={15} className="mt-0.5 shrink-0 text-[#1F7A50]" />{e.reply}</p> : <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "بانتظار رد المدرسة" : "Waiting for the school's reply"}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

export default function Family() {
  return <Suspense><FamilyInner /></Suspense>;
}
