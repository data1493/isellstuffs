import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothTorpedoCookieValue,
  boothTorpedoFor,
  clearBoothTorpedo,
  parseBoothTorpedo,
  serializeBoothTorpedo,
  tapeBoothTorpedo,
} from "./booth-torpedo";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothTorpedo(
    stall,
    {},
    "I don't have a torpedo. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothTorpedoCookieValue(taped.map);
  assert.equal(cookie, serializeBoothTorpedo(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothTorpedo(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothTorpedoFor("folding-table-tuesday", parsed)?.note,
    "I don't have a torpedo. Still a crack.",
  );
  assert.equal(boothTorpedoFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothTorpedoFor("the-hall-closet", parsed), undefined);
  assert.equal(boothTorpedoFor("half-working", parsed), undefined);
  assert.equal(boothTorpedoFor("sunday-crate", parsed), undefined);
  assert.equal(boothTorpedoFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothTorpedoFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothTorpedo(writeResultLiteral), {});
  assert.deepEqual(parseBoothTorpedo(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothTorpedo(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const booth = stallById("folding-table-tuesday");
  assert.ok(booth);
  const taped = tapeBoothTorpedo(
    booth,
    {},
    "I don't have a torpedo. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothTorpedo(booth, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothTorpedoFor("folding-table-tuesday", cleared.map), undefined);
});
