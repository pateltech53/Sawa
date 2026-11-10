"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, Building2, Home, Megaphone, MessageCircleQuestion, ShieldCheck, UserRound } from "lucide-react";
import { Logo, SampleFooter } from "@/components/ui";
import { BottomNavBar, type BottomNavItem } from "@/components/ui/bottom-nav-bar";
import { AppToolbar } from "@/components/AppToolbar";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { StudentShell } from "@/components/s/StudentShell";
import { ToastProvider } from "@/components/s/kit";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, ready, me, myChildren } = useStore();
  const router = useRouter();
  const path = usePathname();
  const L = state.lang;

  useEffect(() => {
    if (ready && !me) router.replace("/");
    if (ready && me?.role === "student" && !state.onboarded[me.id]) router.replace("/welcome");
  }, [ready, me, router, state.onboarded]);
  if (!ready || !me) return <div className="grid min-h-dvh place-items-center"><div className="shimmer h-10 w-40 rounded-full" /></div>;
  if (me.role === "student") return <ToastProvider><StudentShell>{children}</StudentShell></ToastProvider>;

  const pendingApprovals = state.approvals.filter((a) => a.guardianId === me.id && a.status === "pending").length;

  const nav: BottomNavItem[] =
    me.role === "parent"
      ? [
          { href: "/app/today", label: t(L, "today"), icon: Home },
          { href: "/app/services", label: t(L, "services"), icon: Building2 },
          { href: "/app/ask", label: t(L, "ask"), icon: MessageCircleQuestion },
          { href: "/app/approvals", label: t(L, "approvals"), icon: BadgeCheck, badge: pendingApprovals || undefined },
          { href: "/app/profile", label: t(L, "profile"), icon: UserRound },
        ]
      : [
            { href: "/app/today", label: t(L, "today"), icon: Home },
            { href: "/app/post", label: t(L, "post"), icon: Megaphone },
            { href: "/app/ask", label: t(L, "ask"), icon: MessageCircleQuestion },
            { href: "/app/office", label: t(L, "office"), icon: Building2 },
            { href: "/app/profile", label: t(L, "profile"), icon: UserRound },
          ];

  const activeIndex = nav.findIndex((n) => path === n.href || (n.href !== "/app/today" && path.startsWith(n.href)));

  return (
    <ToastProvider>
    <div className="mx-auto min-h-dvh max-w-3xl pb-32">
      <header className="sticky top-0 z-30 px-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/app/today" aria-label="Sawa home" className="glass flex h-12 items-center rounded-full px-3 sm:px-4"><Logo size={28} compact /></Link>
          <div className="flex min-w-0 items-center gap-2">
            {me.role === "parent" && myChildren[0] && (
              <span className="chip hidden max-w-[13rem] shrink-0 md:inline-flex" title={t(L, "verifiedGuardian")}>
                <ShieldCheck size={14} className="shrink-0 text-blue-600" aria-label={t(L, "verifiedGuardian")} />
                <span className="truncate">{L === "ar" ? "الابنة" : "Child"}: {L === "ar" ? myChildren[0].nameAr : myChildren[0].name}</span>
              </span>
            )}
            <AppToolbar />
          </div>
        </div>
      </header>

      <main className="px-4 pt-5">{children}</main>
      <SampleFooter />

      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
        <BottomNavBar items={nav} activeIndex={activeIndex} />
      </div>
    </div>
    </ToastProvider>
  );
}
