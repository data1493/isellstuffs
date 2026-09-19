import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothMirrorCookieValue,
  boothMirrorFor,
  parseBoothMirror,
  serializeBoothMirror,
  tapeBoothMirror,
} from "./booth-mirror";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-hall-closet");
  assert.ok(stall);

  const taped = tapeBoothMirror(
    stall,
    {},
    "I don't have a mirror. Still a rack.",
    new Date("2026-09-19T21:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothMirrorCookieValue(taped.map);
  assert.equal(cookie, serializeBoothMirror(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-hall-closet"/);

  const parsed = parseBoothMirror(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-hall-closet"]);
  assert.equal(
    boothMirrorFor("the-hall-closet", parsed)?.note,
    "I don't have a mirror. Still a rack.",
  );
  assert.equal(boothMirrorFor("sunday-crate", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothMirror(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-hall-closet");
  const taped = tapeBoothMirror(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
