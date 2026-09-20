import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothGoboCookieValue,
  boothGoboFor,
  clearBoothGobo,
  parseBoothGobo,
  serializeBoothGobo,
  tapeBoothGobo,
} from "./booth-gobo";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("beats-under-the-table");
  assert.ok(stall);

  const taped = tapeBoothGobo(
    stall,
    {},
    "I don't have a gobo. Still a folder.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothGoboCookieValue(taped.map);
  assert.equal(cookie, serializeBoothGobo(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"beats-under-the-table"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothGobo(cookie);
  assert.deepEqual(Object.keys(parsed), ["beats-under-the-table"]);
  assert.equal(
    boothGoboFor("beats-under-the-table", parsed)?.note,
    "I don't have a gobo. Still a folder.",
  );
  assert.equal(boothGoboFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothGoboFor("the-hall-closet", parsed), undefined);
  assert.equal(boothGoboFor("half-working", parsed), undefined);
  assert.equal(boothGoboFor("sunday-crate", parsed), undefined);
  assert.equal(boothGoboFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothGoboFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothGobo(writeResultLiteral), {});
  assert.deepEqual(parseBoothGobo(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("beats-under-the-table");
  const taped = tapeBoothGobo(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const beats = stallById("beats-under-the-table");
  assert.ok(beats);
  const taped = tapeBoothGobo(
    beats,
    {},
    "I don't have a gobo. Still a folder.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothGobo(beats, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothGoboFor("beats-under-the-table", cleared.map), undefined);
});
