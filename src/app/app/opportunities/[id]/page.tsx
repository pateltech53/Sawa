"use client";

import { uiLocale } from "@/lib/tr";
import { use, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Bell, Check, Clock, MapPin, Send, Sparkles, Users, Wallet, X } from "lucide-react";
import { SaveButton } from "@/components/s/cards";
import { EASE, spring, useToast } from "@/components/s/kit";
import { OPPORTUNITIES } from "@/lib/seed";
import { eligibility, matchOpportunity, TYPE_LABEL } from "@/lib/match";
import { ageOf, useStore } from "@/lib/store";
import { BRAND } from "@/lib/brand";

export default function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, me, register, addReminder } = useStore();
  const toast = useToast();
  const [checking, setChecking] = useState(false);
  const o = OPPORTUNITIES.find((x) => x.id === id);
  if (!me) return null;
  if (!o) return <div className="glass rounded-[24px] p-5">Opportunity not found. <Link className="link-info" href="/app/explore">Back</Link></div>;

  const m = matchOpportunity(me, o);
  const el = eligibility(me, o);
  const registered = (state.registered[me.id] ?? []).includes(o.id);
  const pending = state.approvals.find((a) => a.childId === me.id && a.opportunityId === o.id && a.status === "pending");
  const denied = state.approvals.find((a) => a.childId === me.id && a.opportunityId === o.id && a.status === "denied");
  const needsGuardian = o.needsConsent && ageOf(me) < 15;
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(uiLocale(), { weekday: "short", day: "numeric", month: "short" }) : "—");

  const onRegister = () => {
    const r = register(o.id);
    toast(r === "pending" ? "Request sent to your guardian" : r === "ineligible" ? "This one isn't open to your age" : "You're registered — it's on your calendar");
  };

  return (
    <div className="space-y-4 pb-4">
      <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}
        className="relative overflow-hidden rounded-[30px] border border-white/70" style={{ background: `linear-gradient(180deg, ${o.tint ?? "#ddd"} 0%, ${o.tint ?? "#ddd"}88 100%)` }}>
        <div className="flex items-center justify-between p-3">
          <Link href="/app/explore" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/70"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
          <SaveButton opId={o.id} />
        </div>
        <div className="relative h-[170px]">
          {o.image ? (
             
            <motion.img src={o.image} alt="" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, ...spring }} className="absolute bottom-0 right-4 h-[180px] w-[180px] object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,.2)]" />
          ) : <span className="absolute bottom-4 right-6 font-[family-name:var(--font-serif)] text-6xl text-black/60">{TYPE_LABEL[o.type]}</span>}
          <div className="absolute bottom-4 left-4 max-w-[60%]">
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">{TYPE_LABEL[o.type]}</span>
            <h1 className="mt-2 text-[24px] font-bold leading-tight tracking-tight">{o.titleEn}</h1>
          </div>
        </div>
      </motion.section>

      <section className="glass flex items-center gap-4 rounded-[24px] p-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="3.5" />
            <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke={BRAND.iris} strokeWidth="3.5" strokeLinecap="round" pathLength={1} initial={{ pathLength: 0 }} animate={{ pathLength: m.score / 100 }} transition={{ duration: 0.9, ease: EASE }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-sm font-bold">{m.score}%</span>
        </div>
        <div>
          <p className="flex items-center gap-1 font-semibold"><Sparkles size={14} className="text-iris-500" /> Why it matches you</p>
          <ul className="mt-1 space-y-0.5 text-sm text-[var(--ink-2)]">{m.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {[[Clock, "When", `${fmt(o.startsAt)}${o.durationEn ? ` · ${o.durationEn}` : ""}`], [Bell, "Apply by", fmt(o.deadline ?? o.startsAt)], [MapPin, "Where", `${o.organiser?.replace(" (sample)", "")} · ${m.distance} km`], [Users, "Team", o.teamSize ?? "Individual"], [Wallet, "Cost", o.fee ?? "Free"], [Check, "Ages", `${o.minAge}${o.maxAge ? `–${o.maxAge}` : "+"}`]].map(([I, l, v]) => {
          const Icon = I as typeof Clock;
          return (
            <div key={l as string} className="glass rounded-[20px] p-3">
              <p className="label-xs flex items-center gap-1"><Icon size={11} /> {l as string}</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{v as string}</p>
            </div>
          );
        })}
      </section>

      <section className="glass rounded-[24px] p-4">
        <h2 className="section-title">About</h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{o.detailsEn ?? o.descEn}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">Organiser: {o.organiser} · listing is sample data</p>
      </section>

      <section className="glass rounded-[24px] p-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Eligibility check</h2>
          {!checking && <button className="link-info" onClick={() => setChecking(true)}>Check now</button>}
        </div>
        {checking ? (
          <ul className="mt-2 space-y-2">
            {el.checks.map((c, i) => (
              <motion.li key={c.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.25 }} className="flex items-start gap-3 rounded-2xl bg-white/45 px-3 py-2.5">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.25 + 0.15, ...spring }} className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${c.ok ? "bg-[#1F7A50]" : "bg-[#D0453B]"}`}>{c.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}</motion.span>
                <span><span className="block text-sm font-semibold">{c.label}</span><span className="block text-xs text-[var(--muted)]">{c.detail}</span></span>
              </motion.li>
            ))}
          </ul>
        ) : <p className="mt-1 text-sm text-[var(--muted)]">Checks your age, location and team requirements before you apply.</p>}
      </section>

      <div className="sticky bottom-28 z-10 space-y-2">
        <div className="glass flex gap-2 rounded-[28px] p-2">
          {registered ? (
            <span className="btn-ghost flex-1 !bg-[#1F7A50]/15 !text-[#1F7A50]"><Check size={17} /> Registered</span>
          ) : pending ? (
            <span className="btn-ghost flex-1"><Send size={16} /> Waiting for guardian</span>
          ) : !el.ok ? (
            <span className="btn-ghost flex-1 opacity-70">Not open to your age</span>
          ) : (
            <button className="btn-ink flex-1" onClick={onRegister}>{needsGuardian ? <><Send size={16} /> Ask my guardian</> : "Register"}</button>
          )}
          <button className="btn-ghost !px-4" aria-label="Add a reminder before the deadline" onClick={() => { const d = new Date(o.deadline ?? o.startsAt); d.setDate(d.getDate() - 1); addReminder(`Deadline: ${o.titleEn}`, (d > new Date() ? d : new Date(Date.now() + 3_600_000)).toISOString(), `/app/opportunities/${o.id}`); toast("Reminder added to your calendar"); }}><Bell size={17} /></button>
        </div>
        {denied && !pending && !registered && <p className="text-center text-xs text-[var(--muted)]">Your guardian declined an earlier request. Talk to them, then ask again.</p>}
      </div>
    </div>
  );
}
