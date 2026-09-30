"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import ChapterRail from "@/components/motion/ChapterRail";
import Reveal from "@/components/motion/Reveal";
import { ArrowDown, ArrowUpRight, Github } from "@/components/Icons";
import ProjectIndex from "./ProjectIndex";

export default function Work() {
  const { projects } = usePortfolio();
  const copy = useCopy();
  const featured = projects.filter((project) => project.featured).slice(0, 3);
  const chapters = featured.map((project, index) => ({
    id: `work-${project.slug}`,
    label: project.title.split(/\s[—–-]\s/)[0],
    index: `0${index + 1}`,
  }));
  const [active, setActive] = useState(chapters[0]?.id ?? "");
  const progressRef = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // Track which chapter is in view and how far through the set we are. Plain
  // scroll maths, no engine needed; the rail is sticky via CSS alone.
  useEffect(() => {
    const container = list.current;
    if (!container) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = container.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = box.height - viewport * 0.5;
      const progress = total > 0 ? Math.min(1, Math.max(0, (viewport * 0.5 - box.top) / total)) : 1;
      // Written straight to the element: a state update here would re-render the whole section every frame.
      if (progressRef.current) progressRef.current.style.transform = `scaleY(${progress})`;
      const articles = Array.from(container.querySelectorAll<HTMLElement>("article[id]"));
      const current = articles.find((article) => {
        const rect = article.getBoundingClientRect();
        return rect.top <= viewport * 0.45 && rect.bottom > viewport * 0.45;
      });
      if (current) setActive((previous) => (previous === current.id ? previous : current.id));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{copy("work_eyebrow", "02 / Work")}</span>
          <h2 id="work-title" className="display-2">
            {copy("work_title", "Three things I shipped, up close.")}
          </h2>
          <p className="lede">{copy("work_lede", "Case studies first. The full index follows.")}</p>
        </div>
        <div className="work-layout">
          <aside className="work-rail">
            <ChapterRail chapters={chapters} activeId={active} progressRef={progressRef} label="Featured projects" />
            <a href="#index" className="text-link work-jump">
              {copy("work_jump", "Jump to the project index")} <ArrowDown size={14} />
            </a>
          </aside>
          <div className="work-chapters" ref={list}>
            {featured.map((project, index) => (
              <article key={project.slug} id={`work-${project.slug}`} className="case" aria-labelledby={`case-${project.slug}`}>
                <Reveal className="frame case-figure">
                  <Image src={project.image} alt={`${project.title} screenshot`} width={1200} height={750} sizes="(min-width: 1024px) 60vw, 100vw" priority={index === 0} />
                  <div className="frame-caption">
                    <span>
                      FIG. {String(index + 2).padStart(2, "0")} — {project.title}
                    </span>
                    <span>{project.year}</span>
                  </div>
                </Reveal>
                <Reveal className="case-body" delay={80}>
                  <span className="eyebrow">
                    0{index + 1} / {project.tags[0]}
                  </span>
                  <h3 id={`case-${project.slug}`} className="display-3">
                    {project.title}
                  </h3>
                  <p className="case-summary">{project.summary}</p>
                  <p className="case-description muted">{project.description}</p>
                  <ul className="tag-list" aria-label="Technologies">
                    {project.tags.slice(0, 3).map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <div className="case-links">
                    <a href={project.github} className="text-link" target="_blank" rel="noopener noreferrer">
                      <Github size={16} /> GitHub <ArrowUpRight size={14} />
                    </a>
                    {project.demo && (
                      <a href={project.demo} className="text-link" target="_blank" rel="noopener noreferrer">
                        Live <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
        <ProjectIndex />
      </div>
    </section>
  );
}
