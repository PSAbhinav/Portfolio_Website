"use client";
import { useEffect, useRef } from "react";
import { gsap } from "./gsap";

// A signal ring that trails the pointer and opens over anything interactive.
// The native cursor stays; this is an accent, not a replacement. Only for
// fine pointers with motion allowed.
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches || !ring.current || !dot.current) return;
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.35, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.35, ease: "power3.out" });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power2.out" });
    let shown = false;
    const onMove = (event: PointerEvent) => {
      ringX(event.clientX);
      ringY(event.clientY);
      dotX(event.clientX);
      dotY(event.clientY);
      if (!shown) {
        shown = true;
        document.documentElement.classList.add("has-cursor");
      }
      const interactive = (event.target as Element | null)?.closest("a, button, [role=option], input, textarea, select, summary, label");
      document.documentElement.classList.toggle("cursor-hot", Boolean(interactive));
    };
    const onLeave = () => {
      shown = false;
      document.documentElement.classList.remove("has-cursor", "cursor-hot");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor", "cursor-hot");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
