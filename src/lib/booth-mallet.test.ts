import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothMalletCookieValue,
  boothMalletFor,
  clearBoothMallet,
  parseBoothMallet,
  serializeBoothMallet,
  tapeBoothMallet,
} from "./booth-mallet";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothMallet(
    stall,
    {},
    "I don't have a mallet. Still a driveway. Still a stain.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothMalletCookieValue(taped.map);
  assert.equal(cookie, serializeBoothMallet(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothMallet(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothMalletFor("folding-table-tuesday", parsed)?.note,
    "I don't have a mallet. Still a driveway. Still a stain.",
  );
  assert.equal(boothMalletFor("the-hall-closet", parsed), undefined);
  assert.equal(boothMalletFor("half-working", parsed), undefined);
  assert.equal(boothMalletFor("sunday-crate", parsed), undefined);
  assert.equal(boothMalletFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothMalletFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothMalletFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothMallet(writeResultLiteral), {});
  assert.deepEqual(parseBoothMallet(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothMallet(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const tuesday = stallById("folding-table-tuesday");
  assert.ok(tuesday);
  const taped = tapeBoothMallet(
    tuesday,
    {},
    "I don't have a mallet. Still a driveway. Still a stain.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothMallet(tuesday, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothMalletFor("folding-table-tuesday", cleared.map), undefined);
});
