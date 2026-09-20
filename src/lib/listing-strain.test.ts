import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BRAID_STORAGE_KEY } from "./listing-braid";
import { LOOM_STORAGE_KEY } from "./listing-loom";
import {
  STRAIN_BOY_ID,
  STRAIN_CDR_ID,
  STRAIN_CHAIR_ID,
  STRAIN_COOKIE_NAME,
  STRAIN_HOST_ID,
  STRAIN_LEAVE_LINE,
  STRAIN_LUT_ID,
  STRAIN_NOTICE_TITLE,
  STRAIN_STORAGE_KEY,
  canTapeStrain,
  clearListingStrain,
  isListingStrainOverlay,
  markListingStrain,
  parseStrainListingIds,
  strainCookieValue,
} from "./listing-strain";

test("cookie and storage keys stay the strain paper names", () => {
  assert.equal(STRAIN_STORAGE_KEY, "iss:strain-listing-ids");
  assert.equal(STRAIN_COOKIE_NAME, "iss-strain-listing-ids");
  assert.equal(STRAIN_HOST_ID, "gtk-cable-drawer");
  assert.equal(
    STRAIN_NOTICE_TITLE,
    "I will not strain them. Still mystery USB. Still a forgotten charger.",
  );
  assert.equal(STRAIN_LEAVE_LINE, "Leave the ends");
  assert.notEqual(STRAIN_STORAGE_KEY, LOOM_STORAGE_KEY);
  assert.notEqual(STRAIN_STORAGE_KEY, BRAID_STORAGE_KEY);
  assert.notEqual(STRAIN_COOKIE_NAME, "iss-loom-listing-ids");
  assert.notEqual(STRAIN_COOKIE_NAME, "iss-braid-listing-ids");
});

test("write-result objects never parse as a strain set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseStrainListingIds(writeResult), []);
  assert.equal(
    isListingStrainOverlay(
      "gtk-cable-drawer",
      parseStrainListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = strainCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseStrainListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy, CD-R, and LUTs stay off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById(STRAIN_BOY_ID);
  const cdr = listingById(STRAIN_CDR_ID);
  const luts = listingById(STRAIN_LUT_ID);
  assert.ok(canTapeStrain(drawer));
  assert.equal(canTapeStrain(boy), false);
  assert.equal(canTapeStrain(cdr), false);
  assert.equal(canTapeStrain(luts), false);

  const taped = markListingStrain(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(strainCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingStrainOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingStrainOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingStrainOverlay("ysk-burned-cdr", taped), false);
  assert.equal(isListingStrainOverlay("dl-camera-luts", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("Game Boy, CD-R, LUTs, gift, zine, chair, and overlay-owned rows refuse a strain write", () => {
  const boy = listingById(STRAIN_BOY_ID);
  const cdr = listingById(STRAIN_CDR_ID);
  const luts = listingById(STRAIN_LUT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(STRAIN_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeStrain(boy), false);
  assert.equal(canTapeStrain(cdr), false);
  assert.equal(canTapeStrain(luts), false);
  assert.equal(canTapeStrain(gift), false);
  assert.equal(canTapeStrain(zine), false);
  assert.equal(canTapeStrain(chair), false);
  assert.equal(canTapeStrain(mug), false);

  assert.equal(markListingStrain(boy, []), null);
  assert.equal(markListingStrain(cdr, []), null);
  assert.equal(markListingStrain(luts, []), null);
  assert.equal(markListingStrain(gift, []), null);
  assert.equal(markListingStrain(zine, []), null);
  assert.equal(markListingStrain(chair, []), null);
  assert.equal(markListingStrain(mug, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const drawer = listingById("gtk-cable-drawer");
  assert.ok(drawer);
  const before = {
    price: drawer.price,
    status: drawer.status,
    cartEligible: drawer.cartEligible,
  };
  const taped = markListingStrain(drawer, []);
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  const after = listingById("gtk-cable-drawer");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingStrain(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(strainCookieValue(cleared), "[]");
  assert.equal(isListingStrainOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const taped = markListingStrain(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingStrain(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
