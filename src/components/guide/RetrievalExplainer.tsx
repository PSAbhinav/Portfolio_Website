"use client";
import { stage } from "@/components/motion/useScrubProgress";

const QUERY = "why did my vpn token expire after the sso change";
const TERMS: [string, number][] = [
  ["vpn", 0.92],
  ["token", 0.84],
  ["expire", 0.71],
  ["sso", 0.88],
  ["change", 0.35],
  ["why", 0.12],
];
// Fixed scatter so the server and client draw the same picture.
const POINTS: [number, number][] = [
  [62, 318], [88, 372], [110, 300], [134, 402], [150, 342], [176, 298], [196, 386], [214, 330],
  [238, 362], [248, 316], [262, 398], [276, 344], [292, 306], [304, 380], [318, 350], [330, 322],
  [180, 352], [226, 350], [256, 336], [242, 372], [270, 358], [206, 366], [286, 328], [120, 366],
];
const NEAREST = new Set([17, 18, 19, 20, 21]);
const RESULTS: [string, number][] = [
  ["SSO rollout: token lifetime reset to 8h", 0.93],
  ["VPN re-authentication after IdP change", 0.88],
  ["Known issue: cached tokens at cut-over", 0.81],
  ["Renewing a VPN token manually", 0.66],
  ["Identity provider migration runbook", 0.52],
];

export default function RetrievalExplainer({ progress }: { progress: number }) {
  const sparse = stage(progress, 0.0, 0.4);
  const dense = stage(progress, 0.25, 0.65);
  const fused = stage(progress, 0.55, 1);
  const queryX = 70 + (250 - 70) * dense;
  const queryY = 300 + (352 - 300) * dense;

  return (
    <svg className="explainer" viewBox="0 0 720 440" role="img" aria-label="A query is scored by keyword weights and by vector similarity, then the two rankings are fused.">
      {/* Query */}
      <g className="ex-ink">
        <text x="40" y="52" className="ex-eyebrow">QUERY</text>
        <rect x="40" y="64" width="330" height="34" className="ex-box" />
        <text x="52" y="87" className="ex-mono">{QUERY.slice(0, Math.round(QUERY.length * Math.min(1, progress * 4 + 0.2)))}</text>
      </g>

      {/* Sparse lane */}
      <g>
        <text x="40" y="136" className="ex-eyebrow">SPARSE · BM25 TERM WEIGHTS</text>
        {TERMS.map(([term, weight], index) => {
          const x = 40 + index * 48;
          const height = 70 * weight * sparse;
          return (
            <g key={term}>
              <rect x={x} y={224 - height} width="30" height={height} className={index < 4 ? "ex-bar ex-bar-hot" : "ex-bar"} />
              <text x={x + 15} y="242" textAnchor="middle" className="ex-mono ex-small">{term}</text>
            </g>
          );
        })}
      </g>

      {/* Dense lane */}
      <g>
        <text x="40" y="282" className="ex-eyebrow">DENSE · EMBEDDING NEIGHBOURHOOD</text>
        <rect x="40" y="290" width="300" height="130" className="ex-box ex-dashed" />
        {POINTS.map(([x, y], index) => {
          const hot = NEAREST.has(index) && dense > 0.85;
          return <circle key={index} cx={x} cy={y} r={hot ? 5 : 3} className={hot ? "ex-dot ex-dot-hot" : "ex-dot"} />;
        })}
        <circle cx={queryX} cy={queryY} r="7" className="ex-query" />
        <text x={queryX + 12} y={queryY + 4} className="ex-mono ex-small">query</text>
      </g>

      {/* Fused ranking */}
      <g>
        <text x="390" y="136" className="ex-eyebrow">FUSED RANKING · MILVUS · 92 COLLECTIONS</text>
        {RESULTS.map(([title, score], index) => {
          const t = stage(fused, index * 0.15, index * 0.15 + 0.4);
          const y = 160 + index * 52;
          return (
            <g key={title} style={{ opacity: t }} transform={`translate(${(1 - t) * 24} 0)`}>
              <text x="390" y={y + 6} className="ex-mono ex-small">0{index + 1}</text>
              <text x="416" y={y + 6} className="ex-body">{title}</text>
              <rect x="416" y={y + 16} width="240" height="3" className="ex-track" />
              <rect x="416" y={y + 16} width={240 * score * t} height="3" className="ex-fill" />
              <text x="700" y={y + 6} textAnchor="end" className="ex-mono ex-small">{score.toFixed(2)}</text>
            </g>
          );
        })}
      </g>

      {/* Flow arrows */}
      <path d="M340 190 C 360 190, 370 190, 386 190" className="ex-arrow" style={{ opacity: sparse }} />
      <path d="M340 355 C 365 355, 365 220, 386 214" className="ex-arrow" style={{ opacity: dense }} />
    </svg>
  );
}
