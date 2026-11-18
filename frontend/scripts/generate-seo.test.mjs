import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { generateSeo, markdownToHtml, resolvePublicBaseUrl, withSeoHead } from "./generate-seo.mjs";

test("markdown conversion emits readable headings and links", () => {
  const html = markdownToHtml("# Test\n\nRun the [guide](../how-to/run-locally.md).\n\n```json\n{}\n```", "tutorials/test.md");
  assert.match(html, /<h1>Test<\/h1>/);
  assert.match(html, /href="\/docs\/how-to\/run-locally\/"/);
  assert.match(html, /<pre><code>/);
});

test("SEO head includes canonical, Open Graph, and noindex metadata", () => {
  const html = withSeoHead("<html><head><title>Old</title></head><body></body></html>", {
    title: "Test",
    description: "Test description",
    canonical: "https://example.com/docs/",
  }, null, true);
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/docs\/" \/>/);
  assert.match(html, /<meta property="og:title" content="Test" \/>/);
  assert.match(html, /<meta name="robots" content="noindex, follow" \/>/);
});

test("public build output contains sitemap and robots entries", (t) => {
  const tempRepo = mkdtempSync(join(tmpdir(), "apimocker-seo-"));
  const frontendDist = join(tempRepo, "frontend-dist");
  mkdirSync(frontendDist, { recursive: true });
  writeFileSync(join(frontendDist, "index.html"), '<html><head><title>Old</title></head><body><div id="root"></div></body></html>');

  t.after(() => rmSync(tempRepo, { recursive: true, force: true }));

  assert.doesNotThrow(() => resolvePublicBaseUrl({ PUBLIC_BASE_URL: "https://mock.example.com", APP_PROFILE: "production" }));
  const result = generateSeo(frontendDist);
  const robots = readFileSync(join(frontendDist, "robots.txt"), "utf8");
  const sitemap = readFileSync(join(frontendDist, "sitemap.xml"), "utf8");
  assert.ok(result.sitemapRoutes.includes("/docs/"));
  assert.match(robots, /Disallow: \/m\//);
  assert.match(sitemap, /\/docs\/reference\/rest-api\/</);
});
