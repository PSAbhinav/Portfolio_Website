"use client";
import { useEffect, useState } from "react";
import { useCopy } from "@/components/PortfolioContext";
import { readTheme, setTheme, type Mode } from "@/lib/theme";
import { Moon, Sun } from "./Icons";

// Paper or ink. A choice here is remembered and overrides daylight mode.
export default function ThemeToggle() {
  const copy = useCopy();
  const [mode, setMode] = useState<Mode>("light");
  useEffect(() => setMode(readTheme()), []);
  const next: Mode = mode === "dark" ? "light" : "dark";
  const label = next === "light" ? copy("theme_light", "Switch to paper (light)") : copy("theme_dark", "Switch to ink (dark)");
  function toggle() {
    setTheme(next);
    setMode(next);
  }
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label={label} title={label}>
      {mode === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
