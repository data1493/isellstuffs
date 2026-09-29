import { createServer } from "node:http";
import { readFile, rename, writeFile } from "node:fs/promises";
import { extname, join as pathJoin, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { crowdBeat, fillRoom } from "../js/crowd.mjs";
import { act, enqueue, handleKey, join, linePlace, runItBack, stepOut } from "../js/room.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dest = pathJoin(root, "live.json");
const tmp = pathJoin(root, "live.json.tmp");
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
  ".webp": "image/webp",
};

let state = fillRoom();
let beat = 0;

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(json),
  });
  res.end(json);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  return JSON.parse(text);
}

function clearYou(next) {
  next.you = null;
  return next;
}

function applyPost(path, body) {
  if (path === "/queue") {
    const handle = handleKey(body.handle);
    const link = String(body.link || `https://${handle}.room`).slice(0, 64);
    let next = state;
    if (!next.people.some((person) => person.handle === handle)) {
      const joined = join(next, { handle, link });
      if (!joined.ok) return joined;
      next = clearYou(joined.state);
    }
    const queued = enqueue(next, { handle, link, game: body.game, at: Date.now() });
    if (queued.ok) clearYou(queued.state);
    return queued;
  }
  if (path === "/again") {
    const result = body.stay === false ? stepOut(state, body.handle) : runItBack(state, body.handle);
    if (result.ok) clearYou(result.state);
    return result;
  }
  const result = act(state, body);
  if (result.ok) clearYou(result.state);
  return result;
}

async function publish(next) {
  await writeFile(tmp, JSON.stringify(next));
  await rename(tmp, dest);
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
    if (req.method === "POST" && (url.pathname === "/queue" || url.pathname === "/act" || url.pathname === "/again")) {
      let body = {};
      try {
        body = await readBody(req);
      } catch {
        send(res, 400, { ok: false, error: "Bad request." });
        return;
      }
      const result = applyPost(url.pathname, body);
      if (result.ok) {
        state = result.state;
        await publish(state);
      }
      send(res, result.ok ? 200 : 400, {
        ok: result.ok,
        error: result.error || null,
        place: linePlace(state, body.handle),
        call: state.call || null,
      });
      return;
    }
    if (url.pathname === "/live.json") {
      send(res, 200, state);
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

await publish(state);
server.listen(4480, "127.0.0.1", () => {
  console.log(`row ready: ${state.people.length} in on http://127.0.0.1:4480/`);
});

async function loop() {
  try {
    const stepped = crowdBeat(state, beat, Date.now());
    state = stepped.state;
    beat = stepped.beat;
    await publish(state);
  } catch (error) {
    console.error(error);
  }
  setTimeout(loop, 2400);
}

setTimeout(loop, 2400);
