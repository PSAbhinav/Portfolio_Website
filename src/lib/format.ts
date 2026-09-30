const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-09" → "Sep 2026". Anything else is returned untouched.
export function formatMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return yearMonth;
  return `${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

// "2026-08", "" → "Aug 2026 — Present"
export function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : "Present"}`;
}

// Leading four-digit year from "2022 - 2026" or "2026-08"; 0 when absent.
export function startYear(value: string): number {
  const match = /(\d{4})/.exec(value);
  return match ? Number(match[1]) : 0;
}
