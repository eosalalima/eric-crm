import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const expectedVersion = packageJson.devDependencies?.prisma;
let installedVersion;

try {
  installedVersion = require("prisma/package.json").version;
} catch {
  // The error below also covers a missing installation with one actionable fix.
}

if (!expectedVersion || installedVersion !== expectedVersion) {
  console.error(
    [
      "The installed Prisma CLI does not match this project.",
      `Expected: ${expectedVersion ?? "not declared"}`,
      `Installed: ${installedVersion ?? "not installed"}`,
      "Run `npm install` (or `npm ci` for a clean install) and try again.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Prisma CLI ${installedVersion} matches package.json.`);
