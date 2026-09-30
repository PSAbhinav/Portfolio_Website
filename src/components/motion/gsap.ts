"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registered once for the whole app. Importing from here (never from "gsap"
// directly) keeps a single engine and a single plugin registration.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Media query used by every scroll-linked effect: desktop widths only and
// only when the visitor has not asked for reduced motion.
export const MOTION_MEDIA = "(prefers-reduced-motion: no-preference) and (min-width: 1024px)";

export { gsap, ScrollTrigger, useGSAP };
