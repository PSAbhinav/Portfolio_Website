"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

type Sample = { text: string; action: string; agent: string; confidence: number; typedMs: number; llmMs: number };

// Representative cases in the shape of the benchmark: a typed judgment with a
// probability, versus a full model call. Confidence at or above the 0.95
// threshold skips the model.
const SAMPLES: Sample[] = [
  { text: "Reset my VPN password", action: "Create ticket", agent: "IT access", confidence: 0.99, typedMs: 470, llmMs: 1840 },
  { text: "Where is invoice #4471?", action: "Look up record", agent: "Finance", confidence: 0.97, typedMs: 488, llmMs: 1910 },
  { text: "The portal has been down for an hour", action: "Escalate incident", agent: "Platform", confidence: 0.98, typedMs: 465, llmMs: 2050 },
  { text: "Thanks, that solved it!", action: "Close and rate", agent: "CSAT", confidence: 1.0, typedMs: 452, llmMs: 1760 },
  { text: "Something feels off with my account", action: "Clarify with the model", agent: "LLM fallback", confidence: 0.61, typedMs: 512, llmMs: 2180 },
];
const THRESHOLD = 0.95;
const SCALE_MS = 2400;

export default function RoutingExplainer() {
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const sample = SAMPLES[selected];

  function run() {
    if (reduced) {
      setPhase("done");
      return;
    }
    setPhase("idle");
    requestAnimationFrame(() => setPhase("running"));
    window.setTimeout(() => setPhase("done"), sample.llmMs + 100);
  }

  // Start the first comparison as the block scrolls into view.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (reduced) {
      setPhase("done");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !started.current) {
        started.current = true;
        run();
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  function choose(index: number) {
    setSelected(index);
    started.current = true;
    window.setTimeout(run, 0);
  }

  const running = phase === "running";
  const done = phase === "done";
  const skipped = sample.confidence >= THRESHOLD;
  const lane = (ms: number) => ({
    width: phase === "idle" ? "0%" : `${(ms / SCALE_MS) * 100}%`,
    transitionDuration: running && !reduced ? `${ms}ms` : "0ms",
  });

  return (
    <div className="explainer routing" ref={root}>
      <p className="eyebrow">TRY AN INTENT</p>
      <div className="routing-chips" role="group" aria-label="Sample intents">
        {SAMPLES.map((item, index) => (
          <button key={item.text} type="button" className="chip" aria-pressed={index === selected} onClick={() => choose(index)}>
            {item.text}
          </button>
        ))}
      </div>

      <div className="routing-lanes">
        <div className="routing-lane">
          <div className="routing-lane-head">
            <span className="eyebrow">TYPED JUDGMENT</span>
            <span className="mono">{phase === "idle" ? "—" : `${sample.typedMs} ms`}</span>
          </div>
          <div className="routing-track">
            <span className="routing-fill routing-fill-typed" style={lane(sample.typedMs)} />
          </div>
          <dl className={`routing-result ${done || running ? "is-ready" : ""}`} style={{ transitionDelay: running && !reduced ? `${sample.typedMs}ms` : "0ms" }}>
            <div>
              <dt className="eyebrow">Action</dt>
              <dd>{sample.action}</dd>
            </div>
            <div>
              <dt className="eyebrow">Agent</dt>
              <dd>{sample.agent}</dd>
            </div>
            <div>
              <dt className="eyebrow">Confidence</dt>
              <dd className={skipped ? "accent" : ""}>{sample.confidence.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
        <div className="routing-lane">
          <div className="routing-lane-head">
            <span className="eyebrow">FULL MODEL CALL</span>
            <span className="mono">{phase === "idle" ? "—" : `${sample.llmMs} ms`}</span>
          </div>
          <div className="routing-track">
            <span className="routing-fill" style={lane(sample.llmMs)} />
          </div>
          <p className={`routing-verdict ${done ? "is-ready" : ""}`}>
            {skipped ? "Confidence cleared 0.95, so the model was never called." : "Below the threshold: this one is worth the model call."}
          </p>
        </div>
      </div>
      <p className="routing-note muted">
        Illustration. Values follow the 50-case benchmark I designed: p50 465–490 ms, p95 585–659 ms, and two-thirds of cases cleared the 0.95 threshold.
      </p>
    </div>
  );
}
