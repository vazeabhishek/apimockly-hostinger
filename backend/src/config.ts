import { existsSync } from "node:fs";

export type Profile = "development" | "production";
const PROFILES: Profile[] = ["development", "production"];

export interface Config {
  profile: Profile;
  port: number;
  publicBaseUrl: string;
  sessionSecret: string;
  maxBodyBytes: number;
  createRatePerMin: number;
  serveRatePerMin: number;
  anonCapPerIp: number;
  anonTtlHours: number;
  cleanupCron: string;
  trustProxy: boolean;
  staticDir?: string;
  databaseUrl: string;
}

const num = (v: string | undefined, d: number) => (v ? Number(v) : d);

export function parseProfile(v: string | undefined): Profile {
  const p = v || "development";
  if (!PROFILES.includes(p as Profile)) {
    throw new Error(`APP_PROFILE must be one of: ${PROFILES.join(", ")} (got "${p}")`);
  }
  return p as Profile;
}

// Node's loadEnvFile never overrides variables that are already set.
export function loadEnvFiles(env: NodeJS.ProcessEnv = process.env, dir = process.cwd()): Profile {
  const profile = parseProfile(env.APP_PROFILE);
  for (const f of [`.env.${profile}`, ".env"]) {
    const path = `${dir}/${f}`;
    if (existsSync(path)) process.loadEnvFile(path);
  }
  return parseProfile(env.APP_PROFILE);
}

const LOOPBACK = /^(localhost|0\.0\.0\.0|\[?::1?\]?|127(\.\d{1,3}){3})$/i;

function resolveBaseUrl(profile: Profile, raw: string | undefined, port: number): string {
  if (!raw) {
    if (profile === "production") {
      throw new Error("PUBLIC_BASE_URL must be set when APP_PROFILE=production");
    }
    return `http://localhost:${port}`;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`PUBLIC_BASE_URL is not a valid absolute URL: "${raw}"`);
  }
  if (profile === "production") {
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("PUBLIC_BASE_URL must use http or https");
    }
    if (LOOPBACK.test(url.hostname)) {
      throw new Error(`PUBLIC_BASE_URL must not point at localhost when APP_PROFILE=production (got "${raw}")`);
    }
  }
  return raw.replace(/\/$/, "");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const sessionSecret = env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 16) {
    throw new Error("SESSION_SECRET must be set (at least 16 characters)");
  }
  const profile = parseProfile(env.APP_PROFILE);
  const port = num(env.PORT, 3000);
  return {
    profile,
    port,
    publicBaseUrl: resolveBaseUrl(profile, env.PUBLIC_BASE_URL, port),
    sessionSecret,
    maxBodyBytes: num(env.MAX_BODY_BYTES, 10 * 1024),
    createRatePerMin: num(env.CREATE_RATE_PER_MIN, 10),
    serveRatePerMin: num(env.SERVE_RATE_PER_MIN, 120),
    anonCapPerIp: num(env.ANON_CAP_PER_IP, 5),
    anonTtlHours: num(env.ANON_TTL_HOURS, 24),
    cleanupCron: env.CLEANUP_CRON ?? "0 * * * *",
    trustProxy: env.TRUST_PROXY === "true",
    staticDir: env.STATIC_DIR,
    databaseUrl: env.DATABASE_URL ?? "mysql://apimocker:apimocker@localhost:3306/apimocker",
  };
}
