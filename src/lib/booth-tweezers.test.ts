import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothTweezersCookieValue,
  boothTweezersFor,
  clearBoothTweezers,
  parseBoothTweezers,
  serializeBoothTweezers,
  tapeBoothTweezers,
} from "./booth-tweezers";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("half-working");
  assert.ok(stall);

  const taped = tapeBoothTweezers(
    stall,
    {},
    "I don't have tweezers. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothTweezersCookieValue(taped.map);
  assert.equal(cookie, serializeBoothTweezers(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"half-working"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothTweezers(cookie);
  assert.deepEqual(Object.keys(parsed), ["half-working"]);
  assert.equal(
    boothTweezersFor("half-working", parsed)?.note,
    "I don't have tweezers. Still a driveway.",
  );
  assert.equal(boothTweezersFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothTweezersFor("the-hall-closet", parsed), undefined);
  assert.equal(boothTweezersFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothTweezersFor("sunday-crate", parsed), undefined);
  assert.equal(boothTweezersFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothTweezersFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothTweezers(writeResultLiteral), {});
  assert.deepEqual(parseBoothTweezers(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("half-working");
  const taped = tapeBoothTweezers(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const electronics = stallById("half-working");
  assert.ok(electronics);
  const taped = tapeBoothTweezers(
    electronics,
    {},
    "I don't have tweezers. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothTweezers(electronics, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothTweezersFor("half-working", cleared.map), undefined);
});
