import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothSpongeCookieValue,
  boothSpongeFor,
  parseBoothSponge,
  serializeBoothSponge,
  tapeBoothSponge,
} from "./booth-sponge";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-sink-drawer");
  assert.ok(stall);

  const taped = tapeBoothSponge(
    stall,
    {},
    "I don't have a sponge. Still dishes. Still a hose.",
    new Date("2026-09-19T21:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothSpongeCookieValue(taped.map);
  assert.equal(cookie, serializeBoothSponge(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-sink-drawer"/);

  const parsed = parseBoothSponge(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-sink-drawer"]);
  assert.equal(
    boothSpongeFor("the-sink-drawer", parsed)?.note,
    "I don't have a sponge. Still dishes. Still a hose.",
  );
  assert.equal(boothSpongeFor("the-hall-closet", parsed), undefined);
  assert.equal(boothSpongeFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothSpongeFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothSpongeFor("half-working", parsed), undefined);
  assert.equal(boothSpongeFor("sunday-crate", parsed), undefined);
  assert.equal(boothSpongeFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothSponge(writeResultLiteral), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-sink-drawer");
  const taped = tapeBoothSponge(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
