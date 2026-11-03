import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";
import { createPool, MysqlRepo } from "./mysqlRepo.js";
import { scheduleCleanup } from "./cleanup.js";

const config = loadConfig();
const repo = new MysqlRepo(createPool(config.databaseUrl));
const app = buildApp(repo, config);

scheduleCleanup(repo, config.cleanupCron, (m) => console.log(m));
await app.listen({ port: config.port, host: "0.0.0.0" });
