import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  PILLOW_CHAIR_ID,
  PILLOW_COOKIE_NAME,
  PILLOW_DRAWER_ID,
  PILLOW_GIFT_ID,
  PILLOW_HOST_ID,
  PILLOW_LEAVE_LINE,
  PILLOW_LID_ID,
  PILLOW_LUT_ID,
  PILLOW_NOTICE_TITLE,
  PILLOW_STORAGE_KEY,
  PILLOW_ZINE_ID,
  canTapePillow,
  clearListingPillow,
  isListingPillowOverlay,
  markListingPillow,
  parsePillowListingIds,
  pillowCookieValue,
  readPillowListingIds,
  writePillowListingIds,
} from "./listing-pillow";

test("cookie and storage keys stay the pillow paper names", () => {
  assert.equal(PILLOW_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.equal(PILLOW_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.equal(PILLOW_HOST_ID, "gtk-game-boy");
  assert.equal(
    PILLOW_NOTICE_TITLE,
    "I will not pillow it. Still a crack. Still Tetris.",
  );
  assert.equal(PILLOW_LEAVE_LINE, "Leave the pillow");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:dam-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:acf-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:soak-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:hip-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(PILLOW_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(PILLOW_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-booth-reflex");
});

test("write-result objects never parse as a pillow set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parsePillowListingIds(writeResult), []);
  assert.equal(
    isListingPillowOverlay(
      "gtk-game-boy",
      parsePillowListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parsePillowListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = pillowCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parsePillowListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(PILLOW_DRAWER_ID);
  const lid = listingById(PILLOW_LID_ID);
  const lut = listingById(PILLOW_LUT_ID);

  assert.ok(canTapePillow(boy));
  assert.equal(canTapePillow(drawer), false);
  assert.equal(canTapePillow(lid), false);
  assert.equal(canTapePillow(lut), false);

  const taped = markListingPillow(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(pillowCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingPillowOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingPillowOverlay(PILLOW_DRAWER_ID, taped), false);
  assert.equal(isListingPillowOverlay(PILLOW_LID_ID, taped), false);
  assert.equal(isListingPillowOverlay(PILLOW_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a pillow write", () => {
  const lut = listingById(PILLOW_LUT_ID);
  const drawer = listingById(PILLOW_DRAWER_ID);
  const lid = listingById(PILLOW_LID_ID);
  const gift = listingById(PILLOW_GIFT_ID);
  const zine = listingById(PILLOW_ZINE_ID);
  const chair = listingById(PILLOW_CHAIR_ID);

  assert.equal(canTapePillow(lut), false);
  assert.equal(canTapePillow(drawer), false);
  assert.equal(canTapePillow(lid), false);
  assert.equal(canTapePillow(gift), false);
  assert.equal(canTapePillow(zine), false);
  assert.equal(canTapePillow(chair), false);

  assert.equal(markListingPillow(lut, []), null);
  assert.equal(markListingPillow(drawer, []), null);
  assert.equal(markListingPillow(lid, []), null);
  assert.equal(markListingPillow(gift, []), null);
  assert.equal(markListingPillow(zine, []), null);
  assert.equal(markListingPillow(chair, []), null);
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
  const taped = markListingPillow(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingPillow(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pillowCookieValue(cleared), "[]");
  assert.equal(isListingPillowOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(PILLOW_LUT_ID);
  const taped = markListingPillow(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingPillow(lut, []), null);

  const cleared = clearListingPillow(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PILLOW_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPillow(chair, []), null);
});

test("pillow write does not write leftover billboard, frost, resonance, bsln, thrust, reflex, fringe, rake, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingPillow(boy, []);
  assert.ok(taped);
  writePillowListingIds(taped);
  assert.deepEqual(readPillowListingIds(), ["gtk-game-boy"]);
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(PILLOW_STORAGE_KEY, "iss:hip-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(PILLOW_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(PILLOW_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(PILLOW_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(PILLOW_COOKIE_NAME, REBALL_COOKIE_NAME);
  writePillowListingIds([]);
});
