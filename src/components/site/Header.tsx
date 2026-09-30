"use client";
import { useEffect, useState } from "react";
import { useCopy } from "@/components/PortfolioContext";
import ThemeToggle from "@/components/ThemeToggle";
import CommandMenu from "@/components/CommandMenu";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { ArrowUpRight } from "@/components/Icons";
import Logo from "@/components/Logo";

const LINKS = [
  { id: "now", key: "nav_guide", fallback: "Field guide" },
  { id: "work", key: "nav_work", fallback: "Work" },
  { id: "credentials", key: "nav_credentials", fallback: "Credentials" },
  { id: "toolkit", key: "nav_toolkit", fallback: "Toolkit" },
  { id: "journey", key: "nav_journey", fallback: "Journey" },
];

export default function Header() {
  const copy = useCopy();
  const [active, setActive] = useState("");

  // Highlight the section currently in view so the header doubles as a map.
  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    // Track every section's state so the highlight clears when none is in the band.
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target.id) : inBand.delete(entry.target.id)));
        const first = LINKS.find((link) => inBand.has(link.id));
        setActive(first ? first.id : "");
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <ScrollProgress />
      <div className="shell header-inner">
        <Logo />
        <nav className="header-nav" aria-label="Sections">
          {LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} aria-current={active === link.id ? "true" : undefined}>
              {copy(link.key, link.fallback)}
            </a>
          ))}
        </nav>
        <div className="header-tools">
          <ThemeToggle />
          <CommandMenu />
          <a href="#contact" className="button button-ghost header-cta">
            {copy("nav_contact", "Let’s talk")}
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </header>
  );
}
