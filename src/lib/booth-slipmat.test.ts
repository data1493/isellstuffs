import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSlipmatCookieValue,
  boothSlipmatFor,
  parseBoothSlipmat,
  serializeBoothSlipmat,
  tapeBoothSlipmat,
} from "./booth-slipmat";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothSlipmat(
    stall,
    {},
    "I don't have a slipmat. Still a crate. Still no deck.",
    new Date("2026-09-19T22:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSlipmatCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSlipmat(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);

  const parsed = parseBoothSlipmat(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothSlipmatFor("sunday-crate", parsed)?.note,
    "I don't have a slipmat. Still a crate. Still no deck.",
  );
  assert.equal(boothSlipmatFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothSlipmatFor("half-working", parsed), undefined);
  assert.equal(boothSlipmatFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSlipmatFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothSlipmatFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothSlipmatFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSlipmat(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothSlipmat(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
