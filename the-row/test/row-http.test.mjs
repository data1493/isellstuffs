import test from "node:test";
import assert from "node:assert/strict";
import { handleRow, readCookie, sessionCookie } from "../js/row-http.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";
import { commitRowState } from "../api/row.mjs";
import { conflictError, createBlobStore, isConflict, lostCreate } from "../js/blob-store.mjs";

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
  const kept = await post(store, "/keep", { handle: "mint" });
  const token = cookieToken(kept.cookie);
  const stranger = await post(store, "/queue", { handle: "walker", link: "https://walker.room", game: "pile" });
  assert.equal(stranger.status, 400);
  assert.equal(stranger.json.error, "Keep a name first.");
  const queued = await post(store, "/queue", { handle: "mint", link: "https://mint.room", game: "pile" }, token);
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
  assert.equal(live.json.queue[0].handle, "mint");

  await store.transact(({ live: room, saveLive }) => {
    const state = structuredClone(room.state);
    state.seats = { ...state.seats, left: "mint" };
    saveLive({ ...room, state });
  });
  const bot = await post(store, "/act", { handle: "nova", kind: "pile", side: "left" });
  assert.equal(bot.status, 400);
  assert.equal(bot.json.error, "Keep a name first.");
  for (let i = 0; i < 5; i += 1) {
    const act = await post(store, "/act", { handle: "mint", kind: "pile", side: "left" }, token);
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
  const stolen = await post(store, "/again", { handle: "nova", stay: true });
  assert.equal(stolen.status, 400);
  const again = await post(store, "/again", { handle: "mint", stay: true }, token);
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

function fakeBlob() {
  let doc = null;
  let serial = 0;
  return {
    async read() {
      if (!doc) return null;
      return { value: structuredClone(doc.value), etag: doc.etag };
    },
    async write(value, etag) {
      if (doc && etag !== doc.etag) {
        const error = new Error("Precondition failed: ETag mismatch.");
        error.name = "BlobPreconditionFailedError";
        throw error;
      }
      if (doc && !etag) throw conflictError();
      serial += 1;
      doc = { value: structuredClone(value), etag: `e${serial}` };
    },
    bump() {
      if (doc) doc.etag = `moved-${doc.etag}`;
    },
  };
}

function blobStore(blob, now) {
  return createBlobStore({
    read: blob.read,
    write: blob.write,
    crowd: true,
    now,
    wait: async () => {},
  });
}

test("a mismatch is a conflict and a landed create is not replayed", () => {
  const missed = new Error("Precondition failed: ETag mismatch.");
  missed.name = "BlobPreconditionFailedError";
  assert.equal(isConflict(missed), true);
  assert.equal(isConflict(conflictError()), true);
  assert.equal(isConflict(new Error("nope")), false);
  const written = { book: { users: [], sessions: [] }, live: { beat: 0 } };
  assert.equal(lostCreate(new Error("Unknown error, please visit https://vercel.com/help."), null, written, null), "fail");
  assert.equal(lostCreate(new Error("down"), null, written, { value: written }), "ok");
  assert.equal(lostCreate(new Error("down"), null, written, { value: { book: { users: [{ handle: "salt" }] } } }), "retry");
  assert.equal(lostCreate(missed, "e1", written, { value: written }), "retry");
});

test("blob keeps the account and the room across two function instances", async () => {
  const blob = fakeBlob();
  let clock = 5_000;
  const first = blobStore(blob, () => clock);
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
  const stored = await blob.read();
  assert.equal(stored.value.live.state.beating, undefined);
  assert.equal(stored.value.book.users[0].key, undefined);
  assert.equal(typeof stored.value.book.users[0].keyHash, "string");

  clock = 5_000 + 2400 * 2;
  const second = blobStore(blob, () => clock);
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
  // With the ticket on the request clock (F-22), the house seats mint on the
  // next ticks instead of leaving a wall-clock ticket that looks unborn.
  assert.equal(live.json.seats.left === "mint" || live.json.seats.right === "mint", true);
  const again = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: true,
    bodyText: "",
    store: blobStore(blob, () => clock),
    crowd: true,
    now: () => clock,
  });
  assert.equal(JSON.stringify(again.json), JSON.stringify(live.json));
  const after = await blob.read();
  assert.equal(after.value.live.beat > 0, true);
  assert.equal(after.value.live.tickAt, clock);
});

test("the first read keeps the crowd clock", async () => {
  const blob = fakeBlob();
  let clock = 10_000;
  await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: false,
    bodyText: "",
    store: blobStore(blob, () => clock),
    crowd: true,
    now: () => clock,
  });
  const seeded = await blob.read();
  assert.equal(seeded.value.live.tickAt, 10_000);
  assert.equal(seeded.value.live.beat, 0);
  clock = 10_000 + 2400;
  await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: false,
    bodyText: "",
    store: blobStore(blob, () => clock),
    crowd: true,
    now: () => clock,
  });
  const moved = await blob.read();
  assert.equal(moved.value.live.beat > 0, true);
  assert.equal(moved.value.live.tickAt, clock);
});

test("a lost write reloads so two keeps both stay", async () => {
  const blob = fakeBlob();
  const left = createBlobStore({ read: blob.read, write: blob.write, crowd: false, now: () => now, wait: async () => {} });
  const right = createBlobStore({ read: blob.read, write: blob.write, crowd: false, now: () => now, wait: async () => {} });
  const [mint, salt] = await Promise.all([
    post(left, "/keep", { handle: "mint" }),
    post(right, "/keep", { handle: "salt" }),
  ]);
  assert.equal(mint.status, 200);
  assert.equal(salt.status, 200);
  const stored = await blob.read();
  const handles = stored.value.book.users.map((user) => user.handle).sort();
  assert.deepEqual(handles, ["mint", "salt"]);
});

test("an etag miss retries against the document that won", async () => {
  const blob = fakeBlob();
  const raw = blob.write.bind(blob);
  let flipped = false;
  blob.write = async (value, etag) => {
    if (!flipped && etag) {
      flipped = true;
      blob.bump();
      const error = new Error("Precondition failed: ETag mismatch.");
      error.name = "BlobPreconditionFailedError";
      throw error;
    }
    return raw(value, etag);
  };
  const store = createBlobStore({
    read: blob.read,
    write: (...args) => blob.write(...args),
    crowd: false,
    now: () => now,
    wait: async () => {},
  });
  assert.equal((await post(store, "/keep", { handle: "mint" })).status, 200);
  assert.equal((await post(store, "/keep", { handle: "salt" })).status, 200);
  const stored = await blob.read();
  const handles = stored.value.book.users.map((user) => user.handle).sort();
  assert.deepEqual(handles, ["mint", "salt"]);
});

test("conflicts stop after the last retry and other errors do not retry", async () => {
  const blob = fakeBlob();
  let writes = 0;
  blob.write = async () => {
    writes += 1;
    throw conflictError();
  };
  const store = createBlobStore({
    read: blob.read,
    write: blob.write,
    crowd: false,
    now: () => now,
    attempts: 3,
    wait: async () => {},
  });
  await assert.rejects(() => post(store, "/keep", { handle: "mint" }), /The room changed/);
  assert.equal(writes, 3);

  let once = 0;
  const other = fakeBlob();
  other.write = async () => {
    once += 1;
    throw new Error("disk full");
  };
  const failing = createBlobStore({
    read: other.read,
    write: other.write,
    crowd: false,
    now: () => now,
    wait: async () => {},
  });
  await assert.rejects(() => post(failing, "/keep", { handle: "mint" }), /disk full/);
  assert.equal(once, 1);
});

function crowdMemory(at = now) {
  return createMemoryStore({ crowd: true, now: () => at });
}

async function liveOf(store, at = now) {
  const result = await handleRow({
    method: "GET",
    pathname: "/live.json",
    token: "",
    secure: false,
    bodyText: "",
    store,
    crowd: true,
    now: () => at,
  });
  return result.json;
}

async function seat(store, handle, side = "left") {
  await store.transact(({ live, saveLive }) => {
    const state = structuredClone(live.state);
    const other = side === "left" ? "right" : "left";
    state.people = [
      { handle, link: `https://${handle}.room` },
      { handle: "nova", link: "https://nova.room" },
    ];
    state.seats = { left: null, right: null, [side]: handle, [other]: "nova" };
    state.queue = [];
    state.pile = { ...state.pile, status: "open", winner: null, game: null, leftScore: 0, rightScore: 0 };
    saveLive({ ...live, state });
  });
}

test("an anonymous act cannot move a house bot", async () => {
  const store = crowdMemory();
  const act = await post(store, "/act", { handle: "jun", side: "right", kind: "pile" });
  assert.equal(act.status, 400);
  assert.equal(act.json.ok, false);
  assert.equal(act.json.error, "Keep a name first.");
  const live = await liveOf(store);
  assert.equal(live.pile.rightScore, 0);
  assert.equal(live.seats.right, "jun");
});

test("renaming a kept name keeps the seat with that player", async () => {
  const store = crowdMemory();
  const kept = await post(store, "/keep", { handle: "alice" });
  const token = cookieToken(kept.cookie);
  await seat(store, "alice", "left");
  const renamed = await post(store, "/keep", { handle: "alice2" }, token);
  assert.equal(renamed.status, 200);
  assert.equal(renamed.json.user.handle, "alice2");
  const stolen = await post(store, "/act", { handle: "alice", side: "left", kind: "pile" });
  assert.equal(stolen.status, 400);
  assert.notEqual(stolen.json.ok, true);
  const live = await liveOf(store);
  assert.equal(live.seats.left, "alice2");
  assert.equal(live.pile.leftScore, 0);
  const played = await post(store, "/act", { handle: "alice2", side: "left", kind: "pile" }, token);
  assert.equal(played.status, 200, played.json.error);
  const after = await liveOf(store);
  assert.equal(after.pile.leftScore, 1);
  assert.equal(after.seats.left, "alice2");
});

test("a human win can run it back, and stepping out is not undone", async () => {
  const store = crowdMemory();
  const alice = await post(store, "/keep", { handle: "alice" });
  const token = cookieToken(alice.cookie);
  await seat(store, "alice", "left");
  for (let i = 0; i < 5; i += 1) {
    const act = await post(store, "/act", { handle: "alice", side: "left", kind: "pile" }, token);
    assert.equal(act.status, 200, act.json.error);
  }
  assert.equal((await liveOf(store)).pile.status, "won");
  const back = await post(store, "/again", { handle: "alice", stay: true }, token);
  assert.equal(back.status, 200, back.json.error);
  await store.tick(now);
  const replay = await liveOf(store);
  assert.equal(replay.pile.status, "open");
  assert.equal(replay.pile.leftScore, 0);
  assert.equal(replay.seats.left, "alice");
  assert.equal(replay.rematch.alice, undefined);

  for (let i = 0; i < 5; i += 1) {
    const act = await post(store, "/act", { handle: "alice", side: "left", kind: "pile" }, token);
    assert.equal(act.status, 200, act.json.error);
  }
  const out = await post(store, "/again", { handle: "alice", stay: false }, token);
  assert.equal(out.status, 200, out.json.error);
  await store.tick(now);
  const left = await liveOf(store);
  assert.notEqual(left.seats.left, "alice");
  assert.notEqual(left.seats.right, "alice");
  assert.equal(left.pile.status, "open");
  assert.equal((left.people || []).some((person) => person.handle === "alice"), false);
});

function vercelLikeBlob() {
  let doc = null;
  let serial = 0;
  let chain = Promise.resolve();
  function exclusive(fn) {
    const run = chain.then(fn, fn);
    chain = run.then(() => {}, () => {});
    return run;
  }
  return {
    put(_path, body, options) {
      return exclusive(async () => {
        const allowOverwrite = options?.allowOverwrite === true;
        const ifMatch = options?.ifMatch;
        if (ifMatch) {
          if (!doc || ifMatch !== doc.etag) {
            const error = new Error("Precondition failed: ETag mismatch.");
            error.name = "BlobPreconditionFailedError";
            throw error;
          }
        } else if (doc && !allowOverwrite) {
          const error = new Error("Unknown error, please visit https://vercel.com/help.");
          error.name = "BlobUnknownError";
          throw error;
        }
        serial += 1;
        doc = { body, etag: `"e${serial}"` };
      });
    },
    read() {
      return exclusive(async () => {
        if (!doc) return null;
        return { value: JSON.parse(doc.body), etag: doc.etag };
      });
    },
  };
}

test("two keeps both survive a create that matches real blob put", async () => {
  const blob = vercelLikeBlob();
  const write = (value, etag) => commitRowState(value, etag, blob);
  const left = createBlobStore({ read: blob.read, write, crowd: false, now: () => now, wait: async () => {} });
  const right = createBlobStore({ read: blob.read, write, crowd: false, now: () => now, wait: async () => {} });
  const [mint, salt] = await Promise.all([
    post(left, "/keep", { handle: "mint" }),
    post(right, "/keep", { handle: "salt" }),
  ]);
  assert.equal(mint.status, 200, mint.json?.error);
  assert.equal(salt.status, 200, salt.json?.error);
  const stored = await blob.read();
  const handles = stored.value.book.users.map((user) => user.handle).sort();
  assert.deepEqual(handles, ["mint", "salt"]);
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
