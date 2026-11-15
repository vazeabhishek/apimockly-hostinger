import cron from "node-cron";
import type { Analytics } from "./analytics.js";
import type { Repo } from "./repo.js";

export const CLEANUP_LOCK = "apimocker_cleanup";

export async function runCleanup(
  repo: Repo,
  now: Date = new Date(),
  analytics?: Analytics,
): Promise<number | null> {
  let deleted = 0;
  const ran = await repo.withLock(CLEANUP_LOCK, async () => {
    deleted = await repo.deleteExpiredAnonymous(now);
  });
  if (ran && deleted > 0) analytics?.track("mock_expired", { count: deleted });
  return ran ? deleted : null;
}

export function scheduleCleanup(repo: Repo, expression: string, log: (msg: string) => void, analytics?: Analytics) {
  return cron.schedule(expression, async () => {
    try {
      const n = await runCleanup(repo, new Date(), analytics);
      if (n !== null) log(`cleanup removed ${n} expired anonymous mocks`);
    } catch (e) {
      log(`cleanup failed: ${(e as Error).message}`);
    }
  });
}
