import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothStatorCookieValue,
  boothStatorFor,
  clearBoothStator,
  parseBoothStator,
  serializeBoothStator,
  tapeBoothStator,
} from "./booth-stator";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothStator(
    stall,
    {},
    "I don't have a stator. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothStatorCookieValue(taped.map);
  assert.equal(cookie, serializeBoothStator(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothStator(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothStatorFor("sunday-crate", parsed)?.note,
    "I don't have a stator. Still a crate.",
  );
  assert.equal(boothStatorFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothStatorFor("the-hall-closet", parsed), undefined);
  assert.equal(boothStatorFor("half-working", parsed), undefined);
  assert.equal(boothStatorFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothStatorFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothStatorFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothStator(writeResultLiteral), {});
  assert.deepEqual(parseBoothStator(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothStator(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothStator(
    crate,
    {},
    "I don't have a stator. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothStator(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothStatorFor("sunday-crate", cleared.map), undefined);
});
