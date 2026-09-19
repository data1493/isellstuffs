import assert from "node:assert/strict";
import { test } from "node:test";

import {
  boothFunnelCookieValue,
  boothFunnelFor,
  parseBoothFunnel,
  serializeBoothFunnel,
  tapeBoothFunnel,
} from "./booth-funnel";
import { stallById } from "./commerce";

test("cookie is the stall map, not a write-result object", () => {
  const stall = stallById("the-sink-drawer");
  assert.ok(stall);

  const taped = tapeBoothFunnel(
    stall,
    {},
    "I don't have a funnel. Still a drawer.",
    new Date("2026-09-19T23:00:00.000Z"),
  );
  assert.equal(taped.ok, true);
  if (!taped.ok) return;

  const cookie = boothFunnelCookieValue(taped.map);
  assert.equal(cookie, serializeBoothFunnel(taped.map));
  assert.doesNotMatch(cookie, /"ok":/);
  assert.match(cookie, /"the-sink-drawer"/);

  const parsed = parseBoothFunnel(cookie);
  assert.deepEqual(Object.keys(parsed), ["the-sink-drawer"]);
  assert.equal(
    boothFunnelFor("the-sink-drawer", parsed)?.note,
    "I don't have a funnel. Still a drawer.",
  );
  assert.equal(boothFunnelFor("the-hall-closet", parsed), undefined);
  assert.equal(boothFunnelFor("beats-under-the-table", parsed), undefined);
  assert.equal(boothFunnelFor("folding-table-tuesday", parsed), undefined);
  assert.equal(boothFunnelFor("half-working", parsed), undefined);
  assert.equal(boothFunnelFor("sunday-crate", parsed), undefined);
  assert.equal(boothFunnelFor("gift-desk", parsed), undefined);

  const writeResultLiteral = JSON.stringify({ ok: true, map: taped.map });
  assert.deepEqual(parseBoothFunnel(writeResultLiteral), {});
  assert.deepEqual(parseBoothFunnel(JSON.stringify({ ok: true })), {});
});

test("empty tape is rejected", () => {
  const stall = stallById("the-sink-drawer");
  const taped = tapeBoothFunnel(stall, {}, "   ");
  assert.deepEqual(taped, { ok: false, reason: "empty", map: {} });
});
