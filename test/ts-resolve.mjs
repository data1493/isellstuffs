import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function fileFor(base) {
  const options = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const file of options) {
    if (!existsSync(file)) continue;
    if (statSync(file).isFile()) return pathToFileURL(file).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  const parent = context.parentURL;
  if (parent && (specifier.startsWith("@/") || specifier.startsWith("./") || specifier.startsWith("../"))) {
    const base = specifier.startsWith("@/")
      ? path.join(root, "src", specifier.slice(2))
      : path.resolve(path.dirname(fileURLToPath(parent)), specifier);
    const resolved = fileFor(base);
    if (resolved) return nextResolve(resolved, context);
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      error &&
      error.code === "ERR_MODULE_NOT_FOUND" &&
      !specifier.startsWith(".") &&
      !specifier.startsWith("node:") &&
      !specifier.endsWith(".js")
    ) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw error;
  }
}
