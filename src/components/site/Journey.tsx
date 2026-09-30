"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { formatRange, startYear, numbered } from "@/lib/format";

type Entry = { key: string; when: string; sortKey: number; title: string; place: string; text: string; kind: "work" | "study" };

export default function Journey() {
  const { experience, education } = usePortfolio();
  const copy = useCopy();

  const entries: Entry[] = [
    ...experience.map((role) => ({
      key: `${role.company}-${role.start}`,
      when: formatRange(role.start, role.end),
      sortKey: startYear(role.start) * 100 + Number(role.start.slice(5) || 0),
      title: role.title,
      place: role.company,
      text: role.summary,
      kind: "work" as const,
    })),
    ...education.map((item) => ({
      key: `${item.place}-${item.date}`,
      when: item.date.replace(/\s*-\s*/, " — "),
      sortKey: startYear(item.date) * 100,
      title: item.title,
      place: item.place,
      text: item.description,
      kind: "study" as const,
    })),
  ].sort((a, b) => b.sortKey - a.sortKey);

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{numbered(copy("journey_eyebrow", "06 / Journey"), 6)}</span>
          <h2 id="journey-title" className="display-2">
            {copy("journey_title", "How I got here.")}
          </h2>
        </div>
        <ol className="journey-list">
          <span className="journey-line" aria-hidden="true">
            <span />
          </span>
          {entries.map((entry) => (
            // Choreography.tsx animates these on scroll; without motion they are simply visible.
            <li key={entry.key} className={`journey-item journey-${entry.kind}`}>
              <span className="journey-dot" aria-hidden="true" />
              <span className="mono journey-when">{entry.when}</span>
              <div className="journey-body">
                <h3 className="journey-heading">
                  <span className="journey-heading-text">{entry.title}</span>
                </h3>
                <p className="journey-place">{entry.place}</p>
                <p className="muted journey-text">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
