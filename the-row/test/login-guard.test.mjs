import test from "node:test";
import assert from "node:assert/strict";
import { emptyBook, keepName, loginName, makeKey, LOGIN_LIMIT, LOCK_MS } from "../js/accounts.mjs";
import { handleRow } from "../js/row-http.mjs";
import { createMemoryStore } from "../js/memory-store.mjs";

const now = 1_700_000_000_000;
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

test("F-09: a new key has at least 58 bits and uses a crypto source", () => {
  const key = makeKey();
  const chars = key.replace(/-/g, "");
  assert.ok([...chars].every((c) => ALPHABET.includes(c)), key);
  const bits = chars.length * Math.log2(ALPHABET.length);
  assert.ok(bits >= 58, `${key} is only ${bits.toFixed(1)} bits`);
  assert.ok(key.length <= 16, "fits the key input maxlength");
  // Math.random is not used: a stubbed Math.random must not decide the key.
  const real = Math.random;
  Math.random = () => 0;
  try {
    const a = makeKey();
    const b = makeKey();
    assert.notEqual(a, b);
  } finally {
    Math.random = real;
  }
});

test("F-09: the name locks after repeated wrong keys, even for the right key", () => {
  const kept = keepName(emptyBook(), { handle: "mint" }, now, { token: () => "tok-1", key: () => "ab3k-9qzz-xy7m" });
  let book = kept.book;
  for (let i = 0; i < LOGIN_LIMIT; i += 1) {
    const bad = loginName(book, { handle: "mint", key: `wrong-${i}` }, now);
    assert.equal(bad.ok, false);
    book = bad.book;
  }
  const locked = loginName(book, { handle: "mint", key: "ab3k-9qzz-xy7m" }, now + 1000);
  assert.equal(locked.ok, false);
  assert.match(locked.error, /Too many tries/);
  const later = loginName(locked.book, { handle: "mint", key: "ab3k-9qzz-xy7m" }, now + LOCK_MS + 1000);
  assert.equal(later.ok, true, later.error);
  const user = later.book.users.find((u) => u.handle === "mint");
  assert.ok(!user.loginFails, "a good login clears the counter");
});

test("F-09: failed logins are persisted through POST /login", async () => {
  const store = createMemoryStore({ crowd: false, now: () => now });
  const post = (path, body) => handleRow({ method: "POST", pathname: path, token: "", secure: false, bodyText: JSON.stringify(body), store, crowd: false, now: () => now });
  const kept = await post("/keep", { handle: "mint" });
  const key = kept.json.user.key;
  for (let i = 0; i < LOGIN_LIMIT; i += 1) await post("/login", { handle: "mint", key: "nope" });
  const right = await post("/login", { handle: "mint", key });
  assert.equal(right.status, 429);
});
