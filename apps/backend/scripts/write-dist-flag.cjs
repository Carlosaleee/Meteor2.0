const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "dist");
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify({ type: "commonjs" }, null, 2) + "\n");
