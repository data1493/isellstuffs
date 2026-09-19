import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { COIL_STORAGE_KEY } from "./listing-coil";
import { FERRITE_STORAGE_KEY } from "./listing-ferrite";
import { PILE_STORAGE_KEY } from "./listing-pile";
import { TIN_STORAGE_KEY } from "./listing-tin";
import {
  BRAID_COOKIE_NAME,
  BRAID_HOST_ID,
  BRAID_LEAVE_LINE,
  BRAID_NOTICE_TITLE,
  BRAID_STORAGE_KEY,
  braidCookieValue,
  canTapeBraid,
  clearListingBraid,
  isListingBraidOverlay,
  markListingBraid,
  parseBraidListingIds,
} from "./listing-braid";

test("cookie and storage keys stay the braid paper names", () => {
  assert.equal(BRAID_STORAGE_KEY, "iss:braid-listing-ids");
  assert.equal(BRAID_COOKIE_NAME, "iss-braid-listing-ids");
  assert.equal(BRAID_HOST_ID, "gtk-cable-drawer");
  assert.equal(
    BRAID_NOTICE_TITLE,
    "I will not braid them. Still a pile. Still untested.",
  );
  assert.equal(BRAID_LEAVE_LINE, "Leave the tangle");
  assert.notEqual(BRAID_STORAGE_KEY, COIL_STORAGE_KEY);
  assert.notEqual(BRAID_STORAGE_KEY, PILE_STORAGE_KEY);
  assert.notEqual(BRAID_STORAGE_KEY, FERRITE_STORAGE_KEY);
  assert.notEqual(BRAID_STORAGE_KEY, TIN_STORAGE_KEY);
});

test("write-result objects never parse as a braid set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseBraidListingIds(writeResult), []);
  assert.equal(
    isListingBraidOverlay("gtk-cable-drawer", parseBraidListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = braidCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseBraidListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy and mixtape stay off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(canTapeBraid(drawer));
  assert.equal(canTapeBraid(boy), false);
  assert.equal(canTapeBraid(mixtape), false);

  const taped = markListingBraid(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(braidCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingBraidOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingBraidOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingBraidOverlay("mdb-mixtape-93", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("Game Boy, LUTs, mixtape, gift, zine, chair, and overlay-owned rows refuse a braid write", () => {
  const boy = listingById("gtk-game-boy");
  const luts = listingById("dl-camera-luts");
  const mixtape = listingById("mdb-mixtape-93");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeBraid(boy), false);
  assert.equal(canTapeBraid(luts), false);
  assert.equal(canTapeBraid(mixtape), false);
  assert.equal(canTapeBraid(gift), false);
  assert.equal(canTapeBraid(zine), false);
  assert.equal(canTapeBraid(chair), false);
  assert.equal(canTapeBraid(jacket), false);
  assert.equal(canTapeBraid(lamp), false);

  assert.equal(markListingBraid(boy, []), null);
  assert.equal(markListingBraid(luts, []), null);
  assert.equal(markListingBraid(mixtape, []), null);
  assert.equal(markListingBraid(gift, []), null);
  assert.equal(markListingBraid(zine, []), null);
  assert.equal(markListingBraid(chair, []), null);
  assert.equal(markListingBraid(jacket, []), null);
  assert.equal(markListingBraid(lamp, []), null);
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
  const taped = markListingBraid(drawer, []);
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  const after = listingById("gtk-cable-drawer");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingBraid(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(braidCookieValue(cleared), "[]");
  assert.equal(isListingBraidOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  const taped = markListingBraid(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingBraid(boy, []), null);

  const cleared = clearListingBraid(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
