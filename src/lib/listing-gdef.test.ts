import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { GSUB_COOKIE_NAME, GSUB_STORAGE_KEY } from "./listing-gsub";
import { GVAR_COOKIE_NAME, GVAR_STORAGE_KEY } from "./listing-gvar";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { OPSZ_COOKIE_NAME, OPSZ_STORAGE_KEY } from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import {
  GDEF_CHAIR_ID,
  GDEF_COOKIE_NAME,
  GDEF_HOST_ID,
  GDEF_LEAVE_LINE,
  GDEF_NOTICE_TITLE,
  GDEF_STORAGE_KEY,
  canTapeGdef,
  clearListingGdef,
  gdefCookieValue,
  isListingGdefOverlay,
  markListingGdef,
  parseGdefListingIds,
} from "./listing-gdef";

test("cookie and storage keys stay the gdef paper names", () => {
  assert.equal(GDEF_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.equal(GDEF_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.equal(GDEF_HOST_ID, "dl-booth-font");
  assert.equal(
    GDEF_NOTICE_TITLE,
    "I will not gdef it. Still two weights. Still almost-bold.",
  );
  assert.equal(GDEF_LEAVE_LINE, "Leave the class");
  assert.notEqual(GDEF_STORAGE_KEY, GSUB_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, GVAR_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(GDEF_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(GDEF_COOKIE_NAME, GSUB_COOKIE_NAME);
  assert.notEqual(GDEF_COOKIE_NAME, GVAR_COOKIE_NAME);
  assert.notEqual(GDEF_COOKIE_NAME, AVAR_COOKIE_NAME);
  assert.notEqual(GDEF_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(GDEF_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(GDEF_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a gdef set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseGdefListingIds(writeResult), []);
  assert.equal(
    isListingGdefOverlay(
      "dl-booth-font",
      parseGdefListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gdefCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseGdefListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeGdef(font));
  assert.equal(canTapeGdef(pack), false);
  assert.equal(canTapeGdef(junk), false);
  assert.equal(canTapeGdef(boy), false);

  const taped = markListingGdef(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(gdefCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingGdefOverlay("dl-booth-font", taped), true);
  assert.equal(isListingGdefOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingGdefOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a gdef write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(GDEF_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeGdef(pack), false);
  assert.equal(canTapeGdef(junk), false);
  assert.equal(canTapeGdef(gift), false);
  assert.equal(canTapeGdef(boy), false);
  assert.equal(canTapeGdef(chair), false);
  assert.equal(canTapeGdef(luts), false);
  assert.equal(canTapeGdef(zine), false);
  assert.equal(canTapeGdef(recipes), false);

  assert.equal(markListingGdef(pack, []), null);
  assert.equal(markListingGdef(junk, []), null);
  assert.equal(markListingGdef(gift, []), null);
  assert.equal(markListingGdef(boy, []), null);
  assert.equal(markListingGdef(chair, []), null);
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
  const taped = markListingGdef(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingGdef(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gdefCookieValue(cleared), "[]");
  assert.equal(isListingGdefOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingGdef(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGdef(boy, []), null);

  const cleared = clearListingGdef(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GDEF_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGdef(chair, []), null);
});

test("gdef write never aliases gsub, gvar, avar, opsz, raster, gasp, or gridfit paper", () => {
  assert.notEqual(GDEF_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(GDEF_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(GDEF_STORAGE_KEY, "iss:stat-listing-ids");
});
