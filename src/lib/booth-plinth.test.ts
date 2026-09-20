import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPlinthCookieValue,
  boothPlinthFor,
  clearBoothPlinth,
  parseBoothPlinth,
  serializeBoothPlinth,
  tapeBoothPlinth,
} from "./booth-plinth";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothPlinth(
    stall,
    {},
    "I don't have a plinth. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPlinthCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPlinth(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothPlinth(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothPlinthFor("sunday-crate", parsed)?.note,
    "I don't have a plinth. Still a crate.",
  );
  assert.equal(boothPlinthFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothPlinthFor("the-hall-closet", parsed), undefined);
  assert.equal(boothPlinthFor("half-working", parsed), undefined);
  assert.equal(boothPlinthFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothPlinthFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothPlinthFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPlinth(writeResultLiteral), {});
  assert.deepEqual(parseBoothPlinth(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothPlinth(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothPlinth(
    crate,
    {},
    "I don't have a plinth. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothPlinth(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothPlinthFor("sunday-crate", cleared.map), undefined);
});
