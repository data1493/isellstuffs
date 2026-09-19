import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FOUNDRY_STORAGE_KEY } from "./listing-foundry";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { LIGATURE_STORAGE_KEY } from "./listing-ligature";
import { QUANTIZE_STORAGE_KEY } from "./listing-quantize";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";
import {
  SUBSET_CHAIR_ID,
  SUBSET_COOKIE_NAME,
  SUBSET_HOST_ID,
  SUBSET_LEAVE_LINE,
  SUBSET_NOTICE_TITLE,
  SUBSET_STORAGE_KEY,
  canTapeSubset,
  clearListingSubset,
  isListingSubsetOverlay,
  markListingSubset,
  parseSubsetListingIds,
  subsetCookieValue,
} from "./listing-subset";

test("cookie and storage keys stay the subset paper names", () => {
  assert.equal(SUBSET_STORAGE_KEY, "iss:subset-listing-ids");
  assert.equal(SUBSET_COOKIE_NAME, "iss-subset-listing-ids");
  assert.equal(SUBSET_HOST_ID, "dl-booth-font");
  assert.equal(
    SUBSET_NOTICE_TITLE,
    "I will not subset it. Still two weights. Still an OTF.",
  );
  assert.equal(SUBSET_LEAVE_LINE, "Leave the two weights");
  assert.notEqual(SUBSET_STORAGE_KEY, FOUNDRY_STORAGE_KEY);
  assert.notEqual(SUBSET_STORAGE_KEY, LIGATURE_STORAGE_KEY);
  assert.notEqual(SUBSET_STORAGE_KEY, VARIABLE_STORAGE_KEY);
  assert.notEqual(SUBSET_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(SUBSET_STORAGE_KEY, QUANTIZE_STORAGE_KEY);
});

test("write-result objects never parse as a subset set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseSubsetListingIds(writeResult), []);
  assert.equal(
    isListingSubsetOverlay(
      "dl-booth-font",
      parseSubsetListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = subsetCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseSubsetListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; pack, LUT, and overlay hosts stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const cdr = listingById("ysk-burned-cdr");

  assert.ok(canTapeSubset(font));
  assert.equal(canTapeSubset(pack), false);
  assert.equal(canTapeSubset(luts), false);
  assert.equal(canTapeSubset(cdr), false);

  const taped = markListingSubset(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(subsetCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingSubsetOverlay("dl-booth-font", taped), true);
  assert.equal(isListingSubsetOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingSubsetOverlay("dl-camera-luts", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("pack, LUT, gift, zine, physical, and overlay-owned rows refuse a subset write", () => {
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const cdr = listingById("ysk-burned-cdr");
  const chair = listingById(SUBSET_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");

  assert.equal(canTapeSubset(pack), false);
  assert.equal(canTapeSubset(luts), false);
  assert.equal(canTapeSubset(gift), false);
  assert.equal(canTapeSubset(zine), false);
  assert.equal(canTapeSubset(cdr), false);
  assert.equal(canTapeSubset(chair), false);
  assert.equal(canTapeSubset(junk), false);

  assert.equal(markListingSubset(pack, []), null);
  assert.equal(markListingSubset(luts, []), null);
  assert.equal(markListingSubset(gift, []), null);
  assert.equal(markListingSubset(zine, []), null);
  assert.equal(markListingSubset(cdr, []), null);
  assert.equal(markListingSubset(chair, []), null);
  assert.equal(markListingSubset(junk, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const font = listingById("dl-booth-font");
  assert.ok(font);
  const before = {
    price: font.price,
    status: font.status,
    cartEligible: font.cartEligible,
  };
  const taped = markListingSubset(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingSubset(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(subsetCookieValue(cleared), "[]");
  assert.equal(isListingSubsetOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const taped = markListingSubset(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSubset(pack, []), null);

  const cleared = clearListingSubset(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SUBSET_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSubset(chair, []), null);
});
