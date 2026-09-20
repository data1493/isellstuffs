import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import {
  FLYCUT_COOKIE_NAME,
  FLYCUT_STORAGE_KEY,
} from "./listing-flycut";
import {
  DRESS_CHAIR_ID,
  DRESS_COOKIE_NAME,
  DRESS_HOST_ID,
  DRESS_LEAVE_LINE,
  DRESS_MUG_ID,
  DRESS_NOTICE_TITLE,
  DRESS_RECIPES_ID,
  DRESS_STORAGE_KEY,
  DRESS_WHISK_ID,
  canTapeDress,
  clearListingDress,
  dressCookieValue,
  isListingDressOverlay,
  markListingDress,
  parseDressListingIds,
  writeDressListingIds,
} from "./listing-dress";
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

test("cookie and storage keys stay the dress paper names", () => {
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(DRESS_COOKIE_NAME, "iss-dress-listing-ids");
  assert.equal(DRESS_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    DRESS_NOTICE_TITLE,
    "I will not dress it. Still a lid. Still no pot.",
  );
  assert.equal(DRESS_LEAVE_LINE, "Leave the glass");
  assert.notEqual(DRESS_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(DRESS_STORAGE_KEY, "iss:stone-listing-ids");
  assert.notEqual(DRESS_STORAGE_KEY, "iss:wheel-listing-ids");
  assert.notEqual(DRESS_STORAGE_KEY, "iss:truing-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a dress set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseDressListingIds(writeResult), []);
  assert.equal(
    isListingDressOverlay(
      "kdr-lid-no-pot",
      parseDressListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseDressListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = dressCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseDressListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(DRESS_WHISK_ID);
  const mug = listingById(DRESS_MUG_ID);
  const recipes = listingById(DRESS_RECIPES_ID);
  assert.ok(canTapeDress(lid));
  assert.equal(canTapeDress(whisk), false);
  assert.equal(canTapeDress(mug), false);
  assert.equal(canTapeDress(recipes), false);

  const taped = markListingDress(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(dressCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingDressOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingDressOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingDressOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingDressOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a dress write", () => {
  const whisk = listingById(DRESS_WHISK_ID);
  const mug = listingById(DRESS_MUG_ID);
  const recipes = listingById(DRESS_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(DRESS_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeDress(whisk), false);
  assert.equal(canTapeDress(mug), false);
  assert.equal(canTapeDress(recipes), false);
  assert.equal(canTapeDress(gift), false);
  assert.equal(canTapeDress(zine), false);
  assert.equal(canTapeDress(chair), false);
  assert.equal(canTapeDress(boy), false);

  assert.equal(markListingDress(whisk, []), null);
  assert.equal(markListingDress(mug, []), null);
  assert.equal(markListingDress(recipes, []), null);
  assert.equal(markListingDress(gift, []), null);
  assert.equal(markListingDress(zine, []), null);
  assert.equal(markListingDress(chair, []), null);
  assert.equal(markListingDress(boy, []), null);
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
  const taped = markListingDress(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingDress(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(dressCookieValue(cleared), "[]");
  assert.equal(isListingDressOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingDress(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingDress(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DRESS_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDress(chair, []), null);
});

test("write never touches flycut, snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeDressListingIds(["kdr-lid-no-pot"]);
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(DRESS_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(DRESS_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(DRESS_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-stone-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-wheel-listing-ids");
  assert.notEqual(DRESS_COOKIE_NAME, "iss-truing-listing-ids");
});
