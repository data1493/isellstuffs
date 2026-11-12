import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const HOST = "127.0.0.1";
const BOTS = new Set(["nova", "jun"]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cookieFrom(response) {
  const headers = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  const row = headers.map((header) => String(header).split(";")[0].trim()).find((part) => part.startsWith("row="));
  return row || "";
}

async function request(base, path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, json, text, cookie: cookieFrom(response) || cookie || "" };
}

function startServer(port, dir) {
  const child = spawn(process.execPath, ["the-row/script/serve.mjs"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      ROW_HOST: HOST,
      ROW_CROWD: "1",
      ROW_LIVE: join(dir, "live.json"),
      ROW_ACCOUNTS: join(dir, "accounts.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (chunk) => {
    log += chunk;
  });
  child.stderr.on("data", (chunk) => {
    log += chunk;
  });
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(log || "server did not start"));
    }, 8000);
    const finish = (error) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    child.stdout.on("data", () => {
      if (log.includes("row ready")) finish();
    });
    child.on("exit", (code) => finish(new Error(log || `server exited ${code}`)));
    child.on("error", (error) => finish(error));
  });
  return { child, ready, log: () => log };
}

function stopServer(child) {
  if (!child || child.exitCode != null) return;
  child.kill("SIGTERM");
}

function guardPrize(room) {
  const holder = room?.drop?.holder;
  if (holder && BOTS.has(holder)) throw new Error(`a house bot held the prize: ${holder}`);
  if (room?.pile?.status === "won" && room.pile.winner) {
    const handle = room.seats?.[room.pile.winner];
    if (BOTS.has(handle)) throw new Error(`a house bot won the round: ${handle}`);
  }
}

function seatedBots(room) {
  return [room.seats?.left, room.seats?.right].filter((handle) => BOTS.has(handle));
}

function queued(room) {
  return (room.queue || []).map((item) => item.handle);
}

async function live(base) {
  const result = await request(base, "/live.json");
  assert.equal(result.status, 200, result.text);
  guardPrize(result.json);
  return result.json;
}

async function until(base, label, pred, ms = 12000) {
  const deadline = Date.now() + ms;
  let room = null;
  while (Date.now() < deadline) {
    room = await live(base);
    if (pred(room)) return room;
    await sleep(200);
  }
  throw new Error(`${label}: seats ${room?.seats?.left}/${room?.seats?.right} queue ${queued(room).join(",")}`);
}

async function keep(base, handle) {
  const result = await request(base, "/keep", { method: "POST", body: { handle } });
  assert.equal(result.status, 200, result.json?.error || result.text);
  assert.equal(result.json.user.handle, handle);
  assert.ok(result.cookie.startsWith("row="));
  return result.cookie;
}

async function queue(base, handle, cookie) {
  const result = await request(base, "/queue", {
    method: "POST",
    cookie,
    body: { handle, link: `https://${handle}.room`, game: "pile" },
  });
  assert.equal(result.status, 200, result.json?.error || result.text);
  return result;
}

async function playRound(base) {
  const empty = await until(base, "two bots open the room", (room) => seatedBots(room).length === 2);
  assert.equal(empty.drop.holder, null);

  const ada = await keep(base, "ada");
  await queue(base, "ada", ada);
  const one = await until(base, "ada takes a seat and one bot steps out", (room) => {
    const seats = [room.seats?.left, room.seats?.right];
    return seats.includes("ada") && seatedBots(room).length === 1;
  });
  assert.equal(seatedBots(one).length, 1);

  const bev = await keep(base, "bev");
  await queue(base, "bev", bev);
  const both = await until(base, "ada and bev sit and the bots step out", (room) => {
    const seats = [room.seats?.left, room.seats?.right].sort();
    return seats[0] === "ada" && seats[1] === "bev" && seatedBots(room).length === 0;
  });
  assert.deepEqual(seatedBots(both), []);

  const cam = await keep(base, "cam");
  await queue(base, "cam", cam);
  const waiting = await until(base, "cam waits behind the two seats", (room) => {
    const seats = [room.seats?.left, room.seats?.right];
    return seats.includes("ada") && seats.includes("bev") && queued(room).includes("cam") && seatedBots(room).length === 0;
  });

  const side = waiting.seats.left === "ada" ? "left" : "right";
  for (let i = 0; i < 5; i += 1) {
    const act = await request(base, "/act", {
      method: "POST",
      cookie: ada,
      body: { handle: "ada", side, kind: "pile" },
    });
    assert.equal(act.status, 200, act.json?.error || act.text);
    guardPrize(await live(base));
  }
  const won = await live(base);
  assert.equal(won.pile.status, "won");
  assert.equal(won.seats[won.pile.winner], "ada");
  assert.equal(won.drop.holder, "ada");
  const loseSide = won.pile.winner === "left" ? "right" : "left";
  assert.equal(won.seats[loseSide], "bev");

  const out = await request(base, "/again", {
    method: "POST",
    cookie: bev,
    body: { handle: "bev", stay: false },
  });
  assert.equal(out.status, 200, out.json?.error || out.text);
  const back = await request(base, "/again", {
    method: "POST",
    cookie: ada,
    body: { handle: "ada", stay: true },
  });
  assert.equal(back.status, 200, back.json?.error || back.text);
  // The house clears a stepped-out player on the next tick, then gives that
  // seat to whoever was already waiting. Bev queues again after that clear,
  // which puts the loser at the back.
  await until(base, "cam takes bev's seat", (room) => {
    const seats = [room.seats?.left, room.seats?.right];
    const names = (room.people || []).map((person) => person.handle);
    return seats.includes("ada") && seats.includes("cam") && !seats.includes("bev") && !names.includes("bev");
  });
  await queue(base, "bev", bev);
  const next = await until(base, "bev is at the back of the queue", (room) => queued(room).at(-1) === "bev");
  assert.equal(queued(next).at(-1), "bev");
  assert.deepEqual([next.seats.left, next.seats.right].filter((handle) => handle === "ada" || handle === "cam").sort(), ["ada", "cam"]);
  assert.equal(seatedBots(next).length, 0);
  await sleep(3000);
  const held = await live(base);
  assert.equal(queued(held).at(-1), "bev");
  assert.ok([held.seats.left, held.seats.right].includes("cam"));
  assert.equal(seatedBots(held).length, 0);
  guardPrize(held);
}

async function boot(dir) {
  let last = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const port = 20000 + ((process.pid + attempt * 97) % 20000);
    const started = startServer(port, dir);
    try {
      await started.ready;
      return { ...started, port };
    } catch (error) {
      last = error;
      stopServer(started.child);
      const log = `${started.log()}\n${error.message}`;
      if (!/EADDRINUSE/i.test(log)) throw error;
    }
  }
  throw last || new Error("no free port");
}

const dir = await mkdtemp(join(tmpdir(), "row-play-"));
const started = await boot(dir);
try {
  await playRound(`http://${HOST}:${started.port}`);
  console.log(`playtest ok on ${HOST}:${started.port}`);
} finally {
  stopServer(started.child);
  await rm(dir, { recursive: true, force: true });
}
