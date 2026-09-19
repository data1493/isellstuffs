import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_STORAGE_KEY } from "./listing-anneal";
import { BENT_STORAGE_KEY } from "./listing-bent";
import { BRAID_STORAGE_KEY } from "./listing-braid";
import { RUST_STORAGE_KEY } from "./listing-rust";
import { TINES_STORAGE_KEY } from "./listing-tines";
import {
  PEEN_COOKIE_NAME,
  PEEN_HOST_ID,
  PEEN_LEAVE_LINE,
  PEEN_NOTICE_TITLE,
  PEEN_STORAGE_KEY,
  canTapePeen,
  clearListingPeen,
  isListingPeenOverlay,
  markListingPeen,
  parsePeenListingIds,
  peenCookieValue,
} from "./listing-peen";

test("cookie and storage keys stay the peen paper names", () => {
  assert.equal(PEEN_STORAGE_KEY, "iss:peen-listing-ids");
  assert.equal(PEEN_COOKIE_NAME, "iss-peen-listing-ids");
  assert.equal(PEEN_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    PEEN_NOTICE_TITLE,
    "I will not peen it. Still splayed. Still metal.",
  );
  assert.equal(PEEN_LEAVE_LINE, "Leave the splay");
  assert.notEqual(PEEN_STORAGE_KEY, BENT_STORAGE_KEY);
  assert.notEqual(PEEN_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(PEEN_STORAGE_KEY, BRAID_STORAGE_KEY);
  assert.notEqual(PEEN_STORAGE_KEY, TINES_STORAGE_KEY);
  assert.notEqual(PEEN_STORAGE_KEY, RUST_STORAGE_KEY);
});

test("write-result objects never parse as a peen set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parsePeenListingIds(writeResult), []);
  assert.equal(
    isListingPeenOverlay(
      "kdr-bent-whisk",
      parsePeenListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = peenCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parsePeenListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapePeen(whisk));
  assert.equal(canTapePeen(mug), false);
  assert.equal(canTapePeen(lid), false);
  assert.equal(canTapePeen(recipes), false);

  const taped = markListingPeen(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(peenCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingPeenOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingPeenOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingPeenOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingPeenOverlay("dl-drawer-recipes", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, chair, gift, zine, and overlay-owned rows refuse a peen write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapePeen(mug), false);
  assert.equal(canTapePeen(lid), false);
  assert.equal(canTapePeen(recipes), false);
  assert.equal(canTapePeen(chair), false);
  assert.equal(canTapePeen(gift), false);
  assert.equal(canTapePeen(zine), false);
  assert.equal(canTapePeen(jacket), false);
  assert.equal(canTapePeen(lamp), false);
  assert.equal(canTapePeen(mixtape), false);

  assert.equal(markListingPeen(mug, []), null);
  assert.equal(markListingPeen(lid, []), null);
  assert.equal(markListingPeen(recipes, []), null);
  assert.equal(markListingPeen(chair, []), null);
  assert.equal(markListingPeen(gift, []), null);
  assert.equal(markListingPeen(zine, []), null);
  assert.equal(markListingPeen(jacket, []), null);
  assert.equal(markListingPeen(lamp, []), null);
  assert.equal(markListingPeen(mixtape, []), null);
  assert.equal(chair?.status, "sold");
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
  const taped = markListingPeen(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingPeen(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(peenCookieValue(cleared), "[]");
  assert.equal(isListingPeenOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingPeen(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPeen(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
