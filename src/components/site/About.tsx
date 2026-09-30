"use client";
import { numbered } from "@/lib/format";
import Image from "next/image";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpRight, Github, Linkedin } from "@/components/Icons";

export default function About() {
  const { profile, biography } = usePortfolio();
  const copy = useCopy();

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="shell about-layout">
        <Reveal as="figure" className="frame about-figure">
          <Image src={profile.image} alt={`Portrait of ${profile.name}`} width={720} height={900} quality={90} sizes="(min-width: 1024px) 30vw, 100vw" />
          <figcaption className="frame-caption">
            <span>{profile.name}</span>
            <span>{profile.location}</span>
          </figcaption>
        </Reveal>
        <div className="about-body">
          <span className="eyebrow">{numbered(copy("about_eyebrow", "04 / Field notes"), 1)}</span>
          <h2 id="about-title" className="display-2">
            {copy("about_title", "The person behind the commits.")}
          </h2>
          <div className="about-text">
            {biography.map((paragraph, index) => (
              <Reveal as="p" key={index} delay={index * 60}>
                {paragraph}
              </Reveal>
            ))}
          </div>
          <div className="about-links">
            <a href={profile.github} className="text-link" target="_blank" rel="noopener noreferrer">
              <Github size={16} /> GitHub <ArrowUpRight size={14} />
            </a>
            <a href={profile.linkedin} className="text-link" target="_blank" rel="noopener noreferrer">
              <Linkedin size={16} /> LinkedIn <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
