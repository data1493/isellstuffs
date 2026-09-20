import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothDriftCookieValue,
  boothDriftFor,
  clearBoothDrift,
  parseBoothDrift,
  serializeBoothDrift,
  tapeBoothDrift,
} from "./booth-drift";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("folding-table-tuesday");
  assert.ok(stall);

  const taped = tapeBoothDrift(
    stall,
    {},
    "I don't have a drift. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothDriftCookieValue(taped.map);
  assert.equal(cookie, serializeBoothDrift(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"folding-table-tuesday"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothDrift(cookie);
  assert.deepEqual(Object.keys(parsed), ["folding-table-tuesday"]);
  assert.equal(
    boothDriftFor("folding-table-tuesday", parsed)?.note,
    "I don't have a drift. Still a driveway.",
  );
  assert.equal(boothDriftFor("sunday-crate", parsed), undefined);
  assert.equal(boothDriftFor("the-hall-closet", parsed), undefined);
  assert.equal(boothDriftFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothDriftFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothDriftFor("half-working", parsed), undefined);
  assert.equal(boothDriftFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothDrift(writeResultLiteral), {});
  assert.deepEqual(parseBoothDrift(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("folding-table-tuesday");
  const taped = tapeBoothDrift(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const tuesday = stallById("folding-table-tuesday");
  assert.ok(tuesday);
  const taped = tapeBoothDrift(
    tuesday,
    {},
    "I don't have a drift. Still a driveway.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothDrift(tuesday, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothDriftFor("folding-table-tuesday", cleared.map), undefined);
});
