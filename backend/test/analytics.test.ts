import { describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { createAnalytics, noopAnalytics } from "../src/analytics.js";
import { loadConfig } from "../src/config.js";
import { MemoryRepo } from "../src/memoryRepo.js";

const base = { SESSION_SECRET: "test-secret-test-secret", CREATE_RATE_PER_MIN: "50" };

describe("analytics config", () => {
  it("rejects a malformed measurement id", () => {
    expect(() => loadConfig({ ...base, GA_MEASUREMENT_ID: "UA-123" })).toThrow(/GA_MEASUREMENT_ID/);
  });
  it("accepts id without secret", () => {
    const c = loadConfig({ ...base, GA_MEASUREMENT_ID: "G-ABC123" });
    expect(c.gaMeasurementId).toBe("G-ABC123");
    expect(c.gaApiSecret).toBeUndefined();
  });
});

describe("sender", () => {
  it("is a no-op without id and secret", () => {
    expect(createAnalytics({ measurementId: "G-ABC" })).toBe(noopAnalytics);
  });
  it("swallows delivery failures", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("down"));
    const log = vi.fn();
    const a = createAnalytics({ measurementId: "G-ABC", apiSecret: "s", fetchFn, log });
    a.track("x");
    await expect(a.close()).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
  });
});

describe("events from routes", () => {
  it("emits events without PII and responses are unaffected", async () => {
    const events: { name: string; params?: object }[] = [];
    const analytics = { track: (name: string, params?: object) => void events.push({ name, params }), flush: async () => {}, close: async () => {} };
    const a = buildApp(new MemoryRepo(), loadConfig(base), () => new Date("2026-01-01T00:00:00Z"), analytics);

    const chat = await a.inject({ method: "POST", url: "/api/chat", payload: { message: 'setup a mock api GET /a which returns {"v":1}' } });
    const { mock } = chat.json();
    await a.inject({ method: "GET", url: `/m/${mock.id}/a` });
    await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "me@example.com", password: "password123" } });

    const names = events.map((e) => e.name);
    expect(names).toEqual(["mock_created", "mock_served", "user_registered"]);
    expect(events[1].params).toEqual({ method: "GET", status_class: "2xx" });
    expect(JSON.stringify(events)).not.toMatch(/example\.com|127\.0\.0\.1|password/);
  });
});
