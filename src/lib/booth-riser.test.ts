import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothRiserCookieValue,
  boothRiserFor,
  clearBoothRiser,
  parseBoothRiser,
  serializeBoothRiser,
  tapeBoothRiser,
} from "./booth-riser";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothRiser(
    stall,
    {},
    "I don't have a riser. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothRiserCookieValue(taped.map);
  assert.equal(cookie, serializeBoothRiser(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothRiser(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothRiserFor("sunday-crate", parsed)?.note,
    "I don't have a riser. Still a crate.",
  );
  assert.equal(boothRiserFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothRiserFor("the-hall-closet", parsed), undefined);
  assert.equal(boothRiserFor("half-working", parsed), undefined);
  assert.equal(boothRiserFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothRiserFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothRiserFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothRiser(writeResultLiteral), {});
  assert.deepEqual(parseBoothRiser(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothRiser(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothRiser(
    crate,
    {},
    "I don't have a riser. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothRiser(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothRiserFor("sunday-crate", cleared.map), undefined);
});
