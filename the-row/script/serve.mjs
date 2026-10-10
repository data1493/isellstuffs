import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { extname, join as pathJoin, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { actingHandle, dropSession, emptyBook, hardenBook, keepName, loginName, playRound, readUser, recordRound } from "../js/accounts.mjs";
import { crowdBeat, fillRoom } from "../js/crowd.mjs";
import { act, enqueue, join, linePlace, runItBack, seatHandle, seedRoom, stepOut } from "../js/room.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dest = pathJoin(root, "live.json");
const tmp = pathJoin(root, "live.json.tmp");
const accountsPath = pathJoin(root, "..", ".data", "row-accounts.json");
const accountsTmp = pathJoin(root, "..", ".data", "row-accounts.json.tmp");
const COOKIE = "row";
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

let state = crowd ? fillRoom() : seedRoom();
let beat = 0;
let book = emptyBook();
let accountWrite = Promise.resolve();

function send(res, status, body, extra = {}) {
  const json = JSON.stringify(body);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(json),
  };
  if (extra.cookie) headers["set-cookie"] = extra.cookie;
  res.writeHead(status, headers);
  res.end(json);
}

function readCookie(req) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function sessionCookie(token, maxAge, secure) {
  const locked = secure ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${locked}`;
}

function secureRequest(req) {
  return process.env.ROW_SECURE === "1" || req.headers["x-forwarded-proto"] === "https";
}

async function loadBook() {
  try {
    const raw = JSON.parse(await readFile(accountsPath, "utf8"));
    book = {
      users: Array.isArray(raw.users) ? raw.users : [],
      sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    };
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
    book = emptyBook();
  }
}

function withBook(fn) {
  const run = accountWrite.then(async () => {
    const result = fn(book);
    if (result.ok && result.book) {
      book = result.book;
      await mkdir(pathJoin(root, "..", ".data"), { recursive: true });
      await writeFile(accountsTmp, JSON.stringify(book));
      await rename(accountsTmp, accountsPath);
    }
    return result;
  });
  accountWrite = run.then(() => {}, () => {});
  return run;
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

function applyPost(path, body, handle) {
  const link = String(body.link || `https://${handle}.room`).slice(0, 64);
  const played = { ...body, handle, link };
  if (path === "/queue") {
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
    const result = played.stay === false ? stepOut(state, handle) : runItBack(state, handle);
    if (result.ok) clearYou(result.state);
    return result;
  }
  const result = act(state, played);
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
    if (url.pathname === "/me" && req.method === "GET") {
      const user = readUser(book, readCookie(req));
      send(res, 200, { ok: true, user });
      return;
    }
    if (req.method === "POST" && (url.pathname === "/keep" || url.pathname === "/login" || url.pathname === "/out")) {
      let body = {};
      try {
        body = await readBody(req);
      } catch {
        send(res, 400, { ok: false, error: "Bad request." });
        return;
      }
      const token = readCookie(req);
      if (url.pathname === "/out") {
        await withBook((current) => ({ ok: true, book: dropSession(current, token) }));
        send(res, 200, { ok: true, user: null }, { cookie: sessionCookie("", 0, secureRequest(req)) });
        return;
      }
      const result = await withBook((current) => (
        url.pathname === "/login" ? loginName(current, body) : keepName(current, { ...body, token })
      ));
      if (!result.ok) {
        send(res, 400, { ok: false, error: result.error });
        return;
      }
      send(res, 200, { ok: true, user: result.user }, { cookie: sessionCookie(result.token, 60 * 60 * 24 * 365, secureRequest(req)) });
      return;
    }
    if (req.method === "POST" && url.pathname === "/round") {
      let body = {};
      try {
        body = await readBody(req);
      } catch {
        send(res, 400, { ok: false, error: "Bad request." });
        return;
      }
      const result = await withBook((current) => playRound(current, readCookie(req), body));
      if (!result.ok) {
        send(res, 400, { ok: false, error: result.error });
        return;
      }
      send(res, 200, { ok: true, user: result.user, wrote: Boolean(result.wrote) });
      return;
    }
    if (req.method === "POST" && (url.pathname === "/queue" || url.pathname === "/act" || url.pathname === "/again")) {
      let body = {};
      try {
        body = await readBody(req);
      } catch {
        send(res, 400, { ok: false, error: "Bad request." });
        return;
      }
      const gate = actingHandle(book, readCookie(req), body.handle);
      if (!gate.ok) {
        send(res, 400, { ok: false, error: gate.error, place: 0, call: state.call || null });
        return;
      }
      const before = state.pile?.status;
      const result = applyPost(url.pathname, body, gate.handle);
      if (result.ok) {
        state = result.state;
        if (before !== "won" && state.pile?.status === "won" && state.pile.winner) {
          const winner = seatHandle(state, state.pile.winner);
          const loser = seatHandle(state, state.pile.winner === "left" ? "right" : "left");
          await withBook((current) => recordRound(current, {
            winner,
            loser,
            held: state.drop?.holder === winner,
            dropId: state.drop?.id,
          }));
        }
        await publish(state);
      }
      send(res, result.ok ? 200 : 400, {
        ok: result.ok,
        error: result.error || null,
        place: linePlace(state, gate.handle),
        call: state.call || null,
      });
      return;
    }
    if (url.pathname === "/live.json") {
      send(res, 200, { ...state, beating: crowd });
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

await publish(state);
await loadBook();
if (hardenBook(book)) await withBook((current) => ({ ok: true, book: current }));
server.listen(port, host, () => {
  console.log(`row ready: ${state.people.length} in on http://${host}:${port}/`);
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

if (crowd) setTimeout(loop, 2400);
