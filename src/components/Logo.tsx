import type { SVGProps } from "react";

// The mark: an "A" whose crossbar is a signal line bending toward the apex,
// where a single vermilion point sits. It is the hero's signal field reduced
// to one letter. Drawn with plain paths so it renders identically everywhere,
// including favicons and social images where webfonts are unavailable.
export function LogoMark({ size = 40, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="1" y="1" width="42" height="42" rx="4" stroke="currentColor" strokeWidth="1" />
      <path d="M8 36.5h28M8 17h28" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <path d="M12.5 34 22 11l9.5 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 28c4.5 0 6.5-3.6 14-3.6S31.5 28 36 28" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="22" cy="10.5" r="2.7" fill="var(--signal, #b8391f)" />
    </svg>
  );
}

type LockupProps = { size?: "regular" | "small"; href?: string; label?: string; className?: string };

// Mark plus name. The name is set in the display serif; the mark inherits the
// text colour so it works on paper, ink and the studio alike.
export default function Logo({ size = "regular", href = "#home", label = "Abhinav Krishna", className = "" }: LockupProps) {
  const mark = size === "small" ? 30 : 38;
  return (
    <a href={href} className={`brand brand-${size} ${className}`.trim()} aria-label={`${label}, home`}>
      <LogoMark size={mark} />
      <span className="brand-name">{label}</span>
    </a>
  );
}
