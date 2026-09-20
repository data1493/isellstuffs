import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DESPECKLE_STORAGE_KEY } from "./listing-despeckle";
import { GASP_COOKIE_NAME, GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import {
  BLUEZONE_CHAIR_ID,
  BLUEZONE_COOKIE_NAME,
  BLUEZONE_HOST_ID,
  BLUEZONE_LEAVE_LINE,
  BLUEZONE_NOTICE_TITLE,
  BLUEZONE_STORAGE_KEY,
  bluezoneCookieValue,
  canTapeBluezone,
  clearListingBluezone,
  isListingBluezoneOverlay,
  markListingBluezone,
  parseBluezoneListingIds,
  readBluezoneListingIds,
  writeBluezoneListingIds,
} from "./listing-bluezone";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the bluezone paper names", () => {
  assert.equal(BLUEZONE_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.equal(BLUEZONE_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.equal(BLUEZONE_HOST_ID, "dl-booth-font");
  assert.equal(
    BLUEZONE_NOTICE_TITLE,
    "I will not bluezone it. Still two weights. Still almost-bold.",
  );
  assert.equal(BLUEZONE_LEAVE_LINE, "Leave the map");
  assert.notEqual(BLUEZONE_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(BLUEZONE_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(BLUEZONE_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(BLUEZONE_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(BLUEZONE_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(BLUEZONE_STORAGE_KEY, DESPECKLE_STORAGE_KEY);
  assert.notEqual(BLUEZONE_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(BLUEZONE_COOKIE_NAME, GASP_COOKIE_NAME);
});

test("write-result objects never parse as a bluezone set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseBluezoneListingIds(writeResult), []);
  assert.equal(
    isListingBluezoneOverlay(
      "dl-booth-font",
      parseBluezoneListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseBluezoneListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = bluezoneCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseBluezoneListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeBluezone(font));
  assert.equal(canTapeBluezone(pack), false);
  assert.equal(canTapeBluezone(junk), false);
  assert.equal(canTapeBluezone(boy), false);

  const taped = markListingBluezone(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(bluezoneCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingBluezoneOverlay("dl-booth-font", taped), true);
  assert.equal(isListingBluezoneOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingBluezoneOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a bluezone write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(BLUEZONE_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeBluezone(pack), false);
  assert.equal(canTapeBluezone(junk), false);
  assert.equal(canTapeBluezone(gift), false);
  assert.equal(canTapeBluezone(boy), false);
  assert.equal(canTapeBluezone(chair), false);
  assert.equal(canTapeBluezone(luts), false);
  assert.equal(canTapeBluezone(zine), false);
  assert.equal(canTapeBluezone(recipes), false);

  assert.equal(markListingBluezone(pack, []), null);
  assert.equal(markListingBluezone(junk, []), null);
  assert.equal(markListingBluezone(gift, []), null);
  assert.equal(markListingBluezone(boy, []), null);
  assert.equal(markListingBluezone(chair, []), null);
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
  const taped = markListingBluezone(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingBluezone(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(bluezoneCookieValue(cleared), "[]");
  assert.equal(isListingBluezoneOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingBluezone(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingBluezone(boy, []), null);

  const cleared = clearListingBluezone(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BLUEZONE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBluezone(chair, []), null);
});

test("bluezone write does not write raster, gasp, gridfit, hint, kern, or despeckle paper", () => {
  const font = listingById("dl-booth-font");
  const taped = markListingBluezone(font, []);
  assert.ok(taped);
  writeBluezoneListingIds(taped);
  assert.deepEqual(readBluezoneListingIds(), ["dl-booth-font"]);
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:kern-listing-ids");
  assert.notEqual(BLUEZONE_STORAGE_KEY, "iss:despeckle-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-hint-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-alignment-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-overshoot-listing-ids");
  assert.notEqual(BLUEZONE_COOKIE_NAME, "iss-snap-listing-ids");
  writeBluezoneListingIds([]);
});
