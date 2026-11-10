// Pure helpers for the teacher workspace (no React). Shared by pages and the SAWA AI route.
import { OPPORTUNITIES } from "./seed";
import { CLASSES, ROSTER, TIMETABLE } from "./seed-teacher";
import type { Opportunity, RosterStudent, Submission, TAssignment, TeacherClass } from "./types";

export const studentById = (id: string) => ROSTER.find((r) => r.id === id);
export const classById = (id: string) => CLASSES.find((c) => c.id === id);
export const ageOfRoster = (r: RosterStudent) => new Date().getFullYear() - r.birthYear;
export const dateKey = (d = new Date()) => d.toISOString().slice(0, 10);
export const attendanceKey = (classId: string, d = new Date()) => `${classId}|${dateKey(d)}`;

export function slotsFor(day: number) {
  return TIMETABLE.filter((s) => s.day === day).sort((a, b) => a.period - b.period);
}

/** Current and next slot for a given time (weekends fall back to Monday's timetable as a preview). */
export function nowAndNext(d = new Date()) {
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const day = weekend ? 1 : d.getDay();
  const slots = slotsFor(day);
  const hm = d.getHours() * 60 + d.getMinutes();
  const toMin = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);
  const current = weekend ? undefined : slots.find((s) => toMin(s.start) <= hm && hm < toMin(s.end));
  const next = weekend ? slots[0] : slots.find((s) => toMin(s.start) > hm);
  return { day, slots, current, next, weekend, toMin };
}

export function classStats(cls: TeacherClass, assignments: TAssignment[], subs: Record<string, Record<string, Submission>>) {
  const mine = assignments.filter((a) => a.classId === cls.id && a.status === "published");
  let graded = 0, sum = 0, max = 0, toGrade = 0, missing = 0, handedIn = 0, expected = 0;
  for (const a of mine) {
    for (const sid of cls.studentIds) {
      const s = subs[a.id]?.[sid];
      const past = new Date(a.dueAt).getTime() < Date.now();
      if (past || s?.status !== "missing") expected++;
      if (!s || s.status === "missing") { if (past) missing++; continue; }
      handedIn++;
      if (s.status === "graded" && s.score !== undefined) { graded++; sum += s.score; max += a.points; }
      else toGrade++;
    }
  }
  return {
    assignments: mine.length,
    average: max ? Math.round((sum / max) * 100) : null,
    toGrade,
    missing,
    submissionRate: expected ? Math.round((handedIn / expected) * 100) : null,
    graded,
  };
}

export function studentAverage(sid: string, cls: TeacherClass, assignments: TAssignment[], subs: Record<string, Record<string, Submission>>) {
  let sum = 0, max = 0, missing = 0;
  for (const a of assignments.filter((x) => x.classId === cls.id)) {
    const s = subs[a.id]?.[sid];
    if (s?.status === "graded" && s.score !== undefined) { sum += s.score; max += a.points; }
    if ((!s || s.status === "missing") && new Date(a.dueAt).getTime() < Date.now()) missing++;
  }
  return { average: max ? Math.round((sum / max) * 100) : null, missing };
}

/** Who in a class can join an opportunity, and who would love it (interest overlap). */
export function eligibility(op: Opportunity, cls: TeacherClass) {
  const students = cls.studentIds.map(studentById).filter(Boolean) as RosterStudent[];
  const eligible = students.filter((s) => { const age = ageOfRoster(s); return age >= op.minAge && (!op.maxAge || age <= op.maxAge); });
  const matched = eligible.filter((s) => s.interests.some((i) => op.interests.includes(i)));
  const needConsent = op.needsConsent ? eligible.filter((s) => ageOfRoster(s) < 15).length : 0;
  return { students, eligible, matched, needConsent };
}

export function bestOpportunitiesFor(cls: TeacherClass, limit = 2) {
  return OPPORTUNITIES
    .filter((o) => !o.deadline || new Date(o.deadline).getTime() > Date.now())
    .map((o) => ({ o, e: eligibility(o, cls) }))
    .filter((x) => x.e.matched.length > 0)
    .sort((a, b) => b.e.matched.length - a.e.matched.length)
    .slice(0, limit);
}

export const KIND_LABEL: Record<TAssignment["kind"], [string, string]> = {
  homework: ["Homework", "واجب"],
  quiz: ["Quiz", "اختبار قصير"],
  project: ["Project", "مشروع"],
  lab: ["Lab", "مختبر"],
};
