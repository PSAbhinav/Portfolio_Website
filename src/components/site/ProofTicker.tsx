"use client";
import { Asterisk } from "@/components/Icons";

// A slow ticker of proof points under the hero. The list is duplicated so
// the loop is seamless; under reduced motion it becomes a static wrapped row.
export default function ProofTicker({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-label="Highlights">
      <div className="ticker-track">
        {row.map((item, index) => (
          <span key={index} className="ticker-item" aria-hidden={index >= items.length}>
            <Asterisk size={12} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
