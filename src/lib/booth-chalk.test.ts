import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothChalkCookieValue,
  boothChalkFor,
  clearBoothChalk,
  parseBoothChalk,
  serializeBoothChalk,
  tapeBoothChalk,
} from "./booth-chalk";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-hall-closet");
  assert.ok(stall);

  const taped = tapeBoothChalk(
    stall,
    {},
    "I don't have chalk. Still a season.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothChalkCookieValue(taped.map);
  assert.equal(cookie, serializeBoothChalk(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-hall-closet"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothChalk(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-hall-closet"]);
  assert.equal(
    boothChalkFor("the-hall-closet", parsed)?.note,
    "I don't have chalk. Still a season.",
  );
  assert.equal(boothChalkFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothChalkFor("half-working", parsed), undefined);
  assert.equal(boothChalkFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothChalkFor("sunday-crate", parsed), undefined);
  assert.equal(boothChalkFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothChalkFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothChalk(writeResultLiteral), {});
  assert.deepEqual(parseBoothChalk(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-hall-closet");
  const taped = tapeBoothChalk(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const closet = stallById("the-hall-closet");
  assert.ok(closet);
  const taped = tapeBoothChalk(
    closet,
    {},
    "I don't have chalk. Still a season.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothChalk(closet, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothChalkFor("the-hall-closet", cleared.map), undefined);
});
