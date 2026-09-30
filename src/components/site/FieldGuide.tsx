"use client";
import { useRef } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";
import { useScrubProgress } from "@/components/motion/useScrubProgress";
import RetrievalExplainer from "@/components/guide/RetrievalExplainer";
import RoutingExplainer from "@/components/guide/RoutingExplainer";
import ConnectorsExplainer from "@/components/guide/ConnectorsExplainer";
import type { Highlight } from "@/lib/content-schema";
import { formatRange } from "@/lib/format";

function Chapter({ highlight, index }: { highlight: Highlight; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrubProgress(ref);
  const visual =
    highlight.visual === "retrieval" ? (
      <RetrievalExplainer progress={progress} />
    ) : highlight.visual === "connectors" ? (
      <ConnectorsExplainer progress={progress} />
    ) : highlight.visual === "routing" ? (
      <RoutingExplainer />
    ) : null;

  return (
    <article ref={ref} id={`now-${index + 1}`} className={`guide-chapter ${visual ? "" : "guide-chapter-text"}`}>
      <div className="guide-text">
        <Reveal>
          <span className="eyebrow">{highlight.label}</span>
          <h3 className="display-3 guide-metric">{highlight.metric}</h3>
          <p className="guide-detail">{highlight.detail}</p>
        </Reveal>
      </div>
      {visual && <div className="guide-visual frame">{visual}</div>}
    </article>
  );
}

export default function FieldGuide() {
  const { experience } = usePortfolio();
  const copy = useCopy();
  const current = experience[0];
  if (!current) return null;

  return (
    <section id="now" className="section guide" aria-labelledby="now-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{copy("now_eyebrow", "01 / Field guide")}</span>
          <h2 id="now-title" className="display-2">
            {copy("now_title", "What I build at rTask.ai, explained.")}
          </h2>
        </div>
        <div className="guide-role">
          <dl>
            <div>
              <dt className="eyebrow">Company</dt>
              <dd>{current.company}</dd>
            </div>
            <div>
              <dt className="eyebrow">Role</dt>
              <dd>{current.title}</dd>
            </div>
            {current.team && (
              <div>
                <dt className="eyebrow">Team</dt>
                <dd>{current.team}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">Since</dt>
              <dd>{formatRange(current.start, current.end)}</dd>
            </div>
          </dl>
          <p className="guide-summary">{current.summary}</p>
        </div>
        <div className="guide-chapters">
          {current.highlights.map((highlight, index) => (
            <Chapter key={highlight.label} highlight={highlight} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
