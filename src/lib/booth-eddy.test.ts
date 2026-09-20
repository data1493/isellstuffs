import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothEddyCookieValue,
  boothEddyFor,
  clearBoothEddy,
  parseBoothEddy,
  serializeBoothEddy,
  tapeBoothEddy,
} from "./booth-eddy";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothEddy(
    stall,
    {},
    "I don't have an eddy. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothEddyCookieValue(taped.map);
  assert.equal(cookie, serializeBoothEddy(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothEddy(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothEddyFor("sunday-crate", parsed)?.note,
    "I don't have an eddy. Still a crate.",
  );
  assert.equal(boothEddyFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothEddyFor("the-hall-closet", parsed), undefined);
  assert.equal(boothEddyFor("half-working", parsed), undefined);
  assert.equal(boothEddyFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothEddyFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothEddyFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothEddy(writeResultLiteral), {});
  assert.deepEqual(parseBoothEddy(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothEddy(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothEddy(
    crate,
    {},
    "I don't have an eddy. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothEddy(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothEddyFor("sunday-crate", cleared.map), undefined);
});
