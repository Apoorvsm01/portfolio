# jd-fetch

Cloudflare Worker that fetches a public job posting URL and returns its job-description text.

`GET /?url=<encoded job url>` returns `{ title?, company?, text }`. Errors are `{ "error": "<code>" }`
(400 bad_url, 403 forbidden_origin/blocked_host, 405, 413 too_large, 415 unsupported_type,
422 no_job_text, 429 rate_limited, 502 upstream_failed, 504 timeout). The site treats any non-2xx as
"ask the visitor to paste the text".

Only `https://apoorvsm01.github.io`, `http://localhost:3217` and `http://localhost:3000` are allowed
origins; requests with any other (or no) Origin get 403.

## Develop

```sh
cd workers/jd-fetch
npm install
npx vitest run        # offline tests
npx tsc --noEmit      # type-check
```

## Deploy

```sh
cd workers/jd-fetch
npx wrangler login
npx wrangler deploy
```

Wrangler prints the Worker URL (`https://jd-fetch.<your-subdomain>.workers.dev`). Quick check:

```sh
curl -H 'Origin: https://apoorvsm01.github.io' \
  'https://jd-fetch.<your-subdomain>.workers.dev/?url=https%3A%2F%2Fexample.com'
```

## Wire it into the site

In `.github/workflows/pages.yml`, add the URL to the build step's env (no trailing slash needed
beyond the path the Worker serves, which is `/`):

```yaml
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_JD_ENDPOINT: https://jd-fetch.<your-subdomain>.workers.dev
```

## Rate limiting

`wrangler.jsonc` declares a Workers Rate Limiting binding (`RATE_LIMITER`, 20 requests per 60 s per IP).
If the binding is absent the Worker falls back to a best-effort in-memory limiter (per isolate, not shared).
