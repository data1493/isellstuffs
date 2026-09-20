import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSnipsCookieValue,
  boothSnipsFor,
  clearBoothSnips,
  parseBoothSnips,
  serializeBoothSnips,
  tapeBoothSnips,
} from "./booth-snips";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothSnips(
    stall,
    {},
    "I don't have snips. Still a driveway. Still a tangle.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSnipsCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSnips(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothSnips(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothSnipsFor("half-working", parsed)?.note,
    "I don't have snips. Still a driveway. Still a tangle.",
  );
  assert.equal(boothSnipsFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothSnipsFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSnipsFor("sunday-crate", parsed), undefined);
  assert.equal(boothSnipsFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothSnipsFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothSnipsFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSnips(writeResultLiteral), {});
  assert.deepEqual(parseBoothSnips(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothSnips(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const electronics = stallById("half-working");
  assert.ok(electronics);
  const taped = tapeBoothSnips(
    electronics,
    {},
    "I don't have snips. Still a driveway. Still a tangle.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothSnips(electronics, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothSnipsFor("half-working", cleared.map), undefined);
});
