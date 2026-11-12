import test from "node:test";
import assert from "node:assert/strict";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";
import { createBlobStore } from "../js/blob-store.mjs";
import { LINE_CAP, LINE_MAX, VIBE_GAP_MS, VIBE_MAX, screenPublicText } from "../js/moderate.mjs";
import { SLURS } from "../js/blocklist.mjs";

const start = 1_700_000_000_000;

function memory(at = start) {
  return createMemoryStore({ crowd: false, now: () => at });
}

function call(store, path, body, token = "", at = start) {
  return handleRow({
    method: body ? "POST" : "GET",
    pathname: path,
    token,
    secure: false,
    bodyText: body ? JSON.stringify(body) : "",
    store,
    crowd: false,
    now: () => at,
  });
}

async function player(store, handle, at = start) {
  const kept = await call(store, "/keep", { handle }, "", at);
  assert.equal(kept.status, 200, kept.json?.error);
  const token = readCookie(kept.cookie);
  const queued = await call(store, "/queue", { handle, link: `https://${handle}.room` }, token, at);
  assert.equal(queued.status, 200, queued.json?.error);
  return token;
}

async function seat(store, handle) {
  await store.transact(({ live, saveLive }) => {
    const state = structuredClone(live.state);
    state.people = [
      { handle, link: `https://${handle}.room` },
      { handle: "nova", link: "https://nova.room" },
    ];
    state.seats = { left: handle, right: "nova" };
    state.queue = [];
    state.pile = { ...state.pile, status: "open", winner: null, game: null, leftScore: 0, rightScore: 0 };
    state.line = { leftText: "", rightText: "", leftVotes: 0, rightVotes: 0 };
    saveLive({ ...live, state });
  });
}

async function vibesOf(store) {
  const live = await call(store, "/live.json", null);
  return live.json.vibes;
}

test("public text is trimmed, collapsed, and stripped of control and zero-width characters", () => {
  const cleaned = screenPublicText(" \u0001 he\u200bllo \n  there \u0007 ");
  assert.equal(cleaned.ok, true);
  assert.equal(cleaned.text, "hello there");
  assert.equal(VIBE_MAX, 80);
  assert.equal(LINE_MAX, 80);
  assert.equal(screenPublicText("ab".repeat(40)).ok, true);
  assert.equal(screenPublicText(`${"ab".repeat(40)}c`).error, "Keep it to one line.");
  assert.equal(screenPublicText("   ").error, "Say something.");
  assert.equal(screenPublicText(12).error, "Say something.");
});

test("the blocklist rejects slurs, links, mention floods, and repeated characters", () => {
  assert.ok(SLURS.length >= 4);
  assert.equal(screenPublicText(`no ${SLURS[0]} here`).error, "That line can't go up.");
  assert.equal(screenPublicText("n.i.g.g.e.r").error, "That line can't go up.");
  assert.equal(screenPublicText("a faggot line").error, "That line can't go up.");
  assert.equal(screenPublicText("what a fag").error, "That line can't go up.");
  assert.equal(screenPublicText("spicy classic snippet").ok, true);
  assert.equal(screenPublicText("see http://evil.example/x").error, "Links stay off the wall.");
  assert.equal(screenPublicText("visit www.spam.example").error, "Links stay off the wall.");
  assert.equal(screenPublicText("come to play.io now").error, "Links stay off the wall.");
  assert.equal(screenPublicText("hey @a @b @c").ok, true);
  assert.equal(screenPublicText("hey @a @b @c @d").error, "Too many @s.");
  assert.equal(screenPublicText("a".repeat(7)).ok, true);
  assert.equal(screenPublicText("a".repeat(8)).error, "Ease off the repeats.");
});

test("a rejected vibe is a 4xx and is never stored", async () => {
  const store = memory();
  const token = await player(store, "mint");
  const before = JSON.stringify(await vibesOf(store));
  const slur = await call(store, "/vibe", { handle: "mint", text: `  ${SLURS[0]}  ` }, token);
  assert.equal(slur.status, 400);
  assert.equal(slur.json.error, "That line can't go up.");
  assert.equal(JSON.stringify(await vibesOf(store)), before);
  const link = await call(store, "/vibe", { handle: "mint", text: "www.spam.example" }, token);
  assert.equal(link.status, 400);
  assert.equal(link.json.error, "Links stay off the wall.");
  assert.equal(JSON.stringify(await vibesOf(store)), before);
  const anon = await call(store, "/vibe", { handle: "walker", text: "hello" });
  assert.equal(anon.status, 400);
  assert.equal(anon.json.error, "Keep a name first.");
});

test("a kept line is stored clean, and the next vibe waits 30 seconds", async () => {
  const store = memory();
  const token = await player(store, "mint");
  const posted = await call(store, "/vibe", { handle: "mint", text: " \u0001he\u200bllo   room " }, token, start);
  assert.equal(posted.status, 200, posted.json?.error);
  assert.equal((await vibesOf(store))[0].text, "hello room");
  const soon = await call(store, "/vibe", { handle: "mint", text: "again" }, token, start + VIBE_GAP_MS - 1);
  assert.equal(soon.status, 429);
  assert.equal(soon.json.error, "The wall needs a breath.");
  assert.notEqual((await vibesOf(store))[0].text, "again");
  const later = await call(store, "/vibe", { handle: "mint", text: "again" }, token, start + VIBE_GAP_MS);
  assert.equal(later.status, 200, later.json?.error);
  assert.equal((await vibesOf(store))[0].text, "again");
});

test("best line text is screened, capped per round, and reset on the next round", async () => {
  const store = memory();
  const token = await player(store, "mint");
  await seat(store, "mint");
  const blocked = await call(store, "/act", { handle: "mint", side: "left", kind: "line", text: "http://nope.example" }, token);
  assert.equal(blocked.status, 400);
  assert.equal(blocked.json.error, "Links stay off the wall.");
  const live = await call(store, "/live.json", null);
  assert.equal(live.json.line.leftText, "");
  for (let i = 0; i < LINE_CAP; i += 1) {
    const line = await call(store, "/act", {
      handle: "mint",
      side: "left",
      kind: "line",
      text: `  line ${i}   stays `,
    }, token, start + i);
    assert.equal(line.status, 200, line.json?.error);
  }
  const shown = await call(store, "/live.json", null);
  assert.equal(shown.json.line.leftText, `line ${LINE_CAP - 1} stays`);
  const over = await call(store, "/act", { handle: "mint", side: "left", kind: "line", text: "one more" }, token);
  assert.equal(over.status, 429);
  assert.equal(over.json.error, "That's enough lines this round.");
  assert.equal((await call(store, "/live.json", null)).json.line.leftText, `line ${LINE_CAP - 1} stays`);
  await store.transact(({ live, saveLive }) => {
    saveLive({ ...live, state: { ...live.state, dealt: (live.state.dealt || 0) + 1 } });
  });
  const fresh = await call(store, "/act", { handle: "mint", side: "left", kind: "line", text: "new round" }, token);
  assert.equal(fresh.status, 200, fresh.json?.error);
  assert.equal((await call(store, "/live.json", null)).json.line.leftText, "new round");
});

test("a personal best line with a slur is not stored", async () => {
  const store = memory();
  const token = await player(store, "mint");
  const played = await call(store, "/round", { kind: "line", side: "left", text: SLURS[1] }, token);
  assert.equal(played.status, 400);
  assert.equal(played.json.error, "That line can't go up.");
  const round = await store.transact(({ book }) => book.users.find((user) => user.handle === "mint").round);
  assert.equal(round, undefined);
});

test("the vibe pace is in the shared blob and the etag write keeps it", async () => {
  let doc = null;
  let serial = 0;
  const blob = {
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
      if (doc && !etag) {
        const error = new Error("The room changed.");
        error.code = "CONFLICT";
        throw error;
      }
      serial += 1;
      doc = { value: structuredClone(value), etag: `e${serial}` };
    },
  };
  let clock = start;
  const open = () => createBlobStore({
    read: blob.read,
    write: blob.write,
    crowd: false,
    now: () => clock,
    wait: async () => {},
  });
  const token = await player(open(), "mint", clock);
  const posted = await call(open(), "/vibe", { handle: "mint", text: "on the wall" }, token, clock);
  assert.equal(posted.status, 200, posted.json?.error);
  const stored = await blob.read();
  assert.equal(stored.value.live.state.vibes[0].text, "on the wall");
  assert.equal(stored.value.book.sessions.find((item) => item.token === token).vibeAt, clock);
  const again = await call(open(), "/vibe", { handle: "mint", text: "too soon" }, token, clock + 1000);
  assert.equal(again.status, 429);
  assert.equal((await blob.read()).value.live.state.vibes[0].text, "on the wall");
});
