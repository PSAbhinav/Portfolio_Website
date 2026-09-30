"use client";
import { useEffect } from "react";

const SECTIONS = ["home", "now", "work", "credentials", "about", "toolkit", "journey", "contact"];
const OPT_OUT_KEY = "portfolio-analytics-opt-out";

// Anonymous, first-party usage signals for the owner's dashboard: a page
// view, which sections were reached, and outbound clicks. No cookies; the
// per-tab session id is hashed server-side and never stored raw.
export default function Analytics() {
  useEffect(() => {
    if (location.pathname !== "/" || navigator.doNotTrack === "1") return;
    let session: string | null;
    try {
      if (localStorage.getItem(OPT_OUT_KEY) === "true") return;
      session = sessionStorage.getItem("portfolio-session");
      if (!session) {
        session = crypto.randomUUID();
        sessionStorage.setItem("portfolio-session", session);
      }
    } catch {
      return;
    }
    let stopped = false;
    const seen = new Set<string>();
    const referrer = document.referrer ? new URL(document.referrer).hostname : "Direct";

    const track = (kind: string, target: string) => {
      if (stopped) return;
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: crypto.randomUUID(), session, kind, target, referrer }),
        keepalive: true,
      }).catch(() => {});
    };

    // Delay the page view so development Strict Mode double-mounts do not double count.
    const timer = setTimeout(() => track("pageview", "/"), 800);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target.id)) {
            seen.add(entry.target.id);
            track("section", entry.target.id);
          }
        });
      },
      { threshold: 0.1 },
    );
    SECTIONS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href);
      if (url.protocol === "mailto:") track("contact", "email");
      else if (url.origin !== location.origin && ["http:", "https:"].includes(url.protocol)) track("outbound", url.hostname + url.pathname);
    };
    const stop = () => {
      stopped = true;
      observer.disconnect();
      clearTimeout(timer);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("portfolio-analytics-opt-out", stop);
    return () => {
      stop();
      document.removeEventListener("click", onClick);
      window.removeEventListener("portfolio-analytics-opt-out", stop);
    };
  }, []);
  return null;
}
