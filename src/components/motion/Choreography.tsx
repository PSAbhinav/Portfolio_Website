"use client";
import { useEffect } from "react";
import { gsap, MOTION_MEDIA, ScrollTrigger, SplitText } from "./gsap";

// Page-wide scroll choreography, applied after mount as progressive
// enhancement: the markup is complete and readable before any of this runs,
// and none of it runs under reduced motion or on narrow screens.
export default function Choreography() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(MOTION_MEDIA, () => {
      const splits: SplitText[] = [];
      const sectionIds = ["home", "now", "work", "credentials", "about", "toolkit", "journey", "contact"];

      // Which section the visitor is in, for the background's warmth.
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) window.dispatchEvent(new CustomEvent("signal:warmth", { detail: id }));
          },
        });
      });

      // Hero: the name arrives character by character out of a mask, the rest
      // follows; on scroll the whole block drifts up and fades as a hand-off.
      const heroTitle = document.getElementById("hero-title");
      const startHero = () => {
        if (!heroTitle) return;
        const split = SplitText.create(heroTitle, { type: "chars,lines", mask: "lines", linesClass: "split-line" });
        splits.push(split);
        gsap.set(heroTitle, { visibility: "visible" });
        gsap.from(split.chars, { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.028 });
        gsap.from([".hero-status", ".hero-tagline", ".hero-actions", ".hero-foot"], { y: 22, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, delay: 0.35 });
      };
      if (sessionStorage.getItem("intro-shown") === "pending") {
        const onDone = () => {
          startHero();
          window.removeEventListener("intro:done", onDone);
        };
        window.addEventListener("intro:done", onDone);
      } else startHero();

      // Primary buttons lean toward the pointer.
      document.querySelectorAll<HTMLElement>(".hero-actions .button, .header-cta").forEach((button) => {
        const toX = gsap.quickTo(button, "x", { duration: 0.4, ease: "power3.out" });
        const toY = gsap.quickTo(button, "y", { duration: 0.4, ease: "power3.out" });
        button.addEventListener("pointermove", (event) => {
          const box = button.getBoundingClientRect();
          toX(((event.clientX - box.left) / box.width - 0.5) * 10);
          toY(((event.clientY - box.top) / box.height - 0.5) * 8);
        });
        button.addEventListener("pointerleave", () => {
          toX(0);
          toY(0);
        });
      });
      gsap.from(".hero-panel", { clipPath: "inset(0 0 0 100%)", duration: 1.2, ease: "expo.out", delay: 0.5 });

      gsap.to(".hero-copy", {
        yPercent: -14,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Section titles unmask line by line as they arrive.
      document.querySelectorAll<HTMLElement>(".section-head .display-2, .about-body .display-2, .contact-copy .display-2").forEach((heading) => {
        const split = SplitText.create(heading, { type: "lines", mask: "lines", linesClass: "split-line" });
        splits.push(split);
        gsap.from(split.lines, {
          yPercent: 100,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: heading, start: "top 88%", once: true },
        });
      });

      // Numbers in the field-guide metrics count up.
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Credential badges tilt in with depth.
      gsap.from(".badge", {
        rotateX: 16,
        y: 44,
        opacity: 0,
        transformOrigin: "50% 0%",
        duration: 0.95,
        ease: "power3.out",
        stagger: { each: 0.06, from: "start" },
        scrollTrigger: { trigger: ".badge-grid", start: "top 85%", once: true },
      });

      // Journey line draws as the visitor descends the list.
      const journeyLine = document.querySelector<HTMLElement>(".journey-line > span");
      if (journeyLine) {
        gsap.fromTo(journeyLine, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".journey-list", start: "top 70%", end: "bottom 60%", scrub: 0.4 } });
      }

      // Toolkit rows cascade in.
      document.querySelectorAll<HTMLElement>(".toolkit-group").forEach((group) => {
        gsap.from(group.querySelectorAll(".toolkit-row"), {
          x: -18,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        });
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => splits.forEach((split) => split.revert());
    });
    return () => media.revert();
  }, []);
  return null;
}
