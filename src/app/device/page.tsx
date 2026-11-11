"use client";

// Presenter view: the app running inside an iPhone-sized frame, with a role switcher,
// for showing Sawa on a laptop or projector. On a real iPhone, open the site and use
// Share › Add to Home Screen instead — it then runs full-screen.
import { useState } from "react";
import Link from "next/link";

const ROLES = [
  { id: "student", label: "Student", path: "/welcome" },
  { id: "parent", label: "Parent", path: "/signin?role=parent" },
  { id: "teacher", label: "Teacher", path: "/signin?role=teacher" },
] as const;

export default function Device() {
  const [src, setSrc] = useState<string>("/");
  const [key, setKey] = useState(0);
  const open = (path: string) => { setSrc(path); setKey((k) => k + 1); };
  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 px-4 py-8 lg:flex-row lg:justify-center lg:gap-16">
      <section className="max-w-sm text-center lg:text-start">
        <p className="label-xs">Presenter view</p>
        <h1 className="h-display mt-1 text-[40px] leading-[1.05]">Sawa on iPhone</h1>
        <p className="mt-3 text-[var(--muted)]">The real app, at iPhone 16 size. Pick a role to start from its sign-in. On a phone, open the site and choose Share › Add to Home Screen.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
          <button className="chip" aria-pressed={src === "/"} onClick={() => open("/")}>Start screen</button>
          {ROLES.map((r) => <button key={r.id} className="chip" aria-pressed={src === r.path} onClick={() => open(r.path)}>{r.label}</button>)}
        </div>
        <Link href="/" className="link-info mt-5 inline-block">Open full screen</Link>
      </section>
      <div className="relative shrink-0 rounded-[64px] bg-[#121217] p-[14px] shadow-[0_40px_80px_-30px_rgba(18,18,23,.6)]" style={{ width: 393 + 28, height: 852 + 28 }}>
        <div aria-hidden className="absolute left-1/2 top-[26px] z-10 h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
        <iframe key={key} src={src} title="Sawa running at iPhone size" className="h-[852px] w-[393px] rounded-[50px] border-0 bg-[#d6d2cc]" />
      </div>
    </main>
  );
}
