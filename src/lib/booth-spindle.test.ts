import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSpindleCookieValue,
  boothSpindleFor,
  parseBoothSpindle,
  serializeBoothSpindle,
  tapeBoothSpindle,
} from "./booth-spindle";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("beats-under-the-table");
  assert.ok(stall);

  const taped = tapeBoothSpindle(
    stall,
    {},
    "I don't have a spindle. Still a jewel.",
    new Date("2026-09-19T21:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSpindleCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSpindle(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"beats-under-the-table"/);

  const parsed = parseBoothSpindle(cookie);
  assert.deepEqual(Object.keys(parsed), ["beats-under-the-table"]);
  assert.equal(
    boothSpindleFor("beats-under-the-table", parsed)?.note,
    "I don't have a spindle. Still a jewel.",
  );
  assert.equal(boothSpindleFor("sunday-crate", parsed), undefined);
  assert.equal(boothSpindleFor("half-working", parsed), undefined);
  assert.equal(boothSpindleFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSpindleFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothSpindleFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothSpindleFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSpindle(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("beats-under-the-table");
  const taped = tapeBoothSpindle(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
