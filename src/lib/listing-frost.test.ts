import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLANCHARD_STORAGE_KEY } from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { DRESS_STORAGE_KEY } from "./listing-dress";
import { FLYCUT_STORAGE_KEY } from "./listing-flycut";
import {
  FROST_CHAIR_ID,
  FROST_COOKIE_NAME,
  FROST_HOST_ID,
  FROST_LEAVE_LINE,
  FROST_MUG_ID,
  FROST_NOTICE_TITLE,
  FROST_RECIPES_ID,
  FROST_STORAGE_KEY,
  FROST_WHISK_ID,
  canTapeFrost,
  clearListingFrost,
  frostCookieValue,
  isListingFrostOverlay,
  markListingFrost,
  parseFrostListingIds,
  writeFrostListingIds,
} from "./listing-frost";
import {
  PRUSSIAN_COOKIE_NAME,
  PRUSSIAN_STORAGE_KEY,
} from "./listing-prussian";
import { SINE_COOKIE_NAME, SINE_STORAGE_KEY } from "./listing-sine";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { SPOTFACE_COOKIE_NAME, SPOTFACE_STORAGE_KEY } from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import { WEDGE_COOKIE_NAME, WEDGE_STORAGE_KEY } from "./listing-wedge";
import { WRING_STORAGE_KEY } from "./listing-wring";

test("cookie and storage keys stay the frost paper names", () => {
  assert.equal(FROST_STORAGE_KEY, "iss:frost-listing-ids");
  assert.equal(FROST_COOKIE_NAME, "iss-frost-listing-ids");
  assert.equal(FROST_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    FROST_NOTICE_TITLE,
    "I will not frost it. Still a lid. Still no pot.",
  );
  assert.equal(FROST_LEAVE_LINE, "Leave the frost");
  assert.notEqual(FROST_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(FROST_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, TAP_COOKIE_NAME);
});

test("write-result objects never parse as a frost set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseFrostListingIds(writeResult), []);
  assert.equal(
    isListingFrostOverlay(
      "kdr-lid-no-pot",
      parseFrostListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = frostCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseFrostListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(FROST_WHISK_ID);
  const mug = listingById(FROST_MUG_ID);
  const recipes = listingById(FROST_RECIPES_ID);
  assert.ok(canTapeFrost(lid));
  assert.equal(canTapeFrost(whisk), false);
  assert.equal(canTapeFrost(mug), false);
  assert.equal(canTapeFrost(recipes), false);

  const taped = markListingFrost(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(frostCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingFrostOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingFrostOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingFrostOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingFrostOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a frost write", () => {
  const whisk = listingById(FROST_WHISK_ID);
  const mug = listingById(FROST_MUG_ID);
  const recipes = listingById(FROST_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FROST_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeFrost(whisk), false);
  assert.equal(canTapeFrost(mug), false);
  assert.equal(canTapeFrost(recipes), false);
  assert.equal(canTapeFrost(gift), false);
  assert.equal(canTapeFrost(zine), false);
  assert.equal(canTapeFrost(chair), false);
  assert.equal(canTapeFrost(boy), false);

  assert.equal(markListingFrost(whisk, []), null);
  assert.equal(markListingFrost(mug, []), null);
  assert.equal(markListingFrost(recipes, []), null);
  assert.equal(markListingFrost(gift, []), null);
  assert.equal(markListingFrost(zine, []), null);
  assert.equal(markListingFrost(chair, []), null);
  assert.equal(markListingFrost(boy, []), null);
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
  const taped = markListingFrost(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingFrost(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(frostCookieValue(cleared), "[]");
  assert.equal(isListingFrostOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingFrost(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFrost(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FROST_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFrost(chair, []), null);
});

test("write never touches prussian, wedge, sine, wring, snug, countersink, or spotface keys", () => {
  writeFrostListingIds(["kdr-lid-no-pot"]);
  assert.equal(FROST_STORAGE_KEY, "iss:frost-listing-ids");
  assert.equal(PRUSSIAN_STORAGE_KEY, "iss:prussian-listing-ids");
  assert.equal(WEDGE_STORAGE_KEY, "iss:wedge-listing-ids");
  assert.equal(SINE_STORAGE_KEY, "iss:sine-listing-ids");
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(FROST_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FROST_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FROST_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FROST_COOKIE_NAME, "iss-prussian-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(FROST_COOKIE_NAME, "iss-spotface-listing-ids");
});
