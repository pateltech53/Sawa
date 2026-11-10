"use client";

// Generic marks for the school systems Sawa joins up. These are plain wordmarks
// with lucide icons, not the vendors' logos: the prototype has no licence to
// show them, and the carousel only needs to say "these all live in one place".
import { BookOpen, CalendarDays, GraduationCap, Library, MonitorSmartphone, NotebookPen, ShieldCheck, School } from "lucide-react";
import type { Logo } from "@/components/ui/logo-carousel";

const mark = (Icon: typeof BookOpen, name: string, color: string) =>
  function Mark({ className = "" }: { className?: string }) {
    return (
      <span className={"inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1.5 text-[12px] font-bold text-[#121217] shadow-sm md:text-sm " + className}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white" style={{ background: color }}><Icon size={13} strokeWidth={2.4} /></span>
        <span className="whitespace-nowrap">{name}</span>
      </span>
    );
  };

export const SYSTEM_MARKS: Logo[] = [
  { id: 1, name: "Classroom", img: mark(NotebookPen, "Classroom", "#2E9E6B") },
  { id: 2, name: "School LMS", img: mark(MonitorSmartphone, "LMS", "#5185DE") },
  { id: 3, name: "E-books", img: mark(BookOpen, "E-books", "#8C59F2") },
  { id: 4, name: "Library", img: mark(Library, "Library", "#7B6A59") },
  { id: 5, name: "UAE PASS (simulated)", img: mark(ShieldCheck, "UAE PASS", "#B68A35") },
  { id: 6, name: "Timetable", img: mark(CalendarDays, "Timetable", "#D9822B") },
  { id: 7, name: "School office", img: mark(School, "Office", "#423A31") },
  { id: 8, name: "Clubs", img: mark(GraduationCap, "Clubs", "#D0453B") },
];
