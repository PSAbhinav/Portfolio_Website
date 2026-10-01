"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCopy } from "@/components/PortfolioContext";
import { ArrowUpRight, Close, Github } from "@/components/Icons";
import type { Project } from "@/lib/content-schema";

type Props = { project: Project | null; index: number; total: number; onClose: () => void };

// The full case study for one project: the artwork whole, the summary, the
// description and the detail points, with the links. A native <dialog> gives
// focus trapping and Escape for free; the page behind stops scrolling.
export default function ProjectDialog({ project, index, total, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const copy = useCopy();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
    document.documentElement.classList.toggle("has-dialog", Boolean(project));
    return () => document.documentElement.classList.remove("has-dialog");
  }, [project]);

  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {project && (
        <article className="project-dialog-inner">
          <button type="button" className="icon-button project-dialog-close" onClick={onClose} aria-label={copy("project_close", "Close")}>
            <Close size={18} />
          </button>
          <div className="frame project-dialog-figure">
            <Image src={project.image} alt={`${project.title} screenshot`} width={1600} height={1000} quality={90} sizes="(min-width: 1024px) 960px, 100vw" priority />
          </div>
          <div className="project-dialog-body">
            <div className="gallery-meta">
              <span className="mono muted">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span className="mono muted">{project.year || project.tags[0]}</span>
            </div>
            <h2 id="project-dialog-title" className="display-3">
              {project.title}
            </h2>
            <p className="lede project-dialog-summary">{project.summary}</p>
            <p className="project-dialog-description">{project.description}</p>
            {project.details.length > 0 && (
              <>
                <h3 className="eyebrow project-dialog-heading">{copy("project_details_title", "In detail")}</h3>
                <ul className="project-dialog-details">
                  {project.details.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="gallery-foot project-dialog-foot">
              <ul className="tag-list" aria-label="Technologies">
                {project.tags.map((tag) => (
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
                    {copy("project_live", "Live")} <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
      )}
    </dialog>
  );
}
