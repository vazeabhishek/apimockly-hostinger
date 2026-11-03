import cron from "node-cron";
import type { Repo } from "./repo.js";

export const CLEANUP_LOCK = "apimocker_cleanup";

export async function runCleanup(repo: Repo, now: Date = new Date()): Promise<number | null> {
  let deleted = 0;
  const ran = await repo.withLock(CLEANUP_LOCK, async () => {
    deleted = await repo.deleteExpiredAnonymous(now);
  });
  return ran ? deleted : null;
}

export function scheduleCleanup(repo: Repo, expression: string, log: (msg: string) => void) {
  return cron.schedule(expression, async () => {
    try {
      const n = await runCleanup(repo);
      if (n !== null) log(`cleanup removed ${n} expired anonymous mocks`);
    } catch (e) {
      log(`cleanup failed: ${(e as Error).message}`);
    }
  });
}
