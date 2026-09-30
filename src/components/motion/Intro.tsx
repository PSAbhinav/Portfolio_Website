"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap";
import { LogoMark } from "@/components/Logo";

// A one-second brand intro on the first visit of a session: the mark draws
// itself, the point lights, and the paper lifts to reveal the page. Skipped
// under reduced motion and on every later page load in the same session.
export default function Intro() {
  const [show, setShow] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = "yes";
    try {
      seen = sessionStorage.getItem("intro-shown") || "";
    } catch {
      seen = "yes";
    }
    if (reduced || seen === "yes") return;
    try {
      sessionStorage.setItem("intro-shown", "pending");
    } catch {
      return;
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show || !overlay.current) return;
    const root = overlay.current;
    const strokes = root.querySelectorAll("svg path, svg rect");
    const point = root.querySelector("svg circle");
    const finish = () => {
      try {
        sessionStorage.setItem("intro-shown", "yes");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("intro:done"));
      setShow(false);
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power2.inOut", stagger: 0.05 })
      .fromTo(point, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, "-=0.15")
      .to(root, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "+=0.15");
    return () => {
      tl.kill();
    };
  }, [show]);

  if (!show) return null;
  return (
    <div ref={overlay} className="intro" aria-hidden="true">
      <LogoMark size={88} />
    </div>
  );
}
