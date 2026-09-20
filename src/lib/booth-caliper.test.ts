import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothCaliperCookieValue,
  boothCaliperFor,
  clearBoothCaliper,
  parseBoothCaliper,
  serializeBoothCaliper,
  tapeBoothCaliper,
} from "./booth-caliper";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothCaliper(
    stall,
    {},
    "I don't have a caliper. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothCaliperCookieValue(taped.map);
  assert.equal(cookie, serializeBoothCaliper(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothCaliper(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothCaliperFor("folding-table-tuesday", parsed)?.note,
    "I don't have a caliper. Still a crack.",
  );
  assert.equal(boothCaliperFor("the-hall-closet", parsed), undefined);
  assert.equal(boothCaliperFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothCaliperFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothCaliperFor("half-working", parsed), undefined);
  assert.equal(boothCaliperFor("sunday-crate", parsed), undefined);
  assert.equal(boothCaliperFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothCaliper(writeResultLiteral), {});
  assert.deepEqual(parseBoothCaliper(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothCaliper(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const tuesday = stallById("folding-table-tuesday");
  assert.ok(tuesday);
  const taped = tapeBoothCaliper(
    tuesday,
    {},
    "I don't have a caliper. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothCaliper(tuesday, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothCaliperFor("folding-table-tuesday", cleared.map), undefined);
});
