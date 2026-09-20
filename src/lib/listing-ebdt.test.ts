import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import {
  EBDT_CHAIR_ID,
  EBDT_COOKIE_NAME,
  EBDT_HOST_ID,
  EBDT_LEAVE_LINE,
  EBDT_NOTICE_TITLE,
  EBDT_STORAGE_KEY,
  canTapeEbdt,
  clearListingEbdt,
  isListingEbdtOverlay,
  markListingEbdt,
  parseEbdtListingIds,
  ebdtCookieValue,
} from "./listing-ebdt";
import { PCLT_COOKIE_NAME, PCLT_STORAGE_KEY } from "./listing-pclt";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the ebdt paper names", () => {
  assert.equal(EBDT_STORAGE_KEY, "iss:ebdt-listing-ids");
  assert.equal(EBDT_COOKIE_NAME, "iss-ebdt-listing-ids");
  assert.equal(EBDT_HOST_ID, "dl-booth-font");
  assert.equal(
    EBDT_NOTICE_TITLE,
    "I will not ebdt it. Still two weights. Still almost-bold.",
  );
  assert.equal(EBDT_LEAVE_LINE, "Leave the ebd");
  assert.notEqual(EBDT_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(EBDT_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(EBDT_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(EBDT_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(EBDT_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(EBDT_STORAGE_KEY, PCLT_STORAGE_KEY);
  assert.notEqual(EBDT_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(EBDT_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
  assert.notEqual(EBDT_COOKIE_NAME, PCLT_COOKIE_NAME);
});

test("write-result objects never parse as an ebdt set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseEbdtListingIds(writeResult), []);
  assert.equal(
    isListingEbdtOverlay(
      "dl-booth-font",
      parseEbdtListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = ebdtCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseEbdtListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeEbdt(font));
  assert.equal(canTapeEbdt(pack), false);
  assert.equal(canTapeEbdt(junk), false);
  assert.equal(canTapeEbdt(boy), false);

  const taped = markListingEbdt(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(ebdtCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingEbdtOverlay("dl-booth-font", taped), true);
  assert.equal(isListingEbdtOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingEbdtOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse an ebdt write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(EBDT_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");
  const lid = listingById("kdr-lid-no-pot");

  assert.equal(canTapeEbdt(pack), false);
  assert.equal(canTapeEbdt(junk), false);
  assert.equal(canTapeEbdt(gift), false);
  assert.equal(canTapeEbdt(boy), false);
  assert.equal(canTapeEbdt(chair), false);
  assert.equal(canTapeEbdt(luts), false);
  assert.equal(canTapeEbdt(zine), false);
  assert.equal(canTapeEbdt(recipes), false);
  assert.equal(canTapeEbdt(lid), false);

  assert.equal(markListingEbdt(pack, []), null);
  assert.equal(markListingEbdt(junk, []), null);
  assert.equal(markListingEbdt(gift, []), null);
  assert.equal(markListingEbdt(boy, []), null);
  assert.equal(markListingEbdt(chair, []), null);
  assert.equal(markListingEbdt(lid, []), null);
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
  const taped = markListingEbdt(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingEbdt(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(ebdtCookieValue(cleared), "[]");
  assert.equal(isListingEbdtOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingEbdt(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingEbdt(boy, []), null);

  const cleared = clearListingEbdt(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(EBDT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingEbdt(chair, []), null);
});

test("ebdt write never aliases leftover pclt, ltsh, raster, gasp, or gridfit paper", () => {
  assert.notEqual(EBDT_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cvt-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-ltsh-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-cvt-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:loca-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:maxp-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:post-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:hhea-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:vmtx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:vhea-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:sbix-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:trak-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:mort-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:feat-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:dsig-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:prep-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:os2-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:vdmx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:hdmx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:colr-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:mvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cff-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:kerx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:vorg-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cpal-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:fmtx-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:base-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:ppem-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:threshold-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:wdth-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:wght-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:lcar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:eblc-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:ebsc-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:cbdt-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:vvar-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:mother-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(EBDT_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(EBDT_COOKIE_NAME, "iss-booth-stator");
});
