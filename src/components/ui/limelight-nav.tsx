"use client";

import React, { cloneElement, useLayoutEffect, useRef, useState } from "react";

// 21st.dev "Limelight nav", adapted for Sawa:
// - items render as buttons (keyboard reachable) and expose aria-current
// - optional labels under icons, optional badge count
// - controlled mode (activeIndex) so the active tab follows the route
// - ref callbacks no longer return a value (React 19 treats that as cleanup)

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></svg>;
const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;

export type NavItem = {
  id: string | number;
  icon: React.ReactElement<{ className?: string }>;
  label?: string;
  badge?: number;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: "default-home", icon: <DefaultHomeIcon />, label: "Home" },
  { id: "default-explore", icon: <DefaultCompassIcon />, label: "Explore" },
  { id: "default-notifications", icon: <DefaultBellIcon />, label: "Notifications" },
];

type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  /** Controlled active index (e.g. derived from the current route). */
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  showLabels?: boolean;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  "aria-label"?: string;
  /** "lens": a liquid-glass pill slides under the active item instead of the top beam. */
  variant?: "limelight" | "lens";
};

/** An adaptive-width navigation bar with a "limelight" effect that highlights the active item. */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  activeIndex: controlled,
  onTabChange,
  showLabels = false,
  className = "",
  limelightClassName = "",
  iconContainerClassName = "",
  iconClassName = "",
  "aria-label": ariaLabel = "Main",
  variant = "limelight",
}: LimelightNavProps) => {
  const [internal, setInternal] = useState(defaultActiveIndex);
  const activeIndex = controlled ?? internal;
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) return;
    const place = () => {
      const limelight = limelightRef.current;
      const activeItem = navItemRefs.current[activeIndex];
      if (limelight && !activeItem) limelight.style.opacity = "0";
      if (limelight && activeItem) {
        if (variant === "lens") {
          limelight.style.width = `${activeItem.offsetWidth - 6}px`;
          limelight.style.left = `${activeItem.offsetLeft + 3}px`;
        } else limelight.style.left = `${activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2}px`;
        limelight.style.opacity = activeIndex < 0 ? "0" : "1";
      }
    };
    place();
    if (!isReady) {
      const t = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(t);
    }
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [activeIndex, isReady, items, variant]);

  if (items.length === 0) return null;

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setInternal(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav aria-label={ariaLabel} className={`relative inline-flex items-center rounded-lg border bg-card px-2 text-foreground ${showLabels ? "h-[72px]" : "h-16"} ${className}`}>
      {items.map(({ id, icon, label, badge, onClick }, index) => {
        const active = activeIndex === index;
        return (
          <button
            type="button"
            key={id}
            ref={(el) => { navItemRefs.current[index] = el; }}
            className={`relative z-20 flex h-full cursor-pointer flex-col items-center justify-center gap-1 px-4 transition-transform active:scale-95 sm:px-5 ${iconContainerClassName}`}
            onClick={() => handleItemClick(index, onClick)}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            {cloneElement(icon, {
              className: `h-6 w-6 transition-opacity duration-200 ease-in-out ${active ? "opacity-100" : "opacity-45"} ${icon.props.className || ""} ${iconClassName}`,
            })}
            {showLabels && label && <span className={`text-[10.5px] font-semibold leading-none transition-opacity ${active ? "opacity-100" : "opacity-55"}`}>{label}</span>}
            {!!badge && <span className="absolute end-1.5 top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-aered-600 px-1 text-[10px] font-bold text-white">{badge}</span>}
          </button>
        );
      })}

      {variant === "lens" ? (
        <div
          ref={limelightRef}
          aria-hidden
          className={`lg pointer-events-none absolute top-1.5 bottom-1.5 z-10 !rounded-[24px] ${isReady ? "transition-[left,width] duration-[520ms] ease-[cubic-bezier(.3,1.35,.45,1)]" : ""} ${limelightClassName}`}
          style={{ left: "-999px" }}
        />
      ) : (
        <div
          ref={limelightRef}
          aria-hidden
          className={`absolute top-0 z-10 h-[5px] w-11 rounded-full bg-primary shadow-[0_50px_15px_var(--color-primary)] ${isReady ? "transition-[left] duration-[400ms] ease-in-out" : ""} ${limelightClassName}`}
          style={{ left: "-999px" }}
        >
          <div className="pointer-events-none absolute left-[-30%] top-[5px] h-14 w-[160%] bg-gradient-to-b from-primary/30 to-transparent [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)]" />
        </div>
      )}
    </nav>
  );
};
