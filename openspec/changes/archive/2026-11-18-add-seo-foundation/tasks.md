## 1. Public Route Foundation

- [x] 1.1 Inventory public product, use-case, and documentation routes and define canonical titles and descriptions for each route.
- [x] 1.2 Add a build-time public HTML generation step that emits route-specific files for the homepage and selected public landing pages.
- [x] 1.3 Render the existing `docs/` Markdown content as public documentation routes while preserving the Diátaxis information structure.
- [x] 1.4 Add internal navigation between the homepage, documentation index, and relevant documentation pages.

## 2. Metadata and Structured Data

- [x] 2.1 Add route-specific title, description, canonical, and Open Graph metadata to every public HTML document.
- [x] 2.2 Add no-index metadata to login, signup, and saved-mocks routes.
- [x] 2.3 Add JSON-LD `WebApplication` or `SoftwareApplication` metadata to the homepage and appropriate documentation metadata to public docs.
- [x] 2.4 Ensure canonical and Open Graph URLs consistently use `PUBLIC_BASE_URL`.

## 3. Crawl Discovery

- [x] 3.1 Generate `robots.txt` in the frontend build output, allowing public routes and disallowing `/api/`, `/m/`, `/login`, `/signup`, and `/mocks`.
- [x] 3.2 Generate `sitemap.xml` containing only absolute URLs for public product, use-case, and documentation routes.
- [x] 3.3 Verify the sitemap has a canonical absolute URL and is referenced by `robots.txt`.

## 4. Server Routing

- [x] 4.1 Update Fastify static handling so public routes serve their exact generated HTML files.
- [x] 4.2 Keep unknown public paths from falling back to the homepage as a successful 200 response.
- [x] 4.3 Preserve `/api/` and `/m/{id}/*` behavior ahead of static HTML fallback.

## 5. Build and Test Verification

- [x] 5.1 Add build validation that fails on missing public route metadata or canonical URLs outside `PUBLIC_BASE_URL`.
- [x] 5.2 Add tests proving public HTML is emitted and discovery files contain only approved routes.
- [x] 5.3 Add route tests proving login, signup, and mocks are no-index and mock serving behavior is unchanged.
- [x] 5.4 Run the smallest relevant frontend/backend test and build commands and verify generated `robots.txt` and `sitemap.xml`.

## 6. Search Property Setup

- [x] 6.1 Add or update production setup documentation for Google Search Console and Bing Webmaster Tools verification.
- [x] 6.2 Document sitemap submission and the canonical-domain check as post-deployment operational steps.
