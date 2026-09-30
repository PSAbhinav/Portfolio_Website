"use client";

import { useEffect, useState } from "react";
import { errorMessage, requestJson } from "./api";

type Row = { label: string; count: number };
type Summary = { views: number; sessions: number; clicks: number; messages: number };
type Stats = {
  summary: Summary;
  daily: { date: string; count: number }[];
  locations: Row[];
  devices: Row[];
  sources: Row[];
  sections: Row[];
  clicks: Row[];
};

const METRICS: { key: keyof Summary; label: string }[] = [
  { key: "views", label: "Page views" },
  { key: "sessions", label: "Unique sessions" },
  { key: "clicks", label: "Project and external clicks" },
  { key: "messages", label: "Messages" },
];

const RANGES = [7, 30, 90];

function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="studio-breakdown">
      <h3 className="eyebrow">{title}</h3>
      {rows.length === 0 && <p className="studio-empty">No data yet.</p>}
      {rows.map((row) => (
        <div className="studio-stat-row" key={row.label}>
          <div className="studio-stat-label">
            <span>{row.label}</span>
            <strong>{row.count}</strong>
          </div>
          <div className="studio-stat-track" aria-hidden="true">
            <span style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}

function DailyChart({ daily }: { daily: Stats["daily"] }) {
  if (!daily.length) {
    return <p className="studio-empty">Visitor activity appears once the connected site receives traffic.</p>;
  }
  const max = Math.max(1, ...daily.map((day) => day.count));
  const summary = daily.map((day) => `${day.date}: ${day.count} views`).join("; ");
  return (
    <div className="studio-chart" role="img" aria-label={summary}>
      {daily.map((day) => (
        <div className="studio-chart-bar" key={day.date} title={`${day.date}: ${day.count} views`}>
          <span style={{ height: `${Math.max(4, (day.count / max) * 150)}px` }} />
          <small>{day.date.slice(5)}</small>
        </div>
      ))}
    </div>
  );
}

export default function StatsDashboard() {
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setError("");
    setStats(null);
    requestJson<Stats>(`/api/admin/stats?days=${days}`)
      .then((data) => {
        if (live) setStats(data);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [days, refresh]);

  return (
    <div className="studio-stats">
      <div className="studio-toolbar">
        <p className="studio-hint">Anonymous sessions and activity · UTC dates</p>
        <div className="studio-actions">
          <label className="studio-inline-field">
            <span className="studio-label">Period</span>
            <select className="studio-input" value={days} onChange={(event) => setDays(Number(event.target.value))}>
              {RANGES.map((range) => (
                <option key={range} value={range}>
                  Last {range} days
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="button button-ghost" onClick={() => setRefresh(refresh + 1)}>
            Refresh
          </button>
        </div>
      </div>

      {error && <p role="alert" className="studio-notice">{error}</p>}
      {!error && !stats && <p role="status" className="studio-empty">Loading statistics…</p>}
      {stats && (
        <>
          <dl className="studio-metrics">
            {METRICS.map((metric) => (
              <div className="studio-metric" key={metric.key}>
                <dt className="eyebrow">{metric.label}</dt>
                <dd>{stats.summary[metric.key]}</dd>
              </div>
            ))}
          </dl>
          <section className="studio-breakdown">
            <h3 className="eyebrow">Daily page views</h3>
            <DailyChart daily={stats.daily} />
          </section>
          <div className="studio-breakdowns">
            <Breakdown title="Where visitors are" rows={stats.locations} />
            <Breakdown title="Traffic sources" rows={stats.sources} />
            <Breakdown title="Sections explored" rows={stats.sections} />
            <Breakdown title="Devices" rows={stats.devices} />
            <Breakdown title="Links opened" rows={stats.clicks} />
          </div>
          <p className="studio-hint">
            Sessions are not identified people. Location is approximate and may be unavailable. Bots, blocked tracking
            and opt-outs affect totals, and one visitor can appear in several section or link counts.
          </p>
        </>
      )}
    </div>
  );
}
