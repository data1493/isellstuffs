import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import {
  LTSH_CHAIR_ID,
  LTSH_COOKIE_NAME,
  LTSH_HOST_ID,
  LTSH_LEAVE_LINE,
  LTSH_NOTICE_TITLE,
  LTSH_STORAGE_KEY,
  canTapeLtsh,
  clearListingLtsh,
  isListingLtshOverlay,
  ltshCookieValue,
  markListingLtsh,
  parseLtshListingIds,
} from "./listing-ltsh";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the ltsh paper names", () => {
  assert.equal(LTSH_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.equal(LTSH_COOKIE_NAME, "iss-ltsh-listing-ids");
  assert.equal(LTSH_HOST_ID, "dl-booth-font");
  assert.equal(
    LTSH_NOTICE_TITLE,
    "I will not ltsh it. Still two weights. Still almost-bold.",
  );
  assert.equal(LTSH_LEAVE_LINE, "Leave the threshold");
  assert.notEqual(LTSH_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(LTSH_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(LTSH_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(LTSH_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(LTSH_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(LTSH_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(LTSH_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a ltsh set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseLtshListingIds(writeResult), []);
  assert.equal(
    isListingLtshOverlay(
      "dl-booth-font",
      parseLtshListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = ltshCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseLtshListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeLtsh(font));
  assert.equal(canTapeLtsh(pack), false);
  assert.equal(canTapeLtsh(junk), false);
  assert.equal(canTapeLtsh(boy), false);

  const taped = markListingLtsh(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(ltshCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingLtshOverlay("dl-booth-font", taped), true);
  assert.equal(isListingLtshOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingLtshOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a ltsh write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(LTSH_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");
  const lid = listingById("kdr-lid-no-pot");

  assert.equal(canTapeLtsh(pack), false);
  assert.equal(canTapeLtsh(junk), false);
  assert.equal(canTapeLtsh(gift), false);
  assert.equal(canTapeLtsh(boy), false);
  assert.equal(canTapeLtsh(chair), false);
  assert.equal(canTapeLtsh(luts), false);
  assert.equal(canTapeLtsh(zine), false);
  assert.equal(canTapeLtsh(recipes), false);
  assert.equal(canTapeLtsh(lid), false);

  assert.equal(markListingLtsh(pack, []), null);
  assert.equal(markListingLtsh(junk, []), null);
  assert.equal(markListingLtsh(gift, []), null);
  assert.equal(markListingLtsh(boy, []), null);
  assert.equal(markListingLtsh(chair, []), null);
  assert.equal(markListingLtsh(lid, []), null);
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
  const taped = markListingLtsh(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingLtsh(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(ltshCookieValue(cleared), "[]");
  assert.equal(isListingLtshOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingLtsh(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingLtsh(boy, []), null);

  const cleared = clearListingLtsh(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(LTSH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingLtsh(chair, []), null);
});

test("ltsh write never aliases leftover opbd, bsln, raster, gasp, or gridfit paper", () => {
  assert.notEqual(LTSH_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:cvt-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-cvt-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:loca-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:maxp-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:post-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:hhea-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:vmtx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:vhea-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:sbix-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:trak-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:mort-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:feat-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:dsig-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:prep-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:os2-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:vdmx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:hdmx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:colr-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:mvar-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:cff-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:kerx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:vorg-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:cpal-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:fmtx-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:base-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:ppem-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:threshold-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(LTSH_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(LTSH_COOKIE_NAME, "iss-booth-flywheel");
});
