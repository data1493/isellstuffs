import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothWandCookieValue,
  boothWandFor,
  clearBoothWand,
  parseBoothWand,
  serializeBoothWand,
  tapeBoothWand,
} from "./booth-wand";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothWand(
    stall,
    {},
    "I don't have a wand. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothWandCookieValue(taped.map);
  assert.equal(cookie, serializeBoothWand(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothWand(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothWandFor("sunday-crate", parsed)?.note,
    "I don't have a wand. Still a crate.",
  );
  assert.equal(boothWandFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothWandFor("the-hall-closet", parsed), undefined);
  assert.equal(boothWandFor("half-working", parsed), undefined);
  assert.equal(boothWandFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothWandFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothWandFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothWand(writeResultLiteral), {});
  assert.deepEqual(parseBoothWand(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothWand(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothWand(
    crate,
    {},
    "I don't have a wand. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothWand(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothWandFor("sunday-crate", cleared.map), undefined);
});
