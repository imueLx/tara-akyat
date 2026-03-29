# Production Checklist

Use this checklist right after deploying Tara Akyat to production.

## Pre-deploy

- Confirm `NEXT_PUBLIC_SITE_URL` is set to the live canonical domain.
- Run:

```bash
npm run lint
npm run test
npm run build
```

## Live URL checks

Verify these pages after deploy:

- `/`
- `/mountains/mt-ulap`
- `/regions/luzon`
- `/months/march`
- `/about`

For each page, confirm:

- The page loads normally.
- The canonical points to `https://tara-akyat.vercel.app/...` for the matching route.
- Open Graph and Twitter metadata still render.

## Crawl and index checks

Check `/sitemap.xml` and confirm it includes:

- trust pages: `/about`, `/methodology`, `/sources`
- region hubs
- difficulty hubs
- active month hubs
- mountain pages

Check `/robots.txt` and confirm:

- public pages are crawlable
- `/api/` remains disallowed

Check an empty month hub like `/months/june` and confirm:

- the page still loads
- the page is marked `noindex`
- the page is not included in the sitemap

## Internal linking checks

Confirm the homepage and footer still link to:

- `/mountains`
- `/about`
- `/methodology`
- `/sources`

Confirm mountain pages still link to:

- related mountains
- methodology
- sources

## Google checks

In Google Search Console:

- add or confirm the property for `https://tara-akyat.vercel.app`
- submit `/sitemap.xml`
- run URL Inspection for:
  - `/`
  - `/mountains/mt-ulap`
  - `/regions/luzon`
  - `/months/march`

In Rich Results Test:

- test `/`
- test one mountain page such as `/mountains/mt-ulap`

## Monitoring after release

Within the first few weeks, review:

- indexed pages
- impressions
- CTR
- top query/page pairs
- whether Tagalog or Taglish queries are appearing for hub or mountain pages
