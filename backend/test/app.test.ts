import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { MemoryRepo } from "../src/memoryRepo.js";
import { runCleanup } from "../src/cleanup.js";

const config = loadConfig({ SESSION_SECRET: "test-secret-test-secret", ANON_CAP_PER_IP: "2", CREATE_RATE_PER_MIN: "50" });

let repo: MemoryRepo;
let clock: Date;
const app = () => buildApp(repo, config, () => clock);

beforeEach(() => {
  repo = new MemoryRepo();
  clock = new Date("2026-01-01T00:00:00Z");
});

async function create(a: ReturnType<typeof buildApp>, message: string, cookies?: Record<string, string>) {
  return a.inject({ method: "POST", url: "/api/chat", payload: { message }, cookies });
}

describe("chat + serving", () => {
  it("creates a mock and serves it by exact method and path", async () => {
    const a = app();
    const res = await create(a, 'setup a mock api GET /integer/30 which returns {"value":30}');
    expect(res.statusCode).toBe(200);
    const { mock } = res.json();
    expect(mock.url).toBe(`http://localhost:3000/m/${mock.id}/integer/30`);
    expect(new Date(mock.expiresAt).getTime() - clock.getTime()).toBe(24 * 3600_000);

    const ok = await a.inject({ method: "GET", url: `/m/${mock.id}/integer/30` });
    expect(ok.statusCode).toBe(200);
    expect(ok.headers["content-type"]).toContain("application/json");
    expect(ok.headers["x-content-type-options"]).toBe("nosniff");
    expect(ok.headers["content-security-policy"]).toBe("sandbox");
    expect(ok.json()).toEqual({ value: 30 });

    expect((await a.inject({ method: "POST", url: `/m/${mock.id}/integer/30`, payload: "x", headers: { "content-type": "text/plain" } })).statusCode).toBe(404);
    expect((await a.inject({ method: "GET", url: `/m/${mock.id}/integer/31` })).statusCode).toBe(404);
    expect((await a.inject({ method: "GET", url: `/m/unknown/integer/30` })).statusCode).toBe(404);
  });

  it("honours custom status", async () => {
    const a = app();
    const { mock } = (await create(a, 'POST /o returns {"e":1} with status 422')).json();
    const r = await a.inject({ method: "POST", url: `/m/${mock.id}/o`, payload: { any: 1 } });
    expect(r.statusCode).toBe(422);
  });

  it("returns 400 with guidance for bad input", async () => {
    const res = await create(app(), "GET /a returns nope");
    expect(res.statusCode).toBe(400);
    expect(res.json().reply).toContain("JSON");
  });

  it("404s expired mocks before cleanup, then cleanup deletes them", async () => {
    const a = app();
    const { mock } = (await create(a, 'GET /a returns {"a":1}')).json();
    clock = new Date(clock.getTime() + 25 * 3600_000);
    expect((await a.inject({ method: "GET", url: `/m/${mock.id}/a` })).statusCode).toBe(404);
    expect(await runCleanup(repo, clock)).toBe(1);
    expect(repo.mocks.size).toBe(0);
  });

  it("cleanup leaves owned and unexpired mocks", async () => {
    const a = app();
    await create(a, 'GET /a returns {"a":1}');
    const s = await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "u@x.io", password: "password1" } });
    const cookies = { sid: s.cookies[0].value };
    await create(a, 'GET /b returns {"b":1}', cookies);
    clock = new Date(clock.getTime() + 25 * 3600_000);
    expect(await runCleanup(repo, clock)).toBe(1);
    expect(repo.mocks.size).toBe(1);
  });

  it("skips cleanup when another instance holds the lock", async () => {
    let inner: number | null = -1;
    await repo.withLock("apimocker_cleanup", async () => {
      inner = await runCleanup(repo, clock);
    });
    expect(inner).toBeNull();
  });

  it("caps anonymous mocks per IP", async () => {
    const a = app();
    await create(a, "GET /a returns {}");
    await create(a, "GET /b returns {}");
    const res = await create(a, "GET /c returns {}");
    expect(res.statusCode).toBe(429);
  });

  it("rate limits creation", async () => {
    const a = buildApp(repo, { ...config, createRatePerMin: 1, anonCapPerIp: 100 }, () => clock);
    await create(a, "GET /a returns {}");
    expect((await create(a, "GET /b returns {}")).statusCode).toBe(429);
  });

  it("rejects oversized bodies", async () => {
    const a = buildApp(repo, { ...config, maxBodyBytes: 20 }, () => clock);
    const res = await create(a, 'GET /a returns {"a":"' + "x".repeat(40) + '"}');
    expect(res.statusCode).toBe(400);
    expect(repo.mocks.size).toBe(0);
  });
});

describe("accounts", () => {
  it("claims the mock on sign-up and makes it permanent", async () => {
    const a = app();
    const { mock } = (await create(a, 'GET /a returns {"a":1}')).json();
    const s = await a.inject({
      method: "POST",
      url: "/api/auth/signup",
      payload: { email: "U@x.io", password: "password1", claimMockId: mock.id },
    });
    expect(s.json()).toEqual({ user: { email: "u@x.io" }, claimed: true });
    expect(repo.mocks.get(mock.id)).toMatchObject({ ownerId: 1, expiresAt: null });

    const list = await a.inject({ method: "GET", url: "/api/mocks", cookies: { sid: s.cookies[0].value } });
    expect(list.json().mocks).toHaveLength(1);
  });

  it("does not claim expired or already-owned mocks", async () => {
    const a = app();
    const { mock } = (await create(a, 'GET /a returns {"a":1}')).json();
    await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "a@x.io", password: "password1", claimMockId: mock.id } });
    const second = await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "b@x.io", password: "password1", claimMockId: mock.id } });
    expect(second.json().claimed).toBe(false);

    const { mock: m2 } = (await create(a, 'GET /b returns {"a":1}')).json();
    clock = new Date(clock.getTime() + 25 * 3600_000);
    const third = await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "c@x.io", password: "password1", claimMockId: m2.id } });
    expect(third.json().claimed).toBe(false);
  });

  it("rejects duplicate email, weak password, bad login; lists only own mocks", async () => {
    const a = app();
    const body = { email: "a@x.io", password: "password1" };
    const s1 = await a.inject({ method: "POST", url: "/api/auth/signup", payload: body });
    expect((await a.inject({ method: "POST", url: "/api/auth/signup", payload: body })).statusCode).toBe(409);
    expect((await a.inject({ method: "POST", url: "/api/auth/signup", payload: { email: "z@x.io", password: "short" } })).statusCode).toBe(400);
    expect((await a.inject({ method: "POST", url: "/api/auth/login", payload: { ...body, password: "wrongpass1" } })).statusCode).toBe(401);
    expect((await a.inject({ method: "POST", url: "/api/auth/login", payload: body })).statusCode).toBe(200);
    expect((await a.inject({ method: "GET", url: "/api/mocks" })).statusCode).toBe(401);

    const cookies = { sid: s1.cookies[0].value };
    await create(a, "GET /a returns {}", cookies);
    await create(a, "GET /b returns {}");
    expect((await a.inject({ method: "GET", url: "/api/mocks", cookies })).json().mocks).toHaveLength(1);
  });

  it("ignores forged session cookies", async () => {
    const res = await app().inject({ method: "GET", url: "/api/mocks", cookies: { sid: "1" } });
    expect(res.statusCode).toBe(401);
  });
});
