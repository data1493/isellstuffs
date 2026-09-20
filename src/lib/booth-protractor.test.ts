import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothProtractorCookieValue,
  boothProtractorFor,
  clearBoothProtractor,
  parseBoothProtractor,
  serializeBoothProtractor,
  tapeBoothProtractor,
} from "./booth-protractor";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothProtractor(
    stall,
    {},
    "I don't have a protractor. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothProtractorCookieValue(taped.map);
  assert.equal(cookie, serializeBoothProtractor(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothProtractor(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothProtractorFor("sunday-crate", parsed)?.note,
    "I don't have a protractor. Still a crate.",
  );
  assert.equal(boothProtractorFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothProtractorFor("the-hall-closet", parsed), undefined);
  assert.equal(boothProtractorFor("half-working", parsed), undefined);
  assert.equal(boothProtractorFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothProtractorFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothProtractorFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothProtractor(writeResultLiteral), {});
  assert.deepEqual(parseBoothProtractor(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothProtractor(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothProtractor(
    crate,
    {},
    "I don't have a protractor. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothProtractor(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothProtractorFor("sunday-crate", cleared.map), undefined);
});
