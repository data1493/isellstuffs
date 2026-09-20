import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { LIGATURE_STORAGE_KEY } from "./listing-ligature";
import {
  GASP_CHAIR_ID,
  GASP_COOKIE_NAME,
  GASP_HOST_ID,
  GASP_LEAVE_LINE,
  GASP_NOTICE_TITLE,
  GASP_STORAGE_KEY,
  canTapeGasp,
  clearListingGasp,
  gaspCookieValue,
  isListingGaspOverlay,
  markListingGasp,
  parseGaspListingIds,
  readGaspListingIds,
  writeGaspListingIds,
} from "./listing-gasp";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the gasp paper names", () => {
  assert.equal(GASP_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.equal(GASP_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.equal(GASP_HOST_ID, "dl-booth-font");
  assert.equal(
    GASP_NOTICE_TITLE,
    "I will not gasp it. Still two weights. Still almost-bold.",
  );
  assert.equal(GASP_LEAVE_LINE, "Leave the map");
  assert.notEqual(GASP_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(GASP_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(GASP_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(GASP_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(GASP_STORAGE_KEY, LIGATURE_STORAGE_KEY);
  assert.notEqual(GASP_COOKIE_NAME, RASTER_COOKIE_NAME);
});

test("write-result objects never parse as a gasp set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseGaspListingIds(writeResult), []);
  assert.equal(
    isListingGaspOverlay(
      "dl-booth-font",
      parseGaspListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gaspCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseGaspListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeGasp(font));
  assert.equal(canTapeGasp(pack), false);
  assert.equal(canTapeGasp(junk), false);
  assert.equal(canTapeGasp(boy), false);

  const taped = markListingGasp(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(gaspCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingGaspOverlay("dl-booth-font", taped), true);
  assert.equal(isListingGaspOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingGaspOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a gasp write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(GASP_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeGasp(pack), false);
  assert.equal(canTapeGasp(junk), false);
  assert.equal(canTapeGasp(gift), false);
  assert.equal(canTapeGasp(boy), false);
  assert.equal(canTapeGasp(chair), false);
  assert.equal(canTapeGasp(luts), false);
  assert.equal(canTapeGasp(zine), false);
  assert.equal(canTapeGasp(recipes), false);

  assert.equal(markListingGasp(pack, []), null);
  assert.equal(markListingGasp(junk, []), null);
  assert.equal(markListingGasp(gift, []), null);
  assert.equal(markListingGasp(boy, []), null);
  assert.equal(markListingGasp(chair, []), null);
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
  const taped = markListingGasp(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingGasp(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gaspCookieValue(cleared), "[]");
  assert.equal(isListingGaspOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingGasp(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGasp(boy, []), null);

  const cleared = clearListingGasp(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GASP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGasp(chair, []), null);
});

test("gasp write does not write raster, kern, gridfit, hint, or ligature paper", () => {
  const font = listingById("dl-booth-font");
  const taped = markListingGasp(font, []);
  assert.ok(taped);
  writeGaspListingIds(taped);
  assert.deepEqual(readGaspListingIds(), ["dl-booth-font"]);
  assert.notEqual(GASP_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(GASP_STORAGE_KEY, "iss:kern-listing-ids");
  assert.notEqual(GASP_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(GASP_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(GASP_STORAGE_KEY, "iss:ligature-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-kern-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-hint-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-greyscale-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-ppem-listing-ids");
  assert.notEqual(GASP_COOKIE_NAME, "iss-smoothing-listing-ids");
  writeGaspListingIds([]);
});
