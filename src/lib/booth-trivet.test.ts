import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothTrivetCookieValue,
  boothTrivetFor,
  parseBoothTrivet,
  serializeBoothTrivet,
  tapeBoothTrivet,
} from "./booth-trivet";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-sink-drawer");
  assert.ok(stall);

  const taped = tapeBoothTrivet(
    stall,
    {},
    "I don't have a trivet. Still a drawer. Still a chip.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothTrivetCookieValue(taped.map);
  assert.equal(cookie, serializeBoothTrivet(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-sink-drawer"/);

  const parsed = parseBoothTrivet(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-sink-drawer"]);
  assert.equal(
    boothTrivetFor("the-sink-drawer", parsed)?.note,
    "I don't have a trivet. Still a drawer. Still a chip.",
  );
  assert.equal(boothTrivetFor("the-hall-closet", parsed), undefined);
  assert.equal(boothTrivetFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothTrivetFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothTrivetFor("half-working", parsed), undefined);
  assert.equal(boothTrivetFor("sunday-crate", parsed), undefined);
  assert.equal(boothTrivetFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothTrivet(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-sink-drawer");
  const taped = tapeBoothTrivet(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
