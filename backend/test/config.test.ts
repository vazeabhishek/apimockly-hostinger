import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, loadEnvFiles } from "../src/config.js";

const base = { SESSION_SECRET: "test-secret-test-secret" };

describe("profiles and public base URL", () => {
  it("defaults to development with localhost on PORT", () => {
    const c = loadConfig({ ...base, PORT: "4000" });
    expect(c.profile).toBe("development");
    expect(c.publicBaseUrl).toBe("http://localhost:4000");
  });

  it("rejects unknown profiles", () => {
    expect(() => loadConfig({ ...base, APP_PROFILE: "staging" })).toThrow(/development, production/);
  });

  it("requires PUBLIC_BASE_URL in production", () => {
    expect(() => loadConfig({ ...base, APP_PROFILE: "production" })).toThrow(/PUBLIC_BASE_URL/);
  });

  it.each(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000", "http://0.0.0.0"])(
    "rejects loopback %s in production",
    (url) => {
      expect(() => loadConfig({ ...base, APP_PROFILE: "production", PUBLIC_BASE_URL: url })).toThrow(/localhost/);
    },
  );

  it("accepts a real production URL and strips the trailing slash", () => {
    const c = loadConfig({ ...base, APP_PROFILE: "production", PUBLIC_BASE_URL: "https://mock.example.com/" });
    expect(c.publicBaseUrl).toBe("https://mock.example.com");
  });
});

describe("loadEnvFiles", () => {
  it("loads the profile file but never overrides the environment", () => {
    const dir = mkdtempSync(join(tmpdir(), "cfg-"));
    writeFileSync(join(dir, ".env.production"), "PUBLIC_BASE_URL=https://file.example.com\nOTHER=file\n");
    const prev = { ...process.env };
    try {
      process.env.APP_PROFILE = "production";
      process.env.OTHER = "env";
      delete process.env.PUBLIC_BASE_URL;
      loadEnvFiles(process.env, dir);
      expect(process.env.PUBLIC_BASE_URL).toBe("https://file.example.com");
      expect(process.env.OTHER).toBe("env");
    } finally {
      for (const k of Object.keys(process.env)) if (!(k in prev)) delete process.env[k];
      Object.assign(process.env, prev);
    }
  });
});
