import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LIGATURE_STORAGE_KEY, readLigatureListingIds } from "./listing-ligature";
import {
  KERN_CHAIR_ID,
  KERN_COOKIE_NAME,
  KERN_HOST_ID,
  KERN_JACKET_ID,
  KERN_LEAVE_LINE,
  KERN_NOTICE_TITLE,
  KERN_STORAGE_KEY,
  canTapeKern,
  clearListingKern,
  isListingKernOverlay,
  kernCookieValue,
  markListingKern,
  parseKernListingIds,
  readKernListingIds,
  writeKernListingIds,
} from "./listing-kern";
import { SUBSET_STORAGE_KEY, readSubsetListingIds } from "./listing-subset";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";

test("cookie and storage keys stay the kern paper names", () => {
  assert.equal(KERN_STORAGE_KEY, "iss:kern-listing-ids");
  assert.equal(KERN_COOKIE_NAME, "iss-kern-listing-ids");
  assert.equal(KERN_HOST_ID, "dl-booth-font");
  assert.equal(
    KERN_NOTICE_TITLE,
    "I will not kern it. Still two weights. Still a map.",
  );
  assert.equal(KERN_LEAVE_LINE, "Leave the pairs");
  assert.notEqual(KERN_STORAGE_KEY, LIGATURE_STORAGE_KEY);
  assert.notEqual(KERN_STORAGE_KEY, SUBSET_STORAGE_KEY);
  assert.notEqual(KERN_STORAGE_KEY, VARIABLE_STORAGE_KEY);
});

test("write-result objects never parse as a kern set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseKernListingIds(writeResult), []);
  assert.equal(
    isListingKernOverlay(
      "dl-booth-font",
      parseKernListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = kernCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseKernListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; junk PDF, recipes, and jacket stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pdf = listingById("dl-junk-pricing-pdf");
  const recipes = listingById("dl-drawer-recipes");
  const jacket = listingById(KERN_JACKET_ID);

  assert.ok(canTapeKern(font));
  assert.equal(canTapeKern(pdf), false);
  assert.equal(canTapeKern(recipes), false);
  assert.equal(canTapeKern(jacket), false);

  const taped = markListingKern(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(kernCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingKernOverlay("dl-booth-font", taped), true);
  assert.equal(isListingKernOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingKernOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingKernOverlay("clo-windbreaker", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("jacket, gift, zine, PDF, recipes, and overlay-owned rows refuse a kern write", () => {
  const jacket = listingById(KERN_JACKET_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pdf = listingById("dl-junk-pricing-pdf");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById(KERN_CHAIR_ID);
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");

  assert.equal(canTapeKern(jacket), false);
  assert.equal(canTapeKern(gift), false);
  assert.equal(canTapeKern(zine), false);
  assert.equal(canTapeKern(pdf), false);
  assert.equal(canTapeKern(recipes), false);
  assert.equal(canTapeKern(chair), false);
  assert.equal(canTapeKern(pack), false);
  assert.equal(canTapeKern(luts), false);

  assert.equal(markListingKern(jacket, []), null);
  assert.equal(markListingKern(gift, []), null);
  assert.equal(markListingKern(zine, []), null);
  assert.equal(markListingKern(pdf, []), null);
  assert.equal(markListingKern(recipes, []), null);
  assert.equal(markListingKern(chair, []), null);
  assert.equal(markListingKern(pack, []), null);
  assert.equal(markListingKern(luts, []), null);
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
  const taped = markListingKern(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingKern(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(kernCookieValue(cleared), "[]");
  assert.equal(isListingKernOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const jacket = listingById(KERN_JACKET_ID);
  const taped = markListingKern(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingKern(jacket, []), null);

  const cleared = clearListingKern(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(KERN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingKern(chair, []), null);
});

test("kern write does not write ligature or subset paper", () => {
  const font = listingById("dl-booth-font");
  const taped = markListingKern(font, []);
  assert.ok(taped);
  writeKernListingIds(taped);
  assert.deepEqual(readKernListingIds(), ["dl-booth-font"]);
  assert.deepEqual(readLigatureListingIds(), []);
  assert.deepEqual(readSubsetListingIds(), []);
  writeKernListingIds([]);
});
