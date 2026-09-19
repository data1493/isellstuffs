import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothWickCookieValue,
  boothWickFor,
  clearBoothWick,
  parseBoothWick,
  serializeBoothWick,
  tapeBoothWick,
} from "./booth-wick";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothWick(
    stall,
    {},
    "I don't have a wick. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothWickCookieValue(taped.map);
  assert.equal(cookie, serializeBoothWick(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothWick(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothWickFor("half-working", parsed)?.note,
    "I don't have a wick. Still a table.",
  );
  assert.equal(boothWickFor("sunday-crate", parsed), undefined);
  assert.equal(boothWickFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothWickFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothWickFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothWickFor("the-hall-closet", parsed), undefined);
  assert.equal(boothWickFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothWick(writeResultLiteral), {});
  assert.deepEqual(parseBoothWick(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothWick(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const electronics = stallById("half-working");
  assert.ok(electronics);
  const taped = tapeBoothWick(
    electronics,
    {},
    "I don't have a wick. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothWick(electronics, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothWickFor("half-working", cleared.map), undefined);
});
