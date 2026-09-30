// Published content is a snapshot of everything, so on its own it cannot say
// which values the owner typed and which merely came from the bundled
// defaults of the day. The studio therefore records, at save time, the paths
// the owner changed (editedPaths). Laying a snapshot over the current
// defaults with that record (mergeWithDefaults) lets a release change any
// default the owner never touched, add items to a list, or add fields, while
// every owner edit, removal and reordering still wins.
//
// Array items are addressed by a stable key (slug, title, label or name) so
// that reordering does not turn every item into an edit. Path grammar:
//   profile.tagline           a changed value
//   projects[qtrack].summary  a changed field inside a keyed item
//   +projects[my-app]         an item (or key) the owner added
//   -certifications[Old one]  an item (or key) the owner removed
//   ~projects                 a list the owner reordered
//
// A snapshot saved before this record existed has no edit set (null): the
// defaults then win everywhere, and only owner-only items are kept.

type Rec = Record<string, unknown>;
export type EditSet = ReadonlySet<string> | null;

function isRecord(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function itemKey(item: unknown): string | null {
  if (!isRecord(item)) return null;
  for (const field of ["slug", "title", "label", "name"]) {
    const value = item[field];
    if (typeof value === "string" && value) return value;
  }
  return null;
}

// Lists whose every item has a key are merged item by item; anything else
// (paragraphs, tags) is a single value.
function keyed(list: unknown[]): boolean {
  return list.length > 0 && list.every((item) => itemKey(item) !== null);
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const join = (path: string, key: string) => (path ? `${path}.${key}` : key);

export function editedPaths(defaults: unknown, content: unknown, path = ""): string[] {
  const out: string[] = [];
  if (isRecord(defaults) && isRecord(content)) {
    for (const key of new Set([...Object.keys(defaults), ...Object.keys(content)])) {
      const p = join(path, key);
      if (!(key in content)) out.push(`-${p}`);
      else if (!(key in defaults)) out.push(`+${p}`);
      else out.push(...editedPaths(defaults[key], content[key], p));
    }
    return out;
  }
  if (Array.isArray(defaults) && Array.isArray(content) && keyed(defaults) && keyed(content)) {
    const defaultKeys = defaults.map(itemKey);
    const contentKeys = content.map(itemKey);
    content.forEach((item, index) => {
      const at = defaultKeys.indexOf(contentKeys[index]);
      const p = `${path}[${contentKeys[index]}]`;
      if (at === -1) out.push(`+${p}`);
      else out.push(...editedPaths(defaults[at], item, p));
    });
    defaultKeys.forEach((key) => {
      if (!contentKeys.includes(key)) out.push(`-${path}[${key}]`);
    });
    const sharedInContentOrder = contentKeys.filter((key) => defaultKeys.includes(key));
    const sharedInDefaultOrder = defaultKeys.filter((key) => contentKeys.includes(key));
    if (!same(sharedInContentOrder, sharedInDefaultOrder)) out.push(`~${path}`);
    return out;
  }
  if (!same(defaults, content)) out.push(path);
  return out;
}

// Insert `key` into `order` right after the nearest earlier key of `sequence`
// that is already present; at the front when none is.
function insertNear(order: string[], key: string, sequence: string[]): void {
  const at = sequence.indexOf(key);
  for (let back = at - 1; back >= 0; back--) {
    const anchor = order.indexOf(sequence[back]);
    if (anchor !== -1) {
      order.splice(anchor + 1, 0, key);
      return;
    }
  }
  order.unshift(key);
}

function mergeList(defaults: unknown[], snapshot: unknown[], edits: EditSet, path: string): unknown[] {
  const has = (p: string) => edits?.has(p) ?? false;
  const defaultKeys = defaults.map(itemKey) as string[];
  const snapshotKeys = snapshot.map(itemKey) as string[];
  const removed = (key: string) => has(`-${path}[${key}]`);
  // Owner-only items survive when recorded as added, or when there is no record at all.
  const added = (key: string) => !defaultKeys.includes(key) && (edits === null || has(`+${path}[${key}]`));

  let order: string[];
  if (has(`~${path}`)) {
    order = snapshotKeys.filter((key) => defaultKeys.includes(key) || added(key));
    defaultKeys.forEach((key) => {
      if (!order.includes(key) && !removed(key)) insertNear(order, key, defaultKeys);
    });
  } else {
    order = defaultKeys.filter((key) => !removed(key));
    snapshotKeys.forEach((key) => {
      if (added(key)) insertNear(order, key, snapshotKeys);
    });
  }
  return order.map((key) => {
    const fromDefaults = defaults[defaultKeys.indexOf(key)];
    const fromSnapshot = snapshot[snapshotKeys.indexOf(key)];
    if (fromDefaults === undefined) return fromSnapshot;
    if (fromSnapshot === undefined) return fromDefaults;
    return mergeWithDefaults(fromDefaults, fromSnapshot, edits, `${path}[${key}]`);
  });
}

export function mergeWithDefaults<T>(defaults: T, snapshot: unknown, edits: EditSet = null, path = ""): T {
  const has = (p: string) => edits?.has(p) ?? false;
  if (isRecord(defaults) && isRecord(snapshot)) {
    const out: Rec = {};
    for (const key of Object.keys(defaults)) {
      const p = join(path, key);
      if (has(`-${p}`)) continue;
      out[key] = key in snapshot ? mergeWithDefaults(defaults[key], snapshot[key], edits, p) : defaults[key];
    }
    for (const key of Object.keys(snapshot)) {
      if (!(key in defaults) && has(`+${join(path, key)}`)) out[key] = snapshot[key];
    }
    return out as T;
  }
  if (Array.isArray(defaults) && Array.isArray(snapshot) && keyed(defaults) && keyed(snapshot) && !has(path)) {
    return mergeList(defaults, snapshot, edits, path) as T;
  }
  if (snapshot === undefined) return defaults;
  return (has(path) ? snapshot : defaults) as T;
}
