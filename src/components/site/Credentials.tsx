"use client";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { ArrowUpRight, Check } from "@/components/Icons";
import { formatMonth, numbered } from "@/lib/format";

export default function Credentials() {
  const { certifications } = usePortfolio();
  const copy = useCopy();
  if (!certifications.length) return null;

  return (
    <section id="credentials" className="section credentials" aria-labelledby="credentials-title">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">{numbered(copy("credentials_eyebrow", "03 / Credentials"), 4)}</span>
          <h2 id="credentials-title" className="display-2">
            {copy("credentials_title", "Verified, not self-declared.")}
          </h2>
        </div>
        <ul className="badge-grid">
          {certifications.map((certification, index) => {
            const primary = /anthropic/i.test(certification.issuer) && certification.url;
            // Older snapshots kept the PDF in `url`; never show the same document twice.
            const verifyUrl =
              certification.url && certification.url !== certification.file && !(certification.file && certification.url.startsWith("/certificates/"))
                ? certification.url
                : "";
            return (
              <li key={certification.title + certification.date} className={`badge ${primary ? "badge-primary" : ""}`}>
                <div className="badge-top">
                  <span className="eyebrow">{certification.issuer}</span>
                  <span className="mono muted">{formatMonth(certification.date)}</span>
                </div>
                <h3 className="badge-title">{certification.title}</h3>
                <div className="badge-foot">
                  {certification.score ? (
                    <span className="mono badge-score">
                      <Check size={14} /> {certification.score}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="badge-links">
                    {certification.file && (
                      <a href={certification.file} className="text-link" target="_blank" rel="noopener noreferrer">
                        {copy("credentials_view", "View")} <ArrowUpRight size={14} />
                      </a>
                    )}
                    {verifyUrl && (
                      <a href={verifyUrl} className="text-link" target="_blank" rel="noopener noreferrer">
                        {/credly\.com/.test(verifyUrl) ? copy("credentials_verify", "Verify") : copy("credentials_view", "View")} <ArrowUpRight size={14} />
                      </a>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
