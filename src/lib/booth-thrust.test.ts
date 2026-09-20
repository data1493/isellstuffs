import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothThrustCookieValue,
  boothThrustFor,
  clearBoothThrust,
  parseBoothThrust,
  serializeBoothThrust,
  tapeBoothThrust,
} from "./booth-thrust";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("sunday-crate");
  assert.ok(stall);

  const taped = tapeBoothThrust(
    stall,
    {},
    "I don't have a thrust. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothThrustCookieValue(taped.map);
  assert.equal(cookie, serializeBoothThrust(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"sunday-crate"/);
  assert.match(cookie, /"note"/);
  assert.match(cookie, /"at"/);

  const parsed = parseBoothThrust(cookie);
  assert.deepEqual(Object.keys(parsed), ["sunday-crate"]);
  assert.equal(
    boothThrustFor("sunday-crate", parsed)?.note,
    "I don't have a thrust. Still a crate.",
  );
  assert.equal(boothThrustFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothThrustFor("the-hall-closet", parsed), undefined);
  assert.equal(boothThrustFor("half-working", parsed), undefined);
  assert.equal(boothThrustFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothThrustFor("the-sink-drawer", parsed), undefined);
  assert.equal(boothThrustFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothThrust(writeResultLiteral), {});
  assert.deepEqual(parseBoothThrust(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("sunday-crate");
  const taped = tapeBoothThrust(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});

test("clear deletes that booth only", () => {
  const crate = stallById("sunday-crate");
  assert.ok(crate);
  const taped = tapeBoothThrust(
    crate,
    {},
    "I don't have a thrust. Still a crate.",
    new Date("2026-09-20T00:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cleared = clearBoothThrust(crate, taped.map);
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.map, {});
  assert.equal(boothThrustFor("sunday-crate", cleared.map), undefined);
});
