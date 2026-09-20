import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothBoneCookieValue,
  boothBoneFor,
  clearBoothBone,
  parseBoothBone,
  serializeBoothBone,
  tapeBoothBone,
} from "./booth-bone";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothBone(
    stall,
    {},
    "I don't have a bone. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothBoneCookieValue(taped.map);
  assert.equal(cookie, serializeBoothBone(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothBone(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothBoneFor("sunday-crate", parsed)?.note,
    "I don't have a bone. Still a driveway.",
  );
  assert.equal(boothBoneFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothBoneFor("the-hall-closet", parsed), undefined);
  assert.equal(boothBoneFor("half-working", parsed), undefined);
  assert.equal(boothBoneFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothBoneFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothBoneFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothBone(writeResultLiteral), {});
  assert.deepEqual(parseBoothBone(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothBone(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothBone(
    crate,
    {},
    "I don't have a bone. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothBone(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothBoneFor("sunday-crate", cleared.map), undefined);
});
