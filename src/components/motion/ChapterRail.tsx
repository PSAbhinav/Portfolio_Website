"use client";
import type { RefObject } from "react";

export type Chapter = { id: string; label: string; index: string };

type Props = {
  chapters: Chapter[];
  activeId: string;
  progressRef?: RefObject<HTMLSpanElement | null>;
  label: string;
};

// A list of anchor links with a progress hairline. Works as plain links
// without JavaScript; the active state comes from the parent, and the parent
// drives the progress line directly through `progressRef` to avoid re-rendering
// on every scroll frame.
export default function ChapterRail({ chapters, activeId, progressRef, label }: Props) {
  return (
    <nav className="chapter-rail" aria-label={label}>
      <div className="chapter-rail-track" aria-hidden="true">
        <span ref={progressRef} style={{ transform: "scaleY(0)" }} />
      </div>
      <ol>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a href={`#${chapter.id}`} aria-current={chapter.id === activeId ? "true" : undefined}>
              <span className="mono">{chapter.index}</span>
              <span>{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
