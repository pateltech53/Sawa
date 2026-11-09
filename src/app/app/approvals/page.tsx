"use client";

import { Check, Fingerprint, X } from "lucide-react";
import { Card, Empty, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function Approvals() {
  const { state, me, decide } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  const mine = state.approvals.filter((a) => a.guardianId === me.id);
  const pending = mine.filter((a) => a.status === "pending");
  const past = mine.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "الموافقات" : "Approvals"} sub={ar ? "طلبات أبنائك للأنشطة خارج المدرسة" : "Your children's requests for outside-school activities"} />
      {pending.length === 0 && <Empty text={ar ? "لا توجد طلبات معلّقة." : "No pending requests."} />}
      {pending.map((a) => {
        const o = OPPORTUNITIES.find((x) => x.id === a.opportunityId)!;
        const child = state.profiles.find((p) => p.id === a.childId)!;
        const school = SCHOOLS.find((s) => s.id === o.schoolId)!;
        return (
          <Card key={a.id} strong className="pop">
            <Pill tone="gold">{ar ? child.nameAr : child.name} · {ar ? "يحتاج قرارك" : "Needs your decision"}</Pill>
            <h2 className="mt-2 text-lg font-bold">{ar ? o.titleAr : o.titleEn}</h2>
            <p className="text-sm text-[var(--ink-2)]">{ar ? o.descAr : o.descEn}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{fmtDate(o.startsAt, L)} · {ar ? school.nameAr : school.name} · {o.minAge}+</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-ink flex-1" onClick={() => decide(a.id, true)}><Fingerprint size={16} /> {ar ? "موافقة" : "Approve"}</button>
              <button className="btn-ghost" onClick={() => decide(a.id, false)}><X size={16} /> {ar ? "رفض" : "Decline"}</button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--muted)]">{ar ? "يُسجَّل القرار بتوقيت وتوقيع (محاكاة للتوقيع الرقمي)." : "Decision is logged with a timestamp (UAE PASS signature simulated)."}</p>
          </Card>
        );
      })}
      {past.length > 0 && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "السجل" : "History"}</h2>
          <ul className="space-y-2 text-sm">
            {past.map((a) => {
              const o = OPPORTUNITIES.find((x) => x.id === a.opportunityId)!;
              return (
                <li key={a.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
                  <span>{ar ? o.titleAr : o.titleEn}</span>
                  <Pill tone={a.status === "approved" ? "green" : "red"}>{a.status === "approved" ? <><Check size={12} /> {ar ? "موافق" : "Approved"}</> : ar ? "مرفوض" : "Declined"} · {fmtDate(a.decidedAt, L)}</Pill>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
