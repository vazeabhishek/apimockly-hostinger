# search-engine-discovery Specification

## Purpose

Introduced by change add-seo-foundation.

## Requirements

### Requirement: Public routes provide crawlable HTML
The system SHALL provide server-rendered or statically generated HTML for public product and documentation routes.

#### Scenario: Search crawler requests the product page
- **WHEN** a crawler requests `/`
- **THEN** the response is successful HTML containing the product name, value proposition, and a link to the public documentation

#### Scenario: Search crawler requests a public documentation page
- **WHEN** a crawler requests a documentation route generated from `docs/`
- **THEN** the response is successful HTML containing the document title and complete readable page content

#### Scenario: Unknown public route
- **WHEN** a request does not match a generated public route
- **THEN** the system SHALL NOT return the homepage HTML as a successful 200 response

### Requirement: Public pages expose unique page metadata
Every indexable public route SHALL expose a unique title, description, canonical URL, Open Graph metadata, and appropriate structured data.

#### Scenario: Public route metadata
- **WHEN** a crawler or user views an indexable public route
- **THEN** the HTML head contains one title, one description, one canonical URL, and Open Graph title, description, type, and URL fields

#### Scenario: Canonical URL
- **WHEN** a public route is served
- **THEN** its canonical URL uses the configured production public base URL and does not refer to localhost or an alternate host

#### Scenario: Structured product metadata
- **WHEN** the homepage is requested
- **THEN** the HTML contains valid JSON-LD identifying API Mockly as software or web application software

### Requirement: Discovery files identify public URLs
The build SHALL produce a `robots.txt` and XML sitemap containing only public, indexable URLs.

#### Scenario: Robots discovery
- **WHEN** a crawler requests `/robots.txt`
- **THEN** the response is valid text and references the canonical sitemap URL

#### Scenario: Sitemap public routes
- **WHEN** a sitemap consumer reads `sitemap.xml`
- **THEN** it contains absolute URLs for public product and documentation routes

#### Scenario: Sitemap exclusions
- **WHEN** the sitemap is generated
- **THEN** it contains no `/api/`, `/m/`, `/login`, `/signup`, or `/mocks` URLs

### Requirement: Application and mock routes remain non-indexable
Authenticated application views and generated mock endpoints SHALL be excluded from public search discovery.

#### Scenario: Login route
- **WHEN** `/login` is requested
- **THEN** the HTML identifies the route as `noindex, follow`

#### Scenario: Signup route
- **WHEN** `/signup` is requested
- **THEN** the HTML identifies the route as `noindex, follow`

#### Scenario: Saved mocks route
- **WHEN** `/mocks` is requested
- **THEN** the HTML identifies the route as `noindex, follow`

#### Scenario: Generated mock endpoint
- **WHEN** a request matches `/m/{id}/*`
- **THEN** the response retains the existing mock HTTP behavior and is disallowed by `robots.txt`

### Requirement: SEO output is validated during builds
The frontend build SHALL validate public routes and discovery metadata before deployment.

#### Scenario: Public route is missing metadata
- **WHEN** a public route is generated without title, description, canonical, or Open Graph metadata
- **THEN** the build fails with a validation error identifying the route

#### Scenario: Discovery entries use the wrong authority
- **WHEN** sitemap or canonical generation resolves a URL outside `PUBLIC_BASE_URL`
- **THEN** the build fails with a validation error

#### Scenario: Existing mock behavior is preserved
- **WHEN** the SEO foundation is built and deployed
- **THEN** existing `/m/{id}/*` matching, status codes, and JSON response behavior remain unchanged
