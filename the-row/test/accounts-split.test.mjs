import test from "node:test";
import assert from "node:assert/strict";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { createBlobStore } from "../js/blob-store.mjs";
import { ACCOUNT_CAP, creditId, emptyBook, keepName, recordRound } from "../js/accounts.mjs";
import { seedRoom } from "../js/room.mjs";
import { BEAT_MS } from "../js/live-clock.mjs";

const now = 1_700_000_000_000;

function fakeBlob() {
  const docs = new Map();
  let serial = 0;
  const writes = [];
  return {
    writes,
    async read() {
      const load = (part) => {
        const doc = docs.get(part);
        if (!doc) return null;
        return { value: structuredClone(doc.value), etag: doc.etag };
      };
      return { room: load("room"), accounts: load("accounts") };
    },
    async write(part, value, etag) {
      const doc = docs.get(part) || null;
      if (doc && etag !== doc.etag) {
        const error = new Error("Precondition failed: ETag mismatch.");
        error.name = "BlobPreconditionFailedError";
        throw error;
      }
      if (doc && !etag) {
        const error = new Error("The room changed.");
        error.code = "CONFLICT";
        throw error;
      }
      serial += 1;
      docs.set(part, { value: structuredClone(value), etag: `e${serial}` });
      writes.push(part);
    },
    plant(part, value, etag = "planted") {
      docs.set(part, { value: structuredClone(value), etag });
    },
  };
}

function storeFor(blob, { crowd = false, clock = now } = {}) {
  return createBlobStore({
    read: blob.read,
    write: blob.write,
    crowd,
    now: () => clock,
    wait: async () => {},
  });
}

function call(store, path, body, token = "", at = now, crowd = false) {
  return handleRow({
    method: body ? "POST" : "GET",
    pathname: path,
    token,
    secure: false,
    bodyText: body ? JSON.stringify(body) : "",
    store,
    crowd,
    now: () => at,
  });
}

function keptName(index) {
  const n = String(index).padStart(3, "0");
  return {
    id: `U${n}${"x".repeat(28)}`,
    handle: `player${n}`,
    keySalt: "s".repeat(22),
    keyHash: "h".repeat(43),
    createdAt: now,
    wins: 2,
    losses: 1,
    streak: 1,
    streakAt: now + 1_000,
    dropsKept: 1,
    prizes: ["bold"],
  };
}

test("the same round id credits a kept name once", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-mint", key: () => "ab3-k9q" });
  const room = seedRoom();
  room.dealt = 1;
  room.seats = { left: "mint", right: "jun" };
  const id = creditId(room, "mint", "jun");
  const once = recordRound(kept.book, { winner: "mint", loser: "jun", held: true, dropId: "bold", id }, now);
  const twice = recordRound(once.book, { winner: "mint", loser: "jun", held: true, dropId: "bold", id }, now + 1);
  assert.equal(once.wrote, true);
  assert.equal(twice.wrote, false);
  assert.equal(twice.book.users[0].wins, 1);
  assert.equal(twice.book.users[0].dropsKept, 1);
  const next = recordRound(twice.book, { winner: "mint", loser: "jun", held: false, dropId: "bold", id: `${id}-2` }, now + 2);
  assert.equal(next.wrote, true);
  assert.equal(next.book.users[0].wins, 2);
});

test("an old state.json book moves to the accounts document on first read", async () => {
  const blob = fakeBlob();
  const live = { state: seedRoom(), beat: 2, tickAt: now };
  blob.plant("room", {
    book: {
      users: [{ id: "user-mint", handle: "mint", key: "ab3-k9q", createdAt: now }],
      sessions: [{ token: "tok-mint", userId: "user-mint", expires: now + 86_400_000 }],
    },
    live,
  });
  const me = await call(storeFor(blob), "/me", null, "tok-mint");
  assert.equal(me.status, 200);
  assert.equal(me.json.user.handle, "mint");
  const stored = await blob.read();
  assert.equal(stored.room.value.book, undefined);
  assert.equal(stored.room.value.live.beat, 2);
  assert.equal(stored.accounts.value.users.length, 1);
  assert.equal(stored.accounts.value.users[0].key, undefined);
  assert.equal(typeof stored.accounts.value.users[0].keyHash, "string");
  const writesAfter = blob.writes.length;
  await call(storeFor(blob), "/me", null, "tok-mint");
  assert.deepEqual(blob.writes.slice(writesAfter), []);
});

test("a room tick rewrites the room and leaves the accounts document alone", async () => {
  const blob = fakeBlob();
  let clock = 20_000;
  const open = () => storeFor(blob, { crowd: true, clock });
  const kept = await call(open(), "/keep", { handle: "mint" }, "", clock, true);
  assert.equal(kept.status, 200, kept.json?.error);
  const before = await blob.read();
  const accountsJson = JSON.stringify(before.accounts.value);
  clock += BEAT_MS * 2;
  const live = await call(open(), "/live.json", null, "", clock, true);
  assert.equal(live.status, 200);
  const after = await blob.read();
  assert.equal(JSON.stringify(after.accounts.value), accountsJson);
  assert.equal(after.accounts.etag, before.accounts.etag);
  assert.notEqual(after.room.etag, before.room.etag);
  assert.equal(after.room.value.book, undefined);
  assert.ok(after.room.value.live.beat > before.room.value.live.beat);
  assert.equal(blob.writes.filter((part) => part === "accounts").length, 1);
});

test("a lost room write after a win does not credit the name twice", async () => {
  const blob = fakeBlob();
  const store = storeFor(blob);
  const kept = await call(store, "/keep", { handle: "mint" });
  assert.equal(kept.status, 200, kept.json?.error);
  const token = readCookie(kept.cookie);
  await store.transact(({ live, saveLive }) => {
    const state = structuredClone(live.state);
    state.seats = { ...state.seats, left: "mint" };
    state.pile = { ...state.pile, status: "open", game: null, leftScore: state.pile.goal - 1, rightScore: 0, winner: null };
    saveLive({ ...live, state });
  });
  const raw = blob.write.bind(blob);
  let failed = false;
  blob.write = async (part, value, etag) => {
    if (!failed && part === "room" && value?.live?.state?.pile?.status === "won") {
      failed = true;
      const error = new Error("Precondition failed: ETag mismatch.");
      error.name = "BlobPreconditionFailedError";
      throw error;
    }
    return raw(part, value, etag);
  };
  const act = await call(storeFor(blob), "/act", { handle: "mint", side: "left", kind: "pile" }, token);
  assert.equal(act.status, 200, act.json?.error);
  const me = await call(storeFor(blob), "/me", null, token);
  assert.equal(me.json.user.wins, 1);
  assert.equal(me.json.user.dropsKept, 1);
  const stored = await blob.read();
  assert.equal(stored.room.value.live.state.pile.status, "won");
  assert.equal(stored.accounts.value.users[0].wins, 1);
  assert.equal(stored.accounts.value.users[0].credited.length, 1);
});

test("300 players: state.json shrinks once the book leaves it", async () => {
  assert.equal(ACCOUNT_CAP, 300);
  const users = [];
  const sessions = [];
  for (let i = 0; i < 300; i += 1) {
    const user = keptName(i);
    users.push(user);
    sessions.push({
      token: `T${String(i).padStart(3, "0")}${"y".repeat(28)}`,
      userId: user.id,
      expires: now + 31_536_000_000,
    });
  }
  const book = { users, sessions };
  const live = { state: seedRoom(), beat: 4, tickAt: now };
  const before = Buffer.byteLength(JSON.stringify({ book, live }));
  const blob = fakeBlob();
  blob.plant("room", { book, live });
  const me = await call(storeFor(blob), "/me", null, sessions[0].token);
  assert.equal(me.json.user.handle, "player000");
  const stored = await blob.read();
  const stateBytes = Buffer.byteLength(JSON.stringify(stored.room.value));
  const accountBytes = Buffer.byteLength(JSON.stringify(stored.accounts.value));
  console.log(`accounts-split bytes before=${before} state.json=${stateBytes} accounts.json=${accountBytes}`);
  assert.equal(stored.room.value.book, undefined);
  assert.equal(stored.accounts.value.users.length, 300);
  assert.equal(stored.accounts.value.sessions.length, 300);
  assert.ok(stateBytes < before / 2, `state.json ${stateBytes} should be well under the combined ${before}`);
  assert.ok(accountBytes > stateBytes);
  const accountWrites = blob.writes.filter((part) => part === "accounts").length;
  await call(storeFor(blob), "/live.json", null);
  assert.equal(blob.writes.filter((part) => part === "accounts").length, accountWrites);
});
