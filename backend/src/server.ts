import { loadConfig, loadEnvFiles } from "./config.js";
import { buildApp } from "./app.js";
import { createPool, MysqlRepo } from "./mysqlRepo.js";
import { createAnalytics } from "./analytics.js";
import { scheduleCleanup } from "./cleanup.js";

loadEnvFiles();
const config = loadConfig();
const repo = new MysqlRepo(createPool(config.databaseUrl));
const analytics = createAnalytics({
  measurementId: config.gaMeasurementId,
  apiSecret: config.gaApiSecret,
  log: (m) => console.warn(m),
});
const app = buildApp(repo, config, () => new Date(), analytics);
app.addHook("onClose", async () => analytics.close());

scheduleCleanup(repo, config.cleanupCron, (m) => console.log(m), analytics);
await app.listen({ port: config.port, host: "0.0.0.0" });
