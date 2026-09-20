import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothFumeCookieValue,
  boothFumeFor,
  clearBoothFume,
  parseBoothFume,
  serializeBoothFume,
  tapeBoothFume,
} from "./booth-fume";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothFume(
    stall,
    {},
    "I don't have a fume. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothFumeCookieValue(taped.map);
  assert.equal(cookie, serializeBoothFume(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothFume(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothFumeFor("half-working", parsed)?.note,
    "I don't have a fume. Still a driveway.",
  );
  assert.equal(boothFumeFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothFumeFor("the-hall-closet", parsed), undefined);
  assert.equal(boothFumeFor("sunday-crate", parsed), undefined);
  assert.equal(boothFumeFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothFumeFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothFumeFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothFume(writeResultLiteral), {});
  assert.deepEqual(parseBoothFume(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothFume(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const booth = stallById("half-working");
  assert.ok(booth);
  const taped = tapeBoothFume(
    booth,
    {},
    "I don't have a fume. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothFume(booth, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothFumeFor("half-working", cleared.map), undefined);
});
