"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpRight, Github } from "@/components/Icons";

export default function ProjectIndex() {
  const { projects } = usePortfolio();
  const copy = useCopy();
  const all = copy("index_all", "All");
  const [filter, setFilter] = useState(all);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => project.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [projects]);

  const visible = filter === all ? projects : projects.filter((project) => project.tags.includes(filter));

  return (
    <div id="index" className="index">
      <div className="index-head">
        <div>
          <span className="eyebrow">{copy("index_eyebrow", "The project index")}</span>
          <h3 className="display-3">{copy("index_title", "Everything else I’ve made.")}</h3>
        </div>
        <div className="index-filters" role="group" aria-label="Filter projects by technology">
          {[all, ...tags].map((tag) => (
            <button key={tag} type="button" className="chip" aria-pressed={filter === tag} onClick={() => setFilter(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} of {projects.length} projects shown
      </p>
      <ul className="index-grid">
        {visible.map((project, index) => (
          <Reveal as="li" key={project.slug} className="index-card" delay={(index % 3) * 60}>
            <div className="frame index-figure">
              <Image src={project.image} alt="" width={640} height={400} sizes="(min-width: 1024px) 30vw, 100vw" />
            </div>
            <div className="index-body">
              <span className="eyebrow">{project.year || project.tags[0]}</span>
              <h4>{project.title}</h4>
              <p className="muted">{project.summary}</p>
              <div className="case-links">
                <a href={project.github} className="text-link" target="_blank" rel="noopener noreferrer">
                  <Github size={14} /> GitHub <ArrowUpRight size={12} />
                </a>
                {project.demo && (
                  <a href={project.demo} className="text-link" target="_blank" rel="noopener noreferrer">
                    Live <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
