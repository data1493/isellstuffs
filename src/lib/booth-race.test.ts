import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothRaceCookieValue,
  boothRaceFor,
  clearBoothRace,
  parseBoothRace,
  serializeBoothRace,
  tapeBoothRace,
} from "./booth-race";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothRace(
    stall,
    {},
    "I don't have a race. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothRaceCookieValue(taped.map);
  assert.equal(cookie, serializeBoothRace(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothRace(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothRaceFor("sunday-crate", parsed)?.note,
    "I don't have a race. Still a crate.",
  );
  assert.equal(boothRaceFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothRaceFor("the-hall-closet", parsed), undefined);
  assert.equal(boothRaceFor("half-working", parsed), undefined);
  assert.equal(boothRaceFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothRaceFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothRaceFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothRace(writeResultLiteral), {});
  assert.deepEqual(parseBoothRace(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothRace(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothRace(
    crate,
    {},
    "I don't have a race. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothRace(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothRaceFor("sunday-crate", cleared.map), undefined);
});
