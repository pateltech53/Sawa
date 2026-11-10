"use client";

// ToolCallsSection (21st.dev), ported for Sawa: the original's Hugeicons/markdown helper
// files are replaced with lucide icons and plain text, and each entry can carry a live
// status so onboarding can show integrations connecting one by one.
import type { ReactNode } from "react";
import { useState } from "react";
import { Check, ChevronDown, Clock, Loader2, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolStatus = "pending" | "connecting" | "connected" | "needs_approval";

export interface ToolCallEntry {
  tool_name: string;
  tool_category: string;
  message?: string;
  show_category?: boolean;
  tool_call_id?: string;
  inputs?: Record<string, unknown>;
  output?: string;
  integration_name?: string;
  /** Sawa addition: connection state */
  status?: ToolStatus;
  /** Sawa addition: brand colour for the generic icon tile */
  color?: string;
  icon?: ReactNode;
}

export interface ToolCallsSectionProps {
  toolCalls: ToolCallEntry[];
  maxIconsToShow?: number;
  defaultExpanded?: boolean;
  className?: string;
  iconSize?: number;
  label?: (n: number) => string;
}

const STATUS_TEXT: Record<ToolStatus, string> = { pending: "Waiting", connecting: "Connecting…", connected: "Connected", needs_approval: "Needs school approval" };

function ToolIcon({ call, size }: { call: ToolCallEntry; size: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[10px] text-white shadow-sm ring-2 ring-white" style={{ width: size + 8, height: size + 8, background: call.color ?? "#121217" }}>
      {call.icon ?? <Plug size={size - 6} />}
    </span>
  );
}

function StatusBadge({ s }: { s: ToolStatus }) {
  const map = {
    pending: ["bg-black/5 text-[var(--muted)]", <Clock key="i" size={11} />],
    connecting: ["bg-blue-50 text-blue-700", <Loader2 key="i" size={11} className="animate-spin" />],
    connected: ["bg-[#2E9E6B]/15 text-[#1F7A50]", <Check key="i" size={11} strokeWidth={3} />],
    needs_approval: ["bg-aegold-100 text-aegold-800", <Clock key="i" size={11} />],
  } as const;
  const [cls, icon] = map[s];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>{icon}{STATUS_TEXT[s]}</span>;
}

export function ToolCallsSection({ toolCalls, maxIconsToShow = 6, defaultExpanded = false, className, iconSize = 20, label }: ToolCallsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const shown = toolCalls.slice(0, maxIconsToShow);

  return (
    <div className={cn("w-full", className)}>
      <button type="button" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} className="flex w-full items-center justify-start gap-2 py-2 text-[var(--ink-2)] hover:text-ink">
        <span className="flex -space-x-1.5">
          {shown.map((c, i) => (
            <span key={c.tool_name} style={{ rotate: shown.length > 1 ? (i % 2 === 0 ? "8deg" : "-8deg") : "0deg", zIndex: i }}><ToolIcon call={c} size={iconSize} /></span>
          ))}
          {toolCalls.length > maxIconsToShow && <span className="z-0 grid size-7 place-items-center rounded-lg bg-black/10 text-xs">+{toolCalls.length - maxIconsToShow}</span>}
        </span>
        <span className="ms-1 text-sm font-semibold">{label ? label(toolCalls.length) : `Used ${toolCalls.length} tool${toolCalls.length > 1 ? "s" : ""}`}</span>
        <ChevronDown size={16} className={cn("ms-auto transition-transform", isExpanded && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="pt-1">
          {toolCalls.map((call, i) => {
            const details = call.inputs || call.output;
            return (
              <div key={call.tool_name} className="flex items-stretch gap-2.5">
                <div className="flex flex-col items-center self-stretch">
                  <div className="grid min-h-9 min-w-9 place-items-center"><ToolIcon call={call} size={iconSize} /></div>
                  {i < toolCalls.length - 1 && <div className="min-h-4 w-px flex-1 bg-black/15" />}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <button type="button" className={cn("flex !min-h-0 items-center justify-start gap-1 !p-0 pt-1.5 text-start", details && "cursor-pointer")} onClick={() => details && toggle(i)} aria-expanded={details ? open.has(i) : undefined}>
                    <p className="text-sm font-semibold">{call.message ?? call.tool_name}</p>
                    {details && <ChevronDown size={14} className={cn("transition-transform", open.has(i) && "rotate-180")} />}
                  </button>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {call.show_category !== false && <p className="text-xs text-[var(--muted)]">{call.integration_name ?? call.tool_category}</p>}
                    {call.status && <StatusBadge s={call.status} />}
                  </div>
                  {open.has(i) && details && (
                    <div className="mt-2 w-fit space-y-2 rounded-xl bg-white/70 p-3 text-[11px]">
                      {call.inputs && <div><p className="mb-0.5 font-semibold text-[var(--muted)]">Shares</p><p>{Object.entries(call.inputs).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</p></div>}
                      {call.output && <div><p className="mb-0.5 font-semibold text-[var(--muted)]">Result</p><p>{call.output}</p></div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ToolCallsSection;
