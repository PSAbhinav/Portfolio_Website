"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { ArrowUpRight, Search } from "@/components/Icons";

type Result = { id: string; label: string; hint: string; href: string; external?: boolean };

export default function CommandMenu() {
  const { projects } = usePortfolio();
  const copy = useCopy();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const ids = useId();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const sections: Result[] = useMemo(
    () => [
      { id: "now", label: copy("nav_now", "Now"), hint: "Current role", href: "#now" },
      { id: "work", label: copy("nav_work", "Work"), hint: "Case studies", href: "#work" },
      { id: "index", label: copy("index_eyebrow", "The project index"), hint: "All projects", href: "#index" },
      { id: "credentials", label: copy("nav_credentials", "Credentials"), hint: "Certifications", href: "#credentials" },
      { id: "about", label: "About", hint: "Field notes", href: "#about" },
      { id: "toolkit", label: copy("nav_toolkit", "Toolkit"), hint: "Skills", href: "#toolkit" },
      { id: "journey", label: copy("nav_journey", "Journey"), hint: "Timeline", href: "#journey" },
      { id: "contact", label: "Contact", hint: "Say hello", href: "#contact" },
    ],
    [copy],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const projectResults: Result[] = projects.map((project) => ({
      id: project.slug,
      label: project.title,
      hint: project.tags.join(" · "),
      href: project.featured ? `#work-${project.slug}` : project.github,
      external: !project.featured,
    }));
    const all = [...sections, ...projectResults];
    if (!needle) return all.slice(0, 10);
    return all.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(needle)).slice(0, 10);
  }, [query, projects, sections]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        dialog.current?.open ? close() : open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function open() {
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    setQuery("");
    requestAnimationFrame(() => input.current?.focus());
  }

  function close() {
    dialog.current?.close();
    opener.current?.focus();
  }

  function go(result: Result) {
    close();
    if (result.external) window.open(result.href, "_blank", "noopener,noreferrer");
    else location.hash = result.href;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(results.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter" && results[cursor]) {
      event.preventDefault();
      go(results[cursor]);
    }
  }

  return (
    <>
      <button ref={opener} type="button" className="command-trigger" onClick={open} aria-haspopup="dialog" aria-label="Search projects and sections (Ctrl K)">
        <Search size={16} />
        <span className="mono">Ctrl K</span>
      </button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-labelledby={`${ids}-title`}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onClose={() => opener.current?.focus()}
      >
        <div className="command-inner">
          <div className="command-top">
            <span id={`${ids}-title`} className="eyebrow">
              {copy("search_title", "Find your way around")}
            </span>
            <button type="button" className="mono" onClick={close}>
              ESC
            </button>
          </div>
          <label className="sr-only" htmlFor={`${ids}-input`}>
            Search projects and sections
          </label>
          <input
            id={`${ids}-input`}
            ref={input}
            value={query}
            placeholder={copy("search_placeholder", "Search projects and sections…")}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-describedby={`${ids}-help`}
            aria-controls={`${ids}-list`}
            aria-activedescendant={results[cursor] ? `${ids}-option-${results[cursor].id}` : undefined}
            autoComplete="off"
          />
          <ul id={`${ids}-list`} className="command-list" role="listbox" aria-label="Results">
            {results.length === 0 && <li className="command-empty muted">{copy("search_empty", "No matches. Try “AI”, “React”, or “contact”.")}</li>}
            {results.map((result, index) => (
              // Options are plain list items driven by the combobox keyboard model; a nested button would be invalid inside a listbox.
              <li
                key={result.id}
                id={`${ids}-option-${result.id}`}
                role="option"
                aria-selected={index === cursor}
                onMouseEnter={() => setCursor(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(result)}
              >
                <span>{result.label}</span>
                <span className="mono muted">{result.hint}</span>
                <ArrowUpRight size={14} />
              </li>
            ))}
          </ul>
          <p id={`${ids}-help`} className="command-help mono muted">
            {copy("search_help", "↑ ↓ to move · Enter to open · Esc to close")}
          </p>
        </div>
      </dialog>
    </>
  );
}
