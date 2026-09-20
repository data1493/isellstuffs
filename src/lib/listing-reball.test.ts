import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FLUX_STORAGE_KEY } from "./listing-flux";
import { POGO_STORAGE_KEY } from "./listing-pogo";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import { TIN_STORAGE_KEY } from "./listing-tin";
import {
  REBALL_CHAIR_ID,
  REBALL_COOKIE_NAME,
  REBALL_DRAWER_ID,
  REBALL_GIFT_ID,
  REBALL_HOST_ID,
  REBALL_LEAVE_LINE,
  REBALL_LID_ID,
  REBALL_LUT_ID,
  REBALL_NOTICE_TITLE,
  REBALL_STORAGE_KEY,
  REBALL_ZINE_ID,
  canTapeReball,
  clearListingReball,
  isListingReballOverlay,
  markListingReball,
  parseReballListingIds,
  reballCookieValue,
} from "./listing-reball";

test("cookie and storage keys stay the reball paper names", () => {
  assert.equal(REBALL_STORAGE_KEY, "iss:reball-listing-ids");
  assert.equal(REBALL_COOKIE_NAME, "iss-reball-listing-ids");
  assert.equal(REBALL_HOST_ID, "gtk-game-boy");
  assert.equal(
    REBALL_NOTICE_TITLE,
    "I will not reball it. Still a crack. Still Tetris.",
  );
  assert.equal(REBALL_LEAVE_LINE, "Leave the spheres");
  assert.notEqual(REBALL_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(REBALL_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(REBALL_STORAGE_KEY, FLUX_STORAGE_KEY);
  assert.notEqual(REBALL_STORAGE_KEY, TIN_STORAGE_KEY);
  assert.notEqual(REBALL_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-clock-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-flux-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-tin-listing-ids");
});

test("write-result objects never parse as a reball set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseReballListingIds(writeResult), []);
  assert.equal(
    isListingReballOverlay(
      "gtk-game-boy",
      parseReballListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = reballCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseReballListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(REBALL_DRAWER_ID);
  const lid = listingById(REBALL_LID_ID);
  const lut = listingById(REBALL_LUT_ID);

  assert.ok(canTapeReball(boy));
  assert.equal(canTapeReball(drawer), false);
  assert.equal(canTapeReball(lid), false);
  assert.equal(canTapeReball(lut), false);

  const taped = markListingReball(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(reballCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingReballOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingReballOverlay(REBALL_DRAWER_ID, taped), false);
  assert.equal(isListingReballOverlay(REBALL_LID_ID, taped), false);
  assert.equal(isListingReballOverlay(REBALL_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a reball write", () => {
  const lut = listingById(REBALL_LUT_ID);
  const drawer = listingById(REBALL_DRAWER_ID);
  const lid = listingById(REBALL_LID_ID);
  const gift = listingById(REBALL_GIFT_ID);
  const zine = listingById(REBALL_ZINE_ID);
  const chair = listingById(REBALL_CHAIR_ID);

  assert.equal(canTapeReball(lut), false);
  assert.equal(canTapeReball(drawer), false);
  assert.equal(canTapeReball(lid), false);
  assert.equal(canTapeReball(gift), false);
  assert.equal(canTapeReball(zine), false);
  assert.equal(canTapeReball(chair), false);

  assert.equal(markListingReball(lut, []), null);
  assert.equal(markListingReball(drawer, []), null);
  assert.equal(markListingReball(lid, []), null);
  assert.equal(markListingReball(gift, []), null);
  assert.equal(markListingReball(zine, []), null);
  assert.equal(markListingReball(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const boy = listingById("gtk-game-boy");
  assert.ok(boy);
  const before = {
    price: boy.price,
    status: boy.status,
    cartEligible: boy.cartEligible,
  };
  const taped = markListingReball(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingReball(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(reballCookieValue(cleared), "[]");
  assert.equal(isListingReballOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(REBALL_LUT_ID);
  const taped = markListingReball(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingReball(lut, []), null);

  const cleared = clearListingReball(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(REBALL_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingReball(chair, []), null);
});

test("reball write never aliases pogo, clock, reflow, flux, or tin paper", () => {
  assert.notEqual(REBALL_STORAGE_KEY, "iss:pogo-listing-ids");
  assert.notEqual(REBALL_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(REBALL_STORAGE_KEY, "iss:reflow-listing-ids");
  assert.notEqual(REBALL_STORAGE_KEY, "iss:flux-listing-ids");
  assert.notEqual(REBALL_STORAGE_KEY, "iss:tin-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-clock-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-flux-listing-ids");
  assert.notEqual(REBALL_COOKIE_NAME, "iss-tin-listing-ids");
});
