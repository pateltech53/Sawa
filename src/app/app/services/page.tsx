"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Card, PageTitle, Pill, SourceTag } from "@/components/ui";
import { SERVICES } from "@/lib/seed";
import { useStore } from "@/lib/store";

function ServicesInner() {
  const { state, me } = useStore();
  const ar = state.lang === "ar";
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(params.get("open"));
  const mine = state.requests.filter((r) => r.requesterId === me?.id);
  const list = SERVICES.filter((s) => !q || `${s.nameEn} ${s.nameAr} ${s.ownerSystem}`.toLowerCase().includes(q.toLowerCase()));
  const systems = new Set(SERVICES.map((s) => s.ownerSystem)).size;

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "مركز الخدمات" : "Service hub"} sub={ar ? `${SERVICES.length} خدمات من ${systems} أنظمة — دخول واحد` : `${SERVICES.length} services from ${systems} systems — one login`} />
      <label className="relative block">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 opacity-50" size={18} />
        <input className="input !ps-11" placeholder={ar ? "ابحث عن خدمة…" : "Search services…"} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      {mine.length > 0 && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "طلباتي" : "My requests"}</h2>
          <ul className="space-y-2">
            {mine.map((r) => {
              const s = SERVICES.find((x) => x.id === r.serviceId)!;
              return (
                <li key={r.id}>
                  <Link href={`/app/requests/${r.id}`} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
                    <span className="font-semibold">{ar ? s.nameAr : s.nameEn}</span>
                    <Pill tone={r.status === "done" ? "green" : "gold"}>{r.status === "done" ? (ar ? "مكتمل" : "Done") : r.status === "in_review" ? (ar ? "قيد المراجعة" : "In review") : ar ? "مُرسل" : "Submitted"}</Pill>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s.id}>
            <Card className={`h-full ${s.isDemoFlow ? "ring-2 ring-black/80" : ""}`}>
              <div className="flex items-center justify-between gap-2"><SourceTag source={s.ownerSystem} />{s.isDemoFlow && <Pill tone="ink"><Sparkles size={12} /> {ar ? "مسار كامل" : "Full journey"}</Pill>}</div>
              <h3 className="mt-2 font-bold">{ar ? s.nameAr : s.nameEn}</h3>
              <p className="text-sm text-[var(--muted)]">{ar ? s.descAr : s.descEn}</p>
              <p className="mt-2 text-xs text-[var(--ink-2)]">{ar ? "معبّأ مسبقاً" : "Pre-filled"}: {s.fields.length}/{s.fields.length} {ar ? "حقول" : "fields"}</p>
              {s.href ? (
                <Link href={s.href} className="btn-ink mt-3 !min-h-10 text-sm">{ar ? "ابدأ" : "Start"} <ArrowRight size={15} className="rtl:rotate-180" /></Link>
              ) : (
                <button className="btn-ghost mt-3 !min-h-10 text-sm" onClick={() => setOpen(open === s.id ? null : s.id)}>{ar ? "تفاصيل" : "Details"}</button>
              )}
              {open === s.id && !s.href && (
                <p className="mt-2 rounded-2xl bg-white/70 p-3 text-xs pop">
                  {ar ? "في النموذج الأولي، مسار «تحديث ملف الطالب» مبني بالكامل. هذه الخدمة تُربط خلال التجربة مع " : "In this prototype the 'Update school file' journey is fully built. This service connects in the pilot via "}
                  <b>{s.ownerSystem}</b>.
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Services() {
  return <Suspense><ServicesInner /></Suspense>;
}
