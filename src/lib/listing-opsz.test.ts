import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLUEZONE_STORAGE_KEY } from "./listing-bluezone";
import { GASP_STORAGE_KEY } from "./listing-gasp";
import { GRIDFIT_COOKIE_NAME, GRIDFIT_STORAGE_KEY } from "./listing-gridfit";
import { HINT_STORAGE_KEY } from "./listing-hint";
import { KERN_STORAGE_KEY } from "./listing-kern";
import {
  OPSZ_CHAIR_ID,
  OPSZ_COOKIE_NAME,
  OPSZ_HOST_ID,
  OPSZ_LEAVE_LINE,
  OPSZ_NOTICE_TITLE,
  OPSZ_STORAGE_KEY,
  canTapeOpsz,
  clearListingOpsz,
  isListingOpszOverlay,
  markListingOpsz,
  parseOpszListingIds,
  opszCookieValue,
} from "./listing-opsz";
import { RASTER_COOKIE_NAME, RASTER_STORAGE_KEY } from "./listing-raster";

test("cookie and storage keys stay the opsz paper names", () => {
  assert.equal(OPSZ_STORAGE_KEY, "iss:opsz-listing-ids");
  assert.equal(OPSZ_COOKIE_NAME, "iss-opsz-listing-ids");
  assert.equal(OPSZ_HOST_ID, "dl-booth-font");
  assert.equal(
    OPSZ_NOTICE_TITLE,
    "I will not opsz it. Still two weights. Still almost-bold.",
  );
  assert.equal(OPSZ_LEAVE_LINE, "Leave the map");
  assert.notEqual(OPSZ_STORAGE_KEY, RASTER_STORAGE_KEY);
  assert.notEqual(OPSZ_STORAGE_KEY, GASP_STORAGE_KEY);
  assert.notEqual(OPSZ_STORAGE_KEY, GRIDFIT_STORAGE_KEY);
  assert.notEqual(OPSZ_STORAGE_KEY, BLUEZONE_STORAGE_KEY);
  assert.notEqual(OPSZ_STORAGE_KEY, HINT_STORAGE_KEY);
  assert.notEqual(OPSZ_STORAGE_KEY, KERN_STORAGE_KEY);
  assert.notEqual(OPSZ_COOKIE_NAME, RASTER_COOKIE_NAME);
  assert.notEqual(OPSZ_COOKIE_NAME, GRIDFIT_COOKIE_NAME);
});

test("write-result objects never parse as an opsz set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseOpszListingIds(writeResult), []);
  assert.equal(
    isListingOpszOverlay(
      "dl-booth-font",
      parseOpszListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = opszCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseOpszListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; sample pack, junk PDF, and physical stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");

  assert.ok(canTapeOpsz(font));
  assert.equal(canTapeOpsz(pack), false);
  assert.equal(canTapeOpsz(junk), false);
  assert.equal(canTapeOpsz(boy), false);

  const taped = markListingOpsz(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(opszCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingOpszOverlay("dl-booth-font", taped), true);
  assert.equal(isListingOpszOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingOpszOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("sample pack, junk PDF, gift, Game Boy, and overlay-owned rows refuse an opsz write", () => {
  const pack = listingById("dl-sample-pack");
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById("gtk-game-boy");
  const chair = listingById(OPSZ_CHAIR_ID);
  const luts = listingById("dl-camera-luts");
  const zine = listingById("dl-stain-zine");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeOpsz(pack), false);
  assert.equal(canTapeOpsz(junk), false);
  assert.equal(canTapeOpsz(gift), false);
  assert.equal(canTapeOpsz(boy), false);
  assert.equal(canTapeOpsz(chair), false);
  assert.equal(canTapeOpsz(luts), false);
  assert.equal(canTapeOpsz(zine), false);
  assert.equal(canTapeOpsz(recipes), false);

  assert.equal(markListingOpsz(pack, []), null);
  assert.equal(markListingOpsz(junk, []), null);
  assert.equal(markListingOpsz(gift, []), null);
  assert.equal(markListingOpsz(boy, []), null);
  assert.equal(markListingOpsz(chair, []), null);
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
  const taped = markListingOpsz(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingOpsz(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(opszCookieValue(cleared), "[]");
  assert.equal(isListingOpszOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingOpsz(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingOpsz(boy, []), null);

  const cleared = clearListingOpsz(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(OPSZ_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingOpsz(chair, []), null);
});

test("opsz write never aliases raster, gasp, gridfit, bluezone, hint, or kern paper", () => {
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:raster-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:gasp-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:gridfit-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:bluezone-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:hint-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:kern-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-raster-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-gasp-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-gridfit-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-bluezone-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-hint-listing-ids");
  assert.notEqual(OPSZ_COOKIE_NAME, "iss-kern-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:wdth-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:wght-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:ital-listing-ids");
  assert.notEqual(OPSZ_STORAGE_KEY, "iss:optical-listing-ids");
});
