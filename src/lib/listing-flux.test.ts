import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BRAID_STORAGE_KEY } from "./listing-braid";
import {
  FLUX_BOY_ID,
  FLUX_CHAIR_ID,
  FLUX_COOKIE_NAME,
  FLUX_HOST_ID,
  FLUX_LEAVE_LINE,
  FLUX_LID_ID,
  FLUX_NOTICE_TITLE,
  FLUX_PACK_ID,
  FLUX_STORAGE_KEY,
  canTapeFlux,
  clearListingFlux,
  fluxCookieValue,
  isListingFluxOverlay,
  markListingFlux,
  parseFluxListingIds,
} from "./listing-flux";
import { TIN_STORAGE_KEY } from "./listing-tin";

test("cookie and storage keys stay the flux paper names", () => {
  assert.equal(FLUX_STORAGE_KEY, "iss:flux-listing-ids");
  assert.equal(FLUX_COOKIE_NAME, "iss-flux-listing-ids");
  assert.equal(FLUX_HOST_ID, "gtk-cable-drawer");
  assert.equal(
    FLUX_NOTICE_TITLE,
    "I will not flux them. Still a tangle. Still untested.",
  );
  assert.equal(FLUX_LEAVE_LINE, "Leave the copper");
  assert.notEqual(FLUX_STORAGE_KEY, TIN_STORAGE_KEY);
  assert.notEqual(FLUX_STORAGE_KEY, BRAID_STORAGE_KEY);
  assert.notEqual(FLUX_COOKIE_NAME, "iss-tin-listing-ids");
  assert.notEqual(FLUX_COOKIE_NAME, "iss-braid-listing-ids");
});

test("write-result objects never parse as a flux set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseFluxListingIds(writeResult), []);
  assert.equal(
    isListingFluxOverlay(
      "gtk-cable-drawer",
      parseFluxListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = fluxCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseFluxListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy, lid, and pack stay off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById(FLUX_BOY_ID);
  const lid = listingById(FLUX_LID_ID);
  const pack = listingById(FLUX_PACK_ID);
  assert.ok(canTapeFlux(drawer));
  assert.equal(canTapeFlux(boy), false);
  assert.equal(canTapeFlux(lid), false);
  assert.equal(canTapeFlux(pack), false);

  const taped = markListingFlux(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(fluxCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingFluxOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingFluxOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingFluxOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingFluxOverlay("dl-sample-pack", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("Game Boy, lid, pack, gift, zine, chair, and overlay-owned rows refuse a flux write", () => {
  const boy = listingById(FLUX_BOY_ID);
  const lid = listingById(FLUX_LID_ID);
  const pack = listingById(FLUX_PACK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FLUX_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeFlux(boy), false);
  assert.equal(canTapeFlux(lid), false);
  assert.equal(canTapeFlux(pack), false);
  assert.equal(canTapeFlux(gift), false);
  assert.equal(canTapeFlux(zine), false);
  assert.equal(canTapeFlux(chair), false);
  assert.equal(canTapeFlux(mug), false);

  assert.equal(markListingFlux(boy, []), null);
  assert.equal(markListingFlux(lid, []), null);
  assert.equal(markListingFlux(pack, []), null);
  assert.equal(markListingFlux(gift, []), null);
  assert.equal(markListingFlux(zine, []), null);
  assert.equal(markListingFlux(chair, []), null);
  assert.equal(markListingFlux(mug, []), null);
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
  const taped = markListingFlux(drawer, []);
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  const after = listingById("gtk-cable-drawer");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingFlux(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(fluxCookieValue(cleared), "[]");
  assert.equal(isListingFluxOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const taped = markListingFlux(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFlux(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
