import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { createBlobStore } from "../js/blob-store.mjs";
import {
  CROWD_POLL_MS,
  LIVE_CACHE_MS,
  createLiveCache,
  liveCacheControl,
  serveCachedLive,
} from "../js/live-read.mjs";

const now = 1_700_000_000_000;

function fakeBlob() {
  const docs = new Map();
  let serial = 0;
  const writes = [];
  return {
    writes,
    async read() {
      const doc = docs.get("room");
      if (!doc) return null;
      return { value: structuredClone(doc.value), etag: doc.etag };
    },
    async write(value, etag) {
      const doc = docs.get("room") || null;
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
      docs.set("room", { value: structuredClone(value), etag: `e${serial}` });
      writes.push(etag || "create");
    },
  };
}

function storeFor(blob, clock) {
  return createBlobStore({
    read: blob.read,
    write: blob.write,
    crowd: true,
    now: () => clock,
    wait: async () => {},
  });
}

function call(store, path, body, token, at) {
  return handleRow({
    method: body ? "POST" : "GET",
    pathname: path,
    token: token || "",
    secure: false,
    bodyText: body ? JSON.stringify(body) : "",
    store,
    crowd: true,
    now: () => at,
  });
}

test("a crowd beat is shown and not written", async () => {
  const blob = fakeBlob();
  let clock = 10_000;
  await call(storeFor(blob, clock), "/live.json", null, "", clock);
  const seeded = blob.writes.length;
  assert.equal(seeded, 1);
  clock += 2400;
  const shown = await call(storeFor(blob, clock), "/live.json", null, "", clock);
  assert.equal(shown.json.beat > 0, true);
  assert.equal(blob.writes.length, seeded);
  const stored = await blob.read();
  assert.equal(stored.value.live.tickAt, 10_000);
});

test("a pile still writes the room", async () => {
  const blob = fakeBlob();
  const blobStore = storeFor(blob, now);
  const kept = await call(blobStore, "/keep", { handle: "mint" }, "", now);
  assert.equal(kept.status, 200, kept.json?.error);
  const token = readCookie(kept.cookie);
  const queued = await call(blobStore, "/queue", { handle: "mint", link: "https://mint.room", game: "pile" }, token, now);
  assert.equal(queued.status, 200, queued.json?.error);
  const before = blob.writes.length;
  await blobStore.transact(({ live, saveLive }) => {
    const state = structuredClone(live.state);
    state.seats = { left: "mint", right: "nova" };
    state.pile = { ...state.pile, status: "open", game: null, leftScore: 0, rightScore: 0, winner: null };
    saveLive({ ...live, state });
  });
  const act = await call(blobStore, "/act", { handle: "mint", side: "left", kind: "pile" }, token, now);
  assert.equal(act.status, 200, act.json?.error);
  assert.equal(act.json.room.pile.leftScore, 1);
  assert.ok(blob.writes.length > before);
});

test("a live read inside the window does not load the room again", async () => {
  const cache = createLiveCache(LIVE_CACHE_MS);
  let loads = 0;
  const load = async () => {
    loads += 1;
    return { status: 200, json: { beat: loads } };
  };
  const first = await serveCachedLive({ cache, now: 1_000, load });
  const second = await serveCachedLive({ cache, now: 1_000 + LIVE_CACHE_MS - 1, load });
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(loads, 1);
  assert.equal(second.result.json.beat, 1);
  cache.clear();
  const third = await serveCachedLive({ cache, now: 1_000 + LIVE_CACHE_MS - 1, load });
  assert.equal(third.cached, false);
  assert.equal(loads, 2);
  const fourth = await serveCachedLive({ cache, now: 1_000 + LIVE_CACHE_MS - 1 + LIVE_CACHE_MS, load });
  assert.equal(fourth.cached, false);
  assert.equal(loads, 3);
});

test("the live response is cacheable for the shared window", async () => {
  assert.equal(LIVE_CACHE_MS, 30_000);
  assert.equal(CROWD_POLL_MS, 2_000);
  assert.equal(liveCacheControl(), "public, s-maxage=30, max-age=2");
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const live = vercel.headers.find((item) => item.source === "/live.json");
  assert.equal(live.headers[0].value, liveCacheControl());
  const catchAll = vercel.headers.find((item) => item.source === "/(.*)");
  assert.ok(vercel.headers.indexOf(live) > vercel.headers.indexOf(catchAll));
});
