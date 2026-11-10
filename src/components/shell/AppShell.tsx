"use client";

// One shell for students, parents and teachers: liquid-glass toolbar on top,
// glass tab bar below with Ask Sawa in the centre. Content widths follow the
// route: dashboards use the full 1200px grid on desktop, reading pages stay
// at a comfortable 760px.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, BookOpenCheck, Briefcase, Compass, Home, LayoutGrid, Sparkles, UserRound, Users, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui";
import { AppToolbar } from "@/components/AppToolbar";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: LucideIcon; match: string[]; badge?: number };

const WIDE = ["/app/today", "/app/explore", "/app/communities", "/app/services", "/app/classes", "/app/students", "/app/career", "/app/calendar"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, me } = useStore();
  const path = usePathname();
  const reduce = useReducedMotion();
  if (!me) return null;
  const L = state.lang;
  const ar = L === "ar";
  const pending = state.approvals.filter((a) => a.guardianId === me.id && a.status === "pending").length;
  const requests = state.requests.filter((r) => r.status !== "done").length;

  const tabs: [Tab, Tab, Tab, Tab] =
    me.role === "student"
      ? [
          { href: "/app/today", label: ar ? "الرئيسية" : "Home", icon: Home, match: ["/app/today", "/app/calendar"] },
          { href: "/app/explore", label: ar ? "الفرص" : "Explore", icon: Compass, match: ["/app/explore", "/app/opportunities"] },
          { href: "/app/communities", label: ar ? "المجتمعات" : "Communities", icon: Users, match: ["/app/communities"] },
          { href: "/app/profile", label: t(L, "profile"), icon: UserRound, match: ["/app/profile", "/app/connections"] },
        ]
      : me.role === "parent"
        ? [
            { href: "/app/today", label: ar ? "الرئيسية" : "Home", icon: Home, match: ["/app/today", "/app/calendar"] },
            { href: "/app/services", label: t(L, "services"), icon: LayoutGrid, match: ["/app/services", "/app/requests", "/app/documents"] },
            { href: "/app/approvals", label: t(L, "approvals"), icon: BadgeCheck, match: ["/app/approvals"], badge: pending || undefined },
            { href: "/app/profile", label: t(L, "profile"), icon: UserRound, match: ["/app/profile", "/app/impact", "/app/data"] },
          ]
        : [
            { href: "/app/today", label: ar ? "اليوم" : "Today", icon: Home, match: ["/app/today", "/app/office", "/app/calendar"] },
            { href: "/app/classes", label: ar ? "الصفوف" : "Classes", icon: BookOpenCheck, match: ["/app/classes", "/app/post"], badge: requests || undefined },
            { href: "/app/students", label: ar ? "الطلاب" : "Students", icon: Users, match: ["/app/students"] },
            { href: "/app/career", label: ar ? "المهنة" : "Career", icon: Briefcase, match: ["/app/career", "/app/profile", "/app/data"] },
          ];

  const isOn = (t: Tab) => t.match.some((m) => path === m || path.startsWith(m + "/"));
  const askOn = path.startsWith("/app/ask");
  const wide = WIDE.some((w) => path === w);
  const accent = me.role === "teacher" ? state.schoolBrand?.accent : undefined;

  const TabLink = ({ tab }: { tab: Tab }) => {
    const on = isOn(tab);
    return (
      <Link href={tab.href} aria-current={on ? "page" : undefined} className="relative flex h-[58px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px]">
        {on && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[22px] bg-white/85 shadow-[0_6px_16px_-8px_rgba(18,18,23,.35)]" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
        <span className="relative">
          <tab.icon size={21} strokeWidth={on ? 2.4 : 2} className={on ? "text-ink" : "text-ink/60"} aria-hidden />
          {tab.badge ? <span className="absolute -end-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{tab.badge}</span> : null}
        </span>
        <span className={cn("relative text-[11px] font-semibold leading-none", on ? "text-ink" : "text-ink/60")}>{tab.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-dvh pb-32" style={accent ? ({ ["--school-accent" as string]: accent } as React.CSSProperties) : undefined}>
      <header className="sticky top-0 z-30 px-3 pb-2 pt-3 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[88px] backdrop-blur-xl [background:linear-gradient(180deg,rgba(214,210,204,.85)_0%,rgba(214,210,204,.6)_70%,rgba(214,210,204,0)_100%)] [mask-image:linear-gradient(180deg,#000_70%,transparent)]" />
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2">
          <Link href="/app/today" aria-label="Sawa home" className="glass flex h-12 shrink-0 items-center gap-2 rounded-full px-3 sm:px-4">
            {state.schoolBrand?.logo && me.role === "teacher" ? (
              <span className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white" style={{ background: accent }}>{state.schoolBrand.logo}</span>
            ) : null}
            <Logo size={26} compact />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/app/ask" aria-label={t(L, "ask")} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#121217] text-white shadow-[0_10px_22px_-10px_rgba(18,18,23,.7)] ring-1 ring-white/20 transition hover:scale-105">
              <Sparkles size={20} aria-hidden />
            </Link>
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full px-4 pt-4 sm:px-6", wide ? "max-w-[1200px]" : "max-w-[760px]")}>{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[min(100%-20px,460px)]">
        <div className="glass glass-strong flex items-center gap-1 rounded-[30px] p-1.5">
          <TabLink tab={tabs[0]} />
          <TabLink tab={tabs[1]} />
          <Link href="/app/ask" aria-label={t(L, "ask")} aria-current={askOn ? "page" : undefined} className="grid h-[58px] w-[64px] shrink-0 place-items-center">
            <motion.span whileTap={{ scale: 0.9 }} className={cn("grid h-[52px] w-[52px] place-items-center rounded-full text-white shadow-[0_12px_24px_-10px_rgba(92,41,191,.8)]", askOn ? "bg-[linear-gradient(135deg,#F280D9,#734DF2)]" : "bg-[#121217]")}>
              <Sparkles size={22} aria-hidden />
            </motion.span>
          </Link>
          <TabLink tab={tabs[2]} />
          <TabLink tab={tabs[3]} />
        </div>
      </nav>
    </div>
  );
}
