import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothVariacCookieValue,
  boothVariacFor,
  clearBoothVariac,
  parseBoothVariac,
  serializeBoothVariac,
  tapeBoothVariac,
} from "./booth-variac";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothVariac(
    stall,
    {},
    "I don't have a variac. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothVariacCookieValue(taped.map);
  assert.equal(cookie, serializeBoothVariac(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothVariac(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothVariacFor("half-working", parsed)?.note,
    "I don't have a variac. Still a driveway.",
  );
  assert.equal(boothVariacFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothVariacFor("the-hall-closet", parsed), undefined);
  assert.equal(boothVariacFor("sunday-crate", parsed), undefined);
  assert.equal(boothVariacFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothVariacFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothVariacFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothVariac(writeResultLiteral), {});
  assert.deepEqual(parseBoothVariac(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothVariac(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const halfWorking = stallById("half-working");
  assert.ok(halfWorking);
  const taped = tapeBoothVariac(
    halfWorking,
    {},
    "I don't have a variac. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothVariac(halfWorking, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothVariacFor("half-working", cleared.map), undefined);
});
