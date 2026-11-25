// Job description input: decides what the home input holds, and fetches a job link through an optional
// endpoint. Static export has no server, so the endpoint is a separate service set at build time.

export type InputKind =
  | { kind: "empty" }
  | { kind: "url"; url: string }
  | { kind: "jd"; text: string }
  | { kind: "ask"; text: string };

export type JobDescription = { title?: string; company?: string; text: string };

export const JD_MIN_CHARS = 180;
export const JD_MAX_CHARS = 20000;
const FETCH_TIMEOUT_MS = 12000;

function asUrl(text: string): string | null {
  if (!/^https?:\/\/\S+$/i.test(text)) return null;
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// A single http(s) link is a job link; long or multi-line text is a job description; anything else is a question.
export function classifyInput(raw: string): InputKind {
  const text = raw.trim();
  if (!text) return { kind: "empty" };
  const url = asUrl(text);
  if (url) return { kind: "url", url };
  if (text.length > JD_MIN_CHARS || /\n/.test(text)) return { kind: "jd", text: text.slice(0, JD_MAX_CHARS) };
  return { kind: "ask", text };
}

const str = (v: unknown, max: number): string | undefined => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

// Asks the configured endpoint to read a job link. Returns null when no endpoint is set or the call fails,
// so the caller can ask the visitor to paste the text instead. The reply is treated as plain data.
export async function fetchJobDescription(url: string, endpoint: string | undefined = process.env.NEXT_PUBLIC_JD_ENDPOINT): Promise<JobDescription | null> {
  if (!endpoint) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    const rec = data as Record<string, unknown>;
    const text = str(rec.text, JD_MAX_CHARS);
    if (!text) return null;
    return { title: str(rec.title, 140), company: str(rec.company, 100), text };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
