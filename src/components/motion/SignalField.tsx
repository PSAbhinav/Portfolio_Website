"use client";
import { useRef } from "react";
import { gsap, MOTION_MEDIA, useGSAP } from "./gsap";

const WIDTH = 800;
const HEIGHT = 600;
const SEGMENTS = 16;

type Props = { lines?: number };

// A field of horizontal hairlines. With motion allowed, the lines bend
// gently toward the pointer and drift with scroll; otherwise they are
// straight, which is also what the server renders.
export default function SignalField({ lines = 24 }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const spacing = HEIGHT / (lines + 1);
  const rows = Array.from({ length: lines }, (_, i) => spacing * (i + 1));

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(MOTION_MEDIA, () => {
        const root = svg.current;
        if (!root) return;
        const paths = Array.from(root.querySelectorAll<SVGPathElement>("path"));
        const pointer = { x: -9999, y: -9999, strength: 0 };
        const drift = { y: 0 };

        const render = () => {
          paths.forEach((path, index) => {
            const baseY = rows[index];
            let d = `M0 ${baseY.toFixed(1)}`;
            for (let s = 1; s <= SEGMENTS; s++) {
              const x = (WIDTH / SEGMENTS) * s;
              const dx = x - pointer.x;
              const dy = baseY - pointer.y;
              const dist = Math.hypot(dx, dy);
              // Lines part around the pointer like a field around a charge.
              const push = pointer.strength * Math.max(0, 1 - dist / 240) * 34;
              const y = baseY + push * Math.sign(dy || 1) + drift.y * ((index % 5) - 2) * 0.4;
              d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            path.setAttribute("d", d);
          });
        };

        const toX = gsap.quickTo(pointer, "x", { duration: 0.6, ease: "power2.out", onUpdate: render });
        const toY = gsap.quickTo(pointer, "y", { duration: 0.6, ease: "power2.out", onUpdate: render });
        const toStrength = gsap.quickTo(pointer, "strength", { duration: 0.8, ease: "power2.out", onUpdate: render });

        const host = (root.closest<HTMLElement>(".hero") ?? root.parentElement ?? root) as HTMLElement;
        const onMove = (event: PointerEvent) => {
          const box = root.getBoundingClientRect();
          toX(((event.clientX - box.left) / box.width) * WIDTH);
          toY(((event.clientY - box.top) / box.height) * HEIGHT);
          toStrength(1);
        };
        const onLeave = () => toStrength(0);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);

        const scrub = gsap.to(drift, {
          y: 12,
          ease: "none",
          onUpdate: render,
          scrollTrigger: { trigger: host, start: "top top", end: "bottom top", scrub: 0.6 },
        });

        render();
        return () => {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          scrub.scrollTrigger?.kill();
          scrub.kill();
        };
      });
      return () => media.revert();
    },
    { scope: svg },
  );

  return (
    <svg
      ref={svg}
      className="signal-field"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {rows.map((y, index) => (
        <path key={index} d={`M0 ${y.toFixed(1)} L${WIDTH} ${y.toFixed(1)}`} />
      ))}
    </svg>
  );
}
