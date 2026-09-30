"use client";
import { stage } from "@/components/motion/useScrubProgress";

const SOURCES = ["Notion", "Confluence", "Google Drive", "SharePoint", "Azure"];
const STAGES = ["Commit", "Review", "Merged", "UAT"];
const HUB = { x: 470, y: 200 };
const AGENT = { x: 650, y: 200 };

type Point = { x: number; y: number };

// The link from a source to the hub: a cubic bezier that leaves the source
// horizontally and arrives at the hub horizontally.
function linkCurve(y: number): [Point, Point, Point, Point] {
  return [
    { x: 200, y },
    { x: 320, y },
    { x: 340, y: HUB.y },
    { x: HUB.x - 44, y: HUB.y },
  ];
}

function bezierAt([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

// The line is revealed by arc length (stroke-dashoffset), so the travelling dot
// must be placed by arc length too, not by the bezier parameter, or it drifts
// off the tip of the line. 64 samples is plenty for a curve this gentle.
function pointAtLength(curve: [Point, Point, Point, Point], fraction: number): Point {
  const samples: Point[] = [];
  const lengths: number[] = [0];
  for (let i = 0; i <= 64; i++) {
    const point = bezierAt(curve, i / 64);
    if (i > 0) lengths.push(lengths[i - 1] + Math.hypot(point.x - samples[i - 1].x, point.y - samples[i - 1].y));
    samples.push(point);
  }
  const target = fraction * lengths[64];
  let i = 1;
  while (i < 64 && lengths[i] < target) i++;
  const span = lengths[i] - lengths[i - 1] || 1;
  const local = (target - lengths[i - 1]) / span;
  return {
    x: samples[i - 1].x + (samples[i].x - samples[i - 1].x) * local,
    y: samples[i - 1].y + (samples[i].y - samples[i - 1].y) * local,
  };
}

export default function ConnectorsExplainer({ progress }: { progress: number }) {
  const sweep = stage(progress, 0.7, 1);
  return (
    <svg className="explainer" viewBox="0 0 720 440" role="img" aria-label="Five enterprise sources connect into one knowledge base that feeds the helpdesk agent.">
      <text x="40" y="52" className="ex-eyebrow">KNOWLEDGE BASE CONNECTORS</text>
      {SOURCES.map((name, index) => {
        const y = 100 + index * 58;
        const t = stage(progress, index * 0.12, index * 0.12 + 0.28);
        const curve = linkCurve(y);
        const [p0, p1, p2, p3] = curve;
        const path = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
        const tip = pointAtLength(curve, t);
        return (
          <g key={name}>
            <rect x="40" y={y - 18} width="160" height="36" className={t > 0.6 ? "ex-node ex-node-lit" : "ex-node"} />
            <text x="56" y={y + 5} className="ex-body">{name}</text>
            <path d={path} className="ex-link" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - t }} />
            <circle cx={tip.x.toFixed(1)} cy={tip.y.toFixed(1)} r="4" className="ex-query" style={{ opacity: t > 0 && t < 1 ? 1 : 0 }} />
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
