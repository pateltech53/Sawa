"use client";

import { useMemo } from "react";
import { CLASSROOM_COURSES, CLASSROOM_WORK, COMMUNITY_ACTIVITIES, COMMUNITIES, OPPORTUNITIES } from "./seed";
import { useStore } from "./store";

export type AgendaKind = "assignment" | "exam" | "event" | "notice" | "opportunity" | "saved" | "reminder" | "community" | "proactive";

export interface AgendaItem {
  id: string;
  title: string;
  at: string;
  source: string; // "Google Classroom" | "LMS" | "School" | "Sawa" | community name …
  kind: AgendaKind;
  done: boolean;
  href?: string;
  detail?: string;
  color: string;
  toggle?: () => void;
}

export const KIND_COLOR: Record<AgendaKind, string> = {
  assignment: "#5185DE", exam: "#D0453B", event: "#2E9E6B", notice: "#7B6A59", opportunity: "#8C59F2",
  saved: "#B68A35", reminder: "#121217", community: "#D9822B", proactive: "#B68A35",
};

/** Everything that belongs on a student's week, merged from every connected system. */
export function useAgenda() {
  const { state, me, visibleNotices, toggleNotice, toggleReminder } = useStore();
  return useMemo(() => {
    if (!me) return { items: [] as AgendaItem[], classroomConnected: false };
    const classroomConnected = Boolean(state.integrations[me.id]?.gclassroom);
    const items: AgendaItem[] = [];

    for (const n of visibleNotices) {
      if (!n.dueAt) continue;
      const kind: AgendaKind = n.kind === "assignment" ? "assignment" : n.kind === "exam" ? "exam" : n.kind === "event" ? "event" : n.kind === "proactive" ? "proactive" : "notice";
      items.push({ id: n.id, title: n.titleEn, at: n.dueAt, source: n.sourceSystem, kind, done: n.status === "done", href: n.action?.href, detail: n.bodyEn, color: KIND_COLOR[kind], toggle: () => toggleNotice(n.id) });
    }
    if (classroomConnected) {
      for (const w of CLASSROOM_WORK) {
        const c = CLASSROOM_COURSES.find((x) => x.id === w.courseId)!;
        items.push({ id: w.id, title: w.title, at: w.dueAt, source: "Google Classroom", kind: "assignment", done: w.status === "submitted" || w.status === "returned", detail: `${c.name} · ${c.teacher}${w.grade ? ` · Graded ${w.grade}` : ""}${w.status === "missing" ? " · Missing" : ""}`, color: c.color, href: "/app/connections" });
      }
    }
    for (const r of state.reminders.filter((x) => x.userId === me.id)) {
      items.push({ id: r.id, title: r.title, at: r.at, source: "Reminder", kind: "reminder", done: r.done, href: r.linkHref, color: KIND_COLOR.reminder, toggle: () => toggleReminder(r.id) });
    }
    const reg = state.registered[me.id] ?? [];
    for (const o of OPPORTUNITIES.filter((x) => reg.includes(x.id))) {
      items.push({ id: `reg-${o.id}`, title: o.titleEn, at: o.startsAt, source: "Registered", kind: "opportunity", done: false, href: `/app/opportunities/${o.id}`, detail: o.organiser, color: KIND_COLOR.opportunity });
    }
    const saved = (state.saved[me.id] ?? []).filter((x) => !reg.includes(x));
    for (const o of OPPORTUNITIES.filter((x) => saved.includes(x.id))) {
      const at = o.deadline ?? o.startsAt;
      items.push({ id: `sav-${o.id}`, title: `${o.deadline ? "Apply by: " : ""}${o.titleEn}`, at, source: "Saved", kind: "saved", done: false, href: `/app/opportunities/${o.id}`, color: KIND_COLOR.saved });
    }
    const joinedActs = state.activitiesJoined[me.id] ?? [];
    for (const a of COMMUNITY_ACTIVITIES.filter((x) => joinedActs.includes(x.id))) {
      const c = COMMUNITIES.find((x) => x.id === a.communityId)!;
      items.push({ id: a.id, title: a.titleEn, at: a.startsAt, source: c.name, kind: "community", done: false, href: `/app/communities/${c.id}`, detail: a.place, color: KIND_COLOR.community });
    }
    items.sort((a, b) => a.at.localeCompare(b.at));
    return { items, classroomConnected };
  }, [state, me, visibleNotices, toggleNotice, toggleReminder]);
}

export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfWeek = (d: Date) => { const x = startOfDay(d); const day = (x.getDay() + 6) % 7; return addDays(x, -day); }; // Monday
