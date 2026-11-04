// CommonJS entry for hosts (e.g. LiteSpeed lsnode) that require() the entry file.
const path = require("node:path");

process.env.STATIC_DIR ||= path.resolve(__dirname, "../frontend/dist");

import("./dist/server.js").catch((err) => {
  console.error(err);
  process.exit(1);
});
