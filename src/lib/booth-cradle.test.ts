import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothCradleCookieValue,
  boothCradleFor,
  clearBoothCradle,
  parseBoothCradle,
  serializeBoothCradle,
  tapeBoothCradle,
} from "./booth-cradle";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothCradle(
    stall,
    {},
    "I don't have a cradle. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothCradleCookieValue(taped.map);
  assert.equal(cookie, serializeBoothCradle(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothCradle(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothCradleFor("sunday-crate", parsed)?.note,
    "I don't have a cradle. Still a crate.",
  );
  assert.equal(boothCradleFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothCradleFor("the-hall-closet", parsed), undefined);
  assert.equal(boothCradleFor("half-working", parsed), undefined);
  assert.equal(boothCradleFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothCradleFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothCradleFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothCradle(writeResultLiteral), {});
  assert.deepEqual(parseBoothCradle(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothCradle(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothCradle(
    crate,
    {},
    "I don't have a cradle. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothCradle(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothCradleFor("sunday-crate", cleared.map), undefined);
});
