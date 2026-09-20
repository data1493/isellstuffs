import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothBearingCookieValue,
  boothBearingFor,
  clearBoothBearing,
  parseBoothBearing,
  serializeBoothBearing,
  tapeBoothBearing,
} from "./booth-bearing";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothBearing(
    stall,
    {},
    "I don't have a bearing. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothBearingCookieValue(taped.map);
  assert.equal(cookie, serializeBoothBearing(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothBearing(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothBearingFor("sunday-crate", parsed)?.note,
    "I don't have a bearing. Still a crate.",
  );
  assert.equal(boothBearingFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothBearingFor("the-hall-closet", parsed), undefined);
  assert.equal(boothBearingFor("half-working", parsed), undefined);
  assert.equal(boothBearingFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothBearingFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothBearingFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothBearing(writeResultLiteral), {});
  assert.deepEqual(parseBoothBearing(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothBearing(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothBearing(
    crate,
    {},
    "I don't have a bearing. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothBearing(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothBearingFor("sunday-crate", cleared.map), undefined);
});
