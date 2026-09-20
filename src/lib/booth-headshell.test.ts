import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothHeadshellCookieValue,
  boothHeadshellFor,
  clearBoothHeadshell,
  parseBoothHeadshell,
  serializeBoothHeadshell,
  tapeBoothHeadshell,
} from "./booth-headshell";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothHeadshell(
    stall,
    {},
    "I don't have a headshell. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothHeadshellCookieValue(taped.map);
  assert.equal(cookie, serializeBoothHeadshell(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothHeadshell(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothHeadshellFor("sunday-crate", parsed)?.note,
    "I don't have a headshell. Still a crate.",
  );
  assert.equal(boothHeadshellFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothHeadshellFor("the-hall-closet", parsed), undefined);
  assert.equal(boothHeadshellFor("half-working", parsed), undefined);
  assert.equal(boothHeadshellFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothHeadshellFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothHeadshellFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothHeadshell(writeResultLiteral), {});
  assert.deepEqual(parseBoothHeadshell(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothHeadshell(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothHeadshell(
    crate,
    {},
    "I don't have a headshell. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothHeadshell(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothHeadshellFor("sunday-crate", cleared.map), undefined);
});
