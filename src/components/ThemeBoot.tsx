import type { PortfolioContent } from "@/lib/content-schema";
import { paletteCss, THEME_SCRIPT } from "@/lib/theme";

// Server-rendered palette CSS plus the pre-hydration mode chooser. Rendered
// first inside <body> by every page that uses the site's design language.
export default function ThemeBoot({ content }: { content: PortfolioContent }) {
  const s = content.settings;
  const boot =
    `var d=document.documentElement.dataset;d.daylight=${JSON.stringify(s.daylightMode ? "true" : "false")};` +
    `d.dayStart=${JSON.stringify(String(s.dayStartsAt))};d.nightStart=${JSON.stringify(String(s.nightStartsAt))};` +
    `d.defaultMode=${JSON.stringify(s.defaultMode)};${THEME_SCRIPT}`;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: paletteCss(s.palette) }} />
      <script dangerouslySetInnerHTML={{ __html: boot }} />
    </>
  );
}
