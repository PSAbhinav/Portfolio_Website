"use client";
import { stage } from "@/components/motion/useScrubProgress";

const SOURCES = ["Notion", "Confluence", "Google Drive", "SharePoint", "Azure"];
const STAGES = ["Commit", "Review", "Merged", "UAT"];
const HUB = { x: 470, y: 200 };
const AGENT = { x: 650, y: 200 };

export default function ConnectorsExplainer({ progress }: { progress: number }) {
  const sweep = stage(progress, 0.7, 1);
  return (
    <svg className="explainer" viewBox="0 0 720 440" role="img" aria-label="Five enterprise sources connect into one knowledge base that feeds the helpdesk agent.">
      <text x="40" y="52" className="ex-eyebrow">KNOWLEDGE BASE CONNECTORS</text>
      {SOURCES.map((name, index) => {
        const y = 100 + index * 58;
        const t = stage(progress, index * 0.12, index * 0.12 + 0.28);
        const path = `M 200 ${y} C 320 ${y}, 340 ${HUB.y}, ${HUB.x - 44} ${HUB.y}`;
        return (
          <g key={name}>
            <rect x="40" y={y - 18} width="160" height="36" className={t > 0.6 ? "ex-node ex-node-lit" : "ex-node"} />
            <text x="56" y={y + 5} className="ex-body">{name}</text>
            <path d={path} className="ex-link" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - t }} />
            <circle cx={200 + (HUB.x - 244) * t} cy={y + (HUB.y - y) * t * t} r="4" className="ex-query" style={{ opacity: t > 0 && t < 1 ? 1 : 0 }} />
          </g>
        );
      })}
      <g>
        <circle cx={HUB.x} cy={HUB.y} r="44" className={progress > 0.5 ? "ex-hub ex-hub-lit" : "ex-hub"} />
        <text x={HUB.x} y={HUB.y - 4} textAnchor="middle" className="ex-eyebrow">KNOWLEDGE</text>
        <text x={HUB.x} y={HUB.y + 12} textAnchor="middle" className="ex-eyebrow">BASE</text>
      </g>
      <path d={`M ${HUB.x + 44} ${HUB.y} L ${AGENT.x - 40} ${AGENT.y}`} className="ex-link" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - stage(progress, 0.55, 0.8) }} />
      <g style={{ opacity: stage(progress, 0.7, 0.9) }}>
        <rect x={AGENT.x - 40} y={AGENT.y - 26} width="80" height="52" className="ex-node ex-node-lit" />
        <text x={AGENT.x} y={AGENT.y - 2} textAnchor="middle" className="ex-eyebrow">HELPDESK</text>
        <text x={AGENT.x} y={AGENT.y + 14} textAnchor="middle" className="ex-eyebrow">AGENT</text>
      </g>

      {/* Delivery stages */}
      <text x="40" y="392" className="ex-eyebrow">200-ITEM QUALITY PROGRAMME · TRACKED FROM COMMIT TO UAT</text>
      <rect x="40" y="408" width="640" height="3" className="ex-track" />
      <rect x="40" y="408" width={640 * sweep} height="3" className="ex-fill" />
      {STAGES.map((label, index) => {
        const x = 40 + (640 / (STAGES.length - 1)) * index;
        const reached = sweep >= index / (STAGES.length - 1) - 0.01;
        return (
          <g key={label}>
            <circle cx={x} cy="409.5" r="6" className={reached ? "ex-dot ex-dot-hot" : "ex-dot"} />
            <text x={x} y="434" textAnchor={index === 0 ? "start" : index === STAGES.length - 1 ? "end" : "middle"} className="ex-mono ex-small">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}
