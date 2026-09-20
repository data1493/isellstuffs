import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothReflexCookieValue,
  boothReflexFor,
  clearBoothReflex,
  parseBoothReflex,
  serializeBoothReflex,
  tapeBoothReflex,
} from "./booth-reflex";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothReflex(
    stall,
    {},
    "I don't have a reflex. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothReflexCookieValue(taped.map);
  assert.equal(cookie, serializeBoothReflex(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothReflex(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothReflexFor("sunday-crate", parsed)?.note,
    "I don't have a reflex. Still a crate.",
  );
  assert.equal(boothReflexFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothReflexFor("the-hall-closet", parsed), undefined);
  assert.equal(boothReflexFor("half-working", parsed), undefined);
  assert.equal(boothReflexFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothReflexFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothReflexFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothReflex(writeResultLiteral), {});
  assert.deepEqual(parseBoothReflex(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothReflex(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothReflex(
    crate,
    {},
    "I don't have a reflex. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothReflex(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothReflexFor("sunday-crate", cleared.map), undefined);
});
