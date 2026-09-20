import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GDEF_COOKIE_NAME, GDEF_STORAGE_KEY } from "./listing-gdef";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { GSUB_COOKIE_NAME, GSUB_STORAGE_KEY } from "./listing-gsub";
import { GVAR_COOKIE_NAME, GVAR_STORAGE_KEY } from "./listing-gvar";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import { OPSZ_COOKIE_NAME, OPSZ_STORAGE_KEY } from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";
import {
  CVT_CHAIR_ID,
  CVT_COOKIE_NAME,
  CVT_HOST_ID,
  CVT_LEAVE_LINE,
  CVT_NOTICE_TITLE,
  CVT_STORAGE_KEY,
  canTapeCvt,
  clearListingCvt,
  cvtCookieValue,
  isListingCvtOverlay,
  markListingCvt,
  parseCvtListingIds,
} from "./listing-cvt";

test("cookie and storage keys stay the cvt paper names", () => {
  assert.equal(CVT_STORAGE_KEY, "iss:cvt-listing-ids");
  assert.equal(CVT_COOKIE_NAME, "iss-cvt-listing-ids");
  assert.equal(CVT_HOST_ID, "dl-booth-font");
  assert.equal(
    CVT_NOTICE_TITLE,
    "I will not cvt it. Still two weights. Still almost-bold.",
  );
  assert.equal(CVT_LEAVE_LINE, "Leave the values");
  assert.notEqual(CVT_STORAGE_KEY, GDEF_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, GSUB_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, GVAR_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(CVT_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(CVT_COOKIE_NAME, GDEF_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, GSUB_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, GVAR_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, AVAR_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(CVT_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a cvt set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseCvtListingIds(writeResult), []);
  assert.equal(
    isListingCvtOverlay(
      "dl-booth-font",
      parseCvtListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = cvtCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseCvtListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeCvt(font));
  assert.equal(canTapeCvt(pack), false);
  assert.equal(canTapeCvt(junk), false);
  assert.equal(canTapeCvt(boy), false);

  const taped = markListingCvt(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(cvtCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingCvtOverlay("dl-booth-font", taped), true);
  assert.equal(isListingCvtOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingCvtOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a cvt write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(CVT_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeCvt(pack), false);
  assert.equal(canTapeCvt(junk), false);
  assert.equal(canTapeCvt(gift), false);
  assert.equal(canTapeCvt(boy), false);
  assert.equal(canTapeCvt(chair), false);
  assert.equal(canTapeCvt(luts), false);
  assert.equal(canTapeCvt(zine), false);
  assert.equal(canTapeCvt(recipes), false);

  assert.equal(markListingCvt(pack, []), null);
  assert.equal(markListingCvt(junk, []), null);
  assert.equal(markListingCvt(gift, []), null);
  assert.equal(markListingCvt(boy, []), null);
  assert.equal(markListingCvt(chair, []), null);
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
  const taped = markListingCvt(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingCvt(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(cvtCookieValue(cleared), "[]");
  assert.equal(isListingCvtOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingCvt(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCvt(boy, []), null);

  const cleared = clearListingCvt(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(CVT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCvt(chair, []), null);
});

test("cvt write never aliases gdef, gsub, gvar, avar, opsz, raster, gasp, or gridfit paper", () => {
  assert.notEqual(CVT_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(CVT_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:prep-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:os2-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:vdmx-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:hdmx-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:colr-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(CVT_STORAGE_KEY, "iss:mvar-listing-ids");
});
