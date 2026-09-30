"use client";
import { useEffect, useState } from "react";
import { readTheme, setTheme, type Theme } from "@/lib/theme";
import { Moon, Sun } from "./Icons";

type Props = { labelLight: string; labelDark: string };

export default function ThemeToggle({ labelLight, labelDark }: Props) {
  const [theme, setCurrent] = useState<Theme>("light");
  useEffect(() => setCurrent(readTheme()), []);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? labelLight : labelDark;
  function toggle() {
    setTheme(next);
    setCurrent(next);
  }
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
