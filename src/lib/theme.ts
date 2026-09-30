import type { Settings } from "./content-schema";

export type Mode = "light" | "dark";

// Runs before hydration. Order of precedence: the visitor's own toggle choice,
// then the time of day when daylight mode is on, then the default. The hour
// comes from the visitor's clock, so the same site is paper in a Bengaluru
// morning and ink in a New York night.
export const THEME_SCRIPT = `(function(){var h=document.documentElement;try{var d=h.dataset;var saved=localStorage.getItem('theme');var mode;if(saved==='light'||saved==='dark'){mode=saved}else if(d.daylight==='true'){var hr=new Date().getHours();var ds=+d.dayStart,ns=+d.nightStart;mode=(hr>=ds&&hr<ns)?'light':'dark'}else{mode=d.defaultMode||'light'}h.dataset.theme=mode;h.classList.add('js');if(matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 1024px)').matches){h.classList.add('motion')}}catch(e){h.dataset.theme='light'}})();`;

export function readTheme(): Mode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(mode: Mode): void {
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem("theme", mode);
  } catch {
    // Storage can be unavailable (private mode); the attribute still applies.
  }
}

// CSS for both palettes; color-scheme follows so form controls match.
export function paletteCss(palette: Settings["palette"]): string {
  return (["light", "dark"] as const)
    .map((mode) => {
      const p = palette[mode];
      return `[data-theme="${mode}"]{--paper:${p.paper};--paper-2:${p.paper2};--ink:${p.ink};--ink-2:${p.ink2};--rule:${p.rule};--signal:${p.signal};--signal-ink:${p.signalInk};--signal-soft:${rgba(p.signal, 0.13)};color-scheme:${mode};}`;
    })
    .join("\n");
}

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
