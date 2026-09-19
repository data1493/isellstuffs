import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPlayerCookieValue,
  boothPlayerFor,
  parseBoothPlayer,
  serializeBoothPlayer,
  tapeBoothPlayer,
} from "./booth-player";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("beats-under-the-table");
  assert.ok(stall);

  const taped = tapeBoothPlayer(
    stall,
    {},
    "I don't have a player. Still Sharpie.",
    new Date("2026-09-19T21:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPlayerCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPlayer(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"beats-under-the-table"/);

  const parsed = parseBoothPlayer(cookie);
  assert.deepEqual(Object.keys(parsed), ["beats-under-the-table"]);
  assert.equal(
    boothPlayerFor("beats-under-the-table", parsed)?.note,
    "I don't have a player. Still Sharpie.",
  );
  assert.equal(boothPlayerFor("sunday-crate", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPlayer(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("beats-under-the-table");
  const taped = tapeBoothPlayer(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
