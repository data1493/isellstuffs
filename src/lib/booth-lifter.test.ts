import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothLifterCookieValue,
  boothLifterFor,
  clearBoothLifter,
  parseBoothLifter,
  serializeBoothLifter,
  tapeBoothLifter,
} from "./booth-lifter";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothLifter(
    stall,
    {},
    "I don't have a lifter. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothLifterCookieValue(taped.map);
  assert.equal(cookie, serializeBoothLifter(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothLifter(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothLifterFor("sunday-crate", parsed)?.note,
    "I don't have a lifter. Still a crate.",
  );
  assert.equal(boothLifterFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothLifterFor("the-hall-closet", parsed), undefined);
  assert.equal(boothLifterFor("half-working", parsed), undefined);
  assert.equal(boothLifterFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothLifterFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothLifterFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothLifter(writeResultLiteral), {});
  assert.deepEqual(parseBoothLifter(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothLifter(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothLifter(
    crate,
    {},
    "I don't have a lifter. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothLifter(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothLifterFor("sunday-crate", cleared.map), undefined);
});
