import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GATE_STORAGE_KEY } from "./listing-gate";
import { SCALE_STORAGE_KEY } from "./listing-scale";
import { STEMS_STORAGE_KEY } from "./listing-stems";
import { TUNE_STORAGE_KEY } from "./listing-tune";
import {
  QUANTIZE_CHAIR_ID,
  QUANTIZE_COOKIE_NAME,
  QUANTIZE_HOST_ID,
  QUANTIZE_LEAVE_LINE,
  QUANTIZE_NOTICE_TITLE,
  QUANTIZE_RECIPES_ID,
  QUANTIZE_STORAGE_KEY,
  canTapeQuantize,
  clearListingQuantize,
  isListingQuantizeOverlay,
  markListingQuantize,
  parseQuantizeListingIds,
  quantizeCookieValue,
} from "./listing-quantize";

test("cookie and storage keys stay the quantize paper names", () => {
  assert.equal(QUANTIZE_STORAGE_KEY, "iss:quantize-listing-ids");
  assert.equal(QUANTIZE_COOKIE_NAME, "iss-quantize-listing-ids");
  assert.equal(QUANTIZE_HOST_ID, "dl-sample-pack");
  assert.equal(
    QUANTIZE_NOTICE_TITLE,
    "I will not quantize them. Still twelve shots. Still a zip.",
  );
  assert.equal(QUANTIZE_LEAVE_LINE, "Leave the twelve shots");
  assert.notEqual(QUANTIZE_STORAGE_KEY, STEMS_STORAGE_KEY);
  assert.notEqual(QUANTIZE_STORAGE_KEY, GATE_STORAGE_KEY);
  assert.notEqual(QUANTIZE_STORAGE_KEY, TUNE_STORAGE_KEY);
  assert.notEqual(QUANTIZE_STORAGE_KEY, SCALE_STORAGE_KEY);
});

test("write-result objects never parse as a quantize set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-sample-pack"],
  });
  assert.deepEqual(parseQuantizeListingIds(writeResult), []);
  assert.equal(
    isListingQuantizeOverlay(
      "dl-sample-pack",
      parseQuantizeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = quantizeCookieValue(["dl-sample-pack", "dl-sample-pack", ""]);
  assert.equal(raw, '["dl-sample-pack"]');
  assert.deepEqual(parseQuantizeListingIds(raw), ["dl-sample-pack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("sample pack tapes; font, LUT, and recipes stay off that cookie", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const recipes = listingById(QUANTIZE_RECIPES_ID);

  assert.ok(canTapeQuantize(pack));
  assert.equal(canTapeQuantize(font), false);
  assert.equal(canTapeQuantize(luts), false);
  assert.equal(canTapeQuantize(recipes), false);

  const taped = markListingQuantize(pack, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-sample-pack"]);
  assert.equal(quantizeCookieValue(taped), '["dl-sample-pack"]');
  assert.equal(isListingQuantizeOverlay("dl-sample-pack", taped), true);
  assert.equal(isListingQuantizeOverlay("dl-booth-font", taped), false);
  assert.equal(isListingQuantizeOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingQuantizeOverlay(QUANTIZE_RECIPES_ID, taped), false);
  assert.equal(pack?.cartEligible, true);
  assert.equal(pack?.status, "available");
  assert.equal(pack?.price.amountCents, 400);
});

test("font, LUT, gift, zine, physical, recipes, and overlay-owned rows refuse a quantize write", () => {
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const cdr = listingById("ysk-burned-cdr");
  const recipes = listingById(QUANTIZE_RECIPES_ID);
  const chair = listingById(QUANTIZE_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");

  assert.equal(canTapeQuantize(font), false);
  assert.equal(canTapeQuantize(luts), false);
  assert.equal(canTapeQuantize(gift), false);
  assert.equal(canTapeQuantize(zine), false);
  assert.equal(canTapeQuantize(cdr), false);
  assert.equal(canTapeQuantize(recipes), false);
  assert.equal(canTapeQuantize(chair), false);
  assert.equal(canTapeQuantize(junk), false);

  assert.equal(markListingQuantize(font, []), null);
  assert.equal(markListingQuantize(luts, []), null);
  assert.equal(markListingQuantize(gift, []), null);
  assert.equal(markListingQuantize(zine, []), null);
  assert.equal(markListingQuantize(cdr, []), null);
  assert.equal(markListingQuantize(recipes, []), null);
  assert.equal(markListingQuantize(chair, []), null);
  assert.equal(markListingQuantize(junk, []), null);
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
  const taped = markListingQuantize(pack, []);
  assert.deepEqual(taped, ["dl-sample-pack"]);
  const after = listingById("dl-sample-pack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that sample-pack id", () => {
  const pack = listingById("dl-sample-pack");
  const cleared = clearListingQuantize(pack, ["dl-sample-pack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(quantizeCookieValue(cleared), "[]");
  assert.equal(isListingQuantizeOverlay("dl-sample-pack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pack = listingById("dl-sample-pack");
  const recipes = listingById(QUANTIZE_RECIPES_ID);
  const taped = markListingQuantize(pack, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingQuantize(recipes, []), null);

  const cleared = clearListingQuantize(pack, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(QUANTIZE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingQuantize(chair, []), null);
});
