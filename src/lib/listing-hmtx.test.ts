import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { CVT_COOKIE_NAME, CVT_STORAGE_KEY } from "./listing-cvt";
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
  HMTX_CHAIR_ID,
  HMTX_COOKIE_NAME,
  HMTX_HOST_ID,
  HMTX_LEAVE_LINE,
  HMTX_NOTICE_TITLE,
  HMTX_STORAGE_KEY,
  canTapeHmtx,
  clearListingHmtx,
  hmtxCookieValue,
  isListingHmtxOverlay,
  markListingHmtx,
  parseHmtxListingIds,
} from "./listing-hmtx";

test("cookie and storage keys stay the hmtx paper names", () => {
  assert.equal(HMTX_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.equal(HMTX_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.equal(HMTX_HOST_ID, "dl-booth-font");
  assert.equal(
    HMTX_NOTICE_TITLE,
    "I will not hmtx it. Still two weights. Still almost-bold.",
  );
  assert.equal(HMTX_LEAVE_LINE, "Leave the advances");
  assert.notEqual(HMTX_STORAGE_KEY, CVT_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, GDEF_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, GSUB_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, GVAR_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, OPSZ_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(HMTX_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(HMTX_COOKIE_NAME, CVT_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, GDEF_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, GSUB_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, GVAR_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, AVAR_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, OPSZ_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(HMTX_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as a hmtx set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseHmtxListingIds(writeResult), []);
  assert.equal(
    isListingHmtxOverlay(
      "dl-booth-font",
      parseHmtxListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = hmtxCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseHmtxListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeHmtx(font));
  assert.equal(canTapeHmtx(pack), false);
  assert.equal(canTapeHmtx(junk), false);
  assert.equal(canTapeHmtx(boy), false);

  const taped = markListingHmtx(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(hmtxCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingHmtxOverlay("dl-booth-font", taped), true);
  assert.equal(isListingHmtxOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingHmtxOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse a hmtx write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(HMTX_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeHmtx(pack), false);
  assert.equal(canTapeHmtx(junk), false);
  assert.equal(canTapeHmtx(gift), false);
  assert.equal(canTapeHmtx(boy), false);
  assert.equal(canTapeHmtx(chair), false);
  assert.equal(canTapeHmtx(luts), false);
  assert.equal(canTapeHmtx(zine), false);
  assert.equal(canTapeHmtx(recipes), false);

  assert.equal(markListingHmtx(pack, []), null);
  assert.equal(markListingHmtx(junk, []), null);
  assert.equal(markListingHmtx(gift, []), null);
  assert.equal(markListingHmtx(boy, []), null);
  assert.equal(markListingHmtx(chair, []), null);
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
  const taped = markListingHmtx(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingHmtx(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(hmtxCookieValue(cleared), "[]");
  assert.equal(isListingHmtxOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingHmtx(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingHmtx(boy, []), null);

  const cleared = clearListingHmtx(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(HMTX_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingHmtx(chair, []), null);
});

test("hmtx write never aliases cvt, gdef, gsub, gvar, avar, opsz, raster, gasp, or gridfit paper", () => {
  assert.notEqual(HMTX_STORAGE_KEY, "iss:cvt-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gdef-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gsub-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gvar-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:avar-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-cvt-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-gdef-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-gsub-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-gvar-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-avar-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(HMTX_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:loca-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:maxp-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:post-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:hhea-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:vmtx-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:vhea-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:sbix-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:trak-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:mort-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:feat-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:dsig-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:prep-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:os2-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:vdmx-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:hdmx-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:colr-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:cvar-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:hvar-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:glyf-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:gpos-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:cmap-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:fpgm-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:mark-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:jstf-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:stat-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:fvar-listing-ids");
  assert.notEqual(HMTX_STORAGE_KEY, "iss:mvar-listing-ids");
});
