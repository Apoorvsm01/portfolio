// jd-fetch: fetches a public job posting URL and returns its job-description text as JSON.
// Contract (see src/lib/jd.ts in the site): GET ?url=<encoded> -> { title?, company?, text }. Non-2xx = failure.

export interface Env {
  RATE_LIMITER?: RateLimit;
}

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export const ALLOWED_ORIGINS = ["https://apoorvsm01.github.io", "http://localhost:3217", "http://localhost:3000"];
export const MAX_BYTES = 1_500_000;
export const MAX_TEXT = 20_000;
export const MIN_TEXT = 200;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

// ---------- SSRF guard ----------

function ipv4ToParts(host: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  return parts.every((n) => n <= 255) ? parts : null;
}

function isPrivateV4([a, b]: number[]): boolean {
  return (
    a === 0 || // 0.0.0.0/8
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) || // 192.0.0.0/24 and 192.0.2.0/24 docs
    a >= 224 // multicast, reserved, broadcast
  );
}

function parseV6(host: string): number[] | null {
  let h = host;
  if (h.includes(".")) {
    // trailing dotted IPv4 (e.g. ::ffff:1.2.3.4) -> two hex groups
    const idx = h.lastIndexOf(":");
    const v4 = ipv4ToParts(h.slice(idx + 1));
    if (!v4) return null;
    h = `${h.slice(0, idx + 1)}${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`;
  }
  const halves = h.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  const out = groups.map((g) => (/^[0-9a-f]{1,4}$/i.test(g) ? parseInt(g, 16) : NaN));
  return out.some(Number.isNaN) ? null : out;
}

function isPrivateV6(g: number[]): boolean {
  const embeddedV4 = (hi: number, lo: number) => [hi >> 8, hi & 255, lo >> 8, lo & 255];
  const first6Zero = g.slice(0, 5).every((x) => x === 0);
  if (g.slice(0, 7).every((x) => x === 0)) return true; // :: and ::1
  if (first6Zero && g[5] === 0xffff) return isPrivateV4(embeddedV4(g[6], g[7])); // IPv4-mapped
  if (first6Zero && g[5] === 0) return true; // deprecated IPv4-compatible ::a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) return isPrivateV4(embeddedV4(g[6], g[7])); // NAT64
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((g[0] & 0xff00) === 0xff00) return true; // multicast
  if (g[0] === 0x2002) return isPrivateV4(embeddedV4(g[1], g[2])); // 6to4
  return false;
}

/** Throws HttpError(403) for hosts we refuse to fetch; 400 for unusable URLs. */
export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new HttpError(400, "bad_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new HttpError(400, "bad_url");
  if (url.username || url.password) throw new HttpError(400, "bad_url");
  if (url.port !== "" && url.port !== "80" && url.port !== "443") throw new HttpError(403, "blocked_host");

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) throw new HttpError(400, "bad_url");

  if (host.startsWith("[")) {
    const g = parseV6(host.slice(1, -1));
    if (!g || isPrivateV6(g)) throw new HttpError(403, "blocked_host");
    return url;
  }
  const v4 = ipv4ToParts(host);
  if (v4) {
    if (isPrivateV4(v4)) throw new HttpError(403, "blocked_host");
    return url;
  }
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    !host.includes(".") // single-label names resolve only on private networks
  ) {
    throw new HttpError(403, "blocked_host");
  }
  return url;
}

// ---------- Upstream fetch ----------

const ALLOWED_TYPES = /^(text\/html|application\/(ld\+)?json)\b/i;

async function readCapped(res: Response): Promise<string> {
  const declared = Number(res.headers.get("content-length"));
  if (declared > MAX_BYTES) {
    await res.body?.cancel();
    throw new HttpError(413, "too_large");
  }
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new HttpError(413, "too_large");
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  return new TextDecoder("utf-8").decode(buf);
}

async function fetchPage(target: string, doFetch: FetchFn): Promise<{ body: string; type: string }> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let current = assertSafeUrl(target);
  for (let hop = 0; ; hop++) {
    let res: Response;
    try {
      res = await doFetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal,
        headers: {
          accept: "text/html,application/xhtml+xml,application/ld+json;q=0.9,application/json;q=0.8",
          "user-agent": "Mozilla/5.0 (compatible; jd-fetch/1.0)",
          "accept-language": "en",
        },
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) throw new HttpError(504, "timeout");
      throw new HttpError(502, "upstream_failed");
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      await res.body?.cancel();
      if (!loc || hop >= MAX_REDIRECTS) throw new HttpError(502, "upstream_failed");
      try {
        current = assertSafeUrl(new URL(loc, current).toString());
      } catch (err) {
        if (err instanceof HttpError) throw err.status === 400 ? new HttpError(502, "upstream_failed") : err;
        throw new HttpError(502, "upstream_failed");
      }
      continue;
    }
    if (!res.ok) {
      await res.body?.cancel();
      throw new HttpError(502, "upstream_failed");
    }
    const type = res.headers.get("content-type") ?? "";
    if (!ALLOWED_TYPES.test(type.trim())) {
      await res.body?.cancel();
      throw new HttpError(415, "unsupported_type");
    }
    try {
      return { body: await readCapped(res), type };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) throw new HttpError(504, "timeout");
      throw new HttpError(502, "upstream_failed");
    }
  }
}

// ---------- Extraction ----------

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "-", mdash: "-", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', hellip: "...", bull: "-" };

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : " ";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function collapse(s: string): string {
  return s
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function htmlToText(html: string): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/?(br|p|div|section|article|main|ul|ol|table|tr|h[1-6]|blockquote|dd|dt)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return collapse(s);
}

const REMOVED_BLOCKS = ["nav", "footer", "header", "aside", "form", "button"];

function stripChrome(html: string): string {
  let s = html;
  for (const tag of REMOVED_BLOCKS) s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), " ");
  return s;
}

/** Returns the inner HTML of the first element matching openRe, balancing same-name tags. */
function innerOfFirst(html: string, openRe: RegExp): string | null {
  const m = openRe.exec(html);
  if (!m) return null;
  const name = m[1].toLowerCase();
  const re = new RegExp(`<(/?)${name}\\b[^>]*>`, "gi");
  re.lastIndex = m.index + m[0].length;
  let depth = 1;
  for (let t = re.exec(html); t; t = re.exec(html)) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return html.slice(m.index + m[0].length, t.index);
  }
  return html.slice(m.index + m[0].length);
}

function metaContent(html: string, key: string): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (k?.toLowerCase() !== key) continue;
    const c = /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    const v = c ? (c[1] ?? c[2]) : undefined;
    if (v?.trim()) return collapse(decodeEntities(v));
  }
  return undefined;
}

type Extracted = { title?: string; company?: string; text: string };

const asStr = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

function findJobPosting(node: unknown, depth = 0): Record<string, unknown> | null {
  if (!node || typeof node !== "object" || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const f = findJobPosting(n, depth + 1);
      if (f) return f;
    }
    return null;
  }
  const rec = node as Record<string, unknown>;
  const t = rec["@type"];
  if (t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"))) return rec;
  return findJobPosting(rec["@graph"], depth + 1);
}

function fromJobPosting(job: Record<string, unknown>): Extracted | null {
  let desc = asStr(job.description);
  if (!desc) return null;
  // Some sites double-encode the description HTML.
  if (!desc.includes("<") && /&lt;/i.test(desc)) desc = decodeEntities(desc);
  const org = job.hiringOrganization;
  const company = typeof org === "string" ? asStr(org) : asStr((org as Record<string, unknown> | undefined)?.name);
  const title = asStr(job.title);
  return {
    title: title ? collapse(decodeEntities(title)) : undefined,
    company: company ? collapse(decodeEntities(company)) : undefined,
    text: htmlToText(desc),
  };
}

function fromJsonLd(html: string): Extracted | null {
  const re = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    try {
      const job = findJobPosting(JSON.parse(m[1].trim()));
      const out = job && fromJobPosting(job);
      if (out) return out;
    } catch {
      // ignore malformed blocks
    }
  }
  return null;
}

function fromHtml(html: string): Extracted {
  const titleTag = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1];
  const title = metaContent(html, "og:title") ?? (titleTag ? collapse(decodeEntities(titleTag)) : undefined);
  const company = metaContent(html, "og:site_name");

  const body = stripChrome(html.replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1\s*>/gi, " "));
  const candidates = [/<(main)\b[^>]*>/i, /<(article)\b[^>]*>/i, /<([a-z][a-z0-9]*)\b[^>]*\b(?:class|id)\s*=\s*["'][^"']*job[^"']*["'][^>]*>/i];
  for (const re of candidates) {
    const inner = innerOfFirst(body, re);
    if (inner) {
      const text = htmlToText(inner);
      if (text.length >= MIN_TEXT) return { title, company, text };
    }
  }
  const bodyInner = innerOfFirst(body, /<(body)\b[^>]*>/i) ?? body;
  return { title, company, text: htmlToText(bodyInner) };
}

export function extract(body: string, type: string): Extracted {
  if (/json/i.test(type)) {
    try {
      const job = findJobPosting(JSON.parse(body));
      return (job && fromJobPosting(job)) ?? { text: "" };
    } catch {
      return { text: "" };
    }
  }
  return fromJsonLd(body) ?? fromHtml(body);
}

// ---------- HTTP layer ----------

function json(data: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=3600" : "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

// Best-effort per-isolate fallback when the RATE_LIMITER binding is absent. Not shared across isolates.
const hits = new Map<string, number[]>();
function memoryLimit(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] >= RATE_WINDOW_MS) hits.delete(k);
  return true;
}

export async function handle(request: Request, env: Env, doFetch: FetchFn = fetch): Promise<Response> {
  const origin = request.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "forbidden_origin" }, 403);
  const cors = corsHeaders(origin);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405, { ...cors, allow: "GET, OPTIONS" });

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const allowed = env.RATE_LIMITER ? (await env.RATE_LIMITER.limit({ key: ip })).success : memoryLimit(ip);
  if (!allowed) return json({ error: "rate_limited" }, 429, { ...cors, "retry-after": "60" });

  try {
    const target = new URL(request.url).searchParams.get("url");
    if (!target || target.length > 2048) throw new HttpError(400, "bad_url");
    const { body, type } = await fetchPage(target, doFetch);
    const out = extract(body, type);
    const text = out.text.slice(0, MAX_TEXT);
    if (text.length < MIN_TEXT) throw new HttpError(422, "no_job_text");
    const payload: Extracted = { text };
    if (out.title) payload.title = out.title.slice(0, 200);
    if (out.company) payload.company = out.company.slice(0, 120);
    return json(payload, 200, cors);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code }, err.status, cors);
    return json({ error: "upstream_failed" }, 502, cors);
  }
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env),
} satisfies ExportedHandler<Env>;

export const _testing = { memoryLimit, hits };
