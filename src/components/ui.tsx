"use client";

import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function Logo({ size = 40, full = false, compact = false }: { size?: number; full?: boolean; compact?: boolean }) {
  return full ? (
    <Image src="/brand/logo-full.png" alt="Sawa · سوا" width={Math.round(size * 0.73)} height={size} priority />
  ) : (
    <span className="inline-flex items-center gap-2">
      <Image src="/brand/logo-mark.png" alt="" width={Math.round(size * 1.1)} height={size} priority />
      <span className={`${compact ? "hidden sm:inline" : ""} whitespace-nowrap font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight`}>SAWA <span className="font-normal opacity-60">سوا</span></span>
    </span>
  );
}

export function Mascot({ size = 140, className = "", wave = false }: { size?: number; className?: string; wave?: boolean }) {
  return (
    <Image
      src="/brand/mascot.png"
      alt="Sawa's mascot waving"
      width={size}
      height={Math.round(size * 0.95)}
      className={`${wave ? "wave" : "float"} drop-shadow-[0_18px_20px_rgba(0,0,0,.18)] ${className}`}
      priority
    />
  );
}

export function Card({ children, className = "", strong = false, as: As = "section" }: { children: React.ReactNode; className?: string; strong?: boolean; as?: "section" | "div" | "article" | "li" }) {
  return <As className={`glass ${strong ? "glass-strong" : ""} rounded-[28px] p-4 sm:p-5 ${className}`}>{children}</As>;
}

const SRC_COLORS: Record<string, string> = {
  "Al Manhal": "bg-aegold-100 text-aegold-800",
  LMS: "bg-sky-100 text-sky-800",
  Minhaji: "bg-emerald-100 text-emerald-800",
  School: "bg-aeblack-100 text-aeblack-800",
  Sawa: "bg-black text-white",
  Transport: "bg-orange-100 text-orange-800",
  "Student Portal": "bg-violet-100 text-violet-800",
};
export function SourceTag({ source }: { source: string }) {
  const { state } = useStore();
  const ar: Record<string, string> = { "Al Manhal": "المنهل", LMS: "بوابة التعلّم", Minhaji: "منهجي", School: "المدرسة", Sawa: "سوا", Transport: "النقل", "Student Portal": "بوابة الطالب" };
  return <span className={`src ${SRC_COLORS[source] ?? "bg-white text-black"}`}>{state.lang === "ar" ? ar[source] ?? source : source}</span>;
}

export function SampleFooter() {
  const { state } = useStore();
  return (
    <p className="px-4 py-6 text-center text-xs text-[var(--muted)]">
      {t(state.lang, "sampleData")} ·{" "}
      <Link className="underline" href="/app/data">{t(state.lang, "dataSources")}</Link>
    </p>
  );
}

export function LangToggle({ className = "" }: { className?: string }) {
  const { state, setLang } = useStore();
  return (
    <button className={`chip ${className}`} onClick={() => setLang(state.lang === "ar" ? "en" : "ar")} aria-label="Toggle language">
      {t(state.lang, "language")}
    </button>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "gold" | "green" | "red" | "ink" }) {
  const tones = {
    default: "bg-white/70 text-[var(--ink-2)]",
    gold: "bg-aegold-100 text-aegold-800",
    green: "bg-aegreen-100 text-aegreen-800",
    red: "bg-aered-100 text-aered-800",
    ink: "bg-black text-white",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Mascot size={96} />
      <p className="text-sm text-[var(--muted)]">{text}</p>
    </div>
  );
}
