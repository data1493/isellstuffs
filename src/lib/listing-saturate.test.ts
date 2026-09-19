import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GATE_STORAGE_KEY } from "./listing-gate";
import { QUANTIZE_STORAGE_KEY } from "./listing-quantize";
import { TUNE_STORAGE_KEY } from "./listing-tune";
import {
  SATURATE_CHAIR_ID,
  SATURATE_COOKIE_NAME,
  SATURATE_HOST_ID,
  SATURATE_LEAVE_LINE,
  SATURATE_NOTICE_TITLE,
  SATURATE_STORAGE_KEY,
  canTapeSaturate,
  clearListingSaturate,
  isListingSaturateOverlay,
  markListingSaturate,
  parseSaturateListingIds,
  saturateCookieValue,
} from "./listing-saturate";

test("cookie and storage keys stay the saturate paper names", () => {
  assert.equal(SATURATE_STORAGE_KEY, "iss:saturate-listing-ids");
  assert.equal(SATURATE_COOKIE_NAME, "iss-saturate-listing-ids");
  assert.equal(SATURATE_HOST_ID, "dl-sample-pack");
  assert.equal(
    SATURATE_NOTICE_TITLE,
    "I will not saturate them. Still twelve shots. Still a zip.",
  );
  assert.equal(SATURATE_LEAVE_LINE, "Leave the kicks thin");
  assert.notEqual(SATURATE_STORAGE_KEY, QUANTIZE_STORAGE_KEY);
  assert.notEqual(SATURATE_STORAGE_KEY, GATE_STORAGE_KEY);
  assert.notEqual(SATURATE_STORAGE_KEY, TUNE_STORAGE_KEY);
});

test("write-result objects never parse as a saturate set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-sample-pack"],
  });
  assert.deepEqual(parseSaturateListingIds(writeResult), []);
  assert.equal(
    isListingSaturateOverlay(
      "dl-sample-pack",
      parseSaturateListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = saturateCookieValue(["dl-sample-pack", "dl-sample-pack", ""]);
  assert.equal(raw, '["dl-sample-pack"]');
  assert.deepEqual(parseSaturateListingIds(raw), ["dl-sample-pack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("sample pack tapes; font, LUT, and drawer stay off that cookie", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const drawer = listingById("gtk-cable-drawer");

  assert.ok(canTapeSaturate(pack));
  assert.equal(canTapeSaturate(font), false);
  assert.equal(canTapeSaturate(luts), false);
  assert.equal(canTapeSaturate(drawer), false);

  const taped = markListingSaturate(pack, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-sample-pack"]);
  assert.equal(saturateCookieValue(taped), '["dl-sample-pack"]');
  assert.equal(isListingSaturateOverlay("dl-sample-pack", taped), true);
  assert.equal(isListingSaturateOverlay("dl-booth-font", taped), false);
  assert.equal(isListingSaturateOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingSaturateOverlay("gtk-cable-drawer", taped), false);
  assert.equal(pack?.cartEligible, true);
  assert.equal(pack?.status, "available");
  assert.equal(pack?.price.amountCents, 400);
});

test("font, LUT, gift, zine, physical, and overlay-owned rows refuse a saturate write", () => {
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const drawer = listingById("gtk-cable-drawer");
  const chair = listingById(SATURATE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");
  const junk = listingById("dl-junk-pricing-pdf");
  const jacket = listingById("clo-windbreaker");

  assert.equal(canTapeSaturate(font), false);
  assert.equal(canTapeSaturate(luts), false);
  assert.equal(canTapeSaturate(gift), false);
  assert.equal(canTapeSaturate(zine), false);
  assert.equal(canTapeSaturate(drawer), false);
  assert.equal(canTapeSaturate(chair), false);
  assert.equal(canTapeSaturate(boy), false);
  assert.equal(canTapeSaturate(junk), false);
  assert.equal(canTapeSaturate(jacket), false);

  assert.equal(markListingSaturate(font, []), null);
  assert.equal(markListingSaturate(luts, []), null);
  assert.equal(markListingSaturate(gift, []), null);
  assert.equal(markListingSaturate(zine, []), null);
  assert.equal(markListingSaturate(drawer, []), null);
  assert.equal(markListingSaturate(chair, []), null);
  assert.equal(markListingSaturate(boy, []), null);
  assert.equal(markListingSaturate(junk, []), null);
  assert.equal(markListingSaturate(jacket, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const pack = listingById("dl-sample-pack");
  assert.ok(pack);
  const before = {
    price: pack.price,
    status: pack.status,
    cartEligible: pack.cartEligible,
  };
  const taped = markListingSaturate(pack, []);
  assert.deepEqual(taped, ["dl-sample-pack"]);
  const after = listingById("dl-sample-pack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that sample-pack id", () => {
  const pack = listingById("dl-sample-pack");
  const cleared = clearListingSaturate(pack, ["dl-sample-pack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(saturateCookieValue(cleared), "[]");
  assert.equal(isListingSaturateOverlay("dl-sample-pack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const taped = markListingSaturate(pack, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSaturate(font, []), null);

  const cleared = clearListingSaturate(pack, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
