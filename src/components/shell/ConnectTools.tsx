"use client";

// "Connect your tools" onboarding step (all roles). Integrations connect one by one
// (simulated), shown with the ToolCallsSection pattern. One needs the school's
// approval, so the demo shows that state too.
import { useEffect, useState } from "react";
import { BookOpen, CreditCard, MonitorSmartphone, NotebookPen, School, ShieldCheck } from "lucide-react";
import { ToolCallsSection, type ToolCallEntry, type ToolStatus } from "@/components/ui/tool-calls-section";
import type { Role } from "@/lib/types";

const TOOLS: Record<Role, Omit<ToolCallEntry, "status">[]> = {
  parent: [
    { tool_name: "uaepass", tool_category: "Identity", integration_name: "UAE PASS (simulated)", message: "Your verified identity", color: "#B68A35", icon: <ShieldCheck size={14} />, inputs: { shares: "name, Emirates ID (masked)" }, output: "Guardian verified" },
    { tool_name: "school-account", tool_category: "School", integration_name: "Al Noor school account", message: "Sara's school account", color: "#121217", icon: <School size={14} />, inputs: { shares: "child link only" }, output: "Linked to Sara, Grade 8" },
    { tool_name: "fees", tool_category: "Payments", integration_name: "School fees portal", message: "Fees and payment plans", color: "#C23EA5", icon: <CreditCard size={14} />, output: "1 instalment plan found" },
    { tool_name: "lms", tool_category: "Learning", integration_name: "Smart Learning Portal", message: "Homework and grades (read only)", color: "#4073FF", icon: <MonitorSmartphone size={14} />, output: "4 items this week" },
  ],
  teacher: [
    { tool_name: "uaepass", tool_category: "Identity", integration_name: "UAE PASS (simulated)", message: "Your verified identity", color: "#B68A35", icon: <ShieldCheck size={14} />, output: "Educator verified" },
    { tool_name: "timetable", tool_category: "School", integration_name: "School timetable", message: "Your classes and rooms", color: "#121217", icon: <School size={14} />, output: "3 classes, 6 periods today" },
    { tool_name: "gclassroom", tool_category: "Learning", integration_name: "Google Classroom", message: "Classwork and submissions", color: "#2E9E6B", icon: <NotebookPen size={14} />, output: "19 submissions to grade" },
    { tool_name: "lms", tool_category: "Learning", integration_name: "Smart Learning Portal", message: "Assignments and marks", color: "#4073FF", icon: <MonitorSmartphone size={14} />, output: "Synced" },
    { tool_name: "ebooks", tool_category: "Content", integration_name: "Minhaji e-books", message: "Textbooks for your classes", color: "#8C59F2", icon: <BookOpen size={14} />, output: "Needs the school admin to approve" },
  ],
  student: [],
};

export function ConnectTools({ role, onDone }: { role: Role; onDone?: () => void }) {
  const list = TOOLS[role];
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step > list.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 300 : 700);
    if (step === list.length) onDone?.();
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const calls: ToolCallEntry[] = list.map((c, i) => {
    let status: ToolStatus = i < step - 1 ? "connected" : i === step - 1 ? "connecting" : "pending";
    if (status === "connected" && c.tool_name === "ebooks") status = "needs_approval";
    return { ...c, status };
  });
  const connected = calls.filter((c) => c.status === "connected").length;
  return <ToolCallsSection toolCalls={calls} defaultExpanded label={() => `Connected ${connected} of ${list.length} tools`} />;
}
