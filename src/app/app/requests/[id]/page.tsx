"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { FIELD_LABELS, SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { RequestStatus } from "@/lib/types";

const ORDER: RequestStatus[] = ["submitted", "in_review", "done"];

export default function RequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, me } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const req = state.requests.find((r) => r.id === id);
  // Visibility: the requester and school staff only.
  if (!req || !me || (req.requesterId !== me.id && me.role !== "teacher")) {
    return <Card><p>{ar ? "الطلب غير موجود." : "Request not found."}</p></Card>;
  }
  const svc = SERVICES.find((s) => s.id === req.serviceId)!;
  const labels: Record<RequestStatus, [string, string]> = { submitted: ["Submitted", "مُرسل"], in_review: ["In review by school office", "قيد المراجعة في مكتب المدرسة"], done: ["Done — updated everywhere", "مكتمل — حُدّث في كل مكان"] };
  const idx = ORDER.indexOf(req.status);

  return (
    <div className="space-y-4">
      <Link href="/app/services" className="inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft size={16} className="rtl:rotate-180" /> {ar ? "الخدمات" : "Services"}</Link>
      <PageTitle title={ar ? svc.nameAr : svc.nameEn} sub={`#${req.id.slice(4)} · ${svc.ownerSystem}`} right={<Pill tone={req.status === "done" ? "green" : "gold"}>{labels[req.status][ar ? 1 : 0]}</Pill>} />
      <Card strong>
        <ol className="relative space-y-5 ps-8">
          <span className="absolute start-3 top-2 bottom-2 w-0.5 bg-black/10" />
          {ORDER.map((s, i) => {
            const h = req.history.find((x) => x.status === s);
            return (
              <li key={s} className="relative">
                <span className={`absolute -start-8 top-0 grid h-6 w-6 place-items-center rounded-full ${i <= idx ? "bg-black text-white" : "bg-white/70 ring-1 ring-black/15"}`}>{i <= idx ? <Check size={14} /> : null}</span>
                <p className={`font-semibold ${i > idx ? "text-[var(--muted)]" : ""}`}>{labels[s][ar ? 1 : 0]}</p>
                {h && <p className="text-xs text-[var(--muted)]">{fmtDate(h.at, L, true)}</p>}
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-[var(--muted)]">{ar ? "يتحدّث مباشرة عندما يغيّر مكتب المدرسة الحالة." : "Updates live when the school office changes the status."}</p>
      </Card>
      <Card>
        <h2 className="mb-2 font-bold">{ar ? "البيانات المرسلة" : "Submitted details"}</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          {Object.entries(req.payload).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/70 px-3 py-2"><dt className="text-xs text-[var(--muted)]">{ar ? FIELD_LABELS[k]?.ar : FIELD_LABELS[k]?.en ?? k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-3 text-sm"><b>{req.fieldsRetyped}</b> {ar ? "حقول أعيدت كتابتها ·" : "fields re-typed ·"} <b>{req.fieldsPrefilled}</b> {ar ? "معبّأة مسبقاً" : "pre-filled"}</p>
      </Card>
    </div>
  );
}
