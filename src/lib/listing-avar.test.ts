import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { OPSZ_COOKIE_NAME, OPSZ_STORAGE_KEY } from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import {
  AVAR_CHAIR_ID,
  AVAR_COOKIE_NAME,
  AVAR_HOST_ID,
  AVAR_LEAVE_LINE,
  AVAR_NOTICE_TITLE,
  AVAR_STORAGE_KEY,
  avarCookieValue,
  canTapeAvar,
  clearListingAvar,
  isListingAvarOverlay,
  markListingAvar,
  parseAvarListingIds,
} from "./listing-avar";

test("cookie and storage keys stay the avar paper names", () => {
  assert.equal(AVAR_STORAGE_KEY, "iss:avar-listing-ids");
  assert.equal(AVAR_COOKIE_NAME, "iss-avar-listing-ids");
  assert.equal(AVAR_HOST_ID, "dl-booth-font");
  assert.equal(
    AVAR_NOTICE_TITLE,
    "I will not avar it. Still two weights. Still almost-bold.",
  );
  assert.equal(AVAR_LEAVE_LINE, "Leave the map");
  assert.notEqual(AVAR_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(AVAR_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(AVAR_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(AVAR_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(AVAR_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as an avar set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseAvarListingIds(writeResult), []);
  assert.equal(
    isListingAvarOverlay(
      "dl-booth-font",
      parseAvarListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = avarCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseAvarListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeAvar(font));
  assert.equal(canTapeAvar(pack), false);
  assert.equal(canTapeAvar(junk), false);
  assert.equal(canTapeAvar(boy), false);

  const taped = markListingAvar(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(avarCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingAvarOverlay("dl-booth-font", taped), true);
  assert.equal(isListingAvarOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingAvarOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse an avar write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(AVAR_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeAvar(pack), false);
  assert.equal(canTapeAvar(junk), false);
  assert.equal(canTapeAvar(gift), false);
  assert.equal(canTapeAvar(boy), false);
  assert.equal(canTapeAvar(chair), false);
  assert.equal(canTapeAvar(luts), false);
  assert.equal(canTapeAvar(zine), false);
  assert.equal(canTapeAvar(recipes), false);

  assert.equal(markListingAvar(pack, []), null);
  assert.equal(markListingAvar(junk, []), null);
  assert.equal(markListingAvar(gift, []), null);
  assert.equal(markListingAvar(boy, []), null);
  assert.equal(markListingAvar(chair, []), null);
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
  const taped = markListingAvar(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingAvar(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(avarCookieValue(cleared), "[]");
  assert.equal(isListingAvarOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingAvar(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingAvar(boy, []), null);

  const cleared = clearListingAvar(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(AVAR_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAvar(chair, []), null);
});

test("avar write never aliases opsz, raster, gasp, gridfit, bluezone, or hint paper", () => {
  assert.notEqual(AVAR_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(AVAR_COOKIE_NAME, "iss-hint-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(AVAR_STORAGE_KEY, "iss:mvar-listing-ids");
});
