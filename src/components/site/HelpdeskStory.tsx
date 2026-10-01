"use client";
import { useEffect, useRef, useState } from "react";
import RetrievalExplainer from "@/components/guide/RetrievalExplainer";
import ConnectorsExplainer from "@/components/guide/ConnectorsExplainer";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Play } from "@/components/Icons";

// The Field guide film, as a live animation instead of a video file: the same
// five beats, drawn with the site's own diagram components and driven by a
// clock. Nothing is downloaded, so it plays anywhere the page does. It runs
// only while on screen and loops; under reduced motion it rests on the
// final beat with a play control.

const QUERY = "why did my vpn token expire after the sso change";
const BEATS = [
  { key: "question", label: "Question", seconds: 5 },
  { key: "routing", label: "Routing", seconds: 5.5 },
  { key: "retrieval", label: "Retrieval", seconds: 6 },
  { key: "connectors", label: "Connectors", seconds: 5 },
  { key: "answer", label: "Answer", seconds: 5.5 },
] as const;
const TOTAL = BEATS.reduce((sum, beat) => sum + beat.seconds, 0);
const TYPED_MS = 470;
const LLM_MS = 1840;
const SCALE_MS = 2400;

function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Props = { title: string; caption: string };

export default function HelpdeskStory({ title, caption }: Props) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const wantsPlay = useRef(true);
  const visible = useRef(false);

  // Clock: advances only while visible and not paused.
  useEffect(() => {
    // Read the media query directly: the hook's first value is a safe default,
    // not the visitor's real preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setClock(TOTAL - 0.01);
      return;
    }
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (wantsPlay.current && visible.current) {
        setClock((value) => (value + dt) % TOTAL);
        setPlaying(true);
      } else setPlaying(false);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const node = root.current;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => (visible.current = entry.isIntersecting)), { threshold: 0.3 });
    if (node) observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced]);

  // Which beat and how far through it.
  let elapsed = clock;
  let index = 0;
  while (index < BEATS.length - 1 && elapsed >= BEATS[index].seconds) {
    elapsed -= BEATS[index].seconds;
    index++;
  }
  const beat = BEATS[index];
  const t = Math.min(1, elapsed / beat.seconds);
  const progress = clock / TOTAL;

  function toggle() {
    if (reduced) {
      setClock(0);
      return;
    }
    wantsPlay.current = !wantsPlay.current;
    setPlaying(wantsPlay.current);
  }

  const typedChars = Math.round(QUERY.length * Math.min(1, t * 1.6));
  const laneT = ease(Math.min(1, t * 1.25));
  const answerT = ease(Math.min(1, t * 1.4));

  return (
    <figure ref={root} className="story frame" aria-label={title}>
      <div className="story-hud">
        <span className="eyebrow">{title}</span>
        <span className="mono">
          {String(index + 1).padStart(2, "0")} / {String(BEATS.length).padStart(2, "0")} · {beat.label}
        </span>
      </div>
      <div className="story-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="story-stage">
        {/* 01 Question */}
        <section className={`story-beat ${index === 0 ? "is-live" : ""}`} aria-hidden={index !== 0}>
          <h3 className="display-2 story-title">{title}</h3>
          <div className="story-query">
            <span className="eyebrow">An employee asks</span>
            <p className="mono story-query-text">
              {QUERY.slice(0, index === 0 ? typedChars : QUERY.length)}
              {index === 0 && typedChars < QUERY.length && <span className="story-caret" />}
            </p>
          </div>
        </section>

        {/* 02 Routing */}
        <section className={`story-beat ${index === 1 ? "is-live" : ""}`} aria-hidden={index !== 1}>
          <p className="story-label">Two-thirds of intents never need the model</p>
          <div className="routing-lanes">
            <div className="routing-lane">
              <div className="routing-lane-head">
                <span className="eyebrow">Typed judgment</span>
                <span className="mono">{Math.round(TYPED_MS * Math.min(1, laneT * (LLM_MS / TYPED_MS)))} ms</span>
              </div>
              <div className="routing-track">
                <span className="routing-fill routing-fill-typed" style={{ width: `${(Math.min(TYPED_MS, laneT * LLM_MS) / SCALE_MS) * 100}%`, transitionDuration: "0ms" }} />
              </div>
              <dl className={`routing-result ${laneT * LLM_MS >= TYPED_MS ? "is-ready" : ""}`}>
                <div>
                  <dt className="eyebrow">Action</dt>
                  <dd>Create ticket</dd>
                </div>
                <div>
                  <dt className="eyebrow">Agent</dt>
                  <dd>IT access</dd>
                </div>
                <div>
                  <dt className="eyebrow">Confidence</dt>
                  <dd className="accent">0.99</dd>
                </div>
              </dl>
            </div>
            <div className="routing-lane">
              <div className="routing-lane-head">
                <span className="eyebrow">Full model call</span>
                <span className="mono">{Math.round(LLM_MS * laneT)} ms</span>
              </div>
              <div className="routing-track">
                <span className="routing-fill" style={{ width: `${((LLM_MS * laneT) / SCALE_MS) * 100}%`, transitionDuration: "0ms" }} />
              </div>
              <p className={`routing-verdict ${laneT >= 1 ? "is-ready" : ""}`}>Confidence cleared 0.95, so the model was never called.</p>
            </div>
          </div>
        </section>

        {/* 03 Retrieval */}
        <section className={`story-beat ${index === 2 ? "is-live" : ""}`} aria-hidden={index !== 2}>
          <p className="story-label">Hybrid search across 92 production collections on Milvus</p>
          <RetrievalExplainer progress={index === 2 ? t : index > 2 ? 1 : 0} />
        </section>

        {/* 04 Connectors */}
        <section className={`story-beat ${index === 3 ? "is-live" : ""}`} aria-hidden={index !== 3}>
          <p className="story-label">Five enterprise sources, one knowledge base</p>
          <ConnectorsExplainer progress={index === 3 ? t : index > 3 ? 1 : 0} />
        </section>

        {/* 05 Answer */}
        <section className={`story-beat ${index === 4 ? "is-live" : ""}`} aria-hidden={index !== 4}>
          <div className="story-answer">
            <div className="story-answer-card" style={{ opacity: answerT, transform: `translateY(${(1 - answerT) * 14}px)` }}>
              <span className="eyebrow">Answer · IT access</span>
              <p className="story-answer-text">The SSO change reset VPN token lifetimes.</p>
              <p className="story-answer-text">Sign in to the VPN again and a new token is issued.</p>
              <p className="mono story-source">— Source: SSO rollout runbook</p>
            </div>
            <div className="story-elapsed">
              <span className="eyebrow">Elapsed</span>
              <span className="story-elapsed-value">
                {(0.9 * answerT).toFixed(1)}
                <small> s</small>
              </span>
            </div>
          </div>
          <p className="story-label story-outro" style={{ opacity: Math.max(0, (t - 0.55) / 0.45) }}>
            Built test-first at Ramco Systems · Chia AI
          </p>
        </section>
      </div>

      <button type="button" className="film-toggle" onClick={toggle} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <span className="film-pause" aria-hidden="true" /> : <Play size={16} />}
      </button>
      <figcaption className="frame-caption">
        <span>{title}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
