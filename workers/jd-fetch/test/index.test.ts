import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertSafeUrl, handle, MAX_BYTES, _testing, type Env } from "../src/index";

const ORIGIN = "https://apoorvsm01.github.io";
const env: Env = {};
beforeEach(() => _testing.hits.clear());
const LONG = "Design systems, research and prototyping across a product team. ".repeat(10);

const html = (body: string, head = "") => `<!doctype html><html><head><title>T</title>${head}</head><body>${body}</body></html>`;
const page = (body: string, type = "text/html; charset=utf-8", init: ResponseInit = {}) =>
  new Response(body, { ...init, headers: { "content-type": type, ...(init.headers as Record<string, string>) } });

function call(target: string, upstream: (u: string) => Response | Promise<Response>, opts: { origin?: string | null; method?: string } = {}) {
  const headers: Record<string, string> = {};
  const origin = opts.origin === undefined ? ORIGIN : opts.origin;
  if (origin) headers.origin = origin;
  const req = new Request(`https://jd.example.workers.dev/?url=${encodeURIComponent(target)}`, { method: opts.method ?? "GET", headers });
  const fetchMock = vi.fn(async (u: string) => upstream(u));
  return handle(req, env, fetchMock as never).then((res) => ({ res, fetchMock }));
}

describe("extraction", () => {
  it("reads a JobPosting from JSON-LD", async () => {
    const ld = JSON.stringify({ "@type": "JobPosting", title: "Senior Designer", hiringOrganization: { name: "Acme" }, description: `<p>${LONG}</p><ul><li>Lead</li></ul>` });
    const { res } = await call("https://acme.com/job", () => page(html("", `<script type="application/ld+json">${ld}</script>`)));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
    const data = (await res.json()) as { title: string; company: string; text: string };
    expect(data.title).toBe("Senior Designer");
    expect(data.company).toBe("Acme");
    expect(data.text).toContain("Design systems");
    expect(data.text).not.toContain("<p>");
  });

  it("finds a JobPosting inside @graph and decodes escaped HTML", async () => {
    const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "WebSite" }, { "@type": ["JobPosting"], title: "PM", hiringOrganization: "Globex", description: `&lt;p&gt;${LONG}&lt;/p&gt;` }] });
    const { res } = await call("https://globex.com/j", () => page(html("", `<script type="application/ld+json">${ld}</script>`)));
    const data = (await res.json()) as { company: string; text: string };
    expect(res.status).toBe(200);
    expect(data.company).toBe("Globex");
    expect(data.text.startsWith("Design systems")).toBe(true);
  });

  it("falls back to HTML: title, og tags, main text, no chrome", async () => {
    const body = `<nav>MENUITEM</nav><header>HEADERBAR</header><main><div><h1>Role</h1><p>${LONG}</p></div><script>evil()</script></main><footer>FOOTERLINKS</footer>`;
    const head = `<meta property="og:title" content="Staff Designer at Initech"><meta content="Initech" property="og:site_name">`;
    const { res } = await call("https://initech.com/j", () => page(html(body, head)));
    const data = (await res.json()) as { title: string; company: string; text: string };
    expect(res.status).toBe(200);
    expect(data.title).toBe("Staff Designer at Initech");
    expect(data.company).toBe("Initech");
    expect(data.text).toContain("Design systems");
    for (const bad of ["MENUITEM", "HEADERBAR", "FOOTERLINKS", "evil()"]) expect(data.text).not.toContain(bad);
  });

  it("uses a job-class container and caps text at 20,000 chars", async () => {
    const body = `<div class="x">noise</div><section class="job-description">${"word ".repeat(10000)}</section>`;
    const { res } = await call("https://a.com/j", () => page(html(body)));
    const data = (await res.json()) as { text: string };
    expect(data.text.length).toBe(20000);
  });

  it("returns 422 no_job_text for short text (login walls)", async () => {
    const { res } = await call("https://linkedin.com/jobs/1", () => page(html("<main>Sign in to view</main>")));
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "no_job_text" });
  });

  it("never reflects fetched HTML in error output", async () => {
    const { res } = await call("https://a.com/j", () => page(html("<main><script>alert(1)</script>hi</main>")));
    expect(await res.text()).not.toContain("alert");
  });
});

describe("SSRF guard", () => {
  const blocked = [
    "http://127.0.0.1/", "http://127.1.2.3/", "http://10.0.0.5/", "http://172.16.0.1/", "http://172.31.255.255/", "http://192.168.1.1/",
    "http://169.254.169.254/latest/meta-data", "http://100.64.0.1/", "http://100.127.255.254/", "http://0.0.0.0/", "http://2130706433/", "http://0x7f.0.0.1/",
    "http://[::1]/", "http://[::]/", "http://[fc00::1]/", "http://[fd12:3456::1]/", "http://[fe80::1]/", "http://[::ffff:127.0.0.1]/", "http://[::ffff:10.1.2.3]/",
    "http://localhost/", "http://LOCALHOST./", "http://app.localhost/", "http://printer.local/", "http://db.internal/", "http://intranet/",
    "https://example.com:8443/", "http://example.com:22/",
  ];
  it.each(blocked)("rejects %s without fetching", async (u) => {
    const { res, fetchMock } = await call(u, () => page(html(LONG)));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows public IPs and default/explicit 80/443 ports", () => {
    for (const u of ["http://8.8.8.8/", "https://1.1.1.1/x", "https://example.com:443/", "http://example.com:80/", "https://[2606:4700::1111]/", "https://[::ffff:8.8.8.8]/"]) expect(() => assertSafeUrl(u)).not.toThrow();
  });

  it("rejects credentials, non-http schemes and garbage with 400", async () => {
    for (const u of ["https://user:pw@example.com/", "https://user@example.com/", "ftp://example.com/", "file:///etc/passwd", "javascript:alert(1)", "not a url"]) {
      const { res, fetchMock } = await call(u, () => page(html(LONG)));
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
    expect((await call("", () => page("x"))).res.status).toBe(400);
  });

  it("rejects a redirect that lands on a private IP", async () => {
    const { res, fetchMock } = await call("https://example.com/j", () => new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest" } }));
    expect(res.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("follows relative redirects, but at most 3", async () => {
    const ok = await call("https://example.com/a", (u) => (u.endsWith("/a") ? new Response(null, { status: 301, headers: { location: "/b" } }) : page(html(`<main>${LONG}</main>`))));
    expect(ok.res.status).toBe(200);
    expect(ok.fetchMock).toHaveBeenLastCalledWith("https://example.com/b", expect.anything());
    const loop = await call("https://example.com/a", () => new Response(null, { status: 302, headers: { location: "/a" } }));
    expect(loop.res.status).toBe(502);
    expect(loop.fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe("upstream limits", () => {
  it("413 when the stream exceeds the cap (no content-length)", async () => {
    const chunk = new Uint8Array(500_000).fill(97);
    const stream = new ReadableStream({ pull(c) { c.enqueue(chunk); } });
    const { res } = await call("https://a.com/j", () => new Response(stream, { headers: { "content-type": "text/html" } }));
    expect(res.status).toBe(413);
  });
  it("413 when content-length declares too much", async () => {
    const { res } = await call("https://a.com/j", () => page("x", "text/html", { headers: { "content-length": String(MAX_BYTES + 1) } }));
    expect(res.status).toBe(413);
  });
  it("415 for wrong content types", async () => {
    for (const t of ["application/pdf", "image/png", "text/plain"]) expect((await call("https://a.com/j", () => page("x", t))).res.status).toBe(415);
  });
  it("accepts a JSON JobPosting", async () => {
    const body = JSON.stringify({ "@type": "JobPosting", title: "X", description: LONG });
    expect((await call("https://a.com/j", () => page(body, "application/ld+json"))).res.status).toBe(200);
  });
  it("maps timeouts to 504 and network errors to 502, upstream 404 to 502", async () => {
    const timeout = await call("https://a.com/j", () => { throw new DOMException("t", "TimeoutError"); });
    expect(timeout.res.status).toBe(504);
    expect((await call("https://a.com/j", () => { throw new TypeError("net"); })).res.status).toBe(502);
    expect((await call("https://a.com/j", () => new Response("no", { status: 404 }))).res.status).toBe(502);
  });
});

describe("CORS and methods", () => {
  const ok = () => page(html(`<main>${LONG}</main>`));
  it.each([ORIGIN, "http://localhost:3217", "http://localhost:3000"])("echoes allowed origin %s", async (o) => {
    const { res } = await call("https://a.com/j", ok, { origin: o });
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe(o);
    expect(res.headers.get("vary")).toBe("Origin");
  });
  it("403 without CORS headers for other or missing origins", async () => {
    for (const origin of ["https://evil.example", "http://localhost:4000", null]) {
      const { res, fetchMock } = await call("https://a.com/j", ok, { origin });
      expect(res.status).toBe(403);
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });
  it("answers preflight for allowed origins, 403 for others", async () => {
    const good = await call("https://a.com/j", ok, { method: "OPTIONS" });
    expect(good.res.status).toBe(204);
    expect(good.res.headers.get("access-control-allow-methods")).toContain("GET");
    expect(good.res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const bad = await call("https://a.com/j", ok, { method: "OPTIONS", origin: "https://evil.example" });
    expect(bad.res.status).toBe(403);
    expect(bad.res.headers.get("access-control-allow-origin")).toBeNull();
  });
  it("rejects non-GET methods with 405", async () => {
    for (const method of ["POST", "PUT", "DELETE"]) {
      const req = new Request("https://jd.example.workers.dev/?url=https%3A%2F%2Fa.com", { method, headers: { origin: ORIGIN }, body: "x" });
      expect((await handle(req, env, vi.fn() as never)).status).toBe(405);
    }
  });
  it("error responses carry CORS for allowed origins", async () => {
    const { res } = await call("http://localhost/", ok);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
  });
});

describe("rate limiting", () => {
  it("uses the binding when present", async () => {
    const limit = vi.fn(async () => ({ success: false }));
    const req = new Request("https://x/?url=https%3A%2F%2Fa.com", { headers: { origin: ORIGIN } });
    const res = await handle(req, { RATE_LIMITER: { limit } }, vi.fn() as never);
    expect(res.status).toBe(429);
    expect(limit).toHaveBeenCalled();
  });
  it("falls back to an in-memory limiter of 20/min", () => {
    _testing.hits.clear();
    const results = Array.from({ length: 21 }, () => _testing.memoryLimit("1.2.3.4", 1000));
    expect(results.filter(Boolean)).toHaveLength(20);
    expect(_testing.memoryLimit("1.2.3.4", 1000 + 61_000)).toBe(true);
  });
});
