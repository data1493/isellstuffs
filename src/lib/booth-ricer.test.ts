import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothRicerCookieValue,
  boothRicerFor,
  parseBoothRicer,
  serializeBoothRicer,
  tapeBoothRicer,
} from "./booth-ricer";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-sink-drawer");
  assert.ok(stall);

  const taped = tapeBoothRicer(
    stall,
    {},
    "I don't have a ricer. Still a drawer.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothRicerCookieValue(taped.map);
  assert.equal(cookie, serializeBoothRicer(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-sink-drawer"/);

  const parsed = parseBoothRicer(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-sink-drawer"]);
  assert.equal(
    boothRicerFor("the-sink-drawer", parsed)?.note,
    "I don't have a ricer. Still a drawer.",
  );
  assert.equal(boothRicerFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothRicerFor("half-working", parsed), undefined);
  assert.equal(boothRicerFor("the-hall-closet", parsed), undefined);
  assert.equal(boothRicerFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothRicerFor("sunday-crate", parsed), undefined);
  assert.equal(boothRicerFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothRicer(writeResultLiteral), {});
  assert.deepEqual(parseBoothRicer(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-sink-drawer");
  const taped = tapeBoothRicer(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
