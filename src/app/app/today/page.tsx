"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Megaphone, Sparkles } from "lucide-react";
import { Card, Empty, Mascot, Pill, SourceTag } from "@/components/ui";
import { fmtDate, relDays, t } from "@/lib/i18n";
import { OPPORTUNITIES } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Notice } from "@/lib/types";
import { StudentHome } from "@/components/s/StudentHome";
import { TeacherHome } from "@/components/t/TeacherHome";

export default function Today() {
  const { me } = useStore();
  if (me?.role === "student") return <StudentHome />;
  if (me?.role === "teacher") return <TeacherHome />;
  return <GuardianToday />;
}

function GuardianToday() {
  const { state, me, myChildren, visibleNotices, toggleNotice, markSeen } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const [filter, setFilter] = useState("All");
  const [why, setWhy] = useState<string | null>(null);

  // "seen by" counts for teacher posts
  const annIds = useMemo(() => [...new Set(visibleNotices.filter((n) => n.announcementId).map((n) => n.announcementId!))], [visibleNotices]);
  useEffect(() => {
    if (me && annIds.length) markSeen(annIds, me.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annIds.join(","), me?.id]);

  if (!me) return null;

  const proactive = visibleNotices.filter((n) => n.kind === "proactive" && n.status === "open" && n.userId === me.id);
  const rest = visibleNotices.filter((n) => !(n.kind === "proactive" && n.status === "open" && n.userId === me.id));
  const sources = ["All", ...new Set(rest.map((n) => n.sourceSystem))];
  const list = rest
    .filter((n) => filter === "All" || n.sourceSystem === filter)
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "open" ? -1 : 1) || a.priority - b.priority || (a.dueAt ?? "9").localeCompare(b.dueAt ?? "9"));
  const weekOpen = visibleNotices.filter((n) => n.status === "open" && (!n.dueAt || new Date(n.dueAt).getTime() - Date.now() < 7 * 86_400_000)).length;
  const systems = new Set(visibleNotices.map((n) => n.sourceSystem)).size;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d;
  });
  const onDay = (d: Date) => visibleNotices.filter((n) => n.dueAt && new Date(n.dueAt).toDateString() === d.toDateString() && n.status === "open");

  const match = me.role === "student" ? OPPORTUNITIES.find((o) => o.interests.some((i) => me.interests.includes(i))) : undefined;
  const myPosts = state.announcements.filter((a) => a.teacherId === me.id);
  const childName = myChildren[0] ? (ar ? myChildren[0].nameAr : myChildren[0].name) : "";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rise">
        <Mascot size={74} />
        <div>
          <p className="text-sm text-[var(--muted)]">{ar ? "مرحباً" : "Hello"}, {ar ? me.nameAr.split(" ")[0] : me.name.split(" ")[0]} 👋</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight sm:text-3xl">
            {weekOpen} {ar ? "أمور" : "things"} {t(L, "needsYou")}
          </h1>
          <p className="text-xs text-[var(--muted)]">{ar ? `من ${systems} أنظمة في قائمة واحدة` : `from ${systems} systems, in one list`}{childName && ` · ${childName}`}</p>
        </div>
      </div>

      {proactive.map((n, i) => (
        <Card key={n.id} strong className="relative overflow-hidden border-aegold-300! rise" as="article">
          <div className="absolute inset-y-0 start-0 w-1.5 bg-aegold-500" />
          <div className="flex items-start gap-3">
            <span className="jelly h-10 w-10 shrink-0 rounded-xl"><Sparkles size={18} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><SourceTag source="Sawa" /><Pill tone="gold">{ar ? "استباقي" : "Proactive"}</Pill></div>
              <h2 className="mt-1.5 font-bold leading-snug">{ar ? n.titleAr : n.titleEn}</h2>
              <p className="mt-1 text-sm text-[var(--ink-2)]">{ar ? n.bodyAr : n.bodyEn}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {n.action && <Link href={n.action.href} className="btn-ink !min-h-10 text-sm">{ar ? n.action.labelAr : n.action.labelEn} <ArrowRight size={16} className="rtl:rotate-180" /></Link>}
                {n.reasonEn && (
                  <button className="btn-ghost !min-h-10 text-sm" aria-expanded={why === n.id} onClick={() => setWhy(why === n.id ? null : n.id)}>
                    {t(L, "whySee")} <ChevronDown size={14} className={why === n.id ? "rotate-180" : ""} />
                  </button>
                )}
              </div>
              {why === n.id && <p className="mt-2 rounded-2xl bg-white/70 p-3 text-xs text-[var(--ink-2)] pop">{ar ? n.reasonAr : n.reasonEn}</p>}
            </div>
          </div>
          {i === 0 && <span className="sr-only">{ar ? "تنبيه استباقي" : "Proactive alert"}</span>}
        </Card>
      ))}

      {/* week strip */}
      <Card className="!p-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <h2 className="text-sm font-bold">{t(L, "week")}</h2>
          <Link href="/app/calendar" className="text-xs font-semibold underline">{ar ? "التقويم" : "Calendar"}</Link>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const items = onDay(d);
            return (
              <div key={i} className={`flex flex-col items-center rounded-2xl py-2 ${i === 0 ? "bg-black text-white" : "bg-white/60"}`}>
                <span className="text-[10px] font-semibold opacity-70">{d.toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short" })}</span>
                <span className="text-lg font-bold">{d.getDate()}</span>
                <span className="mt-0.5 flex h-1.5 gap-0.5">{items.slice(0, 3).map((n) => <span key={n.id} className={`h-1.5 w-1.5 rounded-full ${n.priority === 1 ? "bg-aered-500" : i === 0 ? "bg-white" : "bg-black/60"}`} />)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {match && (
        <Link href="/app/explore" className="block">
          <Card className="flex items-center gap-3 transition hover:bg-white/60">
            <span className="text-3xl" aria-hidden>🤖</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-aegold-700">{ar ? "مقترح لك بالذكاء الاصطناعي" : "Matched to your interests"}</p>
              <p className="font-bold">{ar ? match.titleAr : match.titleEn}</p>
              <p className="text-xs text-[var(--muted)]">{fmtDate(match.startsAt, L)} · {ar ? "تحتاج موافقة ولي الأمر" : "Needs guardian approval"}</p>
            </div>
            <ArrowRight size={18} className="rtl:rotate-180" />
          </Card>
        </Link>
      )}

      {me.role === "teacher" && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{ar ? "منشوراتك" : "Your posts"}</h2>
            <Link href="/app/post" className="btn-ink !min-h-9 text-sm"><Megaphone size={15} /> {ar ? "نشر جديد" : "New post"}</Link>
          </div>
          {myPosts.length === 0 ? <p className="mt-2 text-sm text-[var(--muted)]">{ar ? "انشر مرة واحدة ليصل إلى الطلاب وأولياء الأمور." : "Post once — it reaches students and parents."}</p> : (
            <ul className="mt-3 space-y-2">
              {myPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-[var(--muted)]">{ar ? "شوهد" : "Seen by"} {p.seenBy.length}/{p.recipients.length}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <section aria-labelledby="inbox">
        <h2 id="inbox" className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{ar ? "الوارد الموحد" : "Unified inbox"}</h2>
        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {sources.map((s) => (
            <button key={s} className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s === "All" ? t(L, "all") : <SourceTag source={s} />}
            </button>
          ))}
        </div>
        {list.length === 0 ? <Empty text={t(L, "nothing")} /> : (
          <ul className="space-y-2.5">
            {list.map((n) => <Row key={n.id} n={n} onToggle={() => toggleNotice(n.id)} />)}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({ n, onToggle }: { n: Notice; onToggle: () => void }) {
  const { state, me, myChildren } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const done = n.status === "done";
  const forChild = me?.role === "parent" && n.userId !== me.id ? myChildren.find((c) => c.id === n.userId) : undefined;
  return (
    <li className={`glass flex items-start gap-3 rounded-3xl p-3.5 transition ${done ? "opacity-55" : ""}`}>
      <button onClick={onToggle} aria-label={done ? t(L, "done") : t(L, "markDone")} className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${done ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}>
        {done && <Check size={15} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceTag source={n.sourceSystem} />
          {n.priority === 1 && !done && <Pill tone="red">{ar ? "عاجل" : "Urgent"}</Pill>}
          {forChild && <Pill>{ar ? forChild.nameAr : forChild.name}</Pill>}
        </div>
        <p className={`mt-1 font-semibold leading-snug ${done ? "line-through" : ""}`}>{ar ? n.titleAr : n.titleEn}</p>
        <p className="whitespace-pre-line text-sm text-[var(--muted)]">{ar ? n.bodyAr : n.bodyEn}</p>
        {n.action && <Link className="mt-1 inline-block text-sm font-semibold underline" href={n.action.href}>{ar ? n.action.labelAr : n.action.labelEn}</Link>}
      </div>
      {n.dueAt && <span className="shrink-0 text-end text-xs font-semibold text-[var(--ink-2)]">{relDays(n.dueAt, L)}<br /><span className="font-normal text-[var(--muted)]">{fmtDate(n.dueAt, L)}</span></span>}
    </li>
  );
}
