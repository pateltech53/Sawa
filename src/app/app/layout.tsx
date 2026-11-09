"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, Building2, CalendarCheck, Compass, Home, Megaphone, MessageCircleQuestion, ShieldCheck, UserRound } from "lucide-react";
import { LangToggle, Logo, SampleFooter } from "@/components/ui";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, ready, me, myChildren } = useStore();
  const router = useRouter();
  const path = usePathname();
  const L = state.lang;

  useEffect(() => {
    if (ready && !me) router.replace("/");
  }, [ready, me, router]);
  if (!ready || !me) return <div className="grid min-h-dvh place-items-center"><div className="shimmer h-10 w-40 rounded-full" /></div>;

  const pendingApprovals = state.approvals.filter((a) => a.guardianId === me.id && a.status === "pending").length;

  const nav =
    me.role === "parent"
      ? [
          { href: "/app/today", label: t(L, "today"), icon: Home },
          { href: "/app/services", label: t(L, "services"), icon: Building2 },
          { href: "/app/ask", label: t(L, "ask"), icon: MessageCircleQuestion, center: true },
          { href: "/app/approvals", label: t(L, "approvals"), icon: BadgeCheck, badge: pendingApprovals },
          { href: "/app/profile", label: t(L, "profile"), icon: UserRound },
        ]
      : me.role === "student"
        ? [
            { href: "/app/today", label: t(L, "today"), icon: Home },
            { href: "/app/explore", label: t(L, "explore"), icon: Compass },
            { href: "/app/ask", label: t(L, "ask"), icon: MessageCircleQuestion, center: true },
            { href: "/app/calendar", label: L === "ar" ? "التقويم" : "Calendar", icon: CalendarCheck },
            { href: "/app/profile", label: t(L, "profile"), icon: UserRound },
          ]
        : [
            { href: "/app/today", label: t(L, "today"), icon: Home },
            { href: "/app/post", label: t(L, "post"), icon: Megaphone },
            { href: "/app/ask", label: t(L, "ask"), icon: MessageCircleQuestion, center: true },
            { href: "/app/office", label: t(L, "office"), icon: Building2 },
            { href: "/app/profile", label: t(L, "profile"), icon: UserRound },
          ];

  return (
    <div className="mx-auto min-h-dvh max-w-3xl pb-32">
      <header className="sticky top-0 z-30 px-4 pt-3">
        <div className="glass flex items-center justify-between gap-2 rounded-full py-2 pe-2 ps-4">
          <Link href="/app/today" aria-label="Sawa home"><Logo size={28} compact /></Link>
          <div className="flex items-center gap-2">
            {me.role === "parent" && (
              <span className="chip hidden sm:inline-flex"><ShieldCheck size={14} /> {t(L, "verifiedGuardian")}</span>
            )}
            {me.role === "parent" && myChildren[0] && (
              <span className="chip max-w-[9rem] truncate">{L === "ar" ? "الابنة" : "Child"}: {L === "ar" ? myChildren[0].nameAr : myChildren[0].name}</span>
            )}
            <LangToggle />
            <Link href="/app/profile" className="jelly h-9 w-9 rounded-full text-sm font-bold" aria-label={t(L, "profile")}>{me.avatar}</Link>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5">{children}</main>
      <SampleFooter />

      <nav aria-label="Main" className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[min(100%-24px,520px)]">
        <ul className="glass flex items-center justify-between rounded-[30px] px-2 py-2">
          {nav.map((n) => {
            const active = path === n.href || (n.href !== "/app/today" && path.startsWith(n.href));
            return (
              <li key={n.href} className="flex-1">
                <Link href={n.href} aria-current={active ? "page" : undefined} className="group relative flex flex-col items-center gap-1 py-1">
                  <span className={`${n.center ? "jelly h-14 w-14 -mt-1 rounded-2xl" : active ? "jelly h-10 w-10 rounded-xl" : "grid h-10 w-10 place-items-center rounded-xl text-[var(--ink)] transition group-hover:bg-white/60"}`}>
                    <n.icon size={n.center ? 26 : 22} strokeWidth={2.2} />
                  </span>
                  {!n.center && <span className={`text-[10px] font-semibold ${active ? "text-black" : "text-[var(--muted)]"}`}>{n.label}</span>}
                  {"badge" in n && n.badge ? <span className="absolute end-3 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-aered-600 px-1 text-[10px] font-bold text-white">{n.badge}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
