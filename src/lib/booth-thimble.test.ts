import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothThimbleCookieValue,
  boothThimbleFor,
  clearBoothThimble,
  parseBoothThimble,
  serializeBoothThimble,
  tapeBoothThimble,
} from "./booth-thimble";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-hall-closet");
  assert.ok(stall);

  const taped = tapeBoothThimble(
    stall,
    {},
    "I don't have a thimble. Still a closet.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothThimbleCookieValue(taped.map);
  assert.equal(cookie, serializeBoothThimble(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-hall-closet"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothThimble(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-hall-closet"]);
  assert.equal(
    boothThimbleFor("the-hall-closet", parsed)?.note,
    "I don't have a thimble. Still a closet.",
  );
  assert.equal(boothThimbleFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothThimbleFor("half-working", parsed), undefined);
  assert.equal(boothThimbleFor("sunday-crate", parsed), undefined);
  assert.equal(boothThimbleFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothThimbleFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothThimbleFor("gift-desk", parsed), undefined);

  assert.deepEqual(parseBoothThimble(JSON.stringify({ ok: true })), {});
  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothThimble(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-hall-closet");
  const taped = tapeBoothThimble(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const closet = stallById("the-hall-closet");
  assert.ok(closet);
  const taped = tapeBoothThimble(
    closet,
    {},
    "I don't have a thimble. Still a closet.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothThimble(closet, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothThimbleFor("the-hall-closet", cleared.map), undefined);
});
