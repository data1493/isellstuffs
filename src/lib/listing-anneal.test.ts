import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { BENT_STORAGE_KEY } from "./listing-bent";
import { CINCH_STORAGE_KEY } from "./listing-cinch";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { OIL_STORAGE_KEY } from "./listing-oil";
import { RUST_STORAGE_KEY } from "./listing-rust";
import { TINES_STORAGE_KEY } from "./listing-tines";
import {
  ANNEAL_COOKIE_NAME,
  ANNEAL_HOST_ID,
  ANNEAL_LEAVE_LINE,
  ANNEAL_NOTICE_TITLE,
  ANNEAL_STORAGE_KEY,
  annealCookieValue,
  canTapeAnneal,
  clearListingAnneal,
  isListingAnnealOverlay,
  markListingAnneal,
  parseAnnealListingIds,
} from "./listing-anneal";

test("cookie and storage keys stay the anneal paper names", () => {
  assert.equal(ANNEAL_STORAGE_KEY, "iss:anneal-listing-ids");
  assert.equal(ANNEAL_COOKIE_NAME, "iss-anneal-listing-ids");
  assert.equal(ANNEAL_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    ANNEAL_NOTICE_TITLE,
    "I will not anneal it. Still splay. Still metal.",
  );
  assert.equal(ANNEAL_LEAVE_LINE, "Leave the splay");
  assert.notEqual(ANNEAL_STORAGE_KEY, BENT_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, TINES_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, RUST_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, OIL_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, CINCH_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(ANNEAL_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
});

test("write-result objects never parse as an anneal set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseAnnealListingIds(writeResult), []);
  assert.equal(
    isListingAnnealOverlay(
      "kdr-bent-whisk",
      parseAnnealListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = annealCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseAnnealListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and mixtape stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(canTapeAnneal(whisk));
  assert.equal(canTapeAnneal(mug), false);
  assert.equal(canTapeAnneal(lid), false);
  assert.equal(canTapeAnneal(mixtape), false);

  const taped = markListingAnneal(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(annealCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingAnnealOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingAnnealOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingAnnealOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingAnnealOverlay("mdb-mixtape-93", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, and overlay-owned rows refuse an anneal write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");

  assert.equal(canTapeAnneal(mug), false);
  assert.equal(canTapeAnneal(lid), false);
  assert.equal(canTapeAnneal(recipes), false);
  assert.equal(canTapeAnneal(gift), false);
  assert.equal(canTapeAnneal(zine), false);
  assert.equal(canTapeAnneal(jacket), false);
  assert.equal(canTapeAnneal(soles), false);
  assert.equal(canTapeAnneal(drawer), false);
  assert.equal(canTapeAnneal(disc), false);
  assert.equal(canTapeAnneal(mixtape), false);
  assert.equal(canTapeAnneal(jewels), false);

  assert.equal(markListingAnneal(mug, []), null);
  assert.equal(markListingAnneal(lid, []), null);
  assert.equal(markListingAnneal(recipes, []), null);
  assert.equal(markListingAnneal(gift, []), null);
  assert.equal(markListingAnneal(zine, []), null);
  assert.equal(markListingAnneal(jacket, []), null);
  assert.equal(markListingAnneal(soles, []), null);
  assert.equal(markListingAnneal(drawer, []), null);
  assert.equal(markListingAnneal(disc, []), null);
  assert.equal(markListingAnneal(mixtape, []), null);
  assert.equal(markListingAnneal(jewels, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(whisk);
  const before = {
    price: whisk.price,
    status: whisk.status,
    cartEligible: whisk.cartEligible,
  };
  const taped = markListingAnneal(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingAnneal(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(annealCookieValue(cleared), "[]");
  assert.equal(isListingAnnealOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingAnneal(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingAnneal(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
