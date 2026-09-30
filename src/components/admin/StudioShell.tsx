"use client";

import Logo from "@/components/Logo";

import { useEffect, useState } from "react";
import type { PortfolioContent } from "@/lib/content-schema";
import ContentEditor, { SECTIONS, type SectionKey, type Value } from "./ContentEditor";
import Inbox from "./Inbox";
import StatsDashboard from "./StatsDashboard";
import { errorMessage, requestJson } from "./api";

type Tab = "content" | "analytics" | "inbox";
type DraftResponse = { content: PortfolioContent; revision: number };
type RevisionResponse = { revision: number };

const TABS: { id: Tab; label: string; title: string }[] = [
  { id: "content", label: "Content", title: "Your portfolio, your words." },
  { id: "analytics", label: "Analytics", title: "Your portfolio, in numbers." },
  { id: "inbox", label: "Inbox", title: "Messages from visitors." },
];

const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

function draftState(content: PortfolioContent | null, dirty: boolean): string {
  if (!content) return "Loading content…";
  return dirty ? "Unsaved changes" : "All changes saved";
}

export default function StudioShell({ onSignOut, signingOut }: { onSignOut: () => void; signingOut: boolean }) {
  const [tab, setTab] = useState<Tab>("content");
  const [section, setSection] = useState<SectionKey>("profile");
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    requestJson<DraftResponse>("/api/admin/content")
      .then((draft) => {
        setContent(draft.content);
        setRevision(draft.revision);
      })
      .catch((reason) => setNotice(errorMessage(reason)));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  function handleSectionChange(value: Value) {
    if (!content) return;
    setContent({ ...content, [section]: value } as PortfolioContent);
    setDirty(true);
    setConfirming(false);
  }

  async function handleSave() {
    setBusy(true);
    setNotice("");
    try {
      const result = await requestJson<RevisionResponse>("/api/admin/content", { action: "save", revision, content });
      setRevision(result.revision);
      setDirty(false);
      setNotice("Draft saved. Preview it before publishing.");
    } catch (reason) {
      setNotice(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    setBusy(true);
    setNotice("");
    try {
      const result = await requestJson<RevisionResponse>("/api/admin/content", { action: "publish", revision });
      setRevision(result.revision);
      setConfirming(false);
      setNotice("Published. The portfolio now shows this version.");
    } catch (reason) {
      setNotice(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const current = TABS.find((item) => item.id === tab) ?? TABS[0];
  const canPublish = !busy && !dirty && revision > 0 && content !== null;

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <Logo href="/" size="small" className="studio-brand" />
        <span className="eyebrow">Private studio</span>
        <nav className="studio-nav" aria-label="Studio sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="studio-nav-item"
              aria-pressed={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="studio-sidebar-foot">
          <a className="studio-nav-link" href="/" target="_blank" rel="noopener noreferrer">
            View portfolio ↗
          </a>
          <button type="button" className="studio-nav-link" disabled={signingOut} onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <p className="studio-draft-state" data-dirty={dirty}>
            <span className="studio-draft-dot" aria-hidden="true" />
            {draftState(content, dirty)}
          </p>
          {confirming ? (
            <div className="studio-confirm" role="group" aria-label="Confirm publish">
              <span>Publish the saved draft to the public site?</span>
              <button type="button" className="button button-primary" disabled={busy} onClick={handlePublish}>
                Publish this version
              </button>
              <button type="button" className="button button-ghost" disabled={busy} onClick={() => setConfirming(false)}>
                Keep as draft
              </button>
            </div>
          ) : (
            <div className="studio-actions">
              <button type="button" className="button button-ghost" disabled={busy || !content} onClick={handleSave}>
                {busy ? "Saving…" : "Save draft"}
              </button>
              <a className="button button-ghost" href="/admin/preview" target="_blank" rel="noopener noreferrer">
                Preview draft ↗
              </a>
              <button
                type="button"
                className="button button-primary"
                disabled={!canPublish}
                title={dirty ? "Save the draft before publishing." : undefined}
                onClick={() => setConfirming(true)}
              >
                Publish
              </button>
            </div>
          )}
        </header>

        <main className="studio-content">
          <div className="studio-heading">
            <span className="eyebrow">{current.label}</span>
            <h1 className="studio-title">{current.title}</h1>
          </div>
          <p role="status" aria-live="polite" className="studio-notice">
            {notice}
          </p>

          {tab === "analytics" && <StatsDashboard />}
          {tab === "inbox" && <Inbox />}
          {tab === "content" && !content && <p className="studio-empty">Loading your content…</p>}
          {tab === "content" && content && (
            <>
              <nav className="studio-sections" aria-label="Content sections">
                {SECTION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="studio-section-button"
                    aria-pressed={section === key}
                    onClick={() => setSection(key)}
                  >
                    {SECTIONS[key].label}
                  </button>
                ))}
              </nav>
              <section className="studio-editor" aria-labelledby="studio-section-title">
                <div className="studio-editor-head">
                  <h2 id="studio-section-title" className="studio-subtitle">
                    {SECTIONS[section].label}
                  </h2>
                  <p className="studio-hint">{SECTIONS[section].description}</p>
                </div>
                <ContentEditor
                  key={section}
                  fieldKey={section}
                  label={SECTIONS[section].label}
                  value={content[section] as Value}
                  onChange={handleSectionChange}
                />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
