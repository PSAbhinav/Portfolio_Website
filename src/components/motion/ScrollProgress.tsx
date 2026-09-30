"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

// Hairline along the top of the header showing how far down the page the
// visitor is. Hidden entirely under reduced motion.
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${fraction})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);
  if (reduced) return null;
  return <div ref={bar} className="scroll-progress" aria-hidden="true" />;
}
