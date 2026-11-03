import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import type { Config } from "./config.js";
import type { Mock, Repo, User } from "./repo.js";
import { parseMockPhrase, SAMPLE_PROMPTS } from "./parser.js";
import { hashIp, hashPassword, newMockId, verifyPassword } from "./security.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildApp(repo: Repo, config: Config, now: () => Date = () => new Date()): FastifyInstance {
  const app = Fastify({ trustProxy: config.trustProxy, bodyLimit: 16 * 1024 });
  const secure = config.publicBaseUrl.startsWith("https://");

  app.register(cookie, { secret: config.sessionSecret });
  app.register(rateLimit, { global: false });

  const currentUser = async (req: FastifyRequest): Promise<User | null> => {
    const raw = req.cookies.sid;
    if (!raw) return null;
    const un = req.unsignCookie(raw);
    if (!un.valid || !un.value) return null;
    return repo.findUserById(Number(un.value));
  };

  const publicMock = (m: Mock) => ({
    id: m.id,
    url: `${config.publicBaseUrl}/m/${m.id}${m.path}`,
    method: m.method,
    path: m.path,
    status: m.status,
    expiresAt: m.expiresAt,
  });

  const limit = (max: number) => ({ config: { rateLimit: { max, timeWindow: "1 minute" } } });

  app.register(async (api) => {
    api.get("/api/samples", async () => ({ prompts: SAMPLE_PROMPTS }));

    api.post<{ Body: { message?: unknown } }>("/api/chat", limit(config.createRatePerMin), async (req, reply) => {
      const message = req.body?.message;
      if (typeof message !== "string" || !message.trim()) {
        return reply.code(400).send({ ok: false, reply: "Please type a message." });
      }
      const parsed = parseMockPhrase(message, config.maxBodyBytes);
      if (!parsed.ok) return reply.code(400).send({ ok: false, reply: parsed.error });

      const user = await currentUser(req);
      const ipHash = hashIp(req.ip, config.sessionSecret);
      const t = now();

      if (!user && (await repo.countLiveAnonymousByIp(ipHash, t)) >= config.anonCapPerIp) {
        return reply.code(429).send({
          ok: false,
          reply: `You already have ${config.anonCapPerIp} active anonymous mocks. Sign up to create more, or wait for them to expire.`,
        });
      }

      const mock: Mock = {
        id: newMockId(),
        ...parsed.mock,
        ownerId: user?.id ?? null,
        expiresAt: user ? null : new Date(t.getTime() + config.anonTtlHours * 3600_000),
        creatorIpHash: ipHash,
        createdAt: t,
      };
      await repo.createMock(mock);

      const pm = publicMock(mock);
      const expiry = user
        ? "It is saved to your account."
        : `It will be deleted automatically after ${config.anonTtlHours} hours unless you sign up.`;
      return { ok: true, mock: pm, reply: `Your mock is live at ${pm.url}. ${expiry}` };
    });

    api.post<{ Body: { email?: unknown; password?: unknown; claimMockId?: unknown } }>(
      "/api/auth/signup",
      limit(config.createRatePerMin),
      async (req, reply) => {
        const { email, password, claimMockId } = req.body ?? {};
        if (typeof email !== "string" || !EMAIL.test(email) || email.length > 255) {
          return reply.code(400).send({ error: "Enter a valid email address." });
        }
        if (typeof password !== "string" || password.length < 8 || password.length > 200) {
          return reply.code(400).send({ error: "Password must be 8-200 characters." });
        }
        const user = await repo.createUser(email.toLowerCase(), hashPassword(password));
        if (!user) return reply.code(409).send({ error: "That email is already registered." });

        const claimed = typeof claimMockId === "string" ? await repo.claimMock(claimMockId, user.id, now()) : false;
        reply.setCookie("sid", String(user.id), { signed: true, httpOnly: true, sameSite: "lax", path: "/", secure });
        return { user: { email: user.email }, claimed };
      },
    );

    api.post<{ Body: { email?: unknown; password?: unknown } }>(
      "/api/auth/login",
      limit(config.createRatePerMin),
      async (req, reply) => {
        const { email, password } = req.body ?? {};
        const user = typeof email === "string" ? await repo.findUserByEmail(email.toLowerCase()) : null;
        if (!user || typeof password !== "string" || !verifyPassword(password, user.passwordHash)) {
          return reply.code(401).send({ error: "Invalid email or password." });
        }
        reply.setCookie("sid", String(user.id), { signed: true, httpOnly: true, sameSite: "lax", path: "/", secure });
        return { user: { email: user.email } };
      },
    );

    api.post("/api/auth/logout", async (_req, reply) => {
      reply.clearCookie("sid", { path: "/" });
      return { ok: true };
    });

    api.get("/api/auth/me", async (req) => {
      const user = await currentUser(req);
      return { user: user ? { email: user.email } : null };
    });

    api.get("/api/mocks", async (req, reply) => {
      const user = await currentUser(req);
      if (!user) return reply.code(401).send({ error: "Not signed in." });
      return { mocks: (await repo.listMocksByOwner(user.id)).map(publicMock) };
    });

    // Mock serving lives in its own scope so body parsing does not reject arbitrary client payloads.
    api.register(async (serving) => {
      serving.removeAllContentTypeParsers();
      serving.addContentTypeParser("*", { parseAs: "buffer", bodyLimit: 64 * 1024 }, (_req, _body, done) =>
        done(null, undefined),
      );

      serving.all<{ Params: { id: string; "*": string } }>(
        "/m/:id/*",
        limit(config.serveRatePerMin),
        async (req, reply) => {
          const path = "/" + req.params["*"];
          const mock = await repo.findMock(req.params.id);
          const live = mock && (mock.expiresAt === null || mock.expiresAt > now());
          reply
            .header("X-Content-Type-Options", "nosniff")
            .header("Content-Security-Policy", "sandbox")
            .header("Cache-Control", "no-store")
            .type("application/json");
          if (!mock || !live || mock.method !== req.method || mock.path !== path) {
            return reply.code(404).send({ error: "No mock matches this request." });
          }
          if (mock.status === 204 || mock.status === 304) return reply.code(mock.status).send();
          return reply.code(mock.status).send(mock.body);
        },
      );
    });
  });

  if (config.staticDir) app.register(fastifyStatic, { root: config.staticDir, wildcard: false });

  return app;
}
