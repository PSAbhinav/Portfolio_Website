"use client";
import { useEffect, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { ArrowUp, Github, Linkedin } from "@/components/Icons";

const OPT_OUT_KEY = "portfolio-analytics-opt-out";

export default function Footer() {
  const { profile } = usePortfolio();
  const copy = useCopy();
  const [optedOut, setOptedOut] = useState(false);
  useEffect(() => {
    try {
      setOptedOut(localStorage.getItem(OPT_OUT_KEY) === "true");
    } catch {
      setOptedOut(true);
    }
  }, []);

  function optOut() {
    try {
      localStorage.setItem(OPT_OUT_KEY, "true");
    } catch {
      // Nothing to persist; the event below still stops the current session.
    }
    window.dispatchEvent(new Event("portfolio-analytics-opt-out"));
    setOptedOut(true);
  }

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <a href="#home" className="wordmark">
            abhinav<span className="accent">.</span>
          </a>
          <p className="muted">{copy("footer_tagline", "Built with curiosity, tested before shipping.")}</p>
        </div>
        <div className="footer-links">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={18} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={18} />
          </a>
          <a href="/privacy" className="mono">
            {copy("privacy", "Privacy")}
          </a>
          {optedOut ? (
            <span className="mono muted">Analytics off</span>
          ) : (
            <button type="button" className="mono text-button" onClick={optOut}>
              {copy("analytics_opt_out", "Turn off anonymous analytics")}
            </button>
          )}
          <a href="#home" className="mono">
            {copy("back_to_top", "Back to top")} <ArrowUp size={12} />
          </a>
        </div>
        <p className="mono muted footer-copy" suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </footer>
  );
}
