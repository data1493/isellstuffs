import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPonyCookieValue,
  boothPonyFor,
  clearBoothPony,
  parseBoothPony,
  serializeBoothPony,
  tapeBoothPony,
} from "./booth-pony";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-hall-closet");
  assert.ok(stall);

  const taped = tapeBoothPony(
    stall,
    {},
    "I don't have a pony. Still a closet.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPonyCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPony(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-hall-closet"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothPony(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-hall-closet"]);
  assert.equal(
    boothPonyFor("the-hall-closet", parsed)?.note,
    "I don't have a pony. Still a closet.",
  );
  assert.equal(boothPonyFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothPonyFor("half-working", parsed), undefined);
  assert.equal(boothPonyFor("sunday-crate", parsed), undefined);
  assert.equal(boothPonyFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothPonyFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothPonyFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPony(writeResultLiteral), {});
  assert.deepEqual(parseBoothPony(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-hall-closet");
  const taped = tapeBoothPony(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const closet = stallById("the-hall-closet");
  assert.ok(closet);
  const taped = tapeBoothPony(
    closet,
    {},
    "I don't have a pony. Still a closet.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothPony(closet, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothPonyFor("the-hall-closet", cleared.map), undefined);
});
