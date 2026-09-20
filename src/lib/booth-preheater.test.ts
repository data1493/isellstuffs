import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPreheaterCookieValue,
  boothPreheaterFor,
  clearBoothPreheater,
  parseBoothPreheater,
  serializeBoothPreheater,
  tapeBoothPreheater,
} from "./booth-preheater";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothPreheater(
    stall,
    {},
    "I don't have a preheater. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPreheaterCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPreheater(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothPreheater(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothPreheaterFor("half-working", parsed)?.note,
    "I don't have a preheater. Still a driveway.",
  );
  assert.equal(boothPreheaterFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothPreheaterFor("the-hall-closet", parsed), undefined);
  assert.equal(boothPreheaterFor("sunday-crate", parsed), undefined);
  assert.equal(boothPreheaterFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothPreheaterFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothPreheaterFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPreheater(writeResultLiteral), {});
  assert.deepEqual(parseBoothPreheater(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothPreheater(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const electronics = stallById("half-working");
  assert.ok(electronics);
  const taped = tapeBoothPreheater(
    electronics,
    {},
    "I don't have a preheater. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothPreheater(electronics, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothPreheaterFor("half-working", cleared.map), undefined);
});
