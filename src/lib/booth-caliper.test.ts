import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothCaliperCookieValue,
  boothCaliperFor,
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
    "I don't have a caliper. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothCaliperCookieValue(taped.map);
  assert.equal(cookie, serializeBoothCaliper(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);

  const parsed = parseBoothCaliper(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothCaliperFor("folding-table-tuesday", parsed)?.note,
    "I don't have a caliper. Still a table.",
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
