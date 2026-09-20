import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothFooterCookieValue,
  boothFooterFor,
  clearBoothFooter,
  parseBoothFooter,
  serializeBoothFooter,
  tapeBoothFooter,
} from "./booth-footer";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothFooter(
    stall,
    {},
    "I don't have a footer. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothFooterCookieValue(taped.map);
  assert.equal(cookie, serializeBoothFooter(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothFooter(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothFooterFor("sunday-crate", parsed)?.note,
    "I don't have a footer. Still a crate.",
  );
  assert.equal(boothFooterFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothFooterFor("the-hall-closet", parsed), undefined);
  assert.equal(boothFooterFor("half-working", parsed), undefined);
  assert.equal(boothFooterFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothFooterFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothFooterFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothFooter(writeResultLiteral), {});
  assert.deepEqual(parseBoothFooter(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothFooter(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothFooter(
    crate,
    {},
    "I don't have a footer. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothFooter(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothFooterFor("sunday-crate", cleared.map), undefined);
});
