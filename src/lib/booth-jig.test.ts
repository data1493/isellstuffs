import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothJigCookieValue,
  boothJigFor,
  parseBoothJig,
  serializeBoothJig,
  tapeBoothJig,
} from "./booth-jig";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothJig(
    stall,
    {},
    "I don't have a jig. Still a table.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothJigCookieValue(taped.map);
  assert.equal(cookie, serializeBoothJig(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);

  const parsed = parseBoothJig(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothJigFor("folding-table-tuesday", parsed)?.note,
    "I don't have a jig. Still a table.",
  );
  assert.equal(boothJigFor("the-hall-closet", parsed), undefined);
  assert.equal(boothJigFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothJigFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothJigFor("half-working", parsed), undefined);
  assert.equal(boothJigFor("sunday-crate", parsed), undefined);
  assert.equal(boothJigFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothJig(writeResultLiteral), {});
  assert.deepEqual(parseBoothJig(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothJig(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
