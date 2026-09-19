import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPreampCookieValue,
  boothPreampFor,
  parseBoothPreamp,
  serializeBoothPreamp,
  tapeBoothPreamp,
} from "./booth-preamp";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothPreamp(
    stall,
    {},
    "I don't have a preamp. Still a crate.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPreampCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPreamp(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);

  const parsed = parseBoothPreamp(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothPreampFor("sunday-crate", parsed)?.note,
    "I don't have a preamp. Still a crate.",
  );
  assert.equal(boothPreampFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothPreampFor("the-hall-closet", parsed), undefined);
  assert.equal(boothPreampFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothPreampFor("half-working", parsed), undefined);
  assert.equal(boothPreampFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothPreampFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPreamp(writeResultLiteral), {});
  assert.deepEqual(parseBoothPreamp(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothPreamp(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
