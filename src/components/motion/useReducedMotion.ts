"use client";
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Starts as `true` so the server render and the first client paint contain
// the static, fully visible version; motion is opted into after mount.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
