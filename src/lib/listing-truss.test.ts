import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_STORAGE_KEY } from "./listing-anneal";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import { TEMPER_STORAGE_KEY } from "./listing-temper";
import {
  TRUSS_CHAIR_ID,
  TRUSS_COOKIE_NAME,
  TRUSS_HOST_ID,
  TRUSS_LEAVE_LINE,
  TRUSS_NOTICE_TITLE,
  TRUSS_PACK_ID,
  TRUSS_STORAGE_KEY,
  canTapeTruss,
  clearListingTruss,
  isListingTrussOverlay,
  markListingTruss,
  parseTrussListingIds,
  trussCookieValue,
} from "./listing-truss";

test("cookie and storage keys stay the truss paper names", () => {
  assert.equal(TRUSS_STORAGE_KEY, "iss:truss-listing-ids");
  assert.equal(TRUSS_COOKIE_NAME, "iss-truss-listing-ids");
  assert.equal(TRUSS_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    TRUSS_NOTICE_TITLE,
    "I will not truss it. Still bent. Still metal.",
  );
  assert.equal(TRUSS_LEAVE_LINE, "Leave the bend");
  assert.notEqual(TRUSS_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(TRUSS_STORAGE_KEY, TEMPER_STORAGE_KEY);
  assert.notEqual(TRUSS_STORAGE_KEY, PEEN_STORAGE_KEY);
});

test("write-result objects never parse as a truss set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseTrussListingIds(writeResult), []);
  assert.equal(
    isListingTrussOverlay(
      "kdr-bent-whisk",
      parseTrussListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = trussCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseTrussListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and sample pack stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const pack = listingById(TRUSS_PACK_ID);
  assert.ok(canTapeTruss(whisk));
  assert.equal(canTapeTruss(mug), false);
  assert.equal(canTapeTruss(lid), false);
  assert.equal(canTapeTruss(pack), false);

  const taped = markListingTruss(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(trussCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingTrussOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingTrussOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingTrussOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingTrussOverlay(TRUSS_PACK_ID, taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, chair, and overlay-owned rows refuse a truss write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const pack = listingById(TRUSS_PACK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TRUSS_CHAIR_ID);
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeTruss(mug), false);
  assert.equal(canTapeTruss(lid), false);
  assert.equal(canTapeTruss(recipes), false);
  assert.equal(canTapeTruss(pack), false);
  assert.equal(canTapeTruss(gift), false);
  assert.equal(canTapeTruss(zine), false);
  assert.equal(canTapeTruss(chair), false);
  assert.equal(canTapeTruss(jacket), false);
  assert.equal(canTapeTruss(mixtape), false);

  assert.equal(markListingTruss(mug, []), null);
  assert.equal(markListingTruss(lid, []), null);
  assert.equal(markListingTruss(recipes, []), null);
  assert.equal(markListingTruss(pack, []), null);
  assert.equal(markListingTruss(gift, []), null);
  assert.equal(markListingTruss(zine, []), null);
  assert.equal(markListingTruss(chair, []), null);
  assert.equal(markListingTruss(jacket, []), null);
  assert.equal(markListingTruss(mixtape, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(whisk);
  const before = {
    price: whisk.price,
    status: whisk.status,
    cartEligible: whisk.cartEligible,
  };
  const taped = markListingTruss(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingTruss(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(trussCookieValue(cleared), "[]");
  assert.equal(isListingTrussOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingTruss(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingTruss(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TRUSS_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTruss(chair, []), null);
});
