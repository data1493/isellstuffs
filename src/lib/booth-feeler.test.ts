import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothFeelerCookieValue,
  boothFeelerFor,
  clearBoothFeeler,
  parseBoothFeeler,
  serializeBoothFeeler,
  tapeBoothFeeler,
} from "./booth-feeler";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothFeeler(
    stall,
    {},
    "I don't have a feeler. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothFeelerCookieValue(taped.map);
  assert.equal(cookie, serializeBoothFeeler(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothFeeler(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothFeelerFor("folding-table-tuesday", parsed)?.note,
    "I don't have a feeler. Still a crack.",
  );
  assert.equal(boothFeelerFor("the-hall-closet", parsed), undefined);
  assert.equal(boothFeelerFor("half-working", parsed), undefined);
  assert.equal(boothFeelerFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothFeelerFor("sunday-crate", parsed), undefined);
  assert.equal(boothFeelerFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothFeelerFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothFeeler(writeResultLiteral), {});
  assert.deepEqual(parseBoothFeeler(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothFeeler(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const tuesday = stallById("folding-table-tuesday");
  assert.ok(tuesday);
  const taped = tapeBoothFeeler(
    tuesday,
    {},
    "I don't have a feeler. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothFeeler(tuesday, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothFeelerFor("folding-table-tuesday", cleared.map), undefined);
});
