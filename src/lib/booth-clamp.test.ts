import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothClampCookieValue,
  boothClampFor,
  parseBoothClamp,
  serializeBoothClamp,
  tapeBoothClamp,
} from "./booth-clamp";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothClamp(
    stall,
    {},
    "I don't have a clamp. Still a folding table.",
    new Date("2026-09-19T21:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothClampCookieValue(taped.map);
  assert.equal(cookie, serializeBoothClamp(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);

  const parsed = parseBoothClamp(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothClampFor("folding-table-tuesday", parsed)?.note,
    "I don't have a clamp. Still a folding table.",
  );
  assert.equal(boothClampFor("the-hall-closet", parsed), undefined);
  assert.equal(boothClampFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothClampFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothClampFor("half-working", parsed), undefined);
  assert.equal(boothClampFor("sunday-crate", parsed), undefined);
  assert.equal(boothClampFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothClamp(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothClamp(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
