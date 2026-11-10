"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarCheck, CalendarDays, Check, Clock, Lock, MapPin, Megaphone, MessageSquare, Send, ShieldCheck, ThumbsUp, Users } from "lucide-react";
import { CommunityBadge } from "@/components/s/cards";
import { Avatar, EASE, useToast } from "@/components/s/kit";
import { COMMUNITIES, COMMUNITY_ACTIVITIES } from "@/lib/seed";
import { ageOf, useStore } from "@/lib/store";

type Tab = "announcements" | "discussion" | "activities" | "about";

export default function CommunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, me, joinCommunity, leaveCommunity, createPost, toggleHelpful, toggleActivity } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("announcements");
  const [draft, setDraft] = useState("");
  const c = COMMUNITIES.find((x) => x.id === id);
  if (!me) return null;
  if (!c) return <div className="glass rounded-[24px] p-5">Community not found. <Link href="/app/communities" className="link-info">Back</Link></div>;

  const age = ageOf(me);
  const locked = age < c.minAge;
  const joined = (state.joined[me.id] ?? []).includes(c.id);
  const posts = state.posts.filter((p) => p.communityId === c.id && (p.status === "approved" || p.author.includes("(you)")));
  const announcements = posts.filter((p) => p.kind === "announcement");
  const discussion = posts.filter((p) => p.kind === "discussion");
  const acts = COMMUNITY_ACTIVITIES.filter((a) => a.communityId === c.id);
  const going = state.activitiesJoined[me.id] ?? [];
  const canPost = joined && age >= 15;

  const tabs: [Tab, string, typeof Megaphone][] = [["announcements", "Notices", Megaphone], ["discussion", "Discussion", MessageSquare], ["activities", "Activities", CalendarDays], ["about", "About", Users]];

  return (
    <div className="space-y-4">
      <Link href="/app/communities" className="inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft size={16} className="rtl:rotate-180" /> Communities</Link>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="glass relative overflow-hidden rounded-[28px] p-4">
        <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60" style={{ background: c.tint, filter: "blur(30px)" }} />
        <div className="relative flex items-center gap-3">
          <CommunityBadge c={c} size={68} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[var(--muted)]">{c.emirate} · {c.scope === "school" ? "School club" : "Cross-school"}</p>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{c.name}</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">{c.members.toLocaleString()} members · <span className="text-[#2E9E6B]">{c.online} online</span></p>
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <span className="chip !bg-white/70 !text-xs"><ShieldCheck size={12} /> Moderated by {c.moderators?.[0]}</span>
          <span className="chip !bg-white/70 !text-xs">Ages {c.minAge}+</span>
        </div>
        <div className="relative mt-4">
          {locked ? (
            <span className="btn-ghost w-full"><Lock size={16} /> Opens when you turn {c.minAge}</span>
          ) : joined ? (
            <button className="btn-ghost w-full" onClick={() => { leaveCommunity(c.id); toast(`Left ${c.name}`); }}><Check size={16} /> Joined · tap to leave</button>
          ) : (
            <button className="btn-ink w-full" onClick={() => { joinCommunity(c.id); toast(`Welcome to ${c.name}`); }}>Join community</button>
          )}
        </div>
      </motion.section>

      <div className="glass flex rounded-full p-1" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="relative flex-1 rounded-full py-2 text-[13px] font-semibold">
            {tab === k && <motion.span layoutId="com-tab" className="absolute inset-0 rounded-full bg-[#121217]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className={`relative ${tab === k ? "text-white" : ""}`}>{l}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {(tab === "announcements" || tab === "discussion") && (
            <div className="space-y-2.5">
              {tab === "discussion" && (
                canPost ? (
                  <form className="glass rounded-[24px] p-3" onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; const r = createPost(c.id, draft.trim()); toast(r === "pending" ? "Sent to moderators — it appears once approved" : "Posting isn't available for under-15s"); setDraft(""); }}>
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} placeholder={`Share something with ${c.name}…`} className="w-full resize-none bg-transparent text-[15px] outline-none" rows={2} aria-label="New post" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted)]">Reviewed by a moderator before it appears</span>
                      <button className="btn-ink !min-h-9 !px-4 text-sm" disabled={!draft.trim()}><Send size={14} /> Post</button>
                    </div>
                  </form>
                ) : (
                  <p className="flex items-start gap-2 rounded-2xl bg-white/45 p-3 text-sm text-[var(--muted)]"><Lock size={14} className="mt-0.5 shrink-0" />
                    {age < 15 ? "Under-15 accounts can read and mark posts helpful, but can't post or message. Ask your club teacher to share your ideas." : "Join this community to take part in discussions."}</p>
                )
              )}
              {(tab === "announcements" ? announcements : discussion).map((p, i) => {
                const helped = (state.helpfulBy[p.id] ?? []).includes(me.id);
                return (
                  <motion.article key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-[24px] p-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.author} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.author}</p>
                        <p className="text-xs text-[var(--muted)]">{p.role === "teacher" ? "Teacher" : p.role === "moderator" ? "Moderator" : "Member"} · {new Date(p.createdAt).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      {p.status === "pending" && <span className="rounded-full bg-[#B68A35]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#7d5d1f]">Awaiting review</span>}
                    </div>
                    <p className="mt-2.5 text-[15px] leading-relaxed">{p.body}</p>
                    {p.status === "approved" && (
                      <button onClick={() => toggleHelpful(p.id)} aria-pressed={helped} className={`chip mt-3 ${helped ? "!bg-[#121217] !text-white" : ""}`}><ThumbsUp size={13} /> Helpful</button>
                    )}
                  </motion.article>
                );
              })}
              {(tab === "announcements" ? announcements : discussion).length === 0 && <p className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">Nothing here yet.</p>}
            </div>
          )}

          {tab === "activities" && (
            <ul className="space-y-2">
              {acts.map((a) => {
                const on = going.includes(a.id);
                return (
                  <li key={a.id} className="glass flex items-center gap-3 rounded-[22px] p-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/70 text-center leading-none">
                      <span><span className="block text-[10px] font-bold uppercase text-[var(--muted)]">{new Date(a.startsAt).toLocaleDateString("en-GB", { month: "short" })}</span><span className="block text-lg font-bold">{new Date(a.startsAt).getDate()}</span></span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{a.titleEn}</span>
                      <span className="flex items-center gap-2 text-xs text-[var(--muted)]"><Clock size={11} /> {new Date(a.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} <MapPin size={11} /> {a.place}</span>
                    </span>
                    <motion.button whileTap={{ scale: 0.92 }} disabled={!joined} onClick={() => { toggleActivity(a.id); toast(on ? "Removed from your calendar" : "Added to your calendar"); }} aria-pressed={on}
                      className={`rounded-full px-3 py-2 text-xs font-bold transition disabled:opacity-40 ${on ? "bg-[#2E9E6B]/15 text-[#1F7A50]" : "bg-[#121217] text-white"}`}>
                      {on ? <span className="inline-flex items-center gap-1"><CalendarCheck size={13} /> Going</span> : "I'm going"}
                    </motion.button>
                  </li>
                );
              })}
              {!joined && <p className="px-1 text-xs text-[var(--muted)]">Join the community to add activities to your calendar.</p>}
            </ul>
          )}

          {tab === "about" && (
            <div className="glass space-y-3 rounded-[24px] p-4 text-[15px]">
              <p className="leading-relaxed">{c.aboutEn}</p>
              <div>
                <p className="label-xs mb-1.5">Moderators</p>
                {c.moderators?.map((m) => <p key={m} className="flex items-center gap-2 text-sm"><Avatar name={m} size={28} /> {m}</p>)}
              </div>
              <div>
                <p className="label-xs mb-1.5">Community rules</p>
                <ul className="list-disc space-y-1 ps-5 text-sm text-[var(--ink-2)]">
                  <li>Be kind and stay on topic.</li><li>No personal contact details or photos of other students.</li><li>Every post is reviewed before it appears.</li><li>No direct messages — talk in the community or in person.</li>
                </ul>
              </div>
              <p className="text-xs text-[var(--muted)]">{c.members.toLocaleString()} members. Member lists aren&apos;t shown, to protect students&apos; privacy.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
