import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, "..");
const repoDir = resolve(frontendDir, "..");
const distDir = join(frontendDir, "dist");
const docsDir = join(repoDir, "docs");

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function readEnvFile(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2")];
      }),
  );
}

export function resolvePublicBaseUrl(env = process.env) {
  const backendEnv = readEnvFile(join(repoDir, "backend", ".env.production"));
  const rootEnv = readEnvFile(join(repoDir, ".env.production"));
  const raw = env.PUBLIC_BASE_URL ?? rootEnv.PUBLIC_BASE_URL ?? backendEnv.PUBLIC_BASE_URL ?? "http://localhost:4000";
  const url = new URL(raw);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  if (env.APP_PROFILE === "production" || rootEnv.APP_PROFILE === "production" || backendEnv.APP_PROFILE === "production") {
    if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
      throw new Error(`PUBLIC_BASE_URL must be an HTTPS public URL, got "${raw}"`);
    }
  }
  return url.origin;
}

export function inlineMarkdown(value, sourceFile) {
  let text = value;
  text = text.replace(/`([^`]+)`/g, (_match, code) => `<code>${escapeHtml(code)}</code>`);
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const clean = String(href).trim();
    let resolved = clean;
    if (!/^(https?:|mailto:|#|\/)/.test(clean) && clean.endsWith(".md")) {
      const sourceDir = posix.dirname(sourceFile.replace(/\\/g, "/"));
      const target = posix.normalize(posix.join(sourceDir, clean.replace(/\.md$/, "")));
      resolved = `/docs/${target}/`;
    }
    return `<a href="${escapeHtml(resolved)}">${escapeHtml(label)}</a>`;
  });
  text = text.replace(/<(https?:\/\/[^>]+)>/g, (_match, url) => `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^\s*](?:[^*]*?[^\s*])?)\*/g, "<em>$1</em>");
  return text;
}

export function markdownToHtml(markdown, sourceFile) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const chunks = [];
  let inCode = null;
  let codeLines = [];
  let inList = null;
  let listItems = [];

  const flushList = () => {
    if (!inList) return;
    const tag = inList === "ordered" ? "ol" : "ul";
    chunks.push(`<${tag}>${listItems.map((item) => `<li>${inlineMarkdown(item, sourceFile)}</li>`).join("")}</${tag}>`);
    inList = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (inCode !== null) {
      if (line.trim().startsWith("```")) {
        chunks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = null;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushList();
      inCode = line.trim().slice(3).trim();
      continue;
    }
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushList();
      chunks.push("<hr>");
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      chunks.push(`<h${level}>${inlineMarkdown(heading[2], sourceFile)}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^[-*]\s+(.*)$/);
    if (unordered) {
      if (inList !== "unordered") {
        flushList();
        inList = "unordered";
      }
      listItems.push(unordered[1]);
      continue;
    }
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      if (inList !== "ordered") {
        flushList();
        inList = "ordered";
      }
      listItems.push(ordered[1]);
      continue;
    }
    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) {
      flushList();
      chunks.push(`<blockquote>${inlineMarkdown(blockquote[1], sourceFile)}</blockquote>`);
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3}/.test(lines[i + 1])) {
      flushList();
      const tableRows = [line];
      let next = i + 2;
      while (next < lines.length && lines[next].includes("|") && lines[next].trim()) {
        tableRows.push(lines[next]);
        next += 1;
      }
      i = next - 1;
      const toCells = (row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const headers = toCells(tableRows[0]);
      const rows = tableRows.slice(1).map(toCells);
      chunks.push(`<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell, sourceFile)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell, sourceFile)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    flushList();
    chunks.push(`<p>${inlineMarkdown(line, sourceFile)}</p>`);
  }
  flushList();
  if (inCode !== null) chunks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  return chunks.join("\n");
}

export function pageShell({ title, description, canonical, body, structuredData = null, noIndex = false }) {
  const robots = noIndex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow" />';
  const jsonLd = structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#6366f1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    ${robots}
    ${jsonLd}
    <link rel="stylesheet" href="/seo.css" />
  </head>
  <body>
    <header class="public-header">
      <div class="public-header-inner">
        <a class="public-brand" href="/">API Mockly</a>
        <nav class="public-nav" aria-label="Public">
          <a href="/">App</a>
          <a href="/docs/">Documentation</a>
          <a href="/use-cases/frontend-development/">Frontend testing</a>
        </nav>
      </div>
    </header>
    <main class="public-main">${body}</main>
  </body>
</html>
`;
}

function publicUrl(baseUrl, route) {
  return `${baseUrl}${route === "/" ? "/" : route}`;
}

function writePage(distRoot, route, html) {
  const target = route === "/"
    ? join(distRoot, "index.html")
    : join(distRoot, route.replace(/^\/|\/$/g, ""), "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isFile() && name.endsWith(".md"))
    .map((name) => join(dir, name));
}

function routeForDoc(sourceFile) {
  const relativePath = relative(docsDir, sourceFile).replace(/\\/g, "/").replace(/\.md$/, "");
  return `/docs/${relativePath}/`;
}

export function generateSeo(distRoot = distDir) {
  if (!existsSync(distRoot)) throw new Error(`Frontend build output does not exist: ${distRoot}`);

  const baseUrl = resolvePublicBaseUrl();
  const sitemapRoutes = ["/"];

  const useCases = [
    {
      slug: "frontend-development",
      title: "API Mocking for Frontend Development",
      description: "Create hosted mock APIs for frontend development, UI prototypes, and component testing.",
      intro: "Build frontend experiences without waiting for a backend by creating deterministic mock APIs from chat prompts.",
      benefits: ["Match exact HTTP methods and paths", "Test success and error states", "Share live mock URLs with your team"],
    },
    {
      slug: "api-testing",
      title: "API Mocking for Automated Testing",
      description: "Use hosted mock API endpoints to test integrations, error handling, and HTTP status flows.",
      intro: "Create predictable HTTP responses for integration testing and exploratory API workflows.",
      benefits: ["Test custom status codes", "Verify exact method and path matching", "Call mocks from scripts and test suites"],
    },
    {
      slug: "rapid-prototyping",
      title: "Rapid API Mocking for Prototypes",
      description: "Prototype API-backed products quickly with hosted JSON responses and no backend setup.",
      intro: "Describe a mock API in plain language and get a hosted endpoint for demos, prototypes, and discovery sessions.",
      benefits: ["Create mocks in seconds", "Use plain-language chat prompts", "Keep useful mocks with a free account"],
    },
  ];

  for (const useCase of useCases) {
    const route = `/use-cases/${useCase.slug}/`;
    sitemapRoutes.push(route);
    const cards = useCase.benefits.map((benefit) => `<section class="seo-card"><h2>${escapeHtml(benefit)}</h2><p>Designed for a faster and more predictable API development workflow.</p></section>`).join("");
    writePage(distRoot, route, pageShell({
      title: `${useCase.title} | API Mockly`,
      description: useCase.description,
      canonical: publicUrl(baseUrl, route),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: useCase.title,
        description: useCase.description,
        url: publicUrl(baseUrl, route),
      },
      body: `<article class="public-page">
        <h1>${escapeHtml(useCase.title)}</h1>
        <p>${escapeHtml(useCase.intro)}</p>
        <div class="seo-grid">${cards}</div>
        <p class="seo-actions"><a class="seo-button" href="/#chat">Create a mock API</a><a class="seo-button secondary" href="/docs/">Read the documentation</a></p>
      </article>`,
    }));
  }

  const categories = ["tutorials", "how-to", "reference", "explanation"];
  const docsPages = [];
  const categoryDescriptions = {
    tutorials: "Learning-oriented API Mockly tutorials.",
    "how-to": "Task-focused API Mockly guides.",
    reference: "Exact API Mockly reference information.",
    explanation: "Conceptual explanations of API Mockly behavior.",
  };

  for (const category of categories) {
    const categoryDir = join(docsDir, category);
    const categoryRoute = `/docs/${category}/`;
    sitemapRoutes.push(categoryRoute);
    const files = listMarkdownFiles(categoryDir);
    const links = files.map((file) => {
      const markdown = readFileSync(file, "utf8");
      const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? basename(file).replace(/[-.]/g, " ");
      const route = routeForDoc(file);
      docsPages.push({ file, route });
      sitemapRoutes.push(route);
      return `<li><a href="${route}">${escapeHtml(title)}</a></li>`;
    }).join("");

    writePage(distRoot, categoryRoute, pageShell({
      title: `${category.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase())} | API Mockly Docs`,
      description: categoryDescriptions[category],
      canonical: publicUrl(baseUrl, categoryRoute),
      body: `<article class="public-page"><h1>${escapeHtml(category.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase()))}</h1><p>${escapeHtml(categoryDescriptions[category])}</p><ul>${links}</ul></article>`,
    }));
  }

  sitemapRoutes.push("/docs/");
  const docsIndexLinks = categories.map((category) =>
    `<li><a href="/docs/${category}/">${escapeHtml(category.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase()))}</a></li>`,
  ).join("");
  writePage(distRoot, "/docs/", pageShell({
    title: "API Mockly Documentation",
    description: "Tutorials, how-to guides, reference documentation, and explanations for API Mockly.",
    canonical: publicUrl(baseUrl, "/docs/"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "API Mockly Documentation",
      description: "Tutorials, how-to guides, reference documentation, and explanations for API Mockly.",
      url: publicUrl(baseUrl, "/docs/"),
    },
    body: `<article class="public-page"><h1>API Mockly documentation</h1><p>Use these guides to create, serve, secure, configure, and understand mock APIs.</p><ul>${docsIndexLinks}</ul></article>`,
  }));

  for (const docsPage of docsPages) {
    const markdown = readFileSync(docsPage.file, "utf8");
    const sourceFile = relative(docsDir, docsPage.file).replace(/\\/g, "/");
    const heading = markdown.match(/^#\s+(.+)$/m)?.[1] ?? "API Mockly documentation";
    const firstParagraph = markdown
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) =>
        block &&
        !block.startsWith("#") &&
        !block.startsWith("```") &&
        !block.startsWith("|") &&
        !block.startsWith("- ") &&
        !block.startsWith("* ") &&
        !/^\d+[.)]\s/.test(block),
      );
    const description = firstParagraph
      ? firstParagraph.replace(/[#*_`<>]/g, "").replace(/\s+/g, " ").slice(0, 160)
      : "API Mockly documentation.";
    writePage(distRoot, docsPage.route, pageShell({
      title: `${heading} | API Mockly`,
      description,
      canonical: publicUrl(baseUrl, docsPage.route),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: heading,
        description,
        url: publicUrl(baseUrl, docsPage.route),
      },
      body: `<article class="public-page">${markdownToHtml(markdown, sourceFile)}</article>`,
    }));
  }

  const indexFile = join(distRoot, "index.html");
  if (!existsSync(indexFile)) throw new Error("Vite build did not produce dist/index.html");
  let indexHtml = readFileSync(indexFile, "utf8");
  indexHtml = withSeoHead(indexHtml, {
    title: "API Mockly - Mock your APIs faster",
    description: "Describe an API in a chat and get a hosted mock endpoint for frontend development, testing, and rapid prototypes.",
    canonical: publicUrl(baseUrl, "/"),
  }, {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "API Mockly",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Describe an API in a chat and get a hosted mock endpoint.",
    url: publicUrl(baseUrl, "/"),
  });
  indexHtml = indexHtml.replace(
    '<div id="root"></div>',
    `<div id="root">
      <main class="seo-fallback">
        <section class="seo-hero">
          <h1>Mock APIs faster</h1>
          <p>Describe an API in chat and get a hosted endpoint for frontend development, testing, and rapid prototypes.</p>
          <div class="seo-actions">
            <a class="seo-button" href="#chat">Create a mock API</a>
            <a class="seo-button secondary" href="/docs/">Read the documentation</a>
          </div>
        </section>
        <div class="seo-grid">
          <section class="seo-card"><h2>Frontend development</h2><p>Keep building UI and components while a real backend is unavailable.</p><a href="/use-cases/frontend-development/">Explore frontend mock APIs</a></section>
          <section class="seo-card"><h2>API testing</h2><p>Create exact method and path responses for integration and error-state testing.</p><a href="/use-cases/api-testing/">Explore API testing mocks</a></section>
          <section class="seo-card"><h2>Rapid prototyping</h2><p>Turn plain-language API descriptions into shareable hosted endpoints.</p><a href="/use-cases/rapid-prototyping/">Explore rapid prototyping</a></section>
        </div>
      </main>
    </div>`,
  );
  writeFileSync(indexFile, indexHtml);

  for (const appRoute of ["login", "signup", "mocks"]) {
    const appHtml = withSeoHead(indexHtml, {
      title: `${appRoute === "mocks" ? "My mocks" : appRoute === "login" ? "Log in" : "Sign up"} | API Mockly`,
      description: "API Mockly account application.",
      canonical: publicUrl(baseUrl, `/${appRoute}/`),
    }, null, true);
    appHtml.replaceAll('<div id="root">', '<div id="root">');
    writePage(distRoot, `/${appRoute}/`, appHtml);
  }

  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /m/",
    "Disallow: /login/",
    "Disallow: /signup/",
    "Disallow: /mocks/",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");
  writeFileSync(join(distRoot, "robots.txt"), robots);

  const uniqueRoutes = [...new Set(sitemapRoutes)].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes.map((route) => `  <url><loc>${escapeHtml(publicUrl(baseUrl, route))}</loc></url>`).join("\n")}
</urlset>
`;
  writeFileSync(join(distRoot, "sitemap.xml"), sitemap);

  return { baseUrl, sitemapRoutes: uniqueRoutes };
}

export function withSeoHead(html, metadata, structuredData = null, noIndex = false) {
  let updated = html.replace(/\s*<title>[^<]*<\/title>/i, "");
  updated = updated.replace(/\s*<meta\s+name="description"[^>]*>/gi, "");
  updated = updated.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "");
  updated = updated.replace(/\s*<meta\s+property="og:[^"]+"[^>]*>/gi, "");
  updated = updated.replace(/\s*<meta\s+name="robots"[^>]*>/gi, "");
  updated = updated.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  const robots = noIndex ? "noindex, follow" : "index, follow";
  const jsonLd = structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : "";
  const headContent = `
    <title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <link rel="canonical" href="${escapeHtml(metadata.canonical)}" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(metadata.canonical)}" />
    <meta name="robots" content="${robots}" />
    <link rel="stylesheet" href="/seo.css" />
    ${jsonLd}`;
  if (!updated.includes("</head>")) throw new Error("Generated HTML does not contain </head>");
  return updated.replace("</head>", `${headContent}\n  </head>`);
}

function basename(file) {
  return file.split("/").at(-1);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = generateSeo();
  console.log(`SEO assets generated for ${result.baseUrl}: ${result.sitemapRoutes.length} indexed routes`);
}
