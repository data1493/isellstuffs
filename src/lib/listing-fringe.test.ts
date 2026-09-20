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
  FROST_COOKIE_NAME,
  FROST_STORAGE_KEY,
} from "./listing-frost";
import {
  FRINGE_CHAIR_ID,
  FRINGE_COOKIE_NAME,
  FRINGE_HOST_ID,
  FRINGE_LEAVE_LINE,
  FRINGE_MUG_ID,
  FRINGE_NOTICE_TITLE,
  FRINGE_RECIPES_ID,
  FRINGE_STORAGE_KEY,
  FRINGE_WHISK_ID,
  canTapeFringe,
  clearListingFringe,
  fringeCookieValue,
  isListingFringeOverlay,
  markListingFringe,
  parseFringeListingIds,
  writeFringeListingIds,
} from "./listing-fringe";
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

test("cookie and storage keys stay the fringe paper names", () => {
  assert.equal(FRINGE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.equal(FRINGE_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.equal(FRINGE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    FRINGE_NOTICE_TITLE,
    "I will not fringe it. Still a lid. Still no pot.",
  );
  assert.equal(FRINGE_LEAVE_LINE, "Leave the fringe");
  assert.notEqual(FRINGE_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(FRINGE_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, TAP_COOKIE_NAME);
});

test("write-result objects never parse as a fringe set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseFringeListingIds(writeResult), []);
  assert.equal(
    isListingFringeOverlay(
      "kdr-lid-no-pot",
      parseFringeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = fringeCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseFringeListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(FRINGE_WHISK_ID);
  const mug = listingById(FRINGE_MUG_ID);
  const recipes = listingById(FRINGE_RECIPES_ID);
  assert.ok(canTapeFringe(lid));
  assert.equal(canTapeFringe(whisk), false);
  assert.equal(canTapeFringe(mug), false);
  assert.equal(canTapeFringe(recipes), false);

  const taped = markListingFringe(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(fringeCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingFringeOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingFringeOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingFringeOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingFringeOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a fringe write", () => {
  const whisk = listingById(FRINGE_WHISK_ID);
  const mug = listingById(FRINGE_MUG_ID);
  const recipes = listingById(FRINGE_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FRINGE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeFringe(whisk), false);
  assert.equal(canTapeFringe(mug), false);
  assert.equal(canTapeFringe(recipes), false);
  assert.equal(canTapeFringe(gift), false);
  assert.equal(canTapeFringe(zine), false);
  assert.equal(canTapeFringe(chair), false);
  assert.equal(canTapeFringe(boy), false);

  assert.equal(markListingFringe(whisk, []), null);
  assert.equal(markListingFringe(mug, []), null);
  assert.equal(markListingFringe(recipes, []), null);
  assert.equal(markListingFringe(gift, []), null);
  assert.equal(markListingFringe(zine, []), null);
  assert.equal(markListingFringe(chair, []), null);
  assert.equal(markListingFringe(boy, []), null);
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
  const taped = markListingFringe(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingFringe(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(fringeCookieValue(cleared), "[]");
  assert.equal(isListingFringeOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingFringe(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFringe(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FRINGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFringe(chair, []), null);
});

test("write never touches frost, prussian, wedge, sine, wring, snug, countersink, or spotface keys", () => {
  writeFringeListingIds(["kdr-lid-no-pot"]);
  assert.equal(FRINGE_STORAGE_KEY, "iss:fringe-listing-ids");
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
  assert.notEqual(FRINGE_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FRINGE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FRINGE_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-prussian-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(FRINGE_COOKIE_NAME, "iss-spotface-listing-ids");
});
