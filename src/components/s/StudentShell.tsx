"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Bell, CalendarPlus, FolderPlus, MessageCircleQuestion, Plug } from "lucide-react";
import { Icon3D, Sheet, useToast, type Icon3DName } from "./kit";
import { useStore } from "@/lib/store";

const NAV: { href: string; label: string; icon: Icon3DName; match: string[] }[] = [
  { href: "/app/today", label: "Home", icon: "home", match: ["/app/today", "/app/calendar"] },
  { href: "/app/explore", label: "Opportunities", icon: "journey", match: ["/app/explore", "/app/opportunities"] },
  { href: "#create", label: "Create", icon: "plus", match: [] },
  { href: "/app/communities", label: "Communities", icon: "people", match: ["/app/communities"] },
  { href: "/app/profile", label: "Profile", icon: "profile", match: ["/app/profile", "/app/connections"] },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [create, setCreate] = useState(false);
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] pb-32">
      <header className="sticky top-0 z-30 px-4 pb-2 pt-4 backdrop-blur-xl [background:linear-gradient(180deg,rgba(207,204,199,.82)_0%,rgba(207,204,199,.62)_75%,rgba(207,204,199,0)_100%)]">
        <div className="flex items-center justify-between">
          <Link href="/app/today" aria-label="Sawa home" className="flex items-center gap-2">
            <Icon3D name="logo3d" size={34} />
            { }
            <span className="text-[19px] font-extrabold tracking-tight">SAWA <span className="font-semibold text-black/45">سوا</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/app/connections" aria-label="Connected school apps" className="grid h-11 w-12 place-items-center rounded-[25px] border border-white/60 bg-white/25 backdrop-blur transition hover:bg-white/45">
              <Icon3D name="planet" size={30} />
            </Link>
            <Link href="/app/ask" aria-label="Ask Sawa" className="grid h-11 w-12 place-items-center rounded-[25px] border border-white/60 bg-white/25 backdrop-blur transition hover:bg-white/45">
              <Icon3D name="wand" size={30} />
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pt-2">{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[min(100%-24px,400px)]">
        <ul className="glass flex h-[72px] items-center justify-around rounded-[32px] px-2">
          {NAV.map((n) => {
            const active = n.match.some((m) => path === m || path.startsWith(m + "/"));
            const inner = (
              <span className="relative flex flex-col items-center">
                {active && <motion.span layoutId="nav-pill" className="absolute -inset-x-2.5 -inset-y-1.5 rounded-[20px] bg-white/70 shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <motion.span whileTap={{ scale: 0.88 }} className="relative"><Icon3D name={n.icon} size={n.icon === "profile" ? 36 : 44} /></motion.span>
              </span>
            );
            return (
              <li key={n.href} className="flex flex-1 justify-center">
                {n.href === "#create" ? (
                  <button aria-label="Create" onClick={() => setCreate(true)} className="grid h-14 w-14 place-items-center">{inner}</button>
                ) : (
                  <Link href={n.href} aria-label={n.label} aria-current={active ? "page" : undefined} className="grid h-14 w-14 place-items-center">{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <CreateSheet open={create} onClose={() => setCreate(false)} />
    </div>
  );
}

function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { addReminder, addProject } = useStore();
  const [mode, setMode] = useState<"menu" | "reminder" | "project">("menu");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 16));
  const close = () => { onClose(); setTimeout(() => { setMode("menu"); setTitle(""); }, 300); };
  const items = [
    { icon: MessageCircleQuestion, label: "Ask Sawa", sub: "Questions about school, deadlines or events", run: () => { close(); router.push("/app/ask"); } },
    { icon: Bell, label: "Add a reminder", sub: "Shows on your week and calendar", run: () => setMode("reminder") },
    { icon: FolderPlus, label: "Start a project", sub: "Track progress on your profile", run: () => setMode("project") },
    { icon: Plug, label: "Connect a school app", sub: "Google Classroom and more", run: () => { close(); router.push("/app/connections"); } },
  ];
  return (
    <Sheet open={open} onClose={close} title={mode === "menu" ? "Create" : mode === "reminder" ? "New reminder" : "New project"}>
      {mode === "menu" && (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.label}>
              <button onClick={i.run} className="flex w-full flex-nowrap items-center justify-start gap-3 rounded-[20px] bg-white px-4 py-3.5 text-start transition hover:bg-white/80">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#121217] text-white"><i.icon size={19} /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{i.label}</span><span className="block text-sm text-[var(--muted)]">{i.sub}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {mode !== "menu" && (
        <form className="space-y-3" onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          if (mode === "reminder") { addReminder(title.trim(), new Date(when).toISOString()); toast("Reminder added to your calendar"); }
          else { addProject(title.trim(), "Personal project"); toast("Project added to your profile"); }
          close();
        }}>
          <label className="block text-sm font-semibold">{mode === "reminder" ? "What do you need to remember?" : "Project name"}
            <input autoFocus className="input mt-1 !bg-white" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={mode === "reminder" ? "e.g. Bring calculator for maths" : "e.g. Solar-powered bird feeder"} />
          </label>
          {mode === "reminder" && (
            <label className="block text-sm font-semibold">When
              <input type="datetime-local" className="input mt-1 !bg-white" value={when} onChange={(e) => setWhen(e.target.value)} />
            </label>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-ghost !bg-white" onClick={() => setMode("menu")}>Back</button>
            <button className="btn-ink flex-1" disabled={!title.trim()}><CalendarPlus size={17} /> Save</button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
