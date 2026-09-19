import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BEEP_STORAGE_KEY } from "./listing-beep";
import { COIL_STORAGE_KEY } from "./listing-coil";
import { DONGLE_STORAGE_KEY } from "./listing-dongle";
import { FERRITE_STORAGE_KEY } from "./listing-ferrite";
import { PILE_STORAGE_KEY } from "./listing-pile";
import {
  TIN_COOKIE_NAME,
  TIN_HOST_ID,
  TIN_LEAVE_LINE,
  TIN_NOTICE_TITLE,
  TIN_STORAGE_KEY,
  canTapeTin,
  clearListingTin,
  isListingTinOverlay,
  markListingTin,
  parseTinListingIds,
  tinCookieValue,
} from "./listing-tin";

test("cookie and storage keys stay the tin paper names", () => {
  assert.equal(TIN_STORAGE_KEY, "iss:tin-listing-ids");
  assert.equal(TIN_COOKIE_NAME, "iss-tin-listing-ids");
  assert.equal(TIN_HOST_ID, "gtk-cable-drawer");
  assert.equal(
    TIN_NOTICE_TITLE,
    "I will not tin them. Still a pile. Still untested.",
  );
  assert.equal(TIN_LEAVE_LINE, "Leave the ends");
  assert.notEqual(TIN_STORAGE_KEY, COIL_STORAGE_KEY);
  assert.notEqual(TIN_STORAGE_KEY, PILE_STORAGE_KEY);
  assert.notEqual(TIN_STORAGE_KEY, DONGLE_STORAGE_KEY);
  assert.notEqual(TIN_STORAGE_KEY, BEEP_STORAGE_KEY);
  assert.notEqual(TIN_STORAGE_KEY, FERRITE_STORAGE_KEY);
});

test("write-result objects never parse as a tin set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseTinListingIds(writeResult), []);
  assert.equal(
    isListingTinOverlay("gtk-cable-drawer", parseTinListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = tinCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseTinListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy stays off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  assert.ok(canTapeTin(drawer));
  assert.equal(canTapeTin(boy), false);

  const taped = markListingTin(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(tinCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingTinOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingTinOverlay("gtk-game-boy", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("Game Boy, LUTs, sample pack, gift, zine, and overlay-owned rows refuse a tin write", () => {
  const boy = listingById("gtk-game-boy");
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const jewels = listingById("mdb-jewel-stack");

  assert.equal(canTapeTin(boy), false);
  assert.equal(canTapeTin(luts), false);
  assert.equal(canTapeTin(pack), false);
  assert.equal(canTapeTin(gift), false);
  assert.equal(canTapeTin(zine), false);
  assert.equal(canTapeTin(jacket), false);
  assert.equal(canTapeTin(soles), false);
  assert.equal(canTapeTin(jewels), false);

  assert.equal(markListingTin(boy, []), null);
  assert.equal(markListingTin(luts, []), null);
  assert.equal(markListingTin(pack, []), null);
  assert.equal(markListingTin(gift, []), null);
  assert.equal(markListingTin(zine, []), null);
  assert.equal(markListingTin(jacket, []), null);
  assert.equal(markListingTin(soles, []), null);
  assert.equal(markListingTin(jewels, []), null);
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
  const taped = markListingTin(drawer, []);
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  const after = listingById("gtk-cable-drawer");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingTin(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(tinCookieValue(cleared), "[]");
  assert.equal(isListingTinOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  const taped = markListingTin(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingTin(boy, []), null);

  const cleared = clearListingTin(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
