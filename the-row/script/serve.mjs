import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, extname, join as pathJoin, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { hardenBook } from "../js/accounts.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";
import { handleRow, isApi, readCookie } from "../js/row-http.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dest = process.env.ROW_LIVE || pathJoin(root, "live.json");
const tmp = `${dest}.tmp`;
const accountsPath = process.env.ROW_ACCOUNTS || pathJoin(root, "..", ".data", "row-accounts.json");
const accountsTmp = `${accountsPath}.tmp`;
const host = process.env.ROW_HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4480);
const crowd = process.env.ROW_CROWD === "1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webp": "image/webp",
};

async function publish(state) {
  await writeFile(tmp, JSON.stringify(state));
  await rename(tmp, dest);
}

async function saveBook(book) {
  await mkdir(dirname(accountsPath), { recursive: true });
  await writeFile(accountsTmp, JSON.stringify(book));
  await rename(accountsTmp, accountsPath);
}

const store = createMemoryStore({
  crowd,
  onBook: saveBook,
  onLive: publish,
});

function send(res, result) {
  if (result.text != null) {
    res.writeHead(result.status, { "content-type": "text/plain; charset=utf-8" });
    res.end(result.text);
    return;
  }
  const json = JSON.stringify(result.json);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(json),
  };
  if (result.cookie) headers["set-cookie"] = result.cookie;
  res.writeHead(result.status, headers);
  res.end(json);
}

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function secureRequest(req) {
  return process.env.ROW_SECURE === "1" || req.headers["x-forwarded-proto"] === "https";
}

async function loadBook() {
  try {
    const raw = JSON.parse(await readFile(accountsPath, "utf8"));
    store.replaceBook(raw);
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
    store.replaceBook({ users: [], sessions: [] });
  }
  await store.transact(({ book, saveBook: keep }) => {
    if (hardenBook(book)) keep(book);
  });
}

function filePath(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  const relative = (clean === "/" ? "index.html" : clean).replace(/^\/+/, "");
  if (!relative || relative.split("/").includes("..")) return null;
  const full = normalize(pathJoin(root, relative));
  const base = root.endsWith("/") ? root : `${root}/`;
  if (full !== root && !full.startsWith(base)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (isApi(url.pathname, req.method || "GET")) {
      const result = await handleRow({
        method: req.method || "GET",
        pathname: url.pathname,
        token: readCookie(req.headers.cookie || ""),
        secure: secureRequest(req),
        bodyText: req.method === "POST" ? await readRaw(req) : "",
        store,
        crowd,
      });
      send(res, result);
      return;
    }
    if (url.pathname === "/favicon.ico" || url.pathname === "/favicon.svg") {
      const icon = await readFile(pathJoin(root, "favicon.svg"));
      res.writeHead(200, { "content-type": "image/svg+xml", "cache-control": "no-store" });
      res.end(icon);
      return;
    }
    const path = filePath(url.pathname);
    if (!path) {
      res.writeHead(403);
      res.end();
      return;
    }
    const file = await readFile(path);
    const type = types[extname(path).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    res.end(file);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Down");
  }
});

await publish(store.getLive().state);
await loadBook();
server.listen(port, host, () => {
  console.log(`row ready: ${store.getLive().state.people.length} in on http://${host}:${port}/`);
});

async function loop() {
  try {
    await store.tick(Date.now());
  } catch (error) {
    console.error(error);
  }
  setTimeout(loop, 2400);
}

if (crowd) setTimeout(loop, 2400);
