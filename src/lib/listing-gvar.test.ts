import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { OPSZ_COOKIE_NAME, OPSZ_STORAGE_KEY } from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import {
  GVAR_CHAIR_ID,
  GVAR_COOKIE_NAME,
  GVAR_HOST_ID,
  GVAR_LEAVE_LINE,
  GVAR_NOTICE_TITLE,
  GVAR_STORAGE_KEY,
  canTapeGvar,
  clearListingGvar,
  gvarCookieValue,
  isListingGvarOverlay,
  markListingGvar,
  parseGvarListingIds,
} from "./listing-gvar";

test("cookie and storage keys stay the gvar paper names", () => {
  assert.equal(GVAR_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.equal(GVAR_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.equal(GVAR_HOST_ID, "dl-booth-font");
  assert.equal(
    GVAR_NOTICE_TITLE,
    "I will not gvar it. Still two weights. Still almost-bold.",
  );
  assert.equal(GVAR_LEAVE_LINE, "Leave the glyphs");
  assert.notEqual(GVAR_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(GVAR_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(GVAR_COOKIE_NAME, AVAR_COOKIE_NAME);
  assert.notEqual(GVAR_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(GVAR_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(GVAR_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a gvar set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseGvarListingIds(writeResult), []);
  assert.equal(
    isListingGvarOverlay(
      "dl-booth-font",
      parseGvarListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gvarCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseGvarListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeGvar(font));
  assert.equal(canTapeGvar(pack), false);
  assert.equal(canTapeGvar(junk), false);
  assert.equal(canTapeGvar(boy), false);

  const taped = markListingGvar(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(gvarCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingGvarOverlay("dl-booth-font", taped), true);
  assert.equal(isListingGvarOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingGvarOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a gvar write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(GVAR_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeGvar(pack), false);
  assert.equal(canTapeGvar(junk), false);
  assert.equal(canTapeGvar(gift), false);
  assert.equal(canTapeGvar(boy), false);
  assert.equal(canTapeGvar(chair), false);
  assert.equal(canTapeGvar(luts), false);
  assert.equal(canTapeGvar(zine), false);
  assert.equal(canTapeGvar(recipes), false);

  assert.equal(markListingGvar(pack, []), null);
  assert.equal(markListingGvar(junk, []), null);
  assert.equal(markListingGvar(gift, []), null);
  assert.equal(markListingGvar(boy, []), null);
  assert.equal(markListingGvar(chair, []), null);
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
  const taped = markListingGvar(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingGvar(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gvarCookieValue(cleared), "[]");
  assert.equal(isListingGvarOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingGvar(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGvar(boy, []), null);

  const cleared = clearListingGvar(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GVAR_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGvar(chair, []), null);
});

test("gvar write never aliases avar, opsz, raster, gasp, gridfit, or bluezone paper", () => {
  assert.notEqual(GVAR_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(GVAR_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(GVAR_STORAGE_KEY, "iss:glyf-listing-ids");
});
