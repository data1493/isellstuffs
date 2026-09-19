import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CELLS_STORAGE_KEY } from "./listing-cells";
import {
  CONTRAST_COOKIE_NAME,
  CONTRAST_HOST_ID,
  CONTRAST_LEAVE_LINE,
  CONTRAST_NOTICE_TITLE,
  CONTRAST_STORAGE_KEY,
  canTapeContrast,
  clearListingContrast,
  contrastCookieValue,
  isListingContrastOverlay,
  markListingContrast,
  parseContrastListingIds,
} from "./listing-contrast";
import { LINE_STORAGE_KEY } from "./listing-line";
import { RECAP_STORAGE_KEY } from "./listing-recap";

test("cookie and storage keys stay the contrast paper names", () => {
  assert.equal(CONTRAST_STORAGE_KEY, "iss:contrast-listing-ids");
  assert.equal(CONTRAST_COOKIE_NAME, "iss-contrast-listing-ids");
  assert.equal(CONTRAST_HOST_ID, "gtk-game-boy");
  assert.equal(
    CONTRAST_NOTICE_TITLE,
    "I will not contrast it. Still a line. Still dim.",
  );
  assert.equal(CONTRAST_LEAVE_LINE, "Leave the dim");
  assert.notEqual(CONTRAST_STORAGE_KEY, LINE_STORAGE_KEY);
  assert.notEqual(CONTRAST_STORAGE_KEY, CELLS_STORAGE_KEY);
  assert.notEqual(CONTRAST_STORAGE_KEY, RECAP_STORAGE_KEY);
});

test("write-result objects never parse as a contrast set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseContrastListingIds(writeResult), []);
  assert.equal(
    isListingContrastOverlay(
      "gtk-game-boy",
      parseContrastListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = contrastCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseContrastListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; LUT, pack, and overlay hosts stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const lamp = listingById("ysk-wobbly-lamp");
  const jewels = listingById("mdb-jewel-stack");
  const junk = listingById("dl-junk-pricing-pdf");
  assert.ok(canTapeContrast(boy));
  assert.equal(canTapeContrast(lut), false);
  assert.equal(canTapeContrast(pack), false);
  assert.equal(canTapeContrast(lamp), false);
  assert.equal(canTapeContrast(jewels), false);
  assert.equal(canTapeContrast(junk), false);

  const taped = markListingContrast(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(contrastCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingContrastOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingContrastOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingContrastOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingContrastOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, pack, gift, zine, and overlay-owned rows refuse a contrast write", () => {
  const lut = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const whisk = listingById("kdr-bent-whisk");
  const lamp = listingById("ysk-wobbly-lamp");
  const junk = listingById("dl-junk-pricing-pdf");

  assert.equal(canTapeContrast(lut), false);
  assert.equal(canTapeContrast(pack), false);
  assert.equal(canTapeContrast(gift), false);
  assert.equal(canTapeContrast(zine), false);
  assert.equal(canTapeContrast(jacket), false);
  assert.equal(canTapeContrast(soles), false);
  assert.equal(canTapeContrast(drawer), false);
  assert.equal(canTapeContrast(disc), false);
  assert.equal(canTapeContrast(mixtape), false);
  assert.equal(canTapeContrast(jewels), false);
  assert.equal(canTapeContrast(whisk), false);
  assert.equal(canTapeContrast(lamp), false);
  assert.equal(canTapeContrast(junk), false);

  assert.equal(markListingContrast(lut, []), null);
  assert.equal(markListingContrast(pack, []), null);
  assert.equal(markListingContrast(gift, []), null);
  assert.equal(markListingContrast(zine, []), null);
  assert.equal(markListingContrast(jacket, []), null);
  assert.equal(markListingContrast(soles, []), null);
  assert.equal(markListingContrast(drawer, []), null);
  assert.equal(markListingContrast(disc, []), null);
  assert.equal(markListingContrast(mixtape, []), null);
  assert.equal(markListingContrast(jewels, []), null);
  assert.equal(markListingContrast(whisk, []), null);
  assert.equal(markListingContrast(lamp, []), null);
  assert.equal(markListingContrast(junk, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const boy = listingById("gtk-game-boy");
  assert.ok(boy);
  const before = {
    price: boy.price,
    status: boy.status,
    cartEligible: boy.cartEligible,
  };
  const taped = markListingContrast(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingContrast(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(contrastCookieValue(cleared), "[]");
  assert.equal(isListingContrastOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingContrast(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingContrast(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
