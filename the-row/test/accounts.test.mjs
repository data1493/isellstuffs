import test from "node:test";
import assert from "node:assert/strict";
import { actingHandle, dropSession, emptyBook, hardenBook, keepName, loginName, playRound, readUser, recordRound } from "../js/accounts.mjs";

const now = 1_700_000_000_000;

test("keep reserves a name and the same session can rename it", () => {
  const first = keepName(emptyBook(), { handle: " Mint " }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  assert.equal(first.ok, true);
  assert.equal(first.user.handle, "mint");
  assert.equal(first.user.key, "ab3-k9q");
  assert.equal(readUser(first.book, first.token, now).handle, "mint");

  const renamed = keepName(first.book, { handle: "MINTY", token: first.token }, now);
  assert.equal(renamed.ok, true);
  assert.equal(renamed.token, first.token);
  assert.equal(renamed.user.handle, "minty");
  assert.equal(renamed.user.key, undefined);
  const stored = renamed.book.users.find((user) => user.handle === "minty");
  assert.equal(stored.key, undefined);
  assert.equal(typeof stored.keyHash, "string");
});

test("a kept name stays with the first person", () => {
  const first = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-a", key: () => "ab3-k9q" });
  const second = keepName(first.book, { handle: "MINT" }, now, { token: () => "tok-b", key: () => "zz9-qqq" });
  assert.equal(second.ok, false);
  assert.equal(second.error, "That name is kept.");
  assert.equal(readUser(second.book, first.token, now).handle, "mint");
});

test("names already in the room cannot be kept", () => {
  const result = keepName(emptyBook(), { handle: "juno" }, now);
  assert.equal(result.ok, false);
  assert.equal(result.error, "That name is already in the room.");
});

test("a kept name can only be played by its session", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  assert.equal(actingHandle(kept.book, kept.token, "someone", now).error, "Play as your name.");
  assert.equal(actingHandle(kept.book, kept.token, "mint", now).handle, "mint");
  assert.equal(actingHandle(kept.book, "", "mint", now).error, "That name is kept.");
  assert.equal(actingHandle(kept.book, "", "guest", now).handle, "guest");
});

test("a win sticks on the kept name and a guest writes nothing", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  const won = recordRound(kept.book, { winner: "Mint", loser: "guest", held: true }, now);
  assert.equal(won.wrote, true);
  assert.equal(readUser(won.book, kept.token, now).streak, 1);
  assert.equal(readUser(won.book, kept.token, now).wins, 1);
  assert.equal(readUser(won.book, kept.token, now).dropsKept, 1);
  const again = recordRound(won.book, { winner: "mint", loser: "guest", held: false }, now + 1);
  assert.equal(readUser(again.book, kept.token, now + 1).streak, 2);
  assert.equal(readUser(again.book, kept.token, now + 1).dropsKept, 1);
  const lost = recordRound(again.book, { winner: "guest", loser: "mint", held: false }, now + 2);
  assert.equal(readUser(lost.book, kept.token, now + 2).streak, 0);
  assert.equal(readUser(lost.book, kept.token, now + 2).losses, 1);
  assert.equal(readUser(lost.book, kept.token, now + 2).wins, 2);
  const guests = recordRound(emptyBook(), { winner: "walker", loser: "guest" }, now);
  assert.equal(guests.wrote, false);
  assert.equal(guests.book.users.length, 0);
});

function play(book, token, move, at) {
  const result = playRound(book, token, move, at);
  assert.equal(result.ok, true, result.error);
  return result;
}

test("a played round credits only the session and a claim does not", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  const other = keepName(kept.book, { handle: "other" }, now, { token: () => "tok-o", key: () => "zz9-qqq" });
  let book = other.book;
  let at = now;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "pile", side: "left" }, at++).book;
  assert.equal(readUser(book, kept.token, at).wins, 1);
  assert.equal(readUser(book, kept.token, at).streak, 1);
  assert.equal(readUser(book, kept.token, at).dropsKept, 1);
  assert.deepEqual(readUser(book, kept.token, at).prizes, ["bold"]);
  assert.equal(readUser(book, kept.token, at).losses, 0);
  const extra = playRound(book, kept.token, { kind: "pile", side: "left" }, at++);
  assert.equal(extra.ok, false);
  assert.equal(readUser(extra.book, kept.token, at).wins, 1);
  const claim = playRound(book, kept.token, { winner: "mint", loser: "other", held: true, mark: "pad:1" }, at++);
  assert.equal(claim.ok, false);
  assert.equal(claim.error, "Pick a move.");
  assert.equal(readUser(book, kept.token, at).wins, 1);
  assert.equal(readUser(book, other.token, at).losses, 0);
  book = play(book, kept.token, { kind: "reset" }, at++).book;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "pile", side: "right" }, at++).book;
  assert.equal(readUser(book, kept.token, at).losses, 1);
  assert.equal(readUser(book, kept.token, at).streak, 0);
  assert.equal(readUser(book, kept.token, at).wins, 1);
  assert.equal(readUser(book, other.token, at).losses, 0);
  book = play(book, kept.token, { kind: "reset" }, at++).book;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "pile", side: "left" }, at++).book;
  assert.equal(readUser(book, kept.token, at).wins, 2);
  assert.equal(readUser(book, kept.token, at).dropsKept, 2);
  assert.deepEqual(readUser(book, kept.token, at).prizes, ["bold"]);
  assert.equal(playRound(book, "", { kind: "pile", side: "left" }, at).error, "Keep a name first.");
  assert.equal(readUser(book, other.token, at).wins, 0);
});

test("best line and the lane credit one win", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  let book = kept.book;
  let at = now;
  book = play(book, kept.token, { kind: "line", side: "left", text: "left line" }, at++).book;
  book = play(book, kept.token, { kind: "line", side: "right", text: "right line" }, at++).book;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "vote", side: "left" }, at++).book;
  assert.equal(readUser(book, kept.token, at).wins, 1);
  assert.equal(playRound(book, kept.token, { kind: "vote", side: "left" }, at).ok, false);
  assert.equal(readUser(book, kept.token, at).wins, 1);

  const lane = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  let laneBook = play(lane.book, lane.token, { kind: "arm", mark: 40 }, now).book;
  laneBook = play(laneBook, lane.token, { kind: "tap", side: "left", spot: 40 }, now + 1).book;
  assert.equal(readUser(laneBook, lane.token, now + 1).wins, 0);
  laneBook = play(laneBook, lane.token, { kind: "tap", side: "right", spot: 90 }, now + 2).book;
  assert.equal(readUser(laneBook, lane.token, now + 2).wins, 1);
  assert.equal(readUser(laneBook, lane.token, now + 2).dropsKept, 1);
  assert.deepEqual(readUser(laneBook, lane.token, now + 2).prizes, ["bold"]);
});

test("a different drop is kept once, and a loss adds nothing", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  let book = kept.book;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "pile", side: "left", drop: "j190" }, now + i).book;
  assert.deepEqual(readUser(book, kept.token, now + 5).prizes, ["j190"]);
  book = play(book, kept.token, { kind: "reset" }, now + 5).book;
  for (let i = 0; i < 5; i += 1) book = play(book, kept.token, { kind: "pile", side: "left", drop: "j190" }, now + 6 + i).book;
  assert.deepEqual(readUser(book, kept.token, now + 11).prizes, ["j190"]);
  assert.equal(readUser(book, kept.token, now + 11).dropsKept, 2);
  const crowd = recordRound(book, { winner: "mint", loser: "jun", held: true, dropId: "list" }, now + 12);
  assert.deepEqual(readUser(crowd.book, kept.token, now + 12).prizes, ["j190", "list"]);
  const missed = recordRound(crowd.book, { winner: "mint", loser: "jun", held: true, dropId: "nope" }, now + 13);
  assert.deepEqual(readUser(missed.book, kept.token, now + 13).prizes, ["j190", "list"]);
  const fresh = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  assert.equal(playRound(fresh.book, fresh.token, { kind: "pile", side: "left", drop: "missing" }, now).error, "That drop isn’t on the floor.");
});

test("a key logs the name back in after this browser steps out", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3-k9q" });
  const gone = dropSession(kept.book, kept.token);
  assert.equal(readUser(gone, kept.token, now), null);
  const stored = kept.book.users.find((user) => user.handle === "mint");
  assert.equal(stored.key, undefined);
  assert.equal(typeof stored.keyHash, "string");
  assert.equal(readUser(kept.book, kept.token, now).key, undefined);
  const back = loginName(gone, { handle: "Mint", key: " AB3-K9Q " }, now, { token: () => "tok-2" });
  assert.equal(back.ok, true);
  assert.equal(back.user.handle, "mint");
  assert.equal(back.user.key, "ab3-k9q");
  assert.equal(readUser(back.book, "tok-2", now).key, undefined);
  const wrong = loginName(back.book, { handle: "mint", key: "nope" }, now);
  assert.equal(wrong.ok, false);
  assert.equal(wrong.error, "That key does not match.");
});

test("a plaintext key on the book becomes a hash and still logs in", () => {
  const book = emptyBook();
  book.users.push({ id: "u1", handle: "plainkey", key: "ab3-k9q", createdAt: now });
  assert.equal(hardenBook(book), true);
  assert.equal(book.users[0].key, undefined);
  assert.equal(typeof book.users[0].keyHash, "string");
  assert.equal(hardenBook(book), false);
  const back = loginName(book, { handle: "plainkey", key: "ab3-k9q" }, now, { token: () => "tok-h" });
  assert.equal(back.ok, true);
  assert.equal(back.user.key, "ab3-k9q");
  assert.equal(readUser(back.book, "tok-h", now).key, undefined);
});
