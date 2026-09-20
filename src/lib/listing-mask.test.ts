import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DEOX_STORAGE_KEY } from "./listing-deox";
import { GLOW_STORAGE_KEY } from "./listing-glow";
import { LINE_STORAGE_KEY } from "./listing-line";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import { SHIELD_STORAGE_KEY } from "./listing-shield";
import { SPEAKER_STORAGE_KEY } from "./listing-speaker";
import {
  MASK_CHAIR_ID,
  MASK_COOKIE_NAME,
  MASK_DISC_ID,
  MASK_DRAWER_ID,
  MASK_HOST_ID,
  MASK_LEAVE_LINE,
  MASK_NOTICE_TITLE,
  MASK_STORAGE_KEY,
  canTapeMask,
  clearListingMask,
  isListingMaskOverlay,
  markListingMask,
  maskCookieValue,
  parseMaskListingIds,
} from "./listing-mask";

test("cookie and storage keys stay the mask paper names", () => {
  assert.equal(MASK_STORAGE_KEY, "iss:mask-listing-ids");
  assert.equal(MASK_COOKIE_NAME, "iss-mask-listing-ids");
  assert.equal(MASK_HOST_ID, "gtk-game-boy");
  assert.equal(
    MASK_NOTICE_TITLE,
    "I will not mask it. Still a board. Still fused.",
  );
  assert.equal(MASK_LEAVE_LINE, "Leave the board");
  assert.notEqual(MASK_STORAGE_KEY, DEOX_STORAGE_KEY);
  assert.notEqual(MASK_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(MASK_STORAGE_KEY, SHIELD_STORAGE_KEY);
  assert.notEqual(MASK_STORAGE_KEY, SPEAKER_STORAGE_KEY);
  assert.notEqual(MASK_STORAGE_KEY, LINE_STORAGE_KEY);
  assert.notEqual(MASK_STORAGE_KEY, GLOW_STORAGE_KEY);
});

test("write-result objects never parse as a mask set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseMaskListingIds(writeResult), []);
  assert.equal(
    isListingMaskOverlay(
      "gtk-game-boy",
      parseMaskListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = maskCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseMaskListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, disc, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(MASK_DRAWER_ID);
  const disc = listingById(MASK_DISC_ID);
  const lut = listingById("dl-camera-luts");

  assert.ok(canTapeMask(boy));
  assert.equal(canTapeMask(drawer), false);
  assert.equal(canTapeMask(disc), false);
  assert.equal(canTapeMask(lut), false);

  const taped = markListingMask(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(maskCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingMaskOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingMaskOverlay(MASK_DRAWER_ID, taped), false);
  assert.equal(isListingMaskOverlay(MASK_DISC_ID, taped), false);
  assert.equal(isListingMaskOverlay("dl-camera-luts", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, disc, gift, zine, and chair refuse a mask write", () => {
  const lut = listingById("dl-camera-luts");
  const drawer = listingById(MASK_DRAWER_ID);
  const disc = listingById(MASK_DISC_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(MASK_CHAIR_ID);

  assert.equal(canTapeMask(lut), false);
  assert.equal(canTapeMask(drawer), false);
  assert.equal(canTapeMask(disc), false);
  assert.equal(canTapeMask(gift), false);
  assert.equal(canTapeMask(zine), false);
  assert.equal(canTapeMask(chair), false);

  assert.equal(markListingMask(lut, []), null);
  assert.equal(markListingMask(drawer, []), null);
  assert.equal(markListingMask(disc, []), null);
  assert.equal(markListingMask(gift, []), null);
  assert.equal(markListingMask(zine, []), null);
  assert.equal(markListingMask(chair, []), null);
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
  const taped = markListingMask(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingMask(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(maskCookieValue(cleared), "[]");
  assert.equal(isListingMaskOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById("dl-camera-luts");
  const taped = markListingMask(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingMask(lut, []), null);

  const cleared = clearListingMask(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(MASK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingMask(chair, []), null);
});
