import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothStropCookieValue,
  boothStropFor,
  clearBoothStrop,
  parseBoothStrop,
  serializeBoothStrop,
  tapeBoothStrop,
} from "./booth-strop";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothStrop(
    stall,
    {},
    "I don't have a strop. Still a crate. Still a skip.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothStropCookieValue(taped.map);
  assert.equal(cookie, serializeBoothStrop(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothStrop(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothStropFor("sunday-crate", parsed)?.note,
    "I don't have a strop. Still a crate. Still a skip.",
  );
  assert.equal(boothStropFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothStropFor("the-hall-closet", parsed), undefined);
  assert.equal(boothStropFor("half-working", parsed), undefined);
  assert.equal(boothStropFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothStropFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothStropFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothStrop(writeResultLiteral), {});
  assert.deepEqual(parseBoothStrop(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothStrop(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothStrop(
    crate,
    {},
    "I don't have a strop. Still a crate. Still a skip.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothStrop(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothStropFor("sunday-crate", cleared.map), undefined);
});
