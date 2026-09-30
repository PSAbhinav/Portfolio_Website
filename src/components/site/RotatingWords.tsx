"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

// One line under the name that cycles through short descriptors. Under
// reduced motion it shows the first descriptor and stays still.
export default function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const timer = window.setInterval(() => {
      setLeaving(true);
      window.setTimeout(() => {
        setIndex((value) => (value + 1) % words.length);
        setLeaving(false);
      }, 380);
    }, interval);
    return () => window.clearInterval(timer);
  }, [reduced, words.length, interval]);

  if (!words.length) return null;
  return (
    <span className="rotating" aria-live="polite">
      <span className={`rotating-word ${leaving ? "is-leaving" : ""}`}>{words[index]}</span>
    </span>
  );
}
