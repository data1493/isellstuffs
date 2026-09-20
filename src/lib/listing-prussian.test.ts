import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLANCHARD_STORAGE_KEY } from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { CVT_STORAGE_KEY } from "./listing-cvt";
import { DRESS_STORAGE_KEY } from "./listing-dress";
import { FLYCUT_STORAGE_KEY } from "./listing-flycut";
import {
  PRUSSIAN_CHAIR_ID,
  PRUSSIAN_COOKIE_NAME,
  PRUSSIAN_HOST_ID,
  PRUSSIAN_LEAVE_LINE,
  PRUSSIAN_MUG_ID,
  PRUSSIAN_NOTICE_TITLE,
  PRUSSIAN_RECIPES_ID,
  PRUSSIAN_STORAGE_KEY,
  PRUSSIAN_WHISK_ID,
  canTapePrussian,
  clearListingPrussian,
  isListingPrussianOverlay,
  markListingPrussian,
  parsePrussianListingIds,
  prussianCookieValue,
  writePrussianListingIds,
} from "./listing-prussian";
import { SINE_COOKIE_NAME, SINE_STORAGE_KEY } from "./listing-sine";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { SPOTFACE_COOKIE_NAME, SPOTFACE_STORAGE_KEY } from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import { TOMBSTONE_STORAGE_KEY } from "./listing-tombstone";
import { WEDGE_COOKIE_NAME, WEDGE_STORAGE_KEY } from "./listing-wedge";
import { WRING_STORAGE_KEY } from "./listing-wring";

test("cookie and storage keys stay the prussian paper names", () => {
  assert.equal(PRUSSIAN_STORAGE_KEY, "iss:prussian-listing-ids");
  assert.equal(PRUSSIAN_COOKIE_NAME, "iss-prussian-listing-ids");
  assert.equal(PRUSSIAN_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    PRUSSIAN_NOTICE_TITLE,
    "I will not prussian it. Still a lid. Still no pot.",
  );
  assert.equal(PRUSSIAN_LEAVE_LINE, "Leave the blue");
  assert.notEqual(PRUSSIAN_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, TOMBSTONE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, CVT_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, TAP_COOKIE_NAME);
});

test("write-result objects never parse as a prussian set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parsePrussianListingIds(writeResult), []);
  assert.equal(
    isListingPrussianOverlay(
      "kdr-lid-no-pot",
      parsePrussianListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = prussianCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parsePrussianListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(PRUSSIAN_WHISK_ID);
  const mug = listingById(PRUSSIAN_MUG_ID);
  const recipes = listingById(PRUSSIAN_RECIPES_ID);
  assert.ok(canTapePrussian(lid));
  assert.equal(canTapePrussian(whisk), false);
  assert.equal(canTapePrussian(mug), false);
  assert.equal(canTapePrussian(recipes), false);

  const taped = markListingPrussian(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(prussianCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingPrussianOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingPrussianOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingPrussianOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingPrussianOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a prussian write", () => {
  const whisk = listingById(PRUSSIAN_WHISK_ID);
  const mug = listingById(PRUSSIAN_MUG_ID);
  const recipes = listingById(PRUSSIAN_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(PRUSSIAN_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapePrussian(whisk), false);
  assert.equal(canTapePrussian(mug), false);
  assert.equal(canTapePrussian(recipes), false);
  assert.equal(canTapePrussian(gift), false);
  assert.equal(canTapePrussian(zine), false);
  assert.equal(canTapePrussian(chair), false);
  assert.equal(canTapePrussian(boy), false);

  assert.equal(markListingPrussian(whisk, []), null);
  assert.equal(markListingPrussian(mug, []), null);
  assert.equal(markListingPrussian(recipes, []), null);
  assert.equal(markListingPrussian(gift, []), null);
  assert.equal(markListingPrussian(zine, []), null);
  assert.equal(markListingPrussian(chair, []), null);
  assert.equal(markListingPrussian(boy, []), null);
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
  const taped = markListingPrussian(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingPrussian(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(prussianCookieValue(cleared), "[]");
  assert.equal(isListingPrussianOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingPrussian(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPrussian(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PRUSSIAN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPrussian(chair, []), null);
});

test("write never touches wedge, sine, wring, snug, countersink, or spotface keys", () => {
  writePrussianListingIds(["kdr-lid-no-pot"]);
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
  assert.equal(TOMBSTONE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(PRUSSIAN_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-tombstone-listing-ids");
  assert.notEqual(PRUSSIAN_COOKIE_NAME, "iss-cvt-listing-ids");
});
