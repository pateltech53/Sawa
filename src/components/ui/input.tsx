import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** shadcn Input, styled with Sawa tokens (frosted field, blue focus ring, red when aria-invalid). */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex min-h-12 w-full rounded-[18px] border border-white/95 bg-white/65 px-4 py-2.5 text-[15px] text-foreground transition-[box-shadow,border-color]",
      "placeholder:text-muted-foreground/80 file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "focus-visible:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/30",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-destructive/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
