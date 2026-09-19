import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSquareCookieValue,
  boothSquareFor,
  parseBoothSquare,
  serializeBoothSquare,
  tapeBoothSquare,
} from "./booth-square";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothSquare(
    stall,
    {},
    "I don't have a square. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSquareCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSquare(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);

  const parsed = parseBoothSquare(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothSquareFor("folding-table-tuesday", parsed)?.note,
    "I don't have a square. Still a table.",
  );
  assert.equal(boothSquareFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSquareFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothSquareFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothSquareFor("half-working", parsed), undefined);
  assert.equal(boothSquareFor("sunday-crate", parsed), undefined);
  assert.equal(boothSquareFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSquare(writeResultLiteral), {});
  assert.deepEqual(parseBoothSquare(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothSquare(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
