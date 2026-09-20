import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BRAID_STORAGE_KEY } from "./listing-braid";
import { COIL_STORAGE_KEY } from "./listing-coil";
import { FERRITE_STORAGE_KEY } from "./listing-ferrite";
import { FLUX_STORAGE_KEY } from "./listing-flux";
import {
  LOOM_BOY_ID,
  LOOM_CDR_ID,
  LOOM_CHAIR_ID,
  LOOM_COOKIE_NAME,
  LOOM_HOST_ID,
  LOOM_LEAVE_LINE,
  LOOM_LUT_ID,
  LOOM_NOTICE_TITLE,
  LOOM_STORAGE_KEY,
  canTapeLoom,
  clearListingLoom,
  isListingLoomOverlay,
  loomCookieValue,
  markListingLoom,
  parseLoomListingIds,
} from "./listing-loom";

test("cookie and storage keys stay the loom paper names", () => {
  assert.equal(LOOM_STORAGE_KEY, "iss:loom-listing-ids");
  assert.equal(LOOM_COOKIE_NAME, "iss-loom-listing-ids");
  assert.equal(LOOM_HOST_ID, "gtk-cable-drawer");
  assert.equal(
    LOOM_NOTICE_TITLE,
    "I will not loom them. Still a tangle. Still some ends honest.",
  );
  assert.equal(LOOM_LEAVE_LINE, "Leave the sleeve");
  assert.notEqual(LOOM_STORAGE_KEY, BRAID_STORAGE_KEY);
  assert.notEqual(LOOM_STORAGE_KEY, COIL_STORAGE_KEY);
  assert.notEqual(LOOM_STORAGE_KEY, FERRITE_STORAGE_KEY);
  assert.notEqual(LOOM_STORAGE_KEY, FLUX_STORAGE_KEY);
  assert.notEqual(LOOM_COOKIE_NAME, "iss-braid-listing-ids");
  assert.notEqual(LOOM_COOKIE_NAME, "iss-coil-listing-ids");
});

test("write-result objects never parse as a loom set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseLoomListingIds(writeResult), []);
  assert.equal(
    isListingLoomOverlay(
      "gtk-cable-drawer",
      parseLoomListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = loomCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseLoomListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy, CD-R, and LUTs stay off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById(LOOM_BOY_ID);
  const cdr = listingById(LOOM_CDR_ID);
  const luts = listingById(LOOM_LUT_ID);
  assert.ok(canTapeLoom(drawer));
  assert.equal(canTapeLoom(boy), false);
  assert.equal(canTapeLoom(cdr), false);
  assert.equal(canTapeLoom(luts), false);

  const taped = markListingLoom(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(loomCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingLoomOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingLoomOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingLoomOverlay("ysk-burned-cdr", taped), false);
  assert.equal(isListingLoomOverlay("dl-camera-luts", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("Game Boy, CD-R, LUTs, gift, zine, chair, and overlay-owned rows refuse a loom write", () => {
  const boy = listingById(LOOM_BOY_ID);
  const cdr = listingById(LOOM_CDR_ID);
  const luts = listingById(LOOM_LUT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(LOOM_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeLoom(boy), false);
  assert.equal(canTapeLoom(cdr), false);
  assert.equal(canTapeLoom(luts), false);
  assert.equal(canTapeLoom(gift), false);
  assert.equal(canTapeLoom(zine), false);
  assert.equal(canTapeLoom(chair), false);
  assert.equal(canTapeLoom(mug), false);

  assert.equal(markListingLoom(boy, []), null);
  assert.equal(markListingLoom(cdr, []), null);
  assert.equal(markListingLoom(luts, []), null);
  assert.equal(markListingLoom(gift, []), null);
  assert.equal(markListingLoom(zine, []), null);
  assert.equal(markListingLoom(chair, []), null);
  assert.equal(markListingLoom(mug, []), null);
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
  const taped = markListingLoom(drawer, []);
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  const after = listingById("gtk-cable-drawer");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingLoom(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(loomCookieValue(cleared), "[]");
  assert.equal(isListingLoomOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const taped = markListingLoom(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingLoom(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
