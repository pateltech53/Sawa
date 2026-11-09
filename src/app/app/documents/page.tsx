"use client";

import Link from "next/link";
import { Link2, ShieldCheck } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { FIELD_LABELS, SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";

/** F9 — the single family profile every service reads (profile_facts + service_field_map). */
export default function TellUsOnce() {
  const { state, me, myChildren } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  const childIds = me.role === "parent" ? myChildren.map((c) => c.id) : me.role === "student" ? [me.id] : [];
  const facts = state.facts.filter((f) => childIds.includes(f.childId));

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "أخبرنا مرة واحدة" : "Tell us once"} sub={ar ? "ملف واحد تقرأ منه كل الخدمات. حدّثه مرة، فيتحدّث في كل مكان." : "One profile every service reads. Update it once, it changes everywhere."} />
      <div className="flex flex-wrap gap-2">
        <Pill tone="green"><ShieldCheck size={12} /> {ar ? "أنت فقط وأبناؤك المرتبطون" : "Only you and your linked children"}</Pill>
        <Pill>{ar ? "قانون حماية البيانات الشخصية 45/2021" : "PDPL · Decree-Law 45/2021"}</Pill>
      </div>
      {facts.length === 0 && <Card>{ar ? "لا يوجد ملف عائلي لهذا الدور." : "No family profile for this role."}</Card>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {facts.map((f) => {
          const usedBy = SERVICES.filter((s) => s.fields.includes(f.field));
          return (
            <Card as="li" key={f.childId + f.field} className="!p-4">
              <p className="text-xs font-semibold text-[var(--muted)]">{ar ? FIELD_LABELS[f.field]?.ar : FIELD_LABELS[f.field]?.en}</p>
              <p className="text-lg font-bold">{f.value}</p>
              <p className="text-[11px] text-[var(--muted)]">{ar ? "المصدر" : "Source"}: {f.sourceDoc} · {ar ? "تحقق" : "verified"} {fmtDate(f.verifiedAt, L)}</p>
              <p className="mt-2 flex flex-wrap items-center gap-1 text-[11px]"><Link2 size={11} /> {ar ? "تستخدمه:" : "Used by:"} {[...new Set(usedBy.map((s) => s.ownerSystem))].map((s) => <span key={s} className="rounded-full bg-black/80 px-2 py-0.5 font-semibold text-white">{s}</span>)}</p>
            </Card>
          );
        })}
      </ul>
      {me.role === "parent" && <Link href="/app/services/school-file" className="btn-ink w-full">{ar ? "حدّث من وثيقة" : "Update from a document"}</Link>}
    </div>
  );
}
