import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { LIGATURE_STORAGE_KEY } from "./listing-ligature";
import {
  GRIDFIT_CHAIR_ID,
  GRIDFIT_COOKIE_NAME,
  GRIDFIT_HOST_ID,
  GRIDFIT_LEAVE_LINE,
  GRIDFIT_NOTICE_TITLE,
  GRIDFIT_STORAGE_KEY,
  canTapeGridfit,
  clearListingGridfit,
  isListingGridfitOverlay,
  markListingGridfit,
  parseGridfitListingIds,
  gridfitCookieValue,
} from "./listing-gridfit";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import { SUBSET_STORAGE_KEY } from "./listing-subset";

test("cookie and storage keys stay the gridfit paper names", () => {
  assert.equal(GRIDFIT_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.equal(GRIDFIT_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.equal(GRIDFIT_HOST_ID, "dl-booth-font");
  assert.equal(
    GRIDFIT_NOTICE_TITLE,
    "I will not gridfit it. Still two weights. Still almost-bold.",
  );
  assert.equal(GRIDFIT_LEAVE_LINE, "Leave the map");
  assert.notEqual(GRIDFIT_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(GRIDFIT_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(GRIDFIT_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(GRIDFIT_STORAGE_KEY, LIGATURE_STORAGE_KEY);
  assert.notEqual(GRIDFIT_STORAGE_KEY, SUBSET_STORAGE_KEY);
  assert.notEqual(GRIDFIT_COOKIE_NAME, RASTER_COOKIE_NAME);
});

test("write-result objects never parse as a gridfit set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseGridfitListingIds(writeResult), []);
  assert.equal(
    isListingGridfitOverlay(
      "dl-booth-font",
      parseGridfitListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gridfitCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseGridfitListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeGridfit(font));
  assert.equal(canTapeGridfit(pack), false);
  assert.equal(canTapeGridfit(junk), false);
  assert.equal(canTapeGridfit(boy), false);

  const taped = markListingGridfit(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(gridfitCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingGridfitOverlay("dl-booth-font", taped), true);
  assert.equal(isListingGridfitOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingGridfitOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a gridfit write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(GRIDFIT_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeGridfit(pack), false);
  assert.equal(canTapeGridfit(junk), false);
  assert.equal(canTapeGridfit(gift), false);
  assert.equal(canTapeGridfit(boy), false);
  assert.equal(canTapeGridfit(chair), false);
  assert.equal(canTapeGridfit(luts), false);
  assert.equal(canTapeGridfit(zine), false);
  assert.equal(canTapeGridfit(recipes), false);

  assert.equal(markListingGridfit(pack, []), null);
  assert.equal(markListingGridfit(junk, []), null);
  assert.equal(markListingGridfit(gift, []), null);
  assert.equal(markListingGridfit(boy, []), null);
  assert.equal(markListingGridfit(chair, []), null);
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
  const taped = markListingGridfit(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingGridfit(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gridfitCookieValue(cleared), "[]");
  assert.equal(isListingGridfitOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingGridfit(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGridfit(boy, []), null);

  const cleared = clearListingGridfit(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GRIDFIT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGridfit(chair, []), null);
});

test("gridfit write never aliases raster, kern, hint, or ligature paper", () => {
  assert.notEqual(GRIDFIT_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(GRIDFIT_STORAGE_KEY, "iss:kern-listing-ids");
  assert.notEqual(GRIDFIT_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(GRIDFIT_STORAGE_KEY, "iss:ligature-listing-ids");
  assert.notEqual(GRIDFIT_STORAGE_KEY, "iss:subset-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-kern-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-hint-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-autohint-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-delta-listing-ids");
  assert.notEqual(GRIDFIT_COOKIE_NAME, "iss-instruct-listing-ids");
});
