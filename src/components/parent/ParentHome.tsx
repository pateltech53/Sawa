"use client";

// Parent home: "What would you like to do today?" — from the team's whiteboard.
// Child first (who, how old, which grade, when the next fee is), then the two most
// common jobs, then one card with every upcoming deadline, then what's already done.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowRightLeft, BadgeCheck, CalendarClock, Check, ChevronRight, CreditCard, FileSignature, GraduationCap, Inbox, Sparkles } from "lucide-react";
import { Avatar, EASE, Sheet, useToast } from "@/components/s/kit";
import { Mascot, SourceTag } from "@/components/ui";
import { ProactiveCard, Row } from "@/components/shell/notices";
import { fmtDate, relDays } from "@/lib/i18n";
import { SCHOOLS } from "@/lib/seed";
import { ageOf, useStore } from "@/lib/store";

type Deadline = { id: string; title: string; when: string; kind: "test" | "fee" | "form" | "approval" | "event"; href: string; source: string };
const KIND_ICON = { test: GraduationCap, fee: CreditCard, form: FileSignature, approval: BadgeCheck, event: CalendarClock } as const;
const KIND_TINT = { test: "#4073FF", fee: "#C23EA5", form: "#B68A35", approval: "#8C59F2", event: "#2E9E6B" } as const;

const days = (iso?: string) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : 0);

export function ParentHome() {
  const { state, me, myChildren, visibleNotices, toggleNotice, payFee } = useStore();
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const ar = state.lang === "ar";
  const L = state.lang;
  const [childIdx, setChildIdx] = useState(0);
  const [sheet, setSheet] = useState<null | "fee" | "switch">(null);
  const [showInbox, setShowInbox] = useState(false);
  const child = myChildren[childIdx];

  const feeApproval = state.approvals.find((a) => a.kind === "fees" && a.childId === child?.id && a.status === "pending");

  const deadlines = useMemo<Deadline[]>(() => {
    if (!child || !me) return [];
    const fromNotices: Deadline[] = visibleNotices
      .filter((n) => n.status === "open" && n.dueAt && n.kind !== "proactive")
      .map((n) => ({
        id: n.id, title: ar ? n.titleAr : n.titleEn, when: n.dueAt!, source: n.sourceSystem,
        kind: /quiz|test|exam/i.test(n.titleEn) ? "test" : n.kind === "event" ? "event" : n.sourceSystem === "Al Manhal" ? "form" : "test",
        href: n.action?.href ?? "/app/calendar",
      }));
    const fromApprovals: Deadline[] = state.approvals
      .filter((a) => a.childId === child.id && a.status === "pending" && a.dueAt)
      .map((a) => ({ id: a.id, title: (ar ? a.titleAr : a.titleEn) ?? "", when: a.dueAt!, kind: a.kind === "fees" ? "fee" : "approval", href: "/app/approvals", source: a.fromEn ?? "School" }));
    const rereg = visibleNotices.find((n) => n.id.startsWith("nudge-rereg"));
    const extra: Deadline[] = rereg?.dueAt ? [{ id: "rereg", title: ar ? "إعادة التسجيل للعام القادم" : "Re-enrolment for next year", when: rereg.dueAt, kind: "form", href: "/app/services", source: "Al Manhal" }] : [];
    return [...fromApprovals, ...extra, ...fromNotices].sort((a, b) => a.when.localeCompare(b.when)).slice(0, 7);
  }, [child, me, visibleNotices, state.approvals, ar]);

  const done = useMemo(() => {
    if (!child) return [];
    return [
      ...state.requests.filter((r) => r.childId === child.id).map((r) => ({ id: r.id, title: ar ? "تحديث الملف المدرسي" : "School file updated", at: r.updatedAt, note: r.status === "done" ? (ar ? "مكتمل" : "Completed") : (ar ? "قيد المراجعة" : "With the school") })),
      ...state.approvals.filter((a) => a.childId === child.id && a.status !== "pending").map((a) => ({ id: a.id, title: (ar ? a.titleAr : a.titleEn) ?? "", at: a.decidedAt ?? a.createdAt, note: a.status === "approved" ? (ar ? "تمت الموافقة" : "Approved") : (ar ? "مرفوض" : "Declined") })),
      ...state.payments.map((p) => ({ id: p.id, title: p.label, at: p.at, note: `AED ${p.amountAed}` })),
      ...visibleNotices.filter((n) => n.status === "done").map((n) => ({ id: n.id, title: ar ? n.titleAr : n.titleEn, at: n.dueAt ?? "", note: ar ? "تم" : "Done" })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  }, [child, state.requests, state.approvals, state.payments, visibleNotices, ar]);

  if (!me) return null;
  if (!child) return <p className="glass rounded-3xl p-5 text-sm">{ar ? "لا يوجد أبناء مرتبطون بعد." : "No linked children yet."}</p>;

  const school = SCHOOLS.find((s) => s.id === child.schoolId);
  const proactive = visibleNotices.filter((n) => n.kind === "proactive" && n.status === "open" && n.userId === me.id && !n.id.startsWith("nudge-rereg"));
  const firstName = (ar ? child.nameAr : child.name).split(" ")[0];
  const feeDays = feeApproval ? days(feeApproval.dueAt) : null;
  const allNotices = [...visibleNotices].sort((a, b) => (a.status === b.status ? 0 : a.status === "open" ? -1 : 1) || (a.dueAt ?? "9").localeCompare(b.dueAt ?? "9"));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      {/* ── left: the child ── */}
      <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
        <motion.section initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass glass-strong relative overflow-hidden rounded-[32px] p-5 text-center">
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,128,217,.28),transparent)]" />
          <p className="relative text-sm font-medium text-[var(--muted)]">{ar ? `مرحباً ${me.nameAr.split(" ")[0]}` : `Hello ${me.name.split(" ")[0]}`}</p>
          <h1 className="relative mt-0.5 text-balance text-[22px] font-bold leading-tight tracking-tight sm:text-[24px]">{ar ? "ماذا تريد أن تنجز اليوم؟" : "What would you like to do today?"}</h1>

          {myChildren.length > 1 && (
            <div className="relative mt-3 flex justify-center gap-1.5" role="tablist">
              {myChildren.map((c, i) => <button key={c.id} role="tab" aria-selected={i === childIdx} className="chip" onClick={() => setChildIdx(i)}>{ar ? c.nameAr : c.name}</button>)}
            </div>
          )}

          <div className="relative mx-auto mt-4 w-fit"><Avatar name={child.name} size={116} ring verified /></div>
          <p className="relative mt-2 text-lg font-bold">{firstName}</p>
          <p className="relative text-sm text-[var(--muted)]">{ar ? school?.nameAr : school?.name?.replace(" (sample)", "")}</p>

          <dl className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              [ar ? "العمر" : "Age", String(ageOf(child))],
              [ar ? "الصف" : "Grade", child.grade ?? "–"],
              [ar ? "أيام للرسوم" : "Days to fee", feeDays === null ? "–" : String(feeDays)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[20px] bg-white/70 px-2 py-3">
                <dd className="text-[22px] font-bold leading-none tracking-tight">{v}</dd>
                <dt className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{k}</dt>
              </div>
            ))}
          </dl>

          <div className="relative mt-3 grid grid-cols-2 gap-2">
            <button className="btn-ink w-full" onClick={() => setSheet("fee")} disabled={!feeApproval}><CreditCard size={17} /> {ar ? "دفع الرسوم" : "Pay fee"}</button>
            <Link href="/app/services#svc-reregistration" className="btn-ghost w-full !bg-white"><FileSignature size={17} /> {ar ? "إعادة التسجيل" : "Re-enrol"}</Link>
          </div>
          <button onClick={() => setSheet("switch")} className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"><ArrowRightLeft size={15} /> {ar ? "الاستفسار عن نقل المدرسة" : "Ask about switching schools"}</button>
        </motion.section>

        {proactive.map((n) => <ProactiveCard key={n.id} n={n} />)}
      </div>

      {/* ── right: what's coming and what's done ── */}
      <div className="min-w-0 space-y-4">
        <section className="glass rounded-[28px] p-4 sm:p-5" aria-labelledby="upcoming">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="upcoming" className="section-title">{ar ? `القادم لـ${firstName}` : `Coming up for ${firstName}`}</h2>
            <Link href="/app/calendar" className="link-info">{ar ? "التقويم" : "Calendar"}</Link>
          </div>
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center"><Mascot mood="celebrate" size={110} /><p className="mt-2 font-semibold">{ar ? "لا مواعيد قادمة" : "Nothing due. Enjoy the week."}</p></div>
          ) : (
            <ol className="space-y-2">
              {deadlines.map((d, i) => {
                const Icon = KIND_ICON[d.kind];
                const left = days(d.when);
                return (
                  <motion.li key={d.id} initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, ease: EASE }}>
                    <Link href={d.href} className="flex items-center gap-3 rounded-[20px] bg-white/65 p-3 transition hover:bg-white/90">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white" style={{ background: KIND_TINT[d.kind] }}><Icon size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{d.title}</span>
                        <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><SourceTag source={d.source} /> {fmtDate(d.when, L)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${left <= 3 ? "bg-pink-100 text-pink-700" : "bg-white text-[var(--ink-2)]"}`}>{relDays(d.when, L)}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="glass rounded-[28px] p-4 sm:p-5" aria-labelledby="done">
          <h2 id="done" className="section-title mb-3">{ar ? "أنجزته هذا الفصل" : "Done this term"}</h2>
          {done.length === 0 ? <p className="text-sm text-[var(--muted)]">{ar ? "ستظهر هنا الأمور التي أنهيتها." : "Things you finish will show up here."}</p> : (
            <ul className="divide-y divide-black/5">
              {done.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2E9E6B] text-white"><Check size={14} strokeWidth={3} /></span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.title}</span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">{d.note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="inbox">
          <button onClick={() => setShowInbox(!showInbox)} aria-expanded={showInbox} className="glass flex w-full items-center gap-3 rounded-[24px] p-4 text-start">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#121217] text-white"><Inbox size={18} /></span>
            <span className="min-w-0 flex-1"><span id="inbox" className="block font-semibold">{ar ? "كل ما وصل من المدرسة" : "Everything from school"}</span><span className="block text-xs text-[var(--muted)]">{ar ? `${allNotices.length} عناصر من ${new Set(allNotices.map((n) => n.sourceSystem)).size} أنظمة` : `${allNotices.length} items from ${new Set(allNotices.map((n) => n.sourceSystem)).size} systems, in one list`}</span></span>
            <ChevronRight size={18} className={`transition ${showInbox ? "rotate-90" : "rtl:rotate-180"}`} />
          </button>
          {showInbox && <ul className="mt-2 space-y-2.5">{allNotices.map((n) => <Row key={n.id} n={n} onToggle={() => toggleNotice(n.id)} />)}</ul>}
        </section>

        <Link href={`/app/ask?q=${encodeURIComponent(ar ? `ما المطلوب مني هذا الأسبوع لـ${firstName}؟` : `What do I need to do for ${firstName} this week?`)}`} className="group flex items-center gap-3 rounded-[28px] bg-[linear-gradient(120deg,#5C29BF,#8C59F2_55%,#F280D9)] p-4 text-white shadow-[0_18px_40px_-18px_rgba(92,41,191,.8)]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/30"><Sparkles size={22} /></span>
          <span className="min-w-0 flex-1"><span className="block font-bold">{ar ? "اسأل سوا" : "Ask Sawa"}</span><span className="block text-sm text-white/80">{ar ? "عن الرسوم أو التسجيل أو أي خدمة" : "Fees, enrolment, any school service"}</span></span>
          <ArrowRight size={18} className="transition group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      <Sheet open={sheet === "fee"} onClose={() => setSheet(null)} title={ar ? "دفع الرسوم" : "Pay a fee"}>
        {feeApproval && (
          <div className="space-y-3">
            <div className="rounded-[20px] bg-white p-4">
              <p className="font-semibold">{ar ? feeApproval.titleAr : feeApproval.titleEn}</p>
              <p className="text-sm text-[var(--muted)]">{ar ? feeApproval.detailAr : feeApproval.detailEn}</p>
              <p className="mt-3 flex items-baseline justify-between"><span className="text-sm">{ar ? "الدفعة الأولى" : "First instalment"}</span><span className="text-2xl font-bold">AED 150</span></p>
            </div>
            <p className="text-xs text-[var(--muted)]">{ar ? "محاكاة: لا يتم تحصيل أي مبلغ. في التجربة الفعلية يتم الدفع عبر بوابة الرسوم الحكومية." : "Simulated: no money moves. In the pilot this hands off to the school's fee portal."}</p>
            <button className="btn-ink w-full" onClick={() => { payFee(ar ? "دفعة رسوم الأنشطة" : "Activity fee · instalment 1", 150, feeApproval.id); setSheet(null); toast(ar ? "تم الدفع (محاكاة)" : "Paid AED 150 (simulated)"); }}>
              <CreditCard size={17} /> {ar ? "ادفع 150 درهم" : "Pay AED 150"}
            </button>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet === "switch"} onClose={() => setSheet(null)} title={ar ? "نقل المدرسة" : "Switching schools"}>
        <div className="space-y-3 text-sm">
          <p>{ar ? "يجهّز سوا طلب النقل من ملف العائلة، ويخبرك بالمقاعد المتاحة والمستندات المطلوبة." : "Sawa pre-fills a transfer from your family profile and tells you which schools have seats and what documents they'll ask for."}</p>
          <ul className="space-y-1.5">
            {(ar ? ["لا حاجة لإعادة إدخال بيانات الطالب", "قائمة بالمدارس القريبة حسب المنهج", "متابعة الطلب خطوة بخطوة"] : ["No re-typing your child's details", "Nearby schools by curriculum and rating (KHDA data)", "Track the request step by step"]).map((x) => (
              <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#2E9E6B]" /> {x}</li>
            ))}
          </ul>
          <button className="btn-ink w-full" onClick={() => { setSheet(null); router.push(`/app/ask?q=${encodeURIComponent(ar ? `كيف أنقل ${firstName} إلى مدرسة أخرى؟` : `How do I transfer ${firstName} to another school?`)}`); }}>
            <Sparkles size={17} /> {ar ? "اسأل سوا عن النقل" : "Ask Sawa about transferring"}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
