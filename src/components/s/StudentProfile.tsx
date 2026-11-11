"use client";

import { uiLocale } from "@/lib/tr";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Database, FileCheck2, Languages, LogOut, MapPin, Plug, RotateCcw, School, Share2, Sparkles, UserCog } from "lucide-react";
import { Avatar, EASE, Progress, SectionHead, Sheet, useToast } from "./kit";
import { CommunityBadge, OppCard } from "./cards";
import { COMMUNITIES, INTERESTS, OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { matchOpportunity } from "@/lib/match";
import { ageOf, tierOf, useStore } from "@/lib/store";
import type { Project, Role } from "@/lib/types";

export function StudentProfile() {
  const { state, me, setLang, signIn, signOut, reset, updateBio, setInterests, setProjectProgress } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<"projects" | "saved" | "communities">("projects");
  const [edit, setEdit] = useState(false);
  const [editInterests, setEditInterests] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  if (!me) return null;

  const school = SCHOOLS.find((s) => s.id === me.schoolId);
  const bio = state.bios[me.id] ?? { handle: me.name.toLowerCase(), bio: "" };
  const verified = Boolean(state.verification[me.id]);
  const joined = COMMUNITIES.filter((c) => (state.joined[me.id] ?? []).includes(c.id));
  const saved = OPPORTUNITIES.filter((o) => (state.saved[me.id] ?? []).includes(o.id));
  const registered = OPPORTUNITIES.filter((o) => (state.registered[me.id] ?? []).includes(o.id));
  const projects = state.projects.filter((p) => p.userId === me.id);

  const achievements = [
    ...(verified ? [{ t: "Verified account", s: "Demo verification", img: "/figma/icons/logo3d.png" }] : []),
    ...registered.map((o) => ({ t: "Registered", s: o.titleEn, img: o.image ?? "/figma/icons/journey.png" })),
    { t: "Robotics Finalist", s: "Sample · school fair", img: "/figma/interests/coding.png" },
    { t: "Photo Award", s: "Sample · school expo", img: "/figma/interests/photography.png" },
    ...(joined.length >= 2 ? [{ t: "Connector", s: `${joined.length} communities`, img: "/figma/icons/people.png" }] : []),
  ];

  const switchTo = (r: Role) => { signIn(r); router.push("/app/today"); };

  return (
    <div className="space-y-5">
      {/* Figma profile header */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="glass rounded-[25px] p-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={me.name} size={84} ring verified={verified} />
          <div className="min-w-0">
            <h1 className="truncate text-[21px] font-bold tracking-tight">{me.name}</h1>
            <p className="text-[13px] font-semibold text-[var(--muted)]">@{bio.handle}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#121217] px-2.5 py-0.5 text-[11px] font-bold text-white">Grade {me.grade}</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-bold"><MapPin size={10} /> Dubai</span>
              <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-bold">{tierOf(me) === "u15" ? "Under-15 tier" : "15+ tier"}</span>
            </div>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--muted)]"><School size={11} /> {school?.name}</p>
          </div>
        </div>
        {bio.bio && <p className="mt-3 text-sm text-[var(--ink-2)]">{bio.bio}</p>}
        <div className="mt-3.5 grid grid-cols-4 rounded-[18px] bg-white/35 py-2 text-center">
          {[[registered.length, "Joined"], [saved.length, "Saved"], [joined.length, "Communities"], [projects.length, "Projects"]].map(([n, l]) => (
            <div key={l as string}><p className="text-lg font-bold">{n}</p><p className="text-[11px] text-[var(--muted)]">{l}</p></div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-ink !min-h-10 flex-1 text-[13px]" onClick={() => setEdit(true)}>Edit profile</button>
          <button className="btn-ghost !min-h-10 flex-1 text-[13px]" onClick={async () => { try { await navigator.clipboard?.writeText(`${location.origin}/p/${bio.handle}`); } catch {} toast("Portfolio link copied (visible to your school only)"); }}><Share2 size={14} /> Share profile</button>
        </div>
      </motion.section>

      <section>
        <SectionHead title="Achievements" />
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
          {achievements.map((a, i) => (
            <motion.div key={a.t + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass flex w-[108px] shrink-0 flex-col items-center rounded-[22px] px-1.5 py-2.5 text-center">
              { }
              <img src={a.img} alt="" className="h-[58px] w-[58px] object-contain" />
              <p className="mt-1 line-clamp-1 text-xs font-bold">{a.t}</p>
              <p className="line-clamp-1 text-[10px] text-[var(--muted)]">{a.s}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Interests" action={<button className="link-info" onClick={() => setEditInterests(true)}>Edit</button>} />
        <div className="flex flex-wrap gap-1.5">{me.interests.map((i) => <span key={i} className="chip">{INTERESTS.find((x) => x.id === i)?.en}</span>)}</div>
      </section>

      <div className="flex gap-5 px-1" role="tablist">
        {(["projects", "saved", "communities"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="relative pb-1.5 text-[16px] font-bold capitalize">
            <span className={tab === k ? "" : "text-black/40"}>{k}</span>
            {tab === k && <motion.span layoutId="prof-tab" className="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-[#121217]" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "projects" && (
            <ul className="space-y-2.5">
              {projects.map((p) => (
                <li key={p.id}>
                  <button onClick={() => setProject(p)} className="glass w-full rounded-[22px] px-3.5 py-3 text-start">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/60">{p.image ? <img src={p.image} alt="" className="h-8 w-8 object-contain" /> : <Sparkles size={16} />}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{p.title}</span><span className="block text-[11px] text-[var(--muted)]">{p.role}</span></span>
                    </div>
                    <div className="mt-2.5"><Progress value={p.progress} /></div>
                    <p className="mt-1.5 text-[11px] text-[var(--muted)]">{p.progress}%{p.due ? ` · due ${new Date(p.due).toLocaleDateString(uiLocale(), { day: "numeric", month: "short" })}` : ""}</p>
                  </button>
                </li>
              ))}
              {projects.length === 0 && <li className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">Start a project with the + button.</li>}
            </ul>
          )}
          {tab === "saved" && (
            <div className="grid gap-3">
              {saved.map((o) => <OppCard key={o.id} m={matchOpportunity(me, o)} />)}
              {saved.length === 0 && <p className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">Saved opportunities appear here.</p>}
            </div>
          )}
          {tab === "communities" && (
            <ul className="space-y-2">
              {joined.map((c) => (
                <li key={c.id}><Link href={`/app/communities/${c.id}`} className="glass flex items-center gap-3 rounded-[24px] p-2"><CommunityBadge c={c} size={44} /><span className="flex-1 font-semibold">{c.name}</span><ChevronRight size={16} className="me-2 opacity-40" /></Link></li>
              ))}
              {joined.length === 0 && <li className="glass rounded-[22px] p-4 text-sm text-[var(--muted)]">No communities yet.</li>}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>

      <section className="glass rounded-[24px] p-2">
        {[
          { href: "/app/connections", icon: Plug, label: "School apps" },
          { href: "/app/documents", icon: FileCheck2, label: "My details (tell us once)" },
          { href: "/app/data", icon: Database, label: "Data sources & privacy" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-white/50"><l.icon size={18} /><span className="flex-1 font-semibold">{l.label}</span><ChevronRight size={16} className="opacity-40 rtl:rotate-180" /></Link>
        ))}
        <button onClick={() => setLang(state.lang === "ar" ? "en" : "ar")} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 hover:bg-white/50"><Languages size={18} /><span className="flex-1 text-start font-semibold">Language</span><span className="chip">{state.lang === "ar" ? "English" : "العربية"}</span></button>
      </section>

      <section className="glass rounded-[24px] p-4">
        <p className="label-xs mb-2 flex items-center gap-1"><UserCog size={12} /> Demo controls</p>
        <div className="grid grid-cols-3 gap-2">
          {(["parent", "student", "teacher"] as Role[]).map((r) => (
            <button key={r} className={me.role === r ? "btn-ink !min-h-10 text-xs capitalize" : "btn-ghost !min-h-10 text-xs capitalize"} onClick={() => switchTo(r)}>{r}</button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn-ghost !min-h-10 text-sm" onClick={() => { if (confirm("Reset all demo data?")) { reset(); router.push("/"); } }}><RotateCcw size={15} /> Reset demo</button>
          <button className="btn-ghost !min-h-10 text-sm" onClick={() => { signOut(); router.push("/"); }}><LogOut size={15} /> Sign out</button>
        </div>
      </section>

      <EditProfile open={edit} onClose={() => setEdit(false)} handle={bio.handle} bio={bio.bio} onSave={(h, b) => { updateBio(h, b); toast("Profile updated"); }} />

      <Sheet open={editInterests} onClose={() => setEditInterests(false)} title="Your interests">
        <p className="-mt-1 mb-3 text-sm text-[var(--muted)]">These shape your matches. Changes apply immediately.</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = me.interests.includes(i.id);
            return (
              <motion.button key={i.id} whileTap={{ scale: 0.95 }} aria-pressed={on} onClick={() => setInterests(on ? me.interests.filter((x) => x !== i.id) : [...me.interests, i.id])}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition ${on ? "border-iris-500 bg-iris-500 text-white" : "border-black/10 bg-white"}`}>
                {on && <Check size={14} />} {i.en}
              </motion.button>
            );
          })}
        </div>
        <button className="btn-ink mt-5 w-full" onClick={() => { setEditInterests(false); toast("Matches updated"); }}>Done</button>
      </Sheet>

      <Sheet open={!!project} onClose={() => setProject(null)} title={project?.title}>
        {project && (() => {
          const cur = state.projects.find((p) => p.id === project.id)!;
          return (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">{cur.role}</p>
              <div className="text-center text-4xl font-bold">{cur.progress}%</div>
              <input type="range" min={0} max={100} step={5} value={cur.progress} onChange={(e) => setProjectProgress(cur.id, Number(e.target.value))} className="w-full accent-blue-500" aria-label="Progress" />
              <button className="btn-ink w-full" onClick={() => { setProject(null); toast("Progress saved"); }}>Save</button>
            </div>
          );
        })()}
      </Sheet>
      <p className="text-center text-xs text-[var(--muted)]">Sample data · prototype · {ageOf(me)} years (demo identity)</p>
    </div>
  );
}

function EditProfile({ open, onClose, handle, bio, onSave }: { open: boolean; onClose: () => void; handle: string; bio: string; onSave: (h: string, b: string) => void }) {
  const [h, setH] = useState(handle);
  const [b, setB] = useState(bio);
  return (
    <Sheet open={open} onClose={onClose} title="Edit profile">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(h.replace(/[^a-z0-9._]/gi, "").slice(0, 24) || handle, b.slice(0, 140)); onClose(); }}>
        <label className="block text-sm font-semibold">Handle<input className="input mt-1 !bg-white" value={h} onChange={(e) => setH(e.target.value)} maxLength={24} /></label>
        <label className="block text-sm font-semibold">Bio<textarea className="input mt-1 !bg-white" rows={3} value={b} onChange={(e) => setB(e.target.value)} maxLength={140} /></label>
        <p className="text-xs text-[var(--muted)]">Don&apos;t include your phone number, address or other personal details.</p>
        <button className="btn-ink w-full">Save</button>
      </form>
    </Sheet>
  );
}
