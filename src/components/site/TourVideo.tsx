"use client";
import { useRef } from "react";
import { useCopy } from "@/components/PortfolioContext";
import { Close, Play } from "@/components/Icons";

// A short tour of the site, rendered from the site itself. Opens in a native
// dialog; nothing autoplays and nothing loads until the visitor asks.
export default function TourVideo() {
  const copy = useCopy();
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  function open() {
    dialog.current?.showModal();
    video.current?.play().catch(() => {});
  }

  function close() {
    video.current?.pause();
    dialog.current?.close();
  }

  return (
    <>
      <button type="button" className="text-link" onClick={open}>
        <Play size={14} /> {copy("hero_cta_tour", "Watch the 24-second tour")}
      </button>
      <dialog
        ref={dialog}
        className="tour-dialog"
        aria-label={copy("tour_title", "A 24-second tour of this site")}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onClose={() => video.current?.pause()}
      >
        <div className="tour-inner">
          <div className="tour-top">
            <span className="eyebrow">{copy("tour_title", "A 24-second tour of this site")}</span>
            <button type="button" className="icon-button" onClick={close} aria-label="Close">
              <Close size={16} />
            </button>
          </div>
          <video ref={video} controls preload="none" poster="/video/tour.jpg" playsInline width={3840} height={2160}>
            <source src="/video/tour.mp4" type="video/mp4" />
          </video>
        </div>
      </dialog>
    </>
  );
}
