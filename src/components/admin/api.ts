// Client-side JSON helper for the admin API. Errors carry the server's
// message so the studio can show it verbatim.
export async function requestJson<T>(url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { cache: "no-store" };
  if (body !== undefined) {
    init.method = "POST";
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request failed. Try again.");
  return data as T;
}

export function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Something went wrong. Try again.";
}
