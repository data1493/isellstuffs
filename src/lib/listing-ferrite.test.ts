import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { COIL_STORAGE_KEY } from "./listing-coil";
import {
  FERRITE_COOKIE_NAME,
  FERRITE_LEAVE_LINE,
  FERRITE_NOTICE_TITLE,
  FERRITE_STORAGE_KEY,
  canTapeFerrite,
  clearListingFerrite,
  ferriteCookieValue,
  isListingFerriteOverlay,
  markListingFerrite,
  parseFerriteListingIds,
} from "./listing-ferrite";

test("cookie and storage keys stay the ferrite paper names", () => {
  assert.equal(FERRITE_STORAGE_KEY, "iss:ferrite-listing-ids");
  assert.equal(FERRITE_COOKIE_NAME, "iss-ferrite-listing-ids");
  assert.equal(
    FERRITE_NOTICE_TITLE,
    "I will not ferrite them. Still a pile. Still untested.",
  );
  assert.equal(FERRITE_LEAVE_LINE, "Leave the noise");
  assert.notEqual(FERRITE_STORAGE_KEY, COIL_STORAGE_KEY);
});

test("write-result objects never parse as a ferrite set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseFerriteListingIds(writeResult), []);
  assert.equal(
    isListingFerriteOverlay(
      "gtk-cable-drawer",
      parseFerriteListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = ferriteCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseFerriteListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy stays off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  assert.ok(canTapeFerrite(drawer));
  assert.ok(canTapeFerrite(boy));

  const taped = markListingFerrite(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(ferriteCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingFerriteOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingFerriteOverlay("gtk-game-boy", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("LUTs, sample pack, gift, chair, and stain zine refuse a ferrite write", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeFerrite(luts), false);
  assert.equal(canTapeFerrite(pack), false);
  assert.equal(canTapeFerrite(gift), false);
  assert.equal(canTapeFerrite(chair), false);
  assert.equal(canTapeFerrite(zine), false);

  assert.equal(markListingFerrite(luts, []), null);
  assert.equal(markListingFerrite(pack, []), null);
  assert.equal(markListingFerrite(gift, []), null);
  assert.equal(markListingFerrite(chair, []), null);
  assert.equal(markListingFerrite(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingFerrite(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(ferriteCookieValue(cleared), "[]");
  assert.equal(isListingFerriteOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const taped = markListingFerrite(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFerrite(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
