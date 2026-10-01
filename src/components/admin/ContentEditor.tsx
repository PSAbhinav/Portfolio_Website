"use client";

import { useId, useState, type ChangeEvent } from "react";
import type { PortfolioContent } from "@/lib/content-schema";

export type Value = string | number | boolean | null | Value[] | { [key: string]: Value };
export type SectionKey = keyof PortfolioContent;

export const SECTIONS: Record<SectionKey, { label: string; description: string }> = {
  profile: { label: "Profile", description: "Name, role, portrait, the one-sentence thesis shown in the hero, and the résumé PDF." },
  contactEmail: { label: "Contact email", description: "The address shown in the Contact section." },
  biography: { label: "Field notes", description: "Paragraphs in the About section, in reading order." },
  experience: { label: "Experience", description: "Roles, dates and the highlights shown in the Now chapter." },
  projects: {
    label: "Projects",
    description: "Case studies and the project index. Up to three featured projects become Work chapters.",
  },
  skillGroups: { label: "Toolkit", description: "Skill groups in the Toolkit section, each skill with a short note." },
  certifications: {
    label: "Credentials",
    description: "Badges in the Credentials section. Add a verify URL and a score when you have them.",
  },
  education: { label: "Education", description: "Entries merged into the Journey timeline." },
  settings: { label: "Settings", description: "Daylight mode and its hours, the two palettes, the brand intro, the signal cursor, and the Field guide film." },
  copy: { label: "Interface copy", description: "Headings, labels and introductions used across the site." },
};

const LABELS: Record<string, string> = {
  github: "GitHub URL",
  linkedin: "LinkedIn URL",
  demo: "Live demo URL",
  url: "Verify URL",
  file: "Certificate file",
  image: "Image",
  resume: "Résumé (PDF)",
  metadataTitle: "Browser title",
  metadataDescription: "Search description",
  contactEmail: "Contact email",
  paper: "Paper (background)",
  paper2: "Paper 2 (raised surfaces)",
  ink: "Ink (text)",
  ink2: "Ink 2 (secondary text)",
  rule: "Rule (hairlines)",
  signal: "Signal (accent)",
  signalInk: "Text on signal",
  daylightMode: "Follow the visitor's clock",
  defaultMode: "Default when daylight mode is off",
  dayStartsAt: "Paper from (hour, 0-23)",
  nightStartsAt: "Ink from (hour, 0-23)",
  showIntro: "Show the brand intro",
  showCursor: "Show the signal cursor",
  src: "Video file",
  poster: "Poster image",
};

export const ITEM_LABELS: Record<string, string> = {
  biography: "Paragraph",
  experience: "Role",
  highlights: "Highlight",
  projects: "Project",
  tags: "Tag",
  details: "Detail point",
  skillGroups: "Skill group",
  skills: "Skill",
  certifications: "Credential",
  education: "Entry",
};

const HINTS: Record<string, string> = {
  start: "Year and month, e.g. 2026-08.",
  end: "Year and month. Leave empty while the role is current.",
  date: "Year and month for credentials (2026-09); free text for education (2020 - 2024).",
  slug: "Lowercase letters, digits and hyphens. Used in the #work-<slug> link.",
  featured: "Featured projects (three at most) become full Work chapters.",
  year: "Shown on the project card. Optional.",
  score: "Optional, e.g. 825 / 1000.",
  url: "https:// link to the credential. Leave empty to hide the Verify link.",
  file: "PDF under /certificates, e.g. /certificates/name.pdf. Shown as View.",
  demo: "https:// link. Leave empty when there is no live demo.",
  details: "Shown when a visitor opens the project. One point each: the problem, what you built, the stack, the outcome.",
  resume: "The PDF behind every Résumé link and /resume. Upload a new one to replace it; leave empty to hide the links.",
  label: "Mono figure label, e.g. 01 / Delivery.",
  metric: "The large figure line, e.g. 92/92 collections · 0 failures.",
  summary: "One or two sentences.",
  note: "One line on where you use it.",
  defaultMode: "light or dark.",
  src: "Path under /public (e.g. /video/helpdesk.mp4) or an uploaded file URL.",
};

// Templates for adding the first item to an empty list.
const TEMPLATES: Record<string, Value> = {
  biography: "",
  tags: "",
  details: "",
  highlights: { label: "", metric: "", detail: "" },
  skills: { name: "", note: "" },
  skillGroups: { title: "", skills: [{ name: "", note: "" }] },
  experience: { company: "", title: "", team: "", location: "", start: "", end: "", summary: "", highlights: [] },
  projects: { slug: "", title: "", summary: "", description: "", image: "", github: "", demo: "", tags: [], featured: false, year: "", details: [] },
  certifications: { title: "", issuer: "", date: "", url: "", file: "", score: "" },
  education: { title: "", place: "", date: "", description: "" },
};

const LONG_TEXT = /description|summary|tagline|detail|biography|message/i;

export function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const words = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function blank(value: Value): Value {
  if (Array.isArray(value)) return value.length ? [blank(value[0])] : [];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blank(item)]));
  }
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return "";
}

function newItem(fieldKey: string, list: Value[]): Value {
  if (list.length) return blank(list[0]);
  return TEMPLATES[fieldKey] ?? "";
}

function move(list: Value[], from: number, to: number): Value[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type EditorProps = {
  fieldKey: string;
  label: string;
  value: Value;
  onChange: (value: Value) => void;
};

function Hint({ fieldKey, id }: { fieldKey: string; id: string }) {
  if (!HINTS[fieldKey]) return null;
  return (
    <span id={id} className="studio-hint">
      {HINTS[fieldKey]}
    </span>
  );
}

function ArrayEditor({ fieldKey, label, value, onChange }: Omit<EditorProps, "value"> & { value: Value[] }) {
  const itemLabel = ITEM_LABELS[fieldKey] ?? "Item";

  function handleAdd() {
    onChange([...value, newItem(fieldKey, value)]);
  }

  return (
    <div className="studio-array" role="group" aria-label={label}>
      {value.map((item, index) => {
        const name = `${itemLabel} ${index + 1}`;
        return (
          <div className="studio-array-item" key={index}>
            <div className="studio-array-toolbar">
              <span className="eyebrow">{name}</span>
              <div className="studio-array-controls">
                <button
                  type="button"
                  className="studio-icon-button"
                  aria-label={`Move ${name} up`}
                  disabled={index === 0}
                  onClick={() => onChange(move(value, index, index - 1))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="studio-icon-button"
                  aria-label={`Move ${name} down`}
                  disabled={index === value.length - 1}
                  onClick={() => onChange(move(value, index, index + 1))}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="studio-text-button"
                  aria-label={`Remove ${name}`}
                  onClick={() => onChange(value.filter((_, position) => position !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
            <ContentEditor
              fieldKey={fieldKey}
              label={name}
              value={item}
              onChange={(next) => onChange(value.map((old, position) => (position === index ? next : old)))}
            />
          </div>
        );
      })}
      <button type="button" className="button button-ghost studio-add" onClick={handleAdd}>
        + Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function ObjectEditor({ value, onChange }: Omit<EditorProps, "value"> & { value: { [key: string]: Value } }) {
  return (
    <div className="studio-fields">
      {Object.entries(value).map(([key, item]) => (
        <ContentEditor
          key={key}
          fieldKey={key}
          label={humanize(key)}
          value={item}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  );
}

function BooleanField({ fieldKey, label, value, onChange }: Omit<EditorProps, "value"> & { value: boolean }) {
  const hintId = useId();
  return (
    <label className="studio-field studio-field-check">
      <input
        type="checkbox"
        checked={value}
        aria-describedby={HINTS[fieldKey] ? hintId : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="studio-label">{label}</span>
      <Hint fieldKey={fieldKey} id={hintId} />
    </label>
  );
}

// Images are re-encoded server-side; PDFs are stored as sent. The field name
// tells the route which it is getting.
const UPLOADS = {
  image: { field: "image", accept: "image/jpeg,image/png,image/webp", button: "Upload image", hint: "JPG, PNG or WebP up to 4 MB. Uploaded images are public once published." },
  pdf: { field: "file", accept: "application/pdf", button: "Upload PDF", hint: "PDF up to 4 MB. It goes live when you publish; the old file stays reachable at its own address." },
};

function FileUpload({ kind, onChange }: { kind: keyof typeof UPLOADS; onChange: (url: string) => void }) {
  const spec = UPLOADS[kind];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append(spec.field, file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      onChange(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="studio-upload">
      <label className="button button-ghost studio-upload-button">
        {uploading ? "Uploading…" : spec.button}
        <input type="file" className="sr-only" accept={spec.accept} disabled={uploading} onChange={handleFile} />
      </label>
      <span className="studio-hint">{spec.hint}</span>
      <p role="status" className="studio-notice">
        {error}
      </p>
    </div>
  );
}

function TextField({ fieldKey, label, value, onChange }: Omit<EditorProps, "value"> & { value: string | number | null }) {
  const hintId = useId();
  const text = value === null ? "" : String(value);
  const long = LONG_TEXT.test(fieldKey) || text.length > 100;
  const describedBy = HINTS[fieldKey] ? hintId : undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onChange(typeof value === "number" ? Number(event.target.value) : event.target.value);
  }

  return (
    <div className={long ? "studio-control studio-control-wide" : "studio-control"}>
      <label className="studio-field">
        <span className="studio-label">{label}</span>
        {long ? (
          <textarea className="studio-input" rows={4} value={text} aria-describedby={describedBy} onChange={handleChange} />
        ) : (
          <span className="studio-inline">
            {/^#[0-9a-fA-F]{6}$/.test(text) && (
              <input type="color" className="studio-color" value={text} aria-label={`${label} colour`} onChange={handleChange} />
            )}
            <input
              className="studio-input"
              type={typeof value === "number" ? "number" : "text"}
              value={text}
              aria-describedby={describedBy}
              onChange={handleChange}
            />
          </span>
        )}
      </label>
      <Hint fieldKey={fieldKey} id={hintId} />
      {fieldKey === "image" && <FileUpload kind="image" onChange={onChange} />}
      {fieldKey === "resume" && <FileUpload kind="pdf" onChange={onChange} />}
    </div>
  );
}

// Schema-driven: the shape of the value decides the control, so new content
// fields appear in the studio without editor changes.
export default function ContentEditor(props: EditorProps) {
  const { value } = props;
  if (Array.isArray(value)) return <ArrayEditor {...props} value={value} />;
  if (value && typeof value === "object") return <ObjectEditor {...props} value={value} />;
  if (typeof value === "boolean") return <BooleanField {...props} value={value} />;
  return <TextField {...props} value={value} />;
}
