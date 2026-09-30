"use client";
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
};

// Fades content in the first time it enters the viewport. Without JavaScript
// the content is simply visible (see base.css), so nothing depends on this.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      node.classList.add("is-in");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("is-in");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;
  const Component = Tag as ElementType;
  return (
    <Component ref={ref} id={id} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </Component>
  );
}
