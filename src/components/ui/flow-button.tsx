"use client";

// FlowButton (21st.dev), adapted for Sawa: real <button>/<Link> semantics, an
// optional href, light and dark tones, and RTL-safe arrows.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FlowButtonProps = {
  text?: string;
  href?: string;
  onClick?: () => void;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function FlowButton({ text = "Modern Button", href, onClick, tone = "dark", size = "md", className, type = "button", disabled }: FlowButtonProps) {
  const ink = tone === "dark" ? "#121217" : "#ffffff";
  const fg = tone === "dark" ? "#ffffff" : "#121217";
  const cls = cn(
    "group relative inline-flex flex-nowrap items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] font-semibold",
    "cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[14px] hover:border-transparent active:scale-[0.95]",
    "disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "h-9 px-6 text-[13px]" : "h-12 px-8 text-sm",
    className,
  );
  const style = { borderColor: tone === "dark" ? "rgba(18,18,23,.35)" : "rgba(255,255,255,.7)", color: ink, ["--fg" as string]: fg, ["--ink" as string]: ink } as React.CSSProperties;
  const inner = (
    <>
      <ArrowRight aria-hidden className="absolute start-[-25%] z-[9] h-4 w-4 fill-none stroke-[var(--ink)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:start-4 group-hover:stroke-[var(--fg)] rtl:rotate-180" />
      <span className="relative z-[1] -translate-x-3 whitespace-nowrap transition-all duration-[800ms] ease-out group-hover:translate-x-3 group-hover:text-[var(--fg)] rtl:translate-x-3 rtl:group-hover:-translate-x-3">{text}</span>
      <span aria-hidden className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[260px] group-hover:w-[260px] group-hover:opacity-100" style={{ background: ink }} />
      <ArrowRight aria-hidden className="absolute end-4 z-[9] h-4 w-4 fill-none stroke-[var(--ink)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:end-[-25%] group-hover:stroke-[var(--fg)] rtl:rotate-180" />
    </>
  );
  if (href) return <Link href={href} className={cls} style={style}>{inner}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>{inner}</button>;
}

export default FlowButton;
