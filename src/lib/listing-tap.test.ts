import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { KNURL_STORAGE_KEY } from "./listing-knurl";
import { REAM_STORAGE_KEY } from "./listing-ream";
import { STAKE_STORAGE_KEY } from "./listing-stake";
import {
  TAP_CHAIR_ID,
  TAP_COOKIE_NAME,
  TAP_HOST_ID,
  TAP_LAMP_ID,
  TAP_LEAVE_LINE,
  TAP_MUG_ID,
  TAP_NOTICE_TITLE,
  TAP_RECIPES_ID,
  TAP_STORAGE_KEY,
  TAP_WHISK_ID,
  canTapeTap,
  clearListingTap,
  isListingTapOverlay,
  markListingTap,
  parseTapListingIds,
  tapCookieValue,
  writeTapListingIds,
} from "./listing-tap";

test("cookie and storage keys stay the tap paper names", () => {
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.equal(TAP_COOKIE_NAME, "iss-tap-listing-ids");
  assert.equal(TAP_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    TAP_NOTICE_TITLE,
    "I will not tap it. Still a lid. Still no pot.",
  );
  assert.equal(TAP_LEAVE_LINE, "Leave the hole");
  assert.notEqual(TAP_STORAGE_KEY, REAM_STORAGE_KEY);
  assert.notEqual(TAP_STORAGE_KEY, STAKE_STORAGE_KEY);
  assert.notEqual(TAP_STORAGE_KEY, KNURL_STORAGE_KEY);
});

test("write-result objects never parse as a tap set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseTapListingIds(writeResult), []);
  assert.equal(
    isListingTapOverlay("kdr-lid-no-pot", parseTapListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = tapCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseTapListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, whisk, and lamp stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(TAP_MUG_ID);
  const recipes = listingById(TAP_RECIPES_ID);
  const whisk = listingById(TAP_WHISK_ID);
  const lamp = listingById(TAP_LAMP_ID);
  assert.ok(canTapeTap(lid));
  assert.equal(canTapeTap(mug), false);
  assert.equal(canTapeTap(recipes), false);
  assert.equal(canTapeTap(whisk), false);
  assert.equal(canTapeTap(lamp), false);

  const taped = markListingTap(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(tapCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingTapOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingTapOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingTapOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingTapOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingTapOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, lamp, gift, zine, chair, and overlay-owned rows refuse a tap write", () => {
  const mug = listingById(TAP_MUG_ID);
  const recipes = listingById(TAP_RECIPES_ID);
  const whisk = listingById(TAP_WHISK_ID);
  const lamp = listingById(TAP_LAMP_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TAP_CHAIR_ID);
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeTap(mug), false);
  assert.equal(canTapeTap(recipes), false);
  assert.equal(canTapeTap(whisk), false);
  assert.equal(canTapeTap(lamp), false);
  assert.equal(canTapeTap(gift), false);
  assert.equal(canTapeTap(zine), false);
  assert.equal(canTapeTap(chair), false);
  assert.equal(canTapeTap(mixtape), false);

  assert.equal(markListingTap(mug, []), null);
  assert.equal(markListingTap(recipes, []), null);
  assert.equal(markListingTap(whisk, []), null);
  assert.equal(markListingTap(lamp, []), null);
  assert.equal(markListingTap(gift, []), null);
  assert.equal(markListingTap(zine, []), null);
  assert.equal(markListingTap(chair, []), null);
  assert.equal(markListingTap(mixtape, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lid = listingById("kdr-lid-no-pot");
  assert.ok(lid);
  const before = {
    price: lid.price,
    status: lid.status,
    cartEligible: lid.cartEligible,
  };
  const taped = markListingTap(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingTap(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(tapCookieValue(cleared), "[]");
  assert.equal(isListingTapOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingTap(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingTap(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TAP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTap(chair, []), null);
});

test("write never touches ream, stake, or knurl storage keys", () => {
  writeTapListingIds(["kdr-lid-no-pot"]);
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.equal(REAM_STORAGE_KEY, "iss:ream-listing-ids");
  assert.equal(STAKE_STORAGE_KEY, "iss:stake-listing-ids");
  assert.equal(KNURL_STORAGE_KEY, "iss:knurl-listing-ids");
  assert.notEqual(TAP_STORAGE_KEY, REAM_STORAGE_KEY);
  assert.notEqual(TAP_STORAGE_KEY, STAKE_STORAGE_KEY);
  assert.notEqual(TAP_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(TAP_COOKIE_NAME, "iss-ream-listing-ids");
  assert.notEqual(TAP_COOKIE_NAME, "iss-stake-listing-ids");
  assert.notEqual(TAP_COOKIE_NAME, "iss-chamfer-listing-ids");
  assert.notEqual(TAP_COOKIE_NAME, "iss-chase-listing-ids");
});
