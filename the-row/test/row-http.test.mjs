import test from "node:test";
import assert from "node:assert/strict";
import { handleRow, readCookie, sessionCookie } from "../js/row-http.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";
import { createRedisStore } from "../js/redis-store.mjs";

const now = 1_700_000_000_000;

function memory() {
  return createMemoryStore({ crowd: false, now: () => now });
}

function cookieToken(header) {
  return readCookie(header);
}

async function post(store, path, body, token = "", secure = false) {
  return handleRow({
    method: "POST",
    pathname: path,
    token,
    secure,
    bodyText: JSON.stringify(body ?? {}),
    store,
    crowd: false,
    now: () => now,
  });
}

test("the session cookie is httpOnly and locked on https", () => {
  assert.equal(sessionCookie("ab c", 10, false), "row=ab%20c; HttpOnly; SameSite=Lax; Path=/; Max-Age=10");
  assert.match(sessionCookie("tok", 5, true), /Secure$/);
  assert.equal(readCookie("a=1; row=ab%20c; b=2"), "ab c");
});

test("keep, login, and out survive on the book", async () => {
  const store = memory();
  const kept = await post(store, "/keep", { handle: " Mint " });
  assert.equal(kept.status, 200);
  assert.equal(kept.json.user.handle, "mint");
  assert.match(kept.json.user.key, /^[a-z2-9]{3}-[a-z2-9]{3}$/);
  const token = cookieToken(kept.cookie);
  const stored = await store.transact(({ book }) => book.users.find((user) => user.handle === "mint"));
  assert.equal(stored.key, undefined);
  assert.equal(typeof stored.keyHash, "string");

  const me = await handleRow({
    method: "GET",
    pathname: "/me",
    token,
    secure: false,
    bodyText: "",
    store,
    crowd: false,
    now: () => now,
  });
  assert.equal(me.json.user.handle, "mint");
  assert.equal(me.json.user.key, undefined);

  const renamed = await post(store, "/keep", { handle: "minty" }, token);
  assert.equal(renamed.json.user.handle, "minty");
  assert.equal(cookieToken(renamed.cookie), token);

  const taken = await post(store, "/keep", { handle: "minty" });
  assert.equal(taken.status, 400);
  assert.equal(taken.json.error, "That name is kept.");

  const bad = await post(store, "/login", { handle: "minty", key: "nope" });
  assert.equal(bad.json.error, "That key does not match.");
  const back = await post(store, "/login", { handle: "minty", key: kept.json.user.key });
  assert.equal(back.status, 200);
  assert.equal(back.json.user.handle, "minty");

  const out = await post(store, "/out", {}, cookieToken(back.cookie));
  assert.equal(out.json.user, null);
  assert.match(out.cookie, /Max-Age=0/);
  const gone = await handleRow({
    method: "GET",
    pathname: "/me",
    token: cookieToken(back.cookie),
    secure: false,
    bodyText: "",
    store,
    crowd: false,
    now: () => now,
  });
  assert.equal(gone.json.user, null);
});

test("a played round stores the win on the kept name", async () => {
  const store = memory();
  const kept = await post(store, "/keep", { handle: "mint" });
  const token = cookieToken(kept.cookie);
  let wrote = false;
  for (let i = 0; i < 5; i += 1) {
    const played = await post(store, "/round", { kind: "pile", side: "left" }, token);
    assert.equal(played.status, 200, played.json.error);
    wrote = played.json.wrote || wrote;
  }
  assert.equal(wrote, true);
  const me = await handleRow({
    method: "GET",
    pathname: "/me",
    token,
    secure: false,
    bodyText: "",
    store,
    crowd: false,
    now: () => now + 10,
  });
  assert.equal(me.json.user.wins, 1);
  assert.equal(me.json.user.streak, 1);
  assert.equal(me.json.user.dropsKept, 1);
  assert.deepEqual(me.json.user.prizes, ["bold"]);
});

test("the room queue and a called round stay on the shared state", async () => {
  const store = memory();
  const queued = await post(store, "/queue", { handle: "walker", link: "https://walker.room", game: "pile" });
  assert.equal(queued.status, 200);
  assert.equal(queued.json.place, 1);
  const live = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: false,
    bodyText: "",
    store,
    crowd: false,
    now: () => now,
  });
  assert.equal(live.json.beating, false);
  assert.equal(live.json.queue[0].handle, "walker");

  for (let i = 0; i < 5; i += 1) {
    const act = await post(store, "/act", { handle: "nova", kind: "pile", side: "left" });
    assert.equal(act.status, 200, act.json.error);
  }
  const won = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: false,
    bodyText: "",
    store,
    crowd: false,
    now: () => now,
  });
  assert.equal(won.json.pile.status, "won");
  assert.equal(won.json.pile.winner, "left");
  const again = await post(store, "/again", { handle: "nova", stay: true });
  assert.equal(again.status, 200);
});

test("a bad body is refused", async () => {
  const result = await handleRow({
    method: "POST",
    pathname: "/keep",
    token: "",
    secure: false,
    bodyText: "{",
    store: memory(),
    crowd: false,
    now: () => now,
  });
  assert.equal(result.status, 400);
  assert.equal(result.json.error, "Bad request.");
});

function fakeRedis() {
  const data = new Map();
  return {
    async get(key) {
      if (!data.has(key)) return null;
      return structuredClone(data.get(key));
    },
    async set(key, value, opts) {
      if (opts?.nx && data.has(key)) return null;
      data.set(key, structuredClone(value));
      return "OK";
    },
    async del(key) {
      data.delete(key);
      return 1;
    },
  };
}

test("redis keeps the account and the room across two function instances", async () => {
  const redis = fakeRedis();
  let clock = 5_000;
  const first = createRedisStore({ redis, crowd: true, now: () => clock });
  const kept = await handleRow({
    method: "POST",
    pathname: "/keep",
    token: "",
    secure: true,
    bodyText: JSON.stringify({ handle: "mint" }),
    store: first,
    crowd: true,
    now: () => clock,
  });
  assert.equal(kept.status, 200);
  assert.match(kept.cookie, /Secure/);
  const token = cookieToken(kept.cookie);
  await postOn(first, "/queue", { handle: "mint", link: "https://mint.room", game: "lane" }, token);

  clock = 5_000 + 2400 * 2;
  const second = createRedisStore({ redis, crowd: true, now: () => clock });
  const me = await handleRow({
    method: "GET",
    pathname: "/me",
    token,
    secure: true,
    bodyText: "",
    store: second,
    crowd: true,
    now: () => clock,
  });
  assert.equal(me.json.user.handle, "mint");
  assert.equal(me.json.user.key, undefined);
  const live = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: true,
    bodyText: "",
    store: second,
    crowd: true,
    now: () => clock,
  });
  assert.equal(live.json.beating, true);
  assert.equal(live.json.queue.some((item) => item.handle === "mint"), true);
  const again = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: true,
    bodyText: "",
    store: createRedisStore({ redis, crowd: true, now: () => clock }),
    crowd: true,
    now: () => clock,
  });
  assert.equal(JSON.stringify(again.json), JSON.stringify(live.json));
});

function postOn(store, path, body, token) {
  return handleRow({
    method: "POST",
    pathname: path,
    token,
    secure: true,
    bodyText: JSON.stringify(body),
    store,
    crowd: true,
    now: () => 5_000,
  });
}
