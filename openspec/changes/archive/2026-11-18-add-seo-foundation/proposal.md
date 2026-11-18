## Why

API Mockly is an application for developers, but search engines currently see a single React shell instead of a useful set of public product and documentation pages. This prevents the site from ranking for relevant API mocking searches and makes it difficult for crawlers to understand, index, and link to the product.

An SEO foundation will make existing product value and documentation discoverable while keeping account screens and generated mock endpoints out of the search index.

## What Changes

- Add public, crawlable routes for the primary product value proposition and developer use cases.
- Publish the existing Diátaxis documentation as public, internally linked pages instead of Markdown-only repository content.
- Add route-specific page titles, descriptions, canonical URLs, Open Graph metadata, and structured data.
- Add `robots.txt` and an XML sitemap for the public site.
- Add crawl-safe handling for application-only routes such as login, signup, mocks, and `/m/{id}/*`.
- Add indexability and metadata verification to the existing build/test workflow.
- Establish Google Search Console and Bing Webmaster Tools as deployment/setup follow-ups; account access and external property verification are not code changes.

## Capabilities

### New Capabilities
- `search-engine-discovery`: Crawlable public pages, page metadata, structured discovery files, canonicalization, and indexability controls for API Mockly.

### Modified Capabilities
- None.

## Impact

- `frontend/`: public route structure, metadata rendering, landing/use-case content, and public documentation rendering.
- `backend/src/app.ts`: static-route and crawl-safety handling for public and application-only paths.
- Build output: sitemap and robots artifacts.
- Existing documentation: Markdown content will be exposed through public routes while preserving its Diátaxis organization.
- External setup: Search Console and Bing Webmaster Tools property verification and sitemap submission.
- No breaking changes to mock creation APIs or `/m/{id}/*` response behavior.
