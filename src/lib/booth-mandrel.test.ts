import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothMandrelCookieValue,
  boothMandrelFor,
  clearBoothMandrel,
  parseBoothMandrel,
  serializeBoothMandrel,
  tapeBoothMandrel,
} from "./booth-mandrel";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("beats-under-the-table");
  assert.ok(stall);

  const taped = tapeBoothMandrel(
    stall,
    {},
    "I don't have a mandrel. Still a table.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothMandrelCookieValue(taped.map);
  assert.equal(cookie, serializeBoothMandrel(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"beats-under-the-table"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothMandrel(cookie);
  assert.deepEqual(Object.keys(parsed), ["beats-under-the-table"]);
  assert.equal(
    boothMandrelFor("beats-under-the-table", parsed)?.note,
    "I don't have a mandrel. Still a table.",
  );
  assert.equal(boothMandrelFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothMandrelFor("half-working", parsed), undefined);
  assert.equal(boothMandrelFor("the-hall-closet", parsed), undefined);
  assert.equal(boothMandrelFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothMandrelFor("sunday-crate", parsed), undefined);
  assert.equal(boothMandrelFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothMandrel(writeResultLiteral), {});
  assert.deepEqual(parseBoothMandrel(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("beats-under-the-table");
  const taped = tapeBoothMandrel(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const beats = stallById("beats-under-the-table");
  assert.ok(beats);
  const taped = tapeBoothMandrel(
    beats,
    {},
    "I don't have a mandrel. Still a table.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothMandrel(beats, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothMandrelFor("beats-under-the-table", cleared.map), undefined);
});
