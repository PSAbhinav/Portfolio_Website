"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";
import { gsap, MOTION_MEDIA, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { ArrowUpRight, Github } from "@/components/Icons";
import type { Project } from "@/lib/content-schema";

type Mode = "reel" | "grid";

function Card({ project, index, total, priority }: { project: Project; index: number; total: number; priority: boolean }) {
  return (
    <article id={`work-${project.slug}`} className="gallery-card" aria-labelledby={`gallery-${project.slug}`}>
      <div className="frame gallery-figure">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          width={1600}
          height={1000}
          quality={90}
          priority={priority}
          sizes="(min-width: 1024px) 56vw, 100vw"
        />
      </div>
      <div className="gallery-body">
        <div className="gallery-meta">
          <span className="mono muted">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="mono muted">{project.year || project.tags[0]}</span>
        </div>
        <h3 id={`gallery-${project.slug}`} className="display-3">
          {project.title}
        </h3>
        <p className="gallery-summary">{project.summary}</p>
        <p className="gallery-description muted">{project.description}</p>
        <div className="gallery-foot">
          <ul className="tag-list" aria-label="Technologies">
            {project.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="chip">
                {tag}
              </li>
            ))}
          </ul>
          <div className="case-links">
            {project.github && (
              <a href={project.github} className="text-link" target="_blank" rel="noopener noreferrer">
                <Github size={16} /> GitHub <ArrowUpRight size={14} />
              </a>
            )}
            {project.demo && (
              <a href={project.demo} className="text-link" target="_blank" rel="noopener noreferrer">
                Live <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// All projects, once. On desktop with motion allowed the cards form a reel
// that travels sideways as the visitor scrolls down (native scrolling, the
// wheel is never captured). Otherwise, and on request, a two-column grid.
export default function Gallery() {
  const { projects } = usePortfolio();
  const copy = useCopy();
  const [mode, setMode] = useState<Mode>("grid");
  const [reelCapable, setReelCapable] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = window.matchMedia(MOTION_MEDIA);
    const update = () => {
      setReelCapable(media.matches);
      // A deep link to one project needs the grid, where anchors scroll normally.
      const deepLink = /^#work-/.test(location.hash);
      setMode(media.matches && !deepLink ? "reel" : "grid");
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("hashchange", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  useGSAP(
    () => {
      if (mode !== "reel" || !outer.current || !track.current) return;
      // scrollWidth ignores the track's trailing padding, so add it back or the
      // last card stops flush against the viewport edge.
      const distance = () => {
        const trailing = parseFloat(getComputedStyle(track.current!).paddingRight) || 0;
        return track.current!.scrollWidth + trailing - outer.current!.clientWidth;
      };
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: outer.current,
          start: `top ${headerHeight}px`,
          end: () => `+=${distance()}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(projects.length, Math.floor(self.progress * projects.length) + 1);
            if (counter.current) counter.current.textContent = `${String(index).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      // Pinning inserts spacer height after the browser has already jumped to
      // any #hash, so re-aim at the target once the layout is final.
      const jumpToHash = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (!id || /^work-/.test(id)) return;
        const target = document.getElementById(id);
        if (!target) return;
        ScrollTrigger.refresh();
        target.scrollIntoView({ block: "start" });
      };
      requestAnimationFrame(jumpToHash);
      document.fonts?.ready.then(() => {
        ScrollTrigger.refresh();
        jumpToHash();
      });
      window.addEventListener("hashchange", jumpToHash);
      return () => {
        window.removeEventListener("hashchange", jumpToHash);
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [mode, projects.length], scope: outer },
  );

  return (
    <section id="work" className="section gallery" aria-labelledby="work-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{copy("work_eyebrow", "02 / Work")}</span>
          <h2 id="work-title" className="display-2">
            {copy("work_title", "Everything I’ve built, in one pass.")}
          </h2>
          <div className="gallery-tools">
            {copy("work_lede", "") ? <p className="lede">{copy("work_lede", "")}</p> : <span />}
            {reelCapable && (
              <div className="gallery-toggle" role="group" aria-label="Layout">
                <button type="button" className="chip" aria-pressed={mode === "reel"} onClick={() => setMode("reel")}>
                  {copy("work_reel", "Reel view")}
                </button>
                <button type="button" className="chip" aria-pressed={mode === "grid"} onClick={() => setMode("grid")}>
                  {copy("work_grid", "Grid view")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === "reel" ? (
        <div className="reel" ref={outer}>
          <div className="reel-hud shell">
            <span ref={counter} className="mono">
              01 / {String(projects.length).padStart(2, "0")}
            </span>
            <span className="reel-progress" aria-hidden="true">
              <span ref={bar} />
            </span>
            <span className="mono muted">{String(projects.length).padStart(2, "0")}</span>
          </div>
          <div className="reel-track" ref={track}>
            {projects.map((project, index) => (
              <Card key={project.slug} project={project} index={index} total={projects.length} priority={index < 2} />
            ))}
          </div>
        </div>
      ) : (
        <div className="shell">
          <div className="gallery-grid">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={(index % 2) * 60}>
                <Card project={project} index={index} total={projects.length} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
