"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { Github, Linkedin } from "@/components/Icons";
import Logo from "@/components/Logo";

export default function Footer() {
  const { profile } = usePortfolio();
  const copy = useCopy();
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Logo size="small" />
        <p className="mono muted footer-copy" suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <div className="footer-links">
          {profile.resume && (
            <a href="/resume" target="_blank" rel="noopener noreferrer" className="footer-resume">
              {copy("footer_resume", "Résumé")}
            </a>
          )}
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={18} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
