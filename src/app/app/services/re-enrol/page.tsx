"use client";

// Re-enrol: Sawa checks every prerequisite first (ID valid, documents on file, fees,
// guardian verified), pre-fills the form from the family profile, then submits to
// Al Manhal (simulated) and opens the status timeline.
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { useToast } from "@/components/s/kit";
import { fmtDate } from "@/lib/i18n";
import { FEE_PLAN } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function ReEnrol() {
  const { state, me, myChildren, submitRequest } = useStore();
  const router = useRouter();
  const toast = useToast();
  const L = state.lang;
  const ar = L === "ar";
  const [transport, setTransport] = useState(true);
  const child = myChildren[0];
  if (!me || !child) return null;
  const fact = (f: string) => state.facts.find((x) => x.childId === child.id && x.field === f)?.value ?? "";
  const expiry = fact("eid_expiry");
  const idDays = expiry ? Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000) : 0;
  const docs = state.documents.filter((d) => d.ownerId === me.id);
  const paid = state.payments.filter((p) => p.label.startsWith("Activity fee")).length;
  const dueNow = FEE_PLAN.filter((f, i) => i >= paid && new Date(f.dueAt).getTime() < Date.now()).length;
  const existing = state.requests.find((r) => r.serviceId === "svc-reregistration" && r.childId === child.id);

  const checks = [
    { ok: idDays > 30, label: ar ? "هوية الطالب سارية" : "Emirates ID is valid", note: idDays > 30 ? (ar ? `حتى ${fmtDate(expiry, L)}` : `Until ${fmtDate(expiry, L)}`) : ar ? `تنتهي خلال ${idDays} يوماً، حدّثها أولاً` : `Expires in ${idDays} days — update it first`, fix: idDays > 30 ? undefined : { href: "/app/services/school-file", label: ar ? "تحديث" : "Update" } },
    { ok: docs.some((d) => d.kind === "passport"), label: ar ? "جواز السفر في ملف العائلة" : "Passport on the family profile", note: docs.some((d) => d.kind === "passport") ? (ar ? "مرفوع" : "On file") : ar ? "غير مرفوع" : "Not added", fix: docs.some((d) => d.kind === "passport") ? undefined : { href: "/app/documents", label: ar ? "إضافة" : "Add" } },
    { ok: true, label: ar ? "آخر تقرير مدرسي" : "Last report card", note: ar ? "من بوابة التعلّم الذكي" : "From the Smart Learning Portal" },
    { ok: dueNow === 0, label: ar ? "لا رسوم متأخرة" : "No overdue fees", note: dueNow === 0 ? (ar ? "لا شيء متأخر" : "Nothing overdue") : ar ? `${dueNow} قسط متأخر` : `${dueNow} instalment overdue` },
    { ok: true, label: ar ? "ولي أمر موثّق" : "Verified guardian", note: "UAE PASS (simulated)" },
  ];
  const blocking = checks.filter((c) => !c.ok && c.fix);
  const fields: [string, string][] = [
    [ar ? "اسم الطالب" : "Student", fact("full_name")],
    [ar ? "رقم الهوية" : "Emirates ID", fact("eid_number")],
    [ar ? "الصف العام القادم" : "Grade next year", String(Number(child.grade ?? 8) + 1)],
    [ar ? "ولي الأمر" : "Guardian", fact("guardian_name")],
    [ar ? "المنطقة" : "Area", fact("address_area")],
  ];

  const submit = () => {
    const id = submitRequest({ serviceId: "svc-reregistration", childId: child.id, payload: { ...Object.fromEntries(fields), transport: transport ? "yes" : "no" }, fieldsRetyped: 0, fieldsPrefilled: fields.length });
    toast(ar ? "أُرسل طلب إعادة التسجيل" : "Re-enrolment sent to Al Manhal");
    router.push(`/app/requests/${id}`);
  };

  return (
    <div className="space-y-4">
      <Link href="/app/today" className="inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft size={16} className="rtl:rotate-180" /> {ar ? "الرئيسية" : "Home"}</Link>
      <PageTitle title={ar ? `إعادة تسجيل ${child.nameAr}` : `Re-enrol ${child.name} for next year`} sub={ar ? "يتحقق سوا من المتطلبات ويعبّئ النموذج من ملف العائلة" : "Sawa checks what's needed and fills the form from your family profile"} />

      {existing ? (
        <Link href={`/app/requests/${existing.id}`} className="glass flex items-center gap-3 rounded-[24px] p-4">
          <Check size={20} /> <span className="flex-1 font-semibold">{ar ? "أُرسل الطلب، تابع حالته" : "Already sent — track its status"}</span>
        </Link>
      ) : null}

      <section className="glass rounded-[26px] p-4 sm:p-5" aria-labelledby="pre">
        <h2 id="pre" className="section-title mb-3">{ar ? "المتطلبات" : "What's needed"}</h2>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3 rounded-[18px] bg-white/65 px-3 py-2.5">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${c.ok ? "bg-[#1F7A50] text-white" : "bg-[#B68A35] text-white"}`}>{c.ok ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} />}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{c.label}</span><span className="block text-xs text-[var(--muted)]">{c.note}</span></span>
              {c.fix && <Link href={c.fix.href} className="btn-ink !min-h-9 shrink-0 !px-3 text-xs">{c.fix.label}</Link>}
            </li>
          ))}
        </ul>
        <Link href={`/app/ask?q=${encodeURIComponent(ar ? "ما المطلوب لإعادة التسجيل؟" : "What do I need for re-enrolment?")}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"><Sparkles size={15} /> {ar ? "اسأل سوا عن المتطلبات" : "Ask Sawa about the requirements"}</Link>
      </section>

      <section className="glass rounded-[26px] p-4 sm:p-5" aria-labelledby="form">
        <div className="mb-3 flex items-center justify-between"><h2 id="form" className="section-title">{ar ? "النموذج" : "The form"}</h2><span className="rounded-full bg-[#1F7A50]/12 px-2.5 py-1 text-xs font-semibold text-[#1F7A50]">{fields.length}/{fields.length} {ar ? "معبّأ" : "pre-filled"}</span></div>
        <dl className="divide-y divide-black/5">
          {fields.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-sm"><dt className="text-[var(--muted)]">{k}</dt><dd className="flex items-center gap-1.5 font-semibold">{v}<Lock size={12} className="opacity-40" /></dd></div>)}
        </dl>
        <label className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-white/70 px-4 py-3 text-sm font-medium">
          {ar ? "يحتاج النقل المدرسي العام القادم" : "Needs the school bus next year"}
          <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} className="h-5 w-5 accent-[#121217]" />
        </label>
      </section>

      <button className="btn-ink w-full" disabled={blocking.length > 0 || Boolean(existing)} onClick={submit}>{ar ? "أرسل إعادة التسجيل" : "Send re-enrolment"}</button>
      {blocking.length > 0 && <p className="text-center text-xs text-[var(--muted)]">{ar ? "أكمل المتطلبات المعلّمة أولاً." : "Fix the items marked above first."}</p>}
    </div>
  );
}
