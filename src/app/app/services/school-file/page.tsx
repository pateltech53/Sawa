"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Link2, Lock, PartyPopper } from "lucide-react";
import { Card, Mascot, PageTitle, Pill } from "@/components/ui";
import { DocumentReader, ExtractedFields, type ReadResult } from "@/components/DocumentReader";
import { FIELD_LABELS, SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function SchoolFileJourney() {
  const { state, me, myChildren, confirmFacts, submitRequest } = useStore();
  const router = useRouter();
  const ar = state.lang === "ar";
  const child = myChildren[0];
  const [step, setStep] = useState(0);
  const [read, setRead] = useState<ReadResult | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [reqId, setReqId] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [secs, setSecs] = useState(0);
  const [outcome, setOutcome] = useState({ changed: 0, systems: 0, retyped: 0 });

  const svc = SERVICES.find((s) => s.id === "svc-school-file")!;
  const current = useMemo(
    () => Object.fromEntries(state.facts.filter((f) => f.childId === child?.id).map((f) => [f.field, f.value])),
    [state.facts, child?.id],
  );
  const factMeta = (field: string) => state.facts.find((f) => f.childId === child?.id && f.field === field);

  if (!me || me.role !== "parent" || !child) {
    return (
      <Card><p>{ar ? "هذه الخدمة لأولياء الأمور." : "This service is for guardians."}</p><Link className="btn-ghost mt-3" href="/app/today">{ar ? "رجوع" : "Back"}</Link></Card>
    );
  }

  const changedFields = Object.keys(values).filter((f) => current[f] !== values[f]);
  const usedBy = SERVICES.filter((s) => s.fields.some((f) => changedFields.includes(f)));
  const steps = ar ? ["تحقق", "ارفع", "أكّد"] : ["Check", "Upload", "Confirm"];
  const typedByHand = Object.keys(values).filter((f) => values[f] !== read?.fields[f]?.value).length;

  const submit = () => {
    setOutcome({ changed: changedFields.length, systems: new Set(usedBy.map((s) => s.ownerSystem)).size, retyped: typedByHand });
    confirmFacts(child.id, values, read?.docType ?? "Uploaded document");
    const id = submitRequest({
      serviceId: svc.id, childId: child.id,
      payload: { ...current, ...values },
      fieldsRetyped: typedByHand, fieldsPrefilled: svc.fields.length - typedByHand,
    });
    setSecs(Math.round((Date.now() - startedAt) / 1000));
    setReqId(id);
    setStep(3);
  };

  return (
    <div>
      <Link href="/app/services" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft size={16} className="rtl:rotate-180" /> {ar ? "الخدمات" : "Services"}</Link>
      <PageTitle title={ar ? svc.nameAr : svc.nameEn} sub={`${ar ? "لـ" : "For"} ${ar ? child.nameAr : child.name} · ${svc.ownerSystem}`} />

      {step < 3 && (
        <ol className="mb-4 flex gap-2">
          {steps.map((s, i) => (
            <li key={s} className={`flex flex-1 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${i === step ? "bg-black text-white" : i < step ? "bg-white/80" : "bg-white/40 text-[var(--muted)]"}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${i < step ? "bg-black text-white" : "bg-white/30"}`}>{i < step ? <Check size={12} /> : i + 1}</span>{s}
            </li>
          ))}
        </ol>
      )}

      {step === 0 && (
        <Card strong className="rise">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill tone="green"><Check size={12} /> {ar ? `${svc.fields.length} من ${svc.fields.length} حقول معبّأة مسبقاً` : `${svc.fields.length} of ${svc.fields.length} fields pre-filled`}</Pill>
            <Pill>{ar ? "من ملف العائلة" : "From your family profile"}</Pill>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {svc.fields.map((f) => {
              const m = factMeta(f);
              const expiring = f === "eid_expiry" && m && new Date(m.value).getTime() - Date.now() < 30 * 86_400_000;
              return (
                <li key={f} className={`rounded-2xl p-3 ${expiring ? "bg-aered-50 ring-2 ring-aered-300" : "bg-white/70"}`}>
                  <p className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">{ar ? FIELD_LABELS[f].ar : FIELD_LABELS[f].en} <Lock size={12} /></p>
                  <p className="font-semibold">{m?.value ?? "—"}</p>
                  <p className="text-[11px] text-[var(--muted)]">{ar ? "المصدر" : "Source"}: {m?.sourceDoc}</p>
                  {expiring && <p className="mt-1 text-xs font-bold text-aered-700">{ar ? "تنتهي قريباً — حدّث الوثيقة" : "Expiring soon — update the document"}</p>}
                </li>
              );
            })}
          </ul>
          <button className="btn-ink mt-4 w-full" onClick={() => setStep(1)}>{ar ? "ارفع الهوية المجددة" : "Upload the renewed ID"}</button>
        </Card>
      )}

      {step === 1 && (
        <Card strong className="rise">
          {!read ? (
            <>
              <p className="mb-3 text-sm text-[var(--ink-2)]">{ar ? "صوّر البطاقة الجديدة. سيقرأ سوا الحقول ويعرضها عليك لتتحقق منها." : "Take a photo of the new card. Sawa reads the fields and shows them to you to check."}</p>
              <DocumentReader onRead={(r) => { setRead(r); setValues(Object.fromEntries(Object.entries(r.fields).map(([k, v]) => [k, v.value]))); }} />
            </>
          ) : (
            <>
              <ExtractedFields result={read} values={values} setValues={setValues} current={current} />
              <div className="mt-4 flex gap-2">
                <button className="btn-ghost" onClick={() => setRead(null)}>{ar ? "إعادة" : "Retake"}</button>
                <button className="btn-ink flex-1" onClick={() => setStep(2)}>{ar ? "الحقول صحيحة" : "These are correct"}</button>
              </div>
            </>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card strong className="rise space-y-4">
          <div>
            <h2 className="font-bold">{ar ? "ما الذي سيتغير" : "What will change"}</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {changedFields.length === 0 && <li className="text-[var(--muted)]">{ar ? "لا تغييرات." : "No changes."}</li>}
              {changedFields.map((f) => (
                <li key={f} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 px-3 py-2">
                  <span className="font-semibold">{ar ? FIELD_LABELS[f]?.ar : FIELD_LABELS[f]?.en}</span>
                  <span className="text-[var(--muted)] line-through">{current[f]}</span>→<span className="font-semibold">{values[f]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2 font-bold"><Link2 size={16} /> {ar ? "يُحدَّث تلقائياً في" : "Updated automatically in"}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...new Set(usedBy.map((s) => s.ownerSystem))].map((sys) => <Pill key={sys} tone="ink">{sys}</Pill>)}
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">{usedBy.length} {ar ? "خدمات تستخدم هذه الحقول" : "services use these fields"}: {usedBy.map((s) => (ar ? s.nameAr : s.nameEn)).join(" · ")}</p>
          </div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" defaultChecked className="mt-1 h-5 w-5 accent-black" /> {ar ? "أؤكد أن البيانات صحيحة وأوافق على مشاركتها مع الخدمات المذكورة." : "I confirm these details are correct and agree to share them with the services listed."}</label>
          <button className="btn-ink w-full" onClick={submit}>{ar ? "أكّد وأرسل" : "Confirm & submit"}</button>
        </Card>
      )}

      {step === 3 && reqId && (
        <Card strong className="pop text-center">
          <div className="flex justify-center"><Mascot size={120} wave /></div>
          <PartyPopper className="mx-auto mt-2" />
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold">{ar ? "تم الإرسال!" : "Submitted!"}</h2>
          <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
            {[
              [String(outcome.retyped), ar ? "حقول أعيدت كتابتها" : "fields re-typed"],
              [String(outcome.systems), ar ? "أنظمة حُدّثت" : "systems updated"],
              [`${secs}s`, ar ? "الوقت" : "time taken"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/80 p-3"><p className="font-[family-name:var(--font-display)] text-3xl font-extrabold">{n}</p><p className="text-[11px] font-semibold text-[var(--muted)]">{l}</p></div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button className="btn-ink" onClick={() => router.push(`/app/requests/${reqId}`)}>{ar ? "تتبّع الحالة" : "Track status"}</button>
            <Link className="btn-ghost" href="/app/impact">{ar ? "قبل / بعد" : "Before / after"}</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
