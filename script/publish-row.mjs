import { access, cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

const repo = fileURLToPath(new URL("..", import.meta.url));
const source = join(repo, "the-row");
const dest = join(repo, "row-site");
const skip = new Set([
  "api",
  "node_modules",
  "script",
  "test",
  "package.json",
  "package-lock.json",
  "vercel.json",
  ".env",
  ".env.example",
  "live.json",
  "live.json.tmp",
]);

const rowConfig = JSON.parse(await readFile(join(source, "vercel.json"), "utf8"));
const rootConfig = JSON.parse(await readFile(join(repo, "vercel.json"), "utf8"));
const rowRoutes = JSON.stringify({ rewrites: rowConfig.rewrites, headers: rowConfig.headers });
const rootRoutes = JSON.stringify({ rewrites: rootConfig.rewrites, headers: rootConfig.headers });
if (rowRoutes !== rootRoutes) {
  throw new Error("Root vercel.json rewrites and headers must match the-row/vercel.json.");
}

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });

for (const name of await readdir(source)) {
  if (skip.has(name) || name.startsWith(".")) continue;
  await cp(join(source, name), join(dest, name), { recursive: true });
}

const index = await readFile(join(dest, "index.html"), "utf8");
if (!index.includes("<title>The Row</title>")) {
  throw new Error("The Row index was not published.");
}
await readFile(join(dest, "favicon.svg"));
await readFile(join(dest, "js", "room.mjs"));
await readFile(join(dest, "pile.html"));
if (await exists(join(dest, "api", "row.mjs"))) {
  throw new Error("The Blob function source must stay out of the static site.");
}

console.log("published The Row to row-site/");
