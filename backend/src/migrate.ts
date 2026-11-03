import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createPool } from "./mysqlRepo.js";
import { loadEnvFiles } from "./config.js";

loadEnvFiles();

const dir = fileURLToPath(new URL("./migrations/", import.meta.url));
const pool = createPool(process.env.DATABASE_URL ?? "mysql://apimocker:apimocker@localhost:3306/apimocker");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  await pool.query(await readFile(dir + f, "utf8"));
  console.log(`applied ${f}`);
}
await pool.end();
