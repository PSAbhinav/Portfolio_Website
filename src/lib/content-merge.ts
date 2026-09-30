// Published content is stored as a snapshot. When a release adds new fields
// (a copy key, a setting), older snapshots lack them, and the site would fall
// back to blanks or refuse the row under the strict schema. Merging the
// snapshot over the bundled defaults fills every gap while keeping the
// owner's values wherever they exist. Arrays are taken whole from the
// snapshot: they are the owner's lists, not something to pad.
export function mergeWithDefaults<T>(defaults: T, snapshot: unknown): T {
  if (!isRecord(defaults) || !isRecord(snapshot)) return (snapshot ?? defaults) as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(defaults)) {
    const base = (defaults as Record<string, unknown>)[key];
    const value = snapshot[key];
    if (value === undefined) out[key] = base;
    else if (Array.isArray(base)) out[key] = Array.isArray(value) ? fillItems(base, value) : value;
    else if (isRecord(base) && isRecord(value)) out[key] = mergeWithDefaults(base, value);
    else out[key] = value;
  }
  return out as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Items are the owner's, but an item that matches a bundled one (same slug or
// title) inherits any fields it lacks, so a release can add, say, a
// certificate file to an existing credential without a manual edit.
function fillItems(defaults: unknown[], items: unknown[]): unknown[] {
  return items.map((item) => {
    if (!isRecord(item)) return item;
    const match = defaults.find(
      (d) => isRecord(d) && ((d.slug !== undefined && d.slug === item.slug) || (d.title !== undefined && d.title === item.title)),
    );
    return match ? mergeWithDefaults(match as Record<string, unknown>, item) : item;
  });
}
