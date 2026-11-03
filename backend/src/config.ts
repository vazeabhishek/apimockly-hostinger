export interface Config {
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

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const sessionSecret = env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 16) {
    throw new Error("SESSION_SECRET must be set (at least 16 characters)");
  }
  return {
    port: num(env.PORT, 3000),
    publicBaseUrl: (env.PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
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
