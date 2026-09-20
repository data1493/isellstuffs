import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { GVAR_COOKIE_NAME, GVAR_STORAGE_KEY } from "./listing-gvar";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { OPSZ_COOKIE_NAME, OPSZ_STORAGE_KEY } from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import {
  GSUB_CHAIR_ID,
  GSUB_COOKIE_NAME,
  GSUB_HOST_ID,
  GSUB_LEAVE_LINE,
  GSUB_NOTICE_TITLE,
  GSUB_STORAGE_KEY,
  canTapeGsub,
  clearListingGsub,
  gsubCookieValue,
  isListingGsubOverlay,
  markListingGsub,
  parseGsubListingIds,
} from "./listing-gsub";

test("cookie and storage keys stay the gsub paper names", () => {
  assert.equal(GSUB_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.equal(GSUB_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.equal(GSUB_HOST_ID, "dl-booth-font");
  assert.equal(
    GSUB_NOTICE_TITLE,
    "I will not gsub it. Still two weights. Still almost-bold.",
  );
  assert.equal(GSUB_LEAVE_LINE, "Leave the otf");
  assert.notEqual(GSUB_STORAGE_KEY, GVAR_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(GSUB_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(GSUB_COOKIE_NAME, GVAR_COOKIE_NAME);
  assert.notEqual(GSUB_COOKIE_NAME, AVAR_COOKIE_NAME);
  assert.notEqual(GSUB_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(GSUB_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(GSUB_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a gsub set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseGsubListingIds(writeResult), []);
  assert.equal(
    isListingGsubOverlay(
      "dl-booth-font",
      parseGsubListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gsubCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseGsubListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeGsub(font));
  assert.equal(canTapeGsub(pack), false);
  assert.equal(canTapeGsub(junk), false);
  assert.equal(canTapeGsub(boy), false);

  const taped = markListingGsub(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(gsubCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingGsubOverlay("dl-booth-font", taped), true);
  assert.equal(isListingGsubOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingGsubOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a gsub write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(GSUB_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeGsub(pack), false);
  assert.equal(canTapeGsub(junk), false);
  assert.equal(canTapeGsub(gift), false);
  assert.equal(canTapeGsub(boy), false);
  assert.equal(canTapeGsub(chair), false);
  assert.equal(canTapeGsub(luts), false);
  assert.equal(canTapeGsub(zine), false);
  assert.equal(canTapeGsub(recipes), false);

  assert.equal(markListingGsub(pack, []), null);
  assert.equal(markListingGsub(junk, []), null);
  assert.equal(markListingGsub(gift, []), null);
  assert.equal(markListingGsub(boy, []), null);
  assert.equal(markListingGsub(chair, []), null);
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
  const taped = markListingGsub(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingGsub(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gsubCookieValue(cleared), "[]");
  assert.equal(isListingGsubOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingGsub(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGsub(boy, []), null);

  const cleared = clearListingGsub(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GSUB_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGsub(chair, []), null);
});

test("gsub write never aliases gvar, avar, opsz, raster, gasp, or gridfit paper", () => {
  assert.notEqual(GSUB_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(GSUB_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(GSUB_STORAGE_KEY, "iss:fpgm-listing-ids");
});
