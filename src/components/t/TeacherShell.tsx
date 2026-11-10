"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, FolderOpen, Home, Sparkles, Telescope, TrendingUp } from "lucide-react";
import { Icon3D } from "@/components/s/kit";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
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
    <div className="lg-scope mx-auto min-h-dvh max-w-5xl pb-36" onPointerMove={glint}>
      <div className="lg-ambient" aria-hidden><span className="o1" /><span className="o2" /><span className="o3" /><span className="o4" /></div>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="lg-refract" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="sticky top-0 z-30 px-4 pb-3 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-full before:backdrop-blur-xl before:[mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <div className="flex items-center justify-between gap-2">
          <Link href="/app/today" aria-label={ar ? "سوا، الصفحة الرئيسية" : "Sawa home"} className="lg lg-refract lg-lift flex h-12 items-center gap-2 !rounded-full pe-4 ps-2">
            <Icon3D name="logo3d" size={34} />
            <span className="hidden text-[18px] font-extrabold tracking-tight sm:inline">SAWA <span className="font-semibold text-black/45">سوا</span></span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <LiquidMetalButton label="SAWA AI" viewMode="icon" height={48} icon={<Sparkles size={20} className="text-white" aria-hidden />} onClick={() => router.push("/app/ask")} className="shrink-0" />
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className="px-4 pt-3">{children}</main>
      <SampleFooter />

      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
        <LimelightNav
          variant="lens"
          aria-label={ar ? "أقسام مساحة المعلم" : "Teacher workspace"}
          items={items}
          activeIndex={active}
          showLabels
          className="lg lg-refract !h-[70px] !rounded-[34px] !border-0 !bg-transparent text-ink"
          iconContainerClassName="!px-3 sm:!px-5 min-w-[62px]"
        />
      </div>
    </div>
  );
}

/** Moves the specular light on whichever glass card is under the pointer. */
function glint(e: React.PointerEvent) {
  const el = (e.target as HTMLElement).closest?.(".t-card, .lg") as HTMLElement | null;
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}
