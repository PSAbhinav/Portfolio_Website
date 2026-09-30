"use client";
import { useState, type RefObject } from "react";
import { gsap, MOTION_MEDIA, ScrollTrigger, useGSAP } from "./gsap";

// 0..1 as an element travels through the viewport, on desktop with motion
// allowed. Everywhere else (server render, reduced motion, narrow screens,
// no JavaScript) it stays at 1, so visuals show their finished state.
export function useScrubProgress(ref: RefObject<HTMLElement | null>, start = "top 80%", end = "bottom 55%"): number {
  const [progress, setProgress] = useState(1);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(MOTION_MEDIA, () => {
        const trigger = ScrollTrigger.create({
          trigger: ref.current,
          start,
          end,
          onUpdate: (self) => setProgress(Math.round(self.progress * 100) / 100),
          onRefresh: (self) => setProgress(Math.round(self.progress * 100) / 100),
        });
        return () => {
          trigger.kill();
          setProgress(1);
        };
      });
      return () => media.revert();
    },
    { scope: ref },
  );
  return progress;
}

export function stage(progress: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (progress - from) / (to - from)));
}
