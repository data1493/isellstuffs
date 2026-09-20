import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { LIGATURE_STORAGE_KEY } from "./listing-ligature";
import { OUTLINE_STORAGE_KEY } from "./listing-outline";
import {
  RASTER_CHAIR_ID,
  RASTER_COOKIE_NAME,
  RASTER_HOST_ID,
  RASTER_LEAVE_LINE,
  RASTER_NOTICE_TITLE,
  RASTER_STORAGE_KEY,
  canTapeRaster,
  clearListingRaster,
  isListingRasterOverlay,
  markListingRaster,
  parseRasterListingIds,
  rasterCookieValue,
} from "./listing-raster";
import { SUBSET_STORAGE_KEY } from "./listing-subset";

test("cookie and storage keys stay the raster paper names", () => {
  assert.equal(RASTER_STORAGE_KEY, "iss:raster-listing-ids");
  assert.equal(RASTER_COOKIE_NAME, "iss-raster-listing-ids");
  assert.equal(RASTER_HOST_ID, "dl-booth-font");
  assert.equal(
    RASTER_NOTICE_TITLE,
    "I will not raster it. Still two weights. Still almost bold.",
  );
  assert.equal(RASTER_LEAVE_LINE, "Leave the food-court");
  assert.notEqual(RASTER_STORAGE_KEY, OUTLINE_STORAGE_KEY);
  assert.notEqual(RASTER_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(RASTER_STORAGE_KEY, SUBSET_STORAGE_KEY);
  assert.notEqual(RASTER_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(RASTER_STORAGE_KEY, LIGATURE_STORAGE_KEY);
});

test("write-result objects never parse as a raster set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseRasterListingIds(writeResult), []);
  assert.equal(
    isListingRasterOverlay(
      "dl-booth-font",
      parseRasterListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = rasterCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseRasterListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; liner, junk PDF, pack, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const liner = listingById("dl-crate-side-a");
  const junk = listingById("dl-junk-pricing-pdf");
  const pack = listingById("dl-sample-pack");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeRaster(font));
  assert.equal(canTapeRaster(liner), false);
  assert.equal(canTapeRaster(junk), false);
  assert.equal(canTapeRaster(pack), false);
  assert.equal(canTapeRaster(boy), false);

  const taped = markListingRaster(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(rasterCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingRasterOverlay("dl-booth-font", taped), true);
  assert.equal(isListingRasterOverlay("dl-crate-side-a", taped), false);
  assert.equal(isListingRasterOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("liner, junk PDF, gift, Game Boy, and overlay-owned rows refuse a raster write", () => {
  const liner = listingById("dl-crate-side-a");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(RASTER_CHAIR_ID);
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeRaster(liner), false);
  assert.equal(canTapeRaster(junk), false);
  assert.equal(canTapeRaster(gift), false);
  assert.equal(canTapeRaster(boy), false);
  assert.equal(canTapeRaster(chair), false);
  assert.equal(canTapeRaster(pack), false);
  assert.equal(canTapeRaster(luts), false);
  assert.equal(canTapeRaster(zine), false);
  assert.equal(canTapeRaster(recipes), false);

  assert.equal(markListingRaster(liner, []), null);
  assert.equal(markListingRaster(junk, []), null);
  assert.equal(markListingRaster(gift, []), null);
  assert.equal(markListingRaster(boy, []), null);
  assert.equal(markListingRaster(chair, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const font = listingById("dl-booth-font");
  assert.ok(font);
  const before = {
    price: font.price,
    status: font.status,
    cartEligible: font.cartEligible,
  };
  const taped = markListingRaster(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingRaster(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(rasterCookieValue(cleared), "[]");
  assert.equal(isListingRasterOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingRaster(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRaster(boy, []), null);

  const cleared = clearListingRaster(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RASTER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRaster(chair, []), null);
});

test("raster write never aliases outline or kern paper", () => {
  assert.notEqual(RASTER_STORAGE_KEY, "iss:outline-listing-ids");
  assert.notEqual(RASTER_STORAGE_KEY, "iss:kern-listing-ids");
  assert.notEqual(RASTER_STORAGE_KEY, "iss:subset-listing-ids");
  assert.notEqual(RASTER_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(RASTER_STORAGE_KEY, "iss:ligature-listing-ids");
  assert.notEqual(RASTER_COOKIE_NAME, "iss-outline-listing-ids");
  assert.notEqual(RASTER_COOKIE_NAME, "iss-kern-listing-ids");
});
