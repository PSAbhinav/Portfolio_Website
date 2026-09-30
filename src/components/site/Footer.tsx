"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { Github, Linkedin } from "@/components/Icons";

export default function Footer() {
  const { profile } = usePortfolio();
  const copy = useCopy();
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <a href="#home" className="wordmark">
          abhinav<span className="accent">.</span>
        </a>
        <p className="mono muted footer-copy" suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name}
        </p>
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
        </div>
      </div>
    </footer>
  );
}
