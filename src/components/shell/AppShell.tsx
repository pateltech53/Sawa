"use client";

// One shell for students, parents and teachers: liquid-glass toolbar on top,
// glass tab bar below with Ask Sawa in the centre. Content widths follow the
// route: dashboards use the full 1200px grid on desktop, reading pages stay
// at a comfortable 760px.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabBar, Glass } from "glisse";
import { Logo } from "@/components/ui";
import { AppToolbar } from "@/components/AppToolbar";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Icon3D = "home" | "journey" | "people" | "profile" | "planet";
type Tab = { href: string; label: string; icon: Icon3D; match: string[]; badge?: number };

const WIDE = ["/app/today", "/app/explore", "/app/communities", "/app/services", "/app/classes", "/app/students", "/app/career", "/app/calendar"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, me } = useStore();
  const path = usePathname();
  if (!me) return null;
  const L = state.lang;
  const ar = L === "ar";
  const pending = state.approvals.filter((a) => a.guardianId === me.id && a.status === "pending").length;
  const requests = state.requests.filter((r) => r.status !== "done").length;

  const tabs: [Tab, Tab, Tab, Tab] =
    me.role === "student"
      ? [
          { href: "/app/today", label: ar ? "الرئيسية" : "Home", icon: "home", match: ["/app/today", "/app/calendar"] },
          { href: "/app/explore", label: ar ? "الفرص" : "Explore", icon: "journey", match: ["/app/explore", "/app/opportunities"] },
          { href: "/app/communities", label: ar ? "المجتمعات" : "Communities", icon: "people", match: ["/app/communities"] },
          { href: "/app/profile", label: t(L, "profile"), icon: "profile", match: ["/app/profile", "/app/connections"] },
        ]
      : me.role === "parent"
        ? [
            { href: "/app/today", label: ar ? "الرئيسية" : "Home", icon: "home", match: ["/app/today", "/app/calendar"] },
            { href: "/app/services", label: t(L, "services"), icon: "planet", match: ["/app/services", "/app/requests", "/app/documents"] },
            { href: "/app/approvals", label: ar ? "العائلة" : "Family", icon: "people", match: ["/app/approvals", "/app/events"], badge: pending || undefined },
            { href: "/app/profile", label: t(L, "profile"), icon: "profile", match: ["/app/profile", "/app/impact", "/app/data"] },
          ]
        : [
            { href: "/app/today", label: ar ? "اليوم" : "Today", icon: "home", match: ["/app/today", "/app/office", "/app/calendar"] },
            { href: "/app/classes", label: ar ? "الصفوف" : "Classes", icon: "journey", match: ["/app/classes", "/app/post"], badge: requests || undefined },
            { href: "/app/students", label: ar ? "الطلاب" : "Students", icon: "people", match: ["/app/students"] },
            { href: "/app/career", label: ar ? "الفعاليات" : "Events", icon: "planet", match: ["/app/career", "/app/profile", "/app/data"] },
          ];

  const isOn = (tb: Tab) => tb.match.some((m) => path === m || path.startsWith(m + "/"));
  const askOn = path.startsWith("/app/ask");
  const wide = WIDE.some((w) => path === w);
  const accent = me.role === "teacher" ? state.schoolBrand?.accent : undefined;

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
            <Link href="/app/ask" aria-label={t(L, "ask")} className="glass grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/70">
              <img src="/figma/icons/wand.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </Link>
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full px-4 pt-4 sm:px-6", wide ? "max-w-[1200px]" : "max-w-[760px]")}>{children}</main>

      {/* iOS 26 pattern: a liquid-glass tab bar (glisse) with the Figma 3D icons, and Ask Sawa as its own glass button beside it */}
      <nav aria-label="Main" className="sawa-tabbar fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[min(100%-16px,480px)] items-center gap-2 pb-[env(safe-area-inset-bottom)]">
        <TabBar
          className="min-w-0 flex-1"
          link={Link}
          value={tabs.find(isOn)?.href ?? null}
          items={tabs.map((tb) => ({
            value: tb.href,
            href: tb.href,
            label: tb.label,
            icon: (
              <span className="relative inline-grid">
                <img src={`/figma/icons/${tb.icon}.png`} alt="" width={30} height={30} className="h-[30px] w-[30px] object-contain" draggable={false} />
                {tb.badge ? <span className="absolute -end-2 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#c23ea5] px-1 text-[10px] font-bold text-white ring-2 ring-white">{tb.badge}</span> : null}
              </span>
            ),
          }))}
        />
        <Link href="/app/ask" aria-label={t(L, "ask")} aria-current={askOn ? "page" : undefined} className="shrink-0">
          <Glass className={cn("grid h-[62px] w-[62px] place-items-center rounded-full", askOn && "ring-2 ring-[#5c29bf]")}>
            <img src="/figma/icons/wand.png" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" draggable={false} />
          </Glass>
        </Link>
      </nav>
    </div>
  );
}
