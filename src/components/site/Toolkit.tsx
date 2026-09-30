"use client";
import { numbered } from "@/lib/format";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";

export default function Toolkit() {
  const { skillGroups } = usePortfolio();
  const copy = useCopy();

  return (
    <section id="toolkit" className="section toolkit" aria-labelledby="toolkit-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{numbered(copy("toolkit_eyebrow", "05 / Toolkit"), 5)}</span>
          <h2 id="toolkit-title" className="display-2">
            {copy("toolkit_title", "Tools, and what I use them for.")}
          </h2>
        </div>
        <div className="toolkit-grid">
          {skillGroups.map((group, index) => (
            <Reveal key={group.title} className="toolkit-group" delay={index * 80}>
              <h3 className="eyebrow">
                0{index + 1} / {group.title}
              </h3>
              <dl>
                {group.skills.map((skill) => (
                  <div key={skill.name} className="toolkit-row">
                    <dt>{skill.name}</dt>
                    <dd className="muted">{skill.note}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
