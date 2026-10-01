"use client";
import { useRef } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";
import { useScrubProgress } from "@/components/motion/useScrubProgress";
import RetrievalExplainer from "@/components/guide/RetrievalExplainer";
import RoutingExplainer from "@/components/guide/RoutingExplainer";
import ConnectorsExplainer from "@/components/guide/ConnectorsExplainer";
import type { Experience, Highlight } from "@/lib/content-schema";
import { formatRange, numbered } from "@/lib/format";

// Wraps whole numbers so the choreography can count them up on entry.
function countable(text: string) {
  return text.split(/(\d+)/).map((part, index) =>
    /^\d+$/.test(part) ? (
      <span key={index} data-count={part}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// A highlight with an explainer becomes a scroll-driven chapter.
function Chapter({ highlight, index }: { highlight: Highlight; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrubProgress(ref);
  const visual =
    highlight.visual === "retrieval" ? (
      <RetrievalExplainer progress={progress} />
    ) : highlight.visual === "connectors" ? (
      <ConnectorsExplainer progress={progress} />
    ) : (
      <RoutingExplainer />
    );

  return (
    <article ref={ref} id={`now-${index + 1}`} className="guide-chapter">
      <div className="guide-text">
        <Reveal>
          <span className="eyebrow">{highlight.label}</span>
          <h3 className="display-3 guide-metric">{countable(highlight.metric)}</h3>
          <p className="guide-detail">{highlight.detail}</p>
        </Reveal>
      </div>
      <div className="guide-visual frame">{visual}</div>
    </article>
  );
}

// Everything else is listed plainly: what was built, for whom, and what was not mine.
function Ledger({ items, title }: { items: Highlight[]; title: string }) {
  if (!items.length) return null;
  return (
    <div className="guide-ledger-wrap">
      {title && <h3 className="eyebrow guide-ledger-title">{title}</h3>}
      <ul className="guide-ledger">
        {items.map((item, index) => (
          <Reveal as="li" key={item.label} className="guide-card" delay={(index % 2) * 70}>
            <span className="mono muted">{item.label}</span>
            <h4 className="guide-card-title">{item.metric}</h4>
            <p className="muted">{item.detail}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function Role({ role, chapterOffset, alsoLabel }: { role: Experience; chapterOffset: number; alsoLabel: string }) {
  const explained = role.highlights.filter((h) => h.visual !== "none");
  const listed = role.highlights.filter((h) => h.visual === "none");
  return (
    <div className="guide-role-block">
      <header className="guide-role">
        <span className="mono guide-role-when">{formatRange(role.start, role.end)}</span>
        <div className="guide-role-head">
          <h3 className="guide-role-title">{role.title}</h3>
          <p className="guide-role-meta">
            {role.company}
            {role.team ? ` · ${role.team}` : ""}
            {role.location ? ` · ${role.location}` : ""}
          </p>
          <p className="guide-summary">{role.summary}</p>
        </div>
      </header>
      {explained.length > 0 && (
        <div className="guide-chapters">
          {explained.map((highlight, index) => (
            <Chapter key={highlight.label} highlight={highlight} index={chapterOffset + index} />
          ))}
        </div>
      )}
      <Ledger items={listed} title={explained.length ? alsoLabel : ""} />
    </div>
  );
}

export default function FieldGuide() {
  const { experience } = usePortfolio();
  const copy = useCopy();
  if (!experience.length) return null;
  let offset = 0;

  return (
    <section id="now" className="section guide" aria-labelledby="now-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{numbered(copy("now_eyebrow", "02 / Experience"), 2)}</span>
          <h2 id="now-title" className="display-2">
            {copy("now_title", "Work at Ramco Systems.")}
          </h2>
          {copy("now_lede", "") && <p className="lede">{copy("now_lede", "")}</p>}
        </div>
        {experience.map((role) => {
          const block = <Role key={`${role.company}-${role.start}`} role={role} chapterOffset={offset} alsoLabel={copy("now_also", "Also delivered")} />;
          offset += role.highlights.filter((h) => h.visual !== "none").length;
          return block;
        })}
      </div>
    </section>
  );
}
