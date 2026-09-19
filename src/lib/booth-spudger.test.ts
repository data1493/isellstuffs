import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSpudgerCookieValue,
  boothSpudgerFor,
  clearBoothSpudger,
  parseBoothSpudger,
  serializeBoothSpudger,
  tapeBoothSpudger,
} from "./booth-spudger";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothSpudger(
    stall,
    {},
    "I don't have a spudger. Still a blister.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSpudgerCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSpudger(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothSpudger(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothSpudgerFor("half-working", parsed)?.note,
    "I don't have a spudger. Still a blister.",
  );
  assert.equal(boothSpudgerFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothSpudgerFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSpudgerFor("sunday-crate", parsed), undefined);
  assert.equal(boothSpudgerFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothSpudgerFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothSpudgerFor("gift-desk", parsed), undefined);

  assert.deepEqual(parseBoothSpudger(JSON.stringify({ ok: true })), {});
  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSpudger(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothSpudger(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const electronics = stallById("half-working");
  assert.ok(electronics);
  const taped = tapeBoothSpudger(
    electronics,
    {},
    "I don't have a spudger. Still a blister.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothSpudger(electronics, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothSpudgerFor("half-working", cleared.map), undefined);
});
