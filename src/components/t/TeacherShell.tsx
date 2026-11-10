"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { BookOpenCheck, FolderOpen, Home, Sparkles, Telescope, TrendingUp } from "lucide-react";
import { AppToolbar } from "@/components/AppToolbar";
import { Logo, SampleFooter } from "@/components/ui";
import { LimelightNav, type NavItem } from "@/components/ui/limelight-nav";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/app/today", en: "Today", ar: "اليوم", icon: Home, match: ["/app/today", "/app/office"] },
  { href: "/app/classes", en: "Classes", ar: "الصفوف", icon: BookOpenCheck, match: ["/app/classes", "/app/post"] },
  { href: "/app/resources", en: "Resources", ar: "الموارد", icon: FolderOpen, match: ["/app/resources"] },
  { href: "/app/opportunities", en: "Students", ar: "الفرص", icon: Telescope, match: ["/app/opportunities"] },
  { href: "/app/growth", en: "Career", ar: "المسار", icon: TrendingUp, match: ["/app/growth"] },
];

/**
 * Teacher workspace shell.
 * Top right: utilities (SAWA AI, quick create, search, notifications, profile, language) via the shared AppToolbar.
 * Bottom centre: the five workspace sections in the 21st.dev LimelightNav.
 */
export function TeacherShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { state } = useStore();
  const ar = state.lang === "ar";
  const active = NAV.findIndex((n) => n.match.some((m) => path === m || path.startsWith(m + "/")));
  const ungraded = Object.values(state.tSubs).reduce((n, subs) => n + Object.values(subs).filter((s) => s.status === "submitted" || s.status === "late").length, 0);

  const items: NavItem[] = NAV.map((n) => ({
    id: n.href,
    label: ar ? n.ar : n.en,
    icon: <n.icon strokeWidth={2.1} />,
    badge: n.href === "/app/classes" ? ungraded : undefined,
    onClick: () => router.push(n.href),
  }));

  return (
    <div className="mx-auto min-h-dvh max-w-5xl pb-36">
      <header className="sticky top-0 z-30 px-4 pb-2 pt-3 backdrop-blur-xl [background:linear-gradient(180deg,rgba(207,204,199,.8)_0%,rgba(207,204,199,.55)_70%,rgba(207,204,199,0)_100%)]">
        <div className="flex items-center justify-between gap-2">
          <Link href="/app/today" aria-label={ar ? "سوا، الصفحة الرئيسية" : "Sawa home"} className="glass flex h-12 items-center gap-2 rounded-full px-3 sm:px-4">
            <Logo size={28} compact />
            <span className="hidden rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white md:inline">{ar ? "مساحة المعلم" : "Teacher workspace"}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link href="/app/ask" aria-label="SAWA AI" aria-current={path.startsWith("/app/ask") ? "page" : undefined}
                className="flex h-12 items-center gap-2 rounded-full bg-[image:var(--grad-brand)] px-3.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition hover:brightness-105 sm:px-4">
                <Sparkles size={18} aria-hidden /> <span className="hidden sm:inline">SAWA AI</span>
              </Link>
            </motion.div>
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className="px-4 pt-3">{children}</main>
      <SampleFooter />

      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3" style={{ ["--color-primary" as string]: "#4073ff" }}>
        <LimelightNav
          aria-label={ar ? "أقسام مساحة المعلم" : "Teacher workspace"}
          items={items}
          activeIndex={active}
          showLabels
          className="glass glass-strong !rounded-[28px] !border-white/80 !bg-white/60 text-ink shadow-xl"
          iconContainerClassName="!px-3 sm:!px-5 min-w-[62px]"
        />
      </div>
    </div>
  );
}
