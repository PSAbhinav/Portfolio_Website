"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Pinned from "@/components/motion/Pinned";
import Reveal from "@/components/motion/Reveal";
import { formatRange } from "@/lib/format";

export default function Now() {
  const { experience } = usePortfolio();
  const copy = useCopy();
  const current = experience[0];
  if (!current) return null;

  const rail = (
    <div className="now-rail">
      <span className="eyebrow">{copy("now_eyebrow", "01 / Now")}</span>
      <h2 id="now-title" className="display-2">
        {copy("now_title", "What I’m building this season.")}
      </h2>
      <dl className="now-meta">
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
          <dt className="eyebrow">Dates</dt>
          <dd>{formatRange(current.start, current.end)}</dd>
        </div>
      </dl>
      <p className="now-summary">{current.summary}</p>
      {current.highlights.length > 0 && (
        <ol className="now-links" aria-label="Highlights">
          {current.highlights.map((highlight, index) => (
            <li key={highlight.label}>
              <a href={`#now-${index + 1}`} className="mono">
                {highlight.label}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  return (
    <Pinned id="now" className="section now" rail={rail} aria-labelledby="now-title">
      {current.highlights.map((highlight, index) => (
        <Reveal as="article" key={highlight.label} id={`now-${index + 1}`} className="now-card" delay={index * 60}>
          <span className="eyebrow">{highlight.label}</span>
          <p className="now-metric">{highlight.metric}</p>
          <p className="now-detail">{highlight.detail}</p>
        </Reveal>
      ))}
    </Pinned>
  );
}
