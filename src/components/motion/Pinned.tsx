"use client";
import { useRef, type ReactNode } from "react";
import { gsap, MOTION_MEDIA, ScrollTrigger, useGSAP } from "./gsap";

type Props = {
  id: string;
  className?: string;
  rail: ReactNode;
  children: ReactNode;
  "aria-labelledby"?: string;
};

// Two-column chapter. On desktop with motion allowed, the rail stays put
// while the content scrolls past it; everywhere else it is an ordinary
// stacked layout. The pin never captures the wheel, so scrolling is always
// the visitor's own.
export default function Pinned({ id, className = "", rail, children, ...rest }: Props) {
  const section = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(MOTION_MEDIA, () => {
        const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
        // Pin from the moment the rail itself reaches the header until the
        // section's last card has scrolled into place.
        const trigger = ScrollTrigger.create({
          trigger: railRef.current,
          start: `top ${headerHeight + 24}px`,
          endTrigger: section.current,
          end: "bottom bottom",
          pin: railRef.current,
          pinSpacing: false,
        });
        // Webfont swap and image decode change the layout above; re-measure once they settle.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
        return () => trigger.kill();
      });
      return () => media.revert();
    },
    { scope: section },
  );

  return (
    <section id={id} ref={section} className={`pinned ${className}`.trim()} {...rest}>
      <div ref={railRef} className="pinned-rail">
        {rail}
      </div>
      <div className="pinned-body">{children}</div>
    </section>
  );
}
