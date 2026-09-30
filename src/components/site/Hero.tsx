"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { ArrowDown, ArrowUpRight } from "@/components/Icons";

export default function Hero() {
  const { profile } = usePortfolio();
  const copy = useCopy();
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.pop();
  const middle = rest.join(" ");

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="shell hero-inner">
        <p className="hero-status eyebrow">
          <span className="status-dot" />
          <span>
            {copy("status_prefix", "Now")} · {profile.role} · {profile.company} · {profile.location}
          </span>
        </p>
        <h1 id="hero-title" className="display-1 hero-name">
          <span>
            {first} {middle}
          </span>
          <span className="hero-name-last">{last}</span>
        </h1>
        <p className="lede hero-tagline">{profile.tagline}</p>
        <div className="hero-actions">
          <a href="#work" className="button button-primary">
            {copy("hero_cta_work", "See the work")}
            <ArrowUpRight />
          </a>
          <a href="#about" className="text-link">
            {copy("hero_cta_about", "Read the field notes")}
            <ArrowUpRight />
          </a>
        </div>
        <div className="hero-foot">
          <span className="eyebrow hero-availability">
            {profile.availability && (
              <>
                <span className="status-dot" /> {profile.availability}
              </>
            )}
          </span>
          <a href="#now" className="eyebrow hero-scroll">
            Scroll <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
