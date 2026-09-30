"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Play } from "@/components/Icons";

type Props = { src: string; poster: string; title: string; caption: string };

// A silent explainer film that plays only while it is on screen and loops.
// Under reduced motion it waits for a press, with the browser's own controls.
export default function Film({ src, poster, title, caption }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!node || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) node.play().catch(() => {});
          else node.pause();
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  function toggle() {
    const node = video.current;
    if (!node) return;
    if (node.paused) node.play().catch(() => {});
    else node.pause();
  }

  return (
    <figure className="film frame">
      <video
        ref={video}
        className="film-video"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduced}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={title}
      />
      {!reduced && (
        <button type="button" className="film-toggle" onClick={toggle} aria-pressed={playing} aria-label={playing ? "Pause film" : "Play film"}>
          {playing ? <span className="film-pause" aria-hidden="true" /> : <Play size={16} />}
        </button>
      )}
      <figcaption className="frame-caption">
        <span>{title}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
