"use client";

import Link from "next/link";
import { Card, Empty, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";

/** School-office queue. Only staff may change service_requests.status (enforced by RLS in Supabase). */
export default function Office() {
  const { state, me, setRequestStatus } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  if (me.role !== "teacher") return <Card>{ar ? "لموظفي المدرسة فقط." : "School staff only."}</Card>;

  return (
    <div className="space-y-3">
      <PageTitle title={ar ? "مكتب المدرسة" : "School office"} sub={ar ? "طلبات أولياء الأمور — بلا إعادة إدخال" : "Guardian requests — no re-keying into another system"} />
      {state.requests.length === 0 && <Empty text={ar ? "لا طلبات بعد. أرسل طلباً كولي أمر أولاً." : "No requests yet — submit one as the parent first."} />}
      {state.requests.map((r) => {
        const s = SERVICES.find((x) => x.id === r.serviceId)!;
        const child = state.profiles.find((p) => p.id === r.childId);
        return (
          <Card key={r.id}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold">{ar ? s.nameAr : s.nameEn}</p>
                <p className="text-xs text-[var(--muted)]">{ar ? child?.nameAr : child?.name} · {fmtDate(r.updatedAt, L, true)} · {r.fieldsPrefilled} {ar ? "حقول معبّأة" : "fields pre-filled"}</p>
              </div>
              <Pill tone={r.status === "done" ? "green" : "gold"}>{r.status}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-ghost !min-h-9 text-sm" disabled={r.status !== "submitted"} onClick={() => setRequestStatus(r.id, "in_review")}>{ar ? "بدء المراجعة" : "Start review"}</button>
              <button className="btn-ink !min-h-9 text-sm" disabled={r.status === "done"} onClick={() => setRequestStatus(r.id, "done")}>{ar ? "اعتماد وإكمال" : "Approve & complete"}</button>
              <Link className="btn-ghost !min-h-9 text-sm" href={`/app/requests/${r.id}`}>{ar ? "عرض" : "View"}</Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
