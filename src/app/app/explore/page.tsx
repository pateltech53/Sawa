"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Clock, Lock, MapPin, ShieldCheck, Users } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { COMMUNITIES, INTERESTS, OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { ageOf, tierOf, useStore } from "@/lib/store";

const SchoolMap = dynamic(() => import("@/components/SchoolMap"), { ssr: false, loading: () => <div className="shimmer h-[340px] rounded-3xl" /> });

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

export default function Explore() {
  const { state, me, register, joinCommunity } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const [tab, setTab] = useState<"ops" | "map" | "comm">("ops");
  const [toast, setToast] = useState<string | null>(null);
  if (!me) return null;

  const age = ageOf(me);
  const tier = tierOf(me);
  const home = SCHOOLS.find((s) => s.id === me.schoolId)!;
  const ranked = OPPORTUNITIES.map((o) => {
    const overlap = o.interests.filter((i) => me.interests.includes(i));
    return { o, overlap, score: overlap.length * 2 + (o.schoolId === me.schoolId ? 1 : 0) };
  }).sort((a, b) => b.score - a.score);
  const pending = (opId: string) => state.approvals.find((a) => a.childId === me.id && a.opportunityId === opId && a.status === "pending");
  const isReg = (opId: string) => (state.registered[me.id] ?? []).includes(opId);
  const joined = state.joined[me.id] ?? [];
  const label = (id: string) => INTERESTS.find((i) => i.id === id);

  const onRegister = (opId: string) => {
    const r = register(opId);
    setToast(r === "pending" ? (ar ? "أُرسل الطلب إلى ولي أمرك للموافقة ✉️" : "Sent to your guardian for approval ✉️") : r === "ineligible" ? (ar ? "هذا النشاط لفئة عمرية أكبر." : "This one is for an older age group.") : ar ? "تم التسجيل! 🎉" : "You're registered! 🎉");
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "استكشف" : "Explore"} sub={ar ? "مسابقات وورش وأندية مختارة لاهتماماتك" : "Competitions, workshops and clubs matched to you"} />
      <div className="flex flex-wrap gap-2">
        <Pill tone={tier === "u15" ? "gold" : "green"}><ShieldCheck size={12} /> {tier === "u15" ? (ar ? `فئة دون 15 · العمر ${age}` : `Under-15 tier · age ${age}`) : `15+ · ${age}`}</Pill>
        {tier === "u15" && <Pill>{ar ? "لا رسائل خاصة · لا نشر عام" : "No DMs · no public posts"}</Pill>}
      </div>
      <div className="glass flex rounded-full p-1" role="tablist">
        {([["ops", ar ? "الفرص" : "Opportunities"], ["map", ar ? "الخريطة" : "Map"], ["comm", ar ? "المجتمعات" : "Communities"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 rounded-full py-2 text-sm font-bold transition ${tab === k ? "bg-black text-white" : ""}`}>{l}</button>
        ))}
      </div>

      {tab === "ops" && (
        <ul className="space-y-3">
          {ranked.map(({ o, overlap }) => {
            const school = SCHOOLS.find((s) => s.id === o.schoolId)!;
            const tooYoung = age < o.minAge;
            return (
              <Card key={o.id} as="li" className="rise">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      <Pill tone="ink">{o.type.toUpperCase()}</Pill>
                      {overlap.length > 0 && <Pill tone="gold">✨ {ar ? "مطابق لاهتماماتك" : "Matches you"}</Pill>}
                      {o.needsConsent && tier === "u15" && <Pill>{ar ? "يحتاج موافقة" : "Needs guardian OK"}</Pill>}
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{ar ? o.titleAr : o.titleEn}</h3>
                  </div>
                </div>
                <p className="text-sm text-[var(--ink-2)]">{ar ? o.descAr : o.descEn}</p>
                <p className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {fmtDate(o.startsAt, L)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {ar ? school.nameAr : school.name} · {km(home, school)} km</span>
                  <span>{o.minAge}+</span>
                </p>
                {overlap.length > 0 && (
                  <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs">
                    <b>{ar ? "لماذا يناسبك:" : "Why this matches you:"}</b>{" "}
                    {ar ? `لأنك تحب ${overlap.map((i) => label(i)?.ar).join(" و")}، وهو على بعد ${km(home, school)} كم.` : `you picked ${overlap.map((i) => label(i)?.en).join(" & ")}, and it's ${km(home, school)} km away.`}
                  </p>
                )}
                <div className="mt-3">
                  {isReg(o.id) ? <Pill tone="green"><Check size={12} /> {ar ? "مسجّل" : "Registered"}</Pill>
                    : pending(o.id) ? <Pill tone="gold"><Clock size={12} /> {ar ? "بانتظار موافقة ولي الأمر" : "Waiting for guardian approval"}</Pill>
                    : tooYoung ? <Pill><Lock size={12} /> {ar ? `للأعمار ${o.minAge}+` : `For ages ${o.minAge}+`}</Pill>
                    : me.role === "student" && (
                      <button className="btn-ink !min-h-10 text-sm" onClick={() => onRegister(o.id)}>
                        {o.needsConsent && tier === "u15" ? (ar ? "اطلب موافقة ولي الأمر" : "Ask my guardian") : ar ? "سجّل" : "Register"}
                      </button>
                    )}
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      {tab === "map" && (
        <div className="space-y-2">
          <SchoolMap schools={SCHOOLS} opportunities={OPPORTUNITIES} homeSchoolId={me.schoolId} lang={L} />
          <p className="text-xs text-[var(--muted)]">{ar ? "المدارس بتنسيق مجموعة بيانات هيئة المعرفة (دبي بالس) — بيانات تجريبية حالياً. الذهبي = مدرستك." : "Schools in the KHDA / Dubai Pulse dataset format — sample rows for now. Gold = your school."}</p>
        </div>
      )}

      {tab === "comm" && (
        <ul className="space-y-3">
          {COMMUNITIES.map((c) => {
            const locked = age < c.minAge;
            const isIn = joined.includes(c.id);
            return (
              <Card key={c.id} as="li" className={`flex items-center gap-3 ${locked ? "opacity-60" : ""}`}>
                <span className="jelly h-12 w-12 shrink-0 text-xl">{label(c.interests[0])?.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--muted)]">{c.emirate} · {c.scope === "school" ? (ar ? "نادي المدرسة" : "School club") : ar ? "بين المدارس" : "Cross-school"}</p>
                  <p className="font-bold">{ar ? c.nameAr : c.name}</p>
                  <p className="flex items-center gap-2 text-xs text-[var(--muted)]"><Users size={12} /> {c.members} · <ShieldCheck size={12} /> {ar ? "بإشراف" : "Moderated"}</p>
                </div>
                {locked ? <Pill><Lock size={12} /> 15+</Pill> : isIn ? <Pill tone="green"><Check size={12} /> {ar ? "عضو" : "Joined"}</Pill> : <button className="btn-ink !min-h-9 text-sm" onClick={() => joinCommunity(c.id)}>{ar ? "انضم" : "Join"}</button>}
              </Card>
            );
          })}
          {tier === "u15" && <p className="text-center text-xs text-[var(--muted)]">{ar ? "المجتمعات بين المدارس تُفتح عند 15 سنة. حتى ذلك الحين: أندية مدرستك فقط." : "Cross-school communities unlock at 15. Until then: your own school's clubs."}</p>}
        </ul>
      )}

      {toast && <div role="status" className="fixed inset-x-0 bottom-28 z-50 mx-auto w-fit rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-xl pop">{toast}</div>}
    </div>
  );
}
