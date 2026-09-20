import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  SWAGE_CHAIR_ID,
  SWAGE_COOKIE_NAME,
  SWAGE_HOST_ID,
  SWAGE_LEAVE_LINE,
  SWAGE_LID_ID,
  SWAGE_MUG_ID,
  SWAGE_NOTICE_TITLE,
  SWAGE_RECIPES_ID,
  SWAGE_STORAGE_KEY,
  canTapeSwage,
  clearListingSwage,
  isListingSwageOverlay,
  markListingSwage,
  parseSwageListingIds,
  swageCookieValue,
} from "./listing-swage";

test("cookie and storage keys stay the swage paper names", () => {
  assert.equal(SWAGE_STORAGE_KEY, "iss:swage-listing-ids");
  assert.equal(SWAGE_COOKIE_NAME, "iss-swage-listing-ids");
  assert.equal(SWAGE_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    SWAGE_NOTICE_TITLE,
    "I will not swage it. Still bent. Still metal.",
  );
  assert.equal(SWAGE_LEAVE_LINE, "Leave the tines");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:quench-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:joggle-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:upset-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:truss-listing-ids");
  assert.notEqual(SWAGE_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(SWAGE_COOKIE_NAME, "iss-braze-listing-ids");
});

test("write-result objects never parse as a swage set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseSwageListingIds(writeResult), []);
  assert.equal(
    isListingSwageOverlay(
      "kdr-bent-whisk",
      parseSwageListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = swageCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseSwageListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById(SWAGE_MUG_ID);
  const lid = listingById(SWAGE_LID_ID);
  const recipes = listingById(SWAGE_RECIPES_ID);
  assert.ok(canTapeSwage(whisk));
  assert.equal(canTapeSwage(mug), false);
  assert.equal(canTapeSwage(lid), false);
  assert.equal(canTapeSwage(recipes), false);

  const taped = markListingSwage(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(swageCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingSwageOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingSwageOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingSwageOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingSwageOverlay("dl-drawer-recipes", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, lamp, and overlay-owned rows refuse a swage write", () => {
  const mug = listingById(SWAGE_MUG_ID);
  const lid = listingById(SWAGE_LID_ID);
  const recipes = listingById(SWAGE_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lamp = listingById("ysk-wobbly-lamp");
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeSwage(mug), false);
  assert.equal(canTapeSwage(lid), false);
  assert.equal(canTapeSwage(recipes), false);
  assert.equal(canTapeSwage(gift), false);
  assert.equal(canTapeSwage(zine), false);
  assert.equal(canTapeSwage(lamp), false);
  assert.equal(canTapeSwage(jacket), false);
  assert.equal(canTapeSwage(mixtape), false);

  assert.equal(markListingSwage(mug, []), null);
  assert.equal(markListingSwage(lid, []), null);
  assert.equal(markListingSwage(recipes, []), null);
  assert.equal(markListingSwage(gift, []), null);
  assert.equal(markListingSwage(zine, []), null);
  assert.equal(markListingSwage(lamp, []), null);
  assert.equal(markListingSwage(jacket, []), null);
  assert.equal(markListingSwage(mixtape, []), null);
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
  const taped = markListingSwage(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingSwage(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(swageCookieValue(cleared), "[]");
  assert.equal(isListingSwageOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById(SWAGE_RECIPES_ID);
  const taped = markListingSwage(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSwage(recipes, []), null);

  const cleared = clearListingSwage(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SWAGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSwage(chair, []), null);
});

test("swage write never aliases quench or braze paper", () => {
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:quench-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:joggle-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:upset-listing-ids");
  assert.notEqual(SWAGE_STORAGE_KEY, "iss:truss-listing-ids");
  assert.notEqual(SWAGE_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(SWAGE_COOKIE_NAME, "iss-braze-listing-ids");
});
