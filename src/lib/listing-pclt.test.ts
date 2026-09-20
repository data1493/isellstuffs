import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import {
  PCLT_CHAIR_ID,
  PCLT_COOKIE_NAME,
  PCLT_HOST_ID,
  PCLT_LEAVE_LINE,
  PCLT_NOTICE_TITLE,
  PCLT_STORAGE_KEY,
  canTapePclt,
  clearListingPclt,
  isListingPcltOverlay,
  markListingPclt,
  parsePcltListingIds,
  pcltCookieValue,
} from "./listing-pclt";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the pclt paper names", () => {
  assert.equal(PCLT_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.equal(PCLT_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.equal(PCLT_HOST_ID, "dl-booth-font");
  assert.equal(
    PCLT_NOTICE_TITLE,
    "I will not pclt it. Still two weights. Still almost-bold.",
  );
  assert.equal(PCLT_LEAVE_LINE, "Leave the pcl");
  assert.notEqual(PCLT_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(PCLT_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(PCLT_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(PCLT_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(PCLT_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(PCLT_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(PCLT_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a pclt set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parsePcltListingIds(writeResult), []);
  assert.equal(
    isListingPcltOverlay(
      "dl-booth-font",
      parsePcltListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pcltCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parsePcltListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapePclt(font));
  assert.equal(canTapePclt(pack), false);
  assert.equal(canTapePclt(junk), false);
  assert.equal(canTapePclt(boy), false);

  const taped = markListingPclt(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(pcltCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingPcltOverlay("dl-booth-font", taped), true);
  assert.equal(isListingPcltOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingPcltOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a pclt write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(PCLT_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");
  const lid = listingById("kdr-lid-no-pot");

  assert.equal(canTapePclt(pack), false);
  assert.equal(canTapePclt(junk), false);
  assert.equal(canTapePclt(gift), false);
  assert.equal(canTapePclt(boy), false);
  assert.equal(canTapePclt(chair), false);
  assert.equal(canTapePclt(luts), false);
  assert.equal(canTapePclt(zine), false);
  assert.equal(canTapePclt(recipes), false);
  assert.equal(canTapePclt(lid), false);

  assert.equal(markListingPclt(pack, []), null);
  assert.equal(markListingPclt(junk, []), null);
  assert.equal(markListingPclt(gift, []), null);
  assert.equal(markListingPclt(boy, []), null);
  assert.equal(markListingPclt(chair, []), null);
  assert.equal(markListingPclt(lid, []), null);
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
  const taped = markListingPclt(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingPclt(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pcltCookieValue(cleared), "[]");
  assert.equal(isListingPcltOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingPclt(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingPclt(boy, []), null);

  const cleared = clearListingPclt(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PCLT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPclt(chair, []), null);
});

test("pclt write never aliases leftover ltsh, opbd, raster, gasp, or gridfit paper", () => {
  assert.notEqual(PCLT_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:cvt-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-ltsh-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-cvt-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:loca-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:maxp-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:post-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:hhea-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:vmtx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:vhea-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:sbix-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:trak-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:mort-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:feat-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:dsig-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:prep-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:os2-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:vdmx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:hdmx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:colr-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:mvar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:cff-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:kerx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:vorg-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:cpal-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:fmtx-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:base-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:ppem-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:threshold-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:wdth-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:wght-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:lcar-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(PCLT_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(PCLT_COOKIE_NAME, "iss-booth-flywheel");
});
