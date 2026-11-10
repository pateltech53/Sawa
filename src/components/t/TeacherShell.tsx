"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { BookOpenCheck, FolderOpen, Home, Telescope, TrendingUp } from "lucide-react";
import { Icon3D } from "@/components/s/kit";
import { AppToolbar } from "@/components/AppToolbar";
import { SampleFooter } from "@/components/ui";
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
      <header className="sticky top-0 z-30 px-4 pb-2 pt-3 backdrop-blur-xl [background:linear-gradient(180deg,rgba(207,204,199,.82)_0%,rgba(207,204,199,.55)_72%,rgba(207,204,199,0)_100%)]">
        <div className="flex items-center justify-between gap-2">
          <Link href="/app/today" aria-label={ar ? "سوا، الصفحة الرئيسية" : "Sawa home"} className="flex items-center gap-2">
            <Icon3D name="logo3d" size={34} />
            <span className="hidden text-[19px] font-extrabold tracking-tight sm:inline">SAWA <span className="font-semibold text-black/45">سوا</span></span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <motion.div whileTap={{ scale: 0.94 }}>
              <Link href="/app/ask" aria-label="SAWA AI" aria-current={path.startsWith("/app/ask") ? "page" : undefined}
                className={`grid h-11 w-12 place-items-center rounded-[25px] border border-white/60 backdrop-blur transition ${path.startsWith("/app/ask") ? "bg-white/70" : "bg-white/25 hover:bg-white/45"}`}>
                <Icon3D name="wand" size={30} />
              </Link>
            </motion.div>
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className="px-4 pt-3">{children}</main>
      <SampleFooter />

      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3" style={{ ["--color-primary" as string]: "#5185de" }}>
        <LimelightNav
          aria-label={ar ? "أقسام مساحة المعلم" : "Teacher workspace"}
          items={items}
          activeIndex={active}
          showLabels
          className="!h-[68px] !rounded-[32px] !border-white/55 !bg-[rgba(217,217,217,0.28)] text-ink shadow-[0_12px_30px_-16px_rgba(40,30,20,.45)] backdrop-blur-2xl"
          iconContainerClassName="!px-3 sm:!px-5 min-w-[62px]"
        />
      </div>
    </div>
  );
}
