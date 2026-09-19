import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BOLD_STORAGE_KEY } from "./listing-bold";
import { FOUNDRY_STORAGE_KEY } from "./listing-foundry";
import {
  LIGATURE_COOKIE_NAME,
  LIGATURE_HOST_ID,
  LIGATURE_LEAVE_LINE,
  LIGATURE_NOTICE_TITLE,
  LIGATURE_STORAGE_KEY,
  canTapeLigature,
  clearListingLigature,
  isListingLigatureOverlay,
  ligatureCookieValue,
  markListingLigature,
  parseLigatureListingIds,
} from "./listing-ligature";
import { SLANT_STORAGE_KEY } from "./listing-slant";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";

test("cookie and storage keys stay the ligature paper names", () => {
  assert.equal(LIGATURE_STORAGE_KEY, "iss:ligature-listing-ids");
  assert.equal(LIGATURE_COOKIE_NAME, "iss-ligature-listing-ids");
  assert.equal(LIGATURE_HOST_ID, "dl-booth-font");
  assert.equal(
    LIGATURE_NOTICE_TITLE,
    "I will not ligature it. Still two weights. Still a food court.",
  );
  assert.equal(LIGATURE_LEAVE_LINE, "Leave the food court");
  assert.notEqual(LIGATURE_STORAGE_KEY, FOUNDRY_STORAGE_KEY);
  assert.notEqual(LIGATURE_STORAGE_KEY, SLANT_STORAGE_KEY);
  assert.notEqual(LIGATURE_STORAGE_KEY, BOLD_STORAGE_KEY);
  assert.notEqual(LIGATURE_STORAGE_KEY, VARIABLE_STORAGE_KEY);
});

test("write-result objects never parse as a ligature set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseLigatureListingIds(writeResult), []);
  assert.equal(
    isListingLigatureOverlay(
      "dl-booth-font",
      parseLigatureListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = ligatureCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseLigatureListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; pack, LUT, and overlay hosts stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const boy = listingById("gtk-game-boy");
  const jewels = listingById("mdb-jewel-stack");

  assert.ok(canTapeLigature(font));
  assert.equal(canTapeLigature(pack), false);
  assert.equal(canTapeLigature(luts), false);
  assert.equal(canTapeLigature(boy), false);
  assert.equal(canTapeLigature(jewels), false);

  const taped = markListingLigature(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(ligatureCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingLigatureOverlay("dl-booth-font", taped), true);
  assert.equal(isListingLigatureOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingLigatureOverlay("dl-camera-luts", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("pack, LUT, gift, zine, and overlay-owned rows refuse a ligature write", () => {
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const boy = listingById("gtk-game-boy");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const jewels = listingById("mdb-jewel-stack");
  const mixtape = listingById("mdb-mixtape-93");
  const lamp = listingById("ysk-wobbly-lamp");
  const whisk = listingById("kdr-bent-whisk");
  const junk = listingById("dl-junk-pricing-pdf");
  const disc = listingById("ysk-burned-cdr");
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeLigature(pack), false);
  assert.equal(canTapeLigature(luts), false);
  assert.equal(canTapeLigature(gift), false);
  assert.equal(canTapeLigature(zine), false);
  assert.equal(canTapeLigature(boy), false);
  assert.equal(canTapeLigature(jacket), false);
  assert.equal(canTapeLigature(soles), false);
  assert.equal(canTapeLigature(drawer), false);
  assert.equal(canTapeLigature(jewels), false);
  assert.equal(canTapeLigature(mixtape), false);
  assert.equal(canTapeLigature(lamp), false);
  assert.equal(canTapeLigature(whisk), false);
  assert.equal(canTapeLigature(junk), false);
  assert.equal(canTapeLigature(disc), false);
  assert.equal(canTapeLigature(mug), false);

  assert.equal(markListingLigature(pack, []), null);
  assert.equal(markListingLigature(luts, []), null);
  assert.equal(markListingLigature(gift, []), null);
  assert.equal(markListingLigature(zine, []), null);
  assert.equal(markListingLigature(boy, []), null);
  assert.equal(markListingLigature(jacket, []), null);
  assert.equal(markListingLigature(soles, []), null);
  assert.equal(markListingLigature(drawer, []), null);
  assert.equal(markListingLigature(jewels, []), null);
  assert.equal(markListingLigature(mixtape, []), null);
  assert.equal(markListingLigature(lamp, []), null);
  assert.equal(markListingLigature(whisk, []), null);
  assert.equal(markListingLigature(junk, []), null);
  assert.equal(markListingLigature(disc, []), null);
  assert.equal(markListingLigature(mug, []), null);
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
  const taped = markListingLigature(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingLigature(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(ligatureCookieValue(cleared), "[]");
  assert.equal(isListingLigatureOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const taped = markListingLigature(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingLigature(pack, []), null);

  const cleared = clearListingLigature(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
