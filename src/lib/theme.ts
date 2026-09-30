export type Theme = "light" | "dark";

// Runs inline before hydration so the first paint already has the right
// theme and a `js` class (which lets CSS hide reveal targets only when
// JavaScript is present).
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.classList.add('js')}catch(e){document.documentElement.dataset.theme='light'}})();`;

export function readTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return current === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode); the attribute still applies.
  }
}
