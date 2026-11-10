"use client";

// Parent approvals: school trips, fee plans, photo consent and the child's own requests
// for outside-school opportunities, each decided once with a logged (simulated) signature.
import { motion } from "motion/react";
import { Bus, Camera, Check, CreditCard, Fingerprint, Trophy, X } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { Mascot } from "@/components/ui";
import { useToast } from "@/components/s/kit";
import { fmtDate, relDays } from "@/lib/i18n";
import { OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Approval } from "@/lib/types";

const KIND = {
  trip: { icon: Bus, en: "School trip", ar: "رحلة مدرسية", tint: "#2E9E6B" },
  fees: { icon: CreditCard, en: "Fees", ar: "الرسوم", tint: "#C23EA5" },
  media: { icon: Camera, en: "Photo consent", ar: "موافقة التصوير", tint: "#4073FF" },
  opportunity: { icon: Trophy, en: "Outside school", ar: "خارج المدرسة", tint: "#8C59F2" },
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

export default function Approvals() {
  const { state, me, decide } = useStore();
  const toast = useToast();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  const mine = state.approvals.filter((a) => a.guardianId === me.id);
  const pending = mine.filter((a) => a.status === "pending").sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const past = mine.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "الموافقات" : "Approvals"} sub={ar ? "رحلات ورسوم وطلبات أبنائك، قرار واحد لكل منها" : "Trips, fees and your children's requests. One decision each."} />
      {pending.length === 0 && (
        <div className="glass flex flex-col items-center rounded-[28px] p-6 text-center"><Mascot mood="celebrate" size={130} /><p className="mt-2 font-semibold">{ar ? "لا شيء بانتظارك" : "Nothing waiting for you"}</p></div>
      )}
      <ul className="grid gap-3 md:grid-cols-2">
        {pending.map((a, i) => {
          const v = view(a, ar);
          const child = state.profiles.find((p) => p.id === a.childId)!;
          return (
            <motion.li key={a.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0 }}>
              <Card strong className="h-full">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white" style={{ background: v.kind.tint }}><v.kind.icon size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--muted)]">{ar ? v.kind.ar : v.kind.en} · {ar ? child.nameAr : child.name}{v.from ? ` · ${v.from}` : ""}</p>
                    <h2 className="text-lg font-bold leading-snug">{v.title}</h2>
                  </div>
                  {v.when && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold">{relDays(v.when, L)}</span>}
                </div>
                <p className="mt-2 text-sm text-[var(--ink-2)]">{v.detail}</p>
                <div className="mt-4 flex gap-2">
                  <button className="btn-ink flex-1" onClick={() => { decide(a.id, true); toast(ar ? "تمت الموافقة" : "Approved and signed (simulated)"); }}><Fingerprint size={16} /> {ar ? "موافقة" : "Approve"}</button>
                  <button className="btn-ghost !bg-white" onClick={() => { decide(a.id, false); toast(ar ? "تم الرفض" : "Declined"); }}><X size={16} /> {ar ? "رفض" : "Decline"}</button>
                </div>
                <p className="mt-2 text-[11px] text-[var(--muted)]">{ar ? "يُسجَّل القرار بتوقيت وتوقيع (محاكاة للتوقيع الرقمي)." : "Logged with a timestamp (UAE PASS signature simulated)."}</p>
              </Card>
            </motion.li>
          );
        })}
      </ul>
      {past.length > 0 && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "السجل" : "History"}</h2>
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
    </div>
  );
}
