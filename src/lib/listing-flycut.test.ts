import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import {
  FLYCUT_CHAIR_ID,
  FLYCUT_COOKIE_NAME,
  FLYCUT_HOST_ID,
  FLYCUT_LEAVE_LINE,
  FLYCUT_MUG_ID,
  FLYCUT_NOTICE_TITLE,
  FLYCUT_RECIPES_ID,
  FLYCUT_STORAGE_KEY,
  FLYCUT_WHISK_ID,
  canTapeFlycut,
  clearListingFlycut,
  flycutCookieValue,
  isListingFlycutOverlay,
  markListingFlycut,
  parseFlycutListingIds,
  writeFlycutListingIds,
} from "./listing-flycut";
import {
  SNUG_COOKIE_NAME,
  SNUG_STORAGE_KEY,
} from "./listing-snug";
import {
  SPOTFACE_COOKIE_NAME,
  SPOTFACE_STORAGE_KEY,
} from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import {
  TREPAN_COOKIE_NAME,
  TREPAN_STORAGE_KEY,
} from "./listing-trepan";

test("cookie and storage keys stay the flycut paper names", () => {
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(FLYCUT_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.equal(FLYCUT_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    FLYCUT_NOTICE_TITLE,
    "I will not flycut it. Still a lid. Still no pot.",
  );
  assert.equal(FLYCUT_LEAVE_LINE, "Leave the glass");
  assert.notEqual(FLYCUT_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(FLYCUT_STORAGE_KEY, "iss:fly-listing-ids");
  assert.notEqual(FLYCUT_STORAGE_KEY, "iss:facemill-listing-ids");
  assert.notEqual(FLYCUT_STORAGE_KEY, "iss:skimplan-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a flycut set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseFlycutListingIds(writeResult), []);
  assert.equal(
    isListingFlycutOverlay(
      "kdr-lid-no-pot",
      parseFlycutListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = flycutCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseFlycutListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(FLYCUT_WHISK_ID);
  const mug = listingById(FLYCUT_MUG_ID);
  const recipes = listingById(FLYCUT_RECIPES_ID);
  assert.ok(canTapeFlycut(lid));
  assert.equal(canTapeFlycut(whisk), false);
  assert.equal(canTapeFlycut(mug), false);
  assert.equal(canTapeFlycut(recipes), false);

  const taped = markListingFlycut(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(flycutCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingFlycutOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingFlycutOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingFlycutOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingFlycutOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a flycut write", () => {
  const whisk = listingById(FLYCUT_WHISK_ID);
  const mug = listingById(FLYCUT_MUG_ID);
  const recipes = listingById(FLYCUT_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FLYCUT_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeFlycut(whisk), false);
  assert.equal(canTapeFlycut(mug), false);
  assert.equal(canTapeFlycut(recipes), false);
  assert.equal(canTapeFlycut(gift), false);
  assert.equal(canTapeFlycut(zine), false);
  assert.equal(canTapeFlycut(chair), false);
  assert.equal(canTapeFlycut(boy), false);

  assert.equal(markListingFlycut(whisk, []), null);
  assert.equal(markListingFlycut(mug, []), null);
  assert.equal(markListingFlycut(recipes, []), null);
  assert.equal(markListingFlycut(gift, []), null);
  assert.equal(markListingFlycut(zine, []), null);
  assert.equal(markListingFlycut(chair, []), null);
  assert.equal(markListingFlycut(boy, []), null);
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
  const taped = markListingFlycut(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingFlycut(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(flycutCookieValue(cleared), "[]");
  assert.equal(isListingFlycutOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingFlycut(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFlycut(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FLYCUT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFlycut(chair, []), null);
});

test("write never touches snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeFlycutListingIds(["kdr-lid-no-pot"]);
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(FLYCUT_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(FLYCUT_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-fly-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-facemill-listing-ids");
  assert.notEqual(FLYCUT_COOKIE_NAME, "iss-skimplan-listing-ids");
});
