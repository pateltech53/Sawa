"use client";

// LogoCarousel (21st.dev), on `motion/react` (the package Sawa already ships as
// Framer Motion's successor) instead of a second copy under `framer-motion`.
// Columns swap marks every two seconds; with reduced motion they stay still.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface Logo {
  name: string;
  id: number;
  img: React.ComponentType<{ className?: string }>;
}

interface LogoColumnProps {
  logos: Logo[];
  index: number;
  currentTime: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos);
  const columns: Logo[][] = Array.from({ length: columnCount }, () => []);
  shuffled.forEach((logo, index) => columns[index % columnCount].push(logo));
  const maxLength = Math.max(...columns.map((col) => col.length));
  columns.forEach((col) => {
    while (col.length < maxLength) col.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
  });
  return columns;
};

const LogoColumn: React.FC<LogoColumnProps> = React.memo(function LogoColumn({ logos, index, currentTime }) {
  const cycleInterval = 2000;
  const columnDelay = index * 200;
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length);
  const currentIndex = Math.floor(adjustedTime / cycleInterval);
  const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex]);

  return (
    <motion.div
      className="relative h-12 w-[112px] overflow-hidden md:h-16 md:w-36"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${logos[currentIndex].id}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 20, mass: 1, bounce: 0.2, duration: 0.5 } }}
          exit={{ y: "-20%", opacity: 0, filter: "blur(6px)", transition: { type: "tween", ease: "easeIn", duration: 0.3 } }}
        >
          <CurrentLogo className="max-h-[80%] max-w-[90%]" />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

interface LogoCarouselProps {
  columnCount?: number;
  logos: Logo[];
  className?: string;
}

export function LogoCarousel({ columnCount = 2, logos, className = "" }: LogoCarouselProps) {
  const reduce = useReducedMotion();
  const [logoSets, setLogoSets] = useState<Logo[][]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const updateTime = useCallback(() => setCurrentTime((t) => t + 100), []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(updateTime, 100);
    return () => clearInterval(id);
  }, [updateTime, reduce]);

  useEffect(() => {
    setLogoSets(distributeLogos(logos, columnCount));
  }, [logos, columnCount]);

  return (
    <div className={"flex gap-3 " + className} aria-label={"Works with: " + logos.map((l) => l.name).join(", ")} role="img">
      {logoSets.map((set, index) => (
        <LogoColumn key={index} logos={set} index={index} currentTime={currentTime} />
      ))}
    </div>
  );
}

export { LogoColumn };
