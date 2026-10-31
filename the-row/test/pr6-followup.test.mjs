import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_CAP, SESSION_CAP, emptyBook, keepName, loginName } from "../js/accounts.mjs";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";
import { armLane, revive, seedRoom, tapLane } from "../js/room.mjs";

const now = 1_700_000_000_000;

test("F-04: the account book is capped and a full book refuses new names", () => {
  let book = emptyBook();
  for (let i = 0; i < ACCOUNT_CAP; i += 1) {
    const kept = keepName(book, { handle: `spam${i}` }, now, { token: () => `t${i}-${Math.random()}`, key: () => "ab3-k9q" });
    assert.equal(kept.ok, true);
    book = kept.book;
  }
  const over = keepName(book, { handle: "onemore" }, now, { key: () => "ab3-k9q" });
  assert.equal(over.ok, false);
  assert.equal(over.error, "The room has no names left.");
  assert.equal(over.book.users.length, ACCOUNT_CAP);
  assert.ok(JSON.stringify(over.book).length < 100_000);
});

test("F-04: one name keeps only its newest sessions", () => {
  let n = 0;
  const first = keepName(emptyBook(), { handle: "mint" }, now, { token: () => `tok-${n++}`, key: () => "ab3-k9q" });
  let book = first.book;
  for (let i = 0; i < SESSION_CAP + 5; i += 1) {
    const login = loginName(book, { handle: "mint", key: "ab3-k9q" }, now + i, { token: () => `login-${i}` });
    assert.equal(login.ok, true);
    book = login.book;
  }
  assert.equal(book.sessions.length, SESSION_CAP);
  assert.ok(book.sessions.some((s) => s.token === `login-${SESSION_CAP + 4}`));
});

test("F-17: a malformed session cookie reads as logged out", async () => {
  assert.equal(readCookie("row=%E0"), "");
  assert.equal(readCookie("a=%E0; row=ok"), "ok");
});

test("F-16: revive keeps fractional lane positions", () => {
  let state = seedRoom();
  state.pile.game = null;
  const armed = armLane(state, 50.6);
  assert.equal(armed.ok, true, armed.error);
  const tapped = tapLane(armed.state, "left", 50.4);
  assert.equal(tapped.ok, true, tapped.error);
  const back = revive(JSON.parse(JSON.stringify(tapped.state)));
  assert.equal(back.lane.mark, 50.6);
  assert.equal(back.lane.leftTap, 50.4);
});

test("F-22: a queue ticket is stamped with the injected clock", async () => {
  const store = createMemoryStore({ crowd: false, now: () => 1_000_000 });
  const call = (path, body, token = "") => handleRow({
    method: "POST", pathname: path, token, secure: false, bodyText: JSON.stringify(body), store, crowd: false, now: () => 1_000_000,
  });
  const kept = await call("/keep", { handle: "mint" });
  const token = readCookie(kept.cookie);
  const queued = await call("/queue", { handle: "mint" }, token);
  assert.equal(queued.status, 200, JSON.stringify(queued.json));
  const ticket = await store.transact(({ live }) => (live.state.queue || []).find((item) => item.handle === "mint"));
  assert.ok(ticket, "mint is queued or seated");
  assert.equal(ticket.at, 1_000_000);
});
