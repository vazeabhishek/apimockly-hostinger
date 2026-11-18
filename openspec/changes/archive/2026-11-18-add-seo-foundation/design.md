## Context

API Mockly is a Fastify backend that serves a Vite-built React frontend. The frontend currently exposes one static `index.html` with one title and description; content is mostly created after JavaScript loads. The backend also serves generated mock endpoints at `/m/{id}/*`, while account and saved-mock views are client-side application states.

The repository already has Diátaxis documentation in Markdown. The SEO foundation should make that content and the product value proposition crawlable without mixing generated mock responses or authenticated application screens into the public document set.

## Goals / Non-Goals

**Goals:**
- Give search engines indexable HTML for public product and documentation routes.
- Provide unique, accurate metadata and canonical URLs for each public route.
- Generate `robots.txt` and a sitemap from the public route set.
- Prevent mock, API, account, and authenticated routes from being advertised or indexed.
- Preserve existing chat and mock-serving behavior.

**Non-Goals:**
- Guaranteed rankings or first-position placement.
- Server-side implementation of the entire React application.
- Indexing generated mock payloads.
- Keyword stuffing or paid placement.
- External Search Console or Bing account setup inside application code.

## Decisions

### Generate crawlable public HTML at build time

The frontend build SHALL produce static HTML documents for public routes and serve those documents exactly at their URL. This is preferable to relying on client-side React rendering for crawlers and avoids introducing a full SSR runtime for the interactive application.

Public routes include `/`, `/docs/`, documentation category pages, and the selected use-case/feature landing pages. Unknown public paths SHALL remain 404 rather than returning the homepage or a generic application shell.

### Reuse documentation source files

Public documentation SHALL be generated from the existing `docs/` Markdown files. Category and page metadata SHALL come from the same source set used for routing, so repository documentation remains the source of truth and no second, drift-prone documentation copy is created.

### Separate public and application routes

Public HTML routes are the only routes listed by the sitemap. Client-only account routes (`/login`, `/signup`, `/mocks`) SHALL include `noindex, follow` metadata and SHALL not be emitted by the sitemap.

The `/api/` namespace and `/m/{id}/*` namespace SHALL be disallowed in `robots.txt`. The mock namespace SHALL additionally return JSON or 404 responses and SHALL NOT serve public HTML.

### Use canonical and structured metadata

Every indexable public page SHALL have:
- A page-specific title
- A concise meta description
- One canonical URL derived from `PUBLIC_BASE_URL`
- Open Graph `title`, `description`, `type`, and `url`
- An appropriate JSON-LD type for the page

The initial product page SHOULD use `SoftwareApplication` or `WebApplication` structured data; documentation pages SHOULD use `TechArticle` or `BreadcrumbList` where applicable.

### Generate discovery files as build/deployment artifacts

`robots.txt` SHALL reference the canonical sitemap URL and disallow only private or machine-oriented namespaces. `sitemap.xml` SHALL contain only indexable public URLs and SHALL use `PUBLIC_BASE_URL` for absolute URLs.

The build SHALL fail or emit a clear validation error if canonical hosts, public routes, or sitemap entries are malformed or inconsistent.

## Risks / Trade-offs

- **Build duplication** → Public prerendering adds a small build step, but avoids adding a server-side React runtime.
- **Documentation rendering divergence** → Markdown remains the source and build validation checks that every public route maps to a source page.
- **Rankings are not guaranteed** → The implementation measures crawlability and organic discovery, not a fixed rank.
- **Canonical domain mistakes** → `PUBLIC_BASE_URL` remains the production authority and validation rejects localhost or non-HTTPS production values.
- **Mock routes overlap public routing** → Serve mock routes before static HTML fallback and keep static files from treating `/m/` as public content.

## Migration Plan

1. Add public route generation and metadata to the frontend build.
2. Add sitemap and robots generation to the same build output.
3. Update Fastify static and fallback behavior so public HTML is served exactly and application/mock namespaces retain their current behavior.
4. Deploy and submit the canonical sitemap to Google Search Console and Bing Webmaster Tools.
5. Monitor crawl, index, and organic query reports before expanding the public route set.

Rollback is to redeploy the prior frontend build and static handling; no database migration or mock API rollback is required.

## Open Questions

- Which use-case landing pages should launch first: frontend development, automated API testing, or rapid prototyping?
- Should `/docs/` retain a route to the full Diátaxis index or use category-level index pages only?
- What public canonical domain will be used for production: the current public host or a dedicated marketing host?
