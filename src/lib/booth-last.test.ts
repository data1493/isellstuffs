import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothLastCookieValue,
  boothLastFor,
  clearBoothLast,
  parseBoothLast,
  serializeBoothLast,
  tapeBoothLast,
} from "./booth-last";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-hall-closet");
  assert.ok(stall);

  const taped = tapeBoothLast(
    stall,
    {},
    "I don't have a last. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothLastCookieValue(taped.map);
  assert.equal(cookie, serializeBoothLast(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-hall-closet"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothLast(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-hall-closet"]);
  assert.equal(
    boothLastFor("the-hall-closet", parsed)?.note,
    "I don't have a last. Still a table.",
  );
  assert.equal(boothLastFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothLastFor("half-working", parsed), undefined);
  assert.equal(boothLastFor("sunday-crate", parsed), undefined);
  assert.equal(boothLastFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothLastFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothLastFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothLast(writeResultLiteral), {});
  assert.deepEqual(parseBoothLast(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-hall-closet");
  const taped = tapeBoothLast(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const closet = stallById("the-hall-closet");
  assert.ok(closet);
  const taped = tapeBoothLast(
    closet,
    {},
    "I don't have a last. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothLast(closet, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothLastFor("the-hall-closet", cleared.map), undefined);
});
