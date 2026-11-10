"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3, Bell, Building2, ChevronRight, Database, FileCheck2, FileUp, Languages, LogOut, Megaphone,
  MessageCircleQuestion, Plus, Search, Sparkles, UserRound,
} from "lucide-react";
import { BottomMenu, menuRow, type BottomMenuItem } from "@/components/ui/bottom-menu";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/hooks/use-debounce";
import { SERVICES } from "@/lib/seed";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

type Hit = { id: string; title: string; sub: string; href: string };

/** Header toolbar for parents and teachers, built on the 21st.dev BottomMenu. Every entry does something real. */
export function AppToolbar() {
  const { state, me, visibleNotices, setLang, signOut } = useStore();
  const router = useRouter();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;

  const open = visibleNotices
    .filter((n) => n.status === "open")
    .sort((a, b) => a.priority - b.priority || +new Date(a.dueAt ?? 0) - +new Date(b.dueAt ?? 0));
  const pendingApprovals = state.approvals.filter((a) => a.guardianId === me.id && a.status === "pending").length;
  const pendingRequests = me.role === "teacher" ? state.requests.filter((r) => r.status !== "done").length : 0;
  const urgent = open.filter((n) => n.priority === 1 || n.kind === "proactive").length + pendingApprovals + pendingRequests;

  const quick =
    me.role === "student"
      ? [
          { href: "/app/calendar?new=reminder", icon: Plus, label: ar ? "إضافة تذكير" : "Add a reminder" },
          { href: "/app/profile?tab=projects", icon: FileCheck2, label: ar ? "بدء مشروع" : "Start a project" },
          { href: "/app/connections", icon: Building2, label: ar ? "ربط تطبيق مدرسي" : "Connect a school app" },
        ]
      : me.role === "parent"
      ? [
          { href: "/app/services/school-file", icon: FileCheck2, label: ar ? "تحديث ملف الطالب" : "Update school file" },
          { href: "/app/documents", icon: FileUp, label: ar ? "رفع مستند" : "Upload a document" },
          { href: "/app/ask", icon: MessageCircleQuestion, label: t(L, "ask") },
        ]
      : [
          { href: "/app/post", icon: Megaphone, label: ar ? "نشر إعلان" : "Post once to classes" },
          { href: "/app/students?new=event", icon: Plus, label: ar ? "استضافة فعالية" : "Host an event" },
          { href: "/app/office", icon: Building2, label: ar ? "مراجعة الطلبات" : "Review parent requests" },
        ];

  const items: BottomMenuItem[] = [
    {
      key: "quick",
      label: ar ? "إجراءات سريعة" : "Quick actions",
      icon: Plus,
      render: (close) => (
        <ul className="min-w-[230px] space-y-0.5">
          {quick.map((q) => (
            <li key={q.href}>
              <Link href={q.href} onClick={close} className={menuRow}>
                <q.icon size={19} className="text-blue-600" aria-hidden /> {q.label}
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "search",
      label: ar ? "بحث" : "Search",
      icon: Search,
      render: (close) => <SearchPanel close={close} />,
    },
    {
      key: "alerts",
      label: ar ? "التنبيهات" : "Notifications",
      icon: Bell,
      badge: urgent || undefined,
      render: (close) => (
        <div className="w-[min(320px,calc(100vw-40px))]">
          <p className="label-xs px-3 pb-1 pt-2">{ar ? "يحتاج انتباهك" : "Needs your attention"}</p>
          <ul className="space-y-0.5">
            {pendingApprovals > 0 && (
              <li>
                <Link href="/app/approvals" onClick={close} className={menuRow}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{ar ? `${pendingApprovals} طلب موافقة` : `${pendingApprovals} approval${pendingApprovals > 1 ? "s" : ""} waiting`}</span>
                </Link>
              </li>
            )}
            {pendingRequests > 0 && (
              <li>
                <Link href="/app/office" onClick={close} className={menuRow}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{ar ? `${pendingRequests} طلب بانتظار المراجعة` : `${pendingRequests} request${pendingRequests > 1 ? "s" : ""} to review`}</span>
                </Link>
              </li>
            )}
            {open.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link href={n.action?.href ?? "/app/today"} onClick={close} className={menuRow}>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", n.priority === 1 || n.kind === "proactive" ? "bg-pink-500" : "bg-blue-500")} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{ar ? n.titleAr : n.titleEn}</span>
                </Link>
              </li>
            ))}
            {open.length === 0 && pendingApprovals === 0 && pendingRequests === 0 && (
              <li className="px-3 py-3 text-sm text-muted-foreground">{ar ? "لا شيء جديد. أحسنت!" : "You're all caught up."}</li>
            )}
          </ul>
          <Link href="/app/today" onClick={close} className="mt-1 flex items-center justify-between rounded-[14px] px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
            {ar ? "عرض الكل في اليوم" : "See everything in Today"} <ChevronRight size={16} className="rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      ),
    },
    {
      key: "profile",
      label: t(L, "profile"),
      icon: UserRound,
      render: (close) => (
        <div className="min-w-[240px]">
          <div className="flex items-center gap-3 px-3 pb-2 pt-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--grad-brand)] text-sm font-bold text-white">{me.avatar}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{ar ? me.nameAr : me.name}</span>
              <span className="block text-xs text-muted-foreground">{t(L, me.role)}</span>
            </span>
          </div>
          <ul className="space-y-0.5">
            {[
              { href: "/app/profile", icon: UserRound, label: ar ? "حسابي" : "My account" },
              { href: "/app/impact", icon: BarChart3, label: t(L, "impact") },
              { href: "/app/data", icon: Database, label: t(L, "dataSources") },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className={menuRow}><l.icon size={18} className="text-ink/60" aria-hidden /> {l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-start text-[15px] text-destructive transition-colors hover:bg-destructive/10"
            onClick={() => { close(); signOut(); router.push("/"); }}
          >
            <LogOut size={18} aria-hidden /> {t(L, "signOut")}
          </button>
        </div>
      ),
    },
    {
      key: "lang",
      label: ar ? "اللغة" : "Language",
      icon: Languages,
      render: () => (
        <div className="flex min-w-[220px] items-center gap-1.5" role="radiogroup" aria-label={ar ? "اللغة" : "Language"}>
          {([["en", "English"], ["ar", "العربية"]] as [Lang, string][]).map(([key, text]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={L === key}
              onClick={() => setLang(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-[15px] font-medium transition-colors",
                L === key ? "bg-blue-500/12 text-blue-700" : "text-ink/70 hover:bg-muted",
              )}
            >
              {text}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return <BottomMenu items={items} placement="bottom" align="end" />;
}

function SearchPanel({ close }: { close: () => void }) {
  const { state, me, visibleNotices } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim().toLowerCase(), 200);

  const index = useMemo<Hit[]>(() => {
    const pages: Hit[] = [
      { id: "p-today", title: t(L, "today"), sub: ar ? "صفحة" : "Page", href: "/app/today" },
      { id: "p-ask", title: t(L, "ask"), sub: ar ? "صفحة" : "Page", href: "/app/ask" },
      { id: "p-docs", title: t(L, "tellUsOnce"), sub: ar ? "صفحة" : "Page", href: "/app/documents" },
      ...(me?.role === "parent"
        ? [
            { id: "p-svc", title: t(L, "services"), sub: ar ? "صفحة" : "Page", href: "/app/services" },
            { id: "p-appr", title: t(L, "approvals"), sub: ar ? "صفحة" : "Page", href: "/app/approvals" },
          ]
        : [
            { id: "p-post", title: t(L, "post"), sub: ar ? "صفحة" : "Page", href: "/app/post" },
            { id: "p-office", title: t(L, "office"), sub: ar ? "صفحة" : "Page", href: "/app/office" },
          ]),
    ];
    const services: Hit[] = me?.role === "parent"
      ? SERVICES.map((s) => ({ id: s.id, title: ar ? s.nameAr : s.nameEn, sub: s.ownerSystem, href: s.href ?? "/app/services" }))
      : [];
    const notices: Hit[] = visibleNotices.map((n) => ({ id: n.id, title: ar ? n.titleAr : n.titleEn, sub: n.sourceSystem, href: n.action?.href ?? "/app/today" }));
    return [...pages, ...services, ...notices];
  }, [L, ar, me?.role, visibleNotices]);

  const hits = query ? index.filter((h) => `${h.title} ${h.sub}`.toLowerCase().includes(query)).slice(0, 6) : [];
  const askHref = `/app/ask?q=${encodeURIComponent(q.trim())}`;

  return (
    <div className="w-[min(340px,calc(100vw-40px))] space-y-2 p-1">
      <div className="relative">
        <Search size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ar ? "ابحث في الخدمات والإشعارات…" : "Search services, notices, pages…"}
          aria-label={ar ? "بحث" : "Search"}
          className="min-h-11 ps-10"
        />
      </div>
      {query ? (
        <ul className="space-y-0.5" aria-live="polite">
          {hits.map((h) => (
            <li key={h.id}>
              <Link href={h.href} onClick={close} className={menuRow}>
                <span className="min-w-0 flex-1"><span className="block truncate">{h.title}</span><span className="block text-xs text-muted-foreground">{h.sub}</span></span>
                <ChevronRight size={16} className="shrink-0 text-ink/30 rtl:rotate-180" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link href={askHref} onClick={close} className={cn(menuRow, "font-semibold text-blue-700")}>
              <Sparkles size={17} className="text-pink-600" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{ar ? `اسأل سوا: "${q.trim()}"` : `Ask Sawa: “${q.trim()}”`}</span>
            </Link>
          </li>
        </ul>
      ) : (
        <p className="px-2 pb-1 text-xs text-muted-foreground">{ar ? "اكتب للبحث، أو اسأل سوا بلغتك." : "Type to search, or ask Sawa in your own words."}</p>
      )}
    </div>
  );
}
