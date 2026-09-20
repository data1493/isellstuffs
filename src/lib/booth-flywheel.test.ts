import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothFlywheelCookieValue,
  boothFlywheelFor,
  clearBoothFlywheel,
  parseBoothFlywheel,
  serializeBoothFlywheel,
  tapeBoothFlywheel,
} from "./booth-flywheel";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothFlywheel(
    stall,
    {},
    "I don't have a flywheel. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothFlywheelCookieValue(taped.map);
  assert.equal(cookie, serializeBoothFlywheel(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothFlywheel(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothFlywheelFor("sunday-crate", parsed)?.note,
    "I don't have a flywheel. Still a crate.",
  );
  assert.equal(boothFlywheelFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothFlywheelFor("the-hall-closet", parsed), undefined);
  assert.equal(boothFlywheelFor("half-working", parsed), undefined);
  assert.equal(boothFlywheelFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothFlywheelFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothFlywheelFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothFlywheel(writeResultLiteral), {});
  assert.deepEqual(parseBoothFlywheel(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothFlywheel(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothFlywheel(
    crate,
    {},
    "I don't have a flywheel. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothFlywheel(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothFlywheelFor("sunday-crate", cleared.map), undefined);
});
