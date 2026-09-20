import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothPlumbCookieValue,
  boothPlumbFor,
  clearBoothPlumb,
  parseBoothPlumb,
  serializeBoothPlumb,
  tapeBoothPlumb,
} from "./booth-plumb";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothPlumb(
    stall,
    {},
    "I don't have a plumb. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothPlumbCookieValue(taped.map);
  assert.equal(cookie, serializeBoothPlumb(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothPlumb(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothPlumbFor("folding-table-tuesday", parsed)?.note,
    "I don't have a plumb. Still a crack.",
  );
  assert.equal(boothPlumbFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothPlumbFor("the-hall-closet", parsed), undefined);
  assert.equal(boothPlumbFor("half-working", parsed), undefined);
  assert.equal(boothPlumbFor("sunday-crate", parsed), undefined);
  assert.equal(boothPlumbFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothPlumbFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothPlumb(writeResultLiteral), {});
  assert.deepEqual(parseBoothPlumb(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothPlumb(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const tuesday = stallById("folding-table-tuesday");
  assert.ok(tuesday);
  const taped = tapeBoothPlumb(
    tuesday,
    {},
    "I don't have a plumb. Still a crack.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothPlumb(tuesday, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothPlumbFor("folding-table-tuesday", cleared.map), undefined);
});
