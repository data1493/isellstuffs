import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  BLANCHARD_CHAIR_ID,
  BLANCHARD_COOKIE_NAME,
  BLANCHARD_HOST_ID,
  BLANCHARD_LEAVE_LINE,
  BLANCHARD_MUG_ID,
  BLANCHARD_NOTICE_TITLE,
  BLANCHARD_RECIPES_ID,
  BLANCHARD_STORAGE_KEY,
  BLANCHARD_WHISK_ID,
  blanchardCookieValue,
  canTapeBlanchard,
  clearListingBlanchard,
  isListingBlanchardOverlay,
  markListingBlanchard,
  parseBlanchardListingIds,
  writeBlanchardListingIds,
} from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import {
  DRESS_COOKIE_NAME,
  DRESS_STORAGE_KEY,
} from "./listing-dress";
import {
  FLYCUT_COOKIE_NAME,
  FLYCUT_STORAGE_KEY,
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

test("cookie and storage keys stay the blanchard paper names", () => {
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(BLANCHARD_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.equal(BLANCHARD_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    BLANCHARD_NOTICE_TITLE,
    "I will not blanchard it. Still a lid. Still no pot.",
  );
  assert.equal(BLANCHARD_LEAVE_LINE, "Leave the glass");
  assert.notEqual(BLANCHARD_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(BLANCHARD_STORAGE_KEY, "iss:rotary-listing-ids");
  assert.notEqual(BLANCHARD_STORAGE_KEY, "iss:cupwheel-listing-ids");
  assert.notEqual(BLANCHARD_STORAGE_KEY, "iss:surfacegrind-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a blanchard set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseBlanchardListingIds(writeResult), []);
  assert.equal(
    isListingBlanchardOverlay(
      "kdr-lid-no-pot",
      parseBlanchardListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseBlanchardListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = blanchardCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseBlanchardListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(BLANCHARD_WHISK_ID);
  const mug = listingById(BLANCHARD_MUG_ID);
  const recipes = listingById(BLANCHARD_RECIPES_ID);
  assert.ok(canTapeBlanchard(lid));
  assert.equal(canTapeBlanchard(whisk), false);
  assert.equal(canTapeBlanchard(mug), false);
  assert.equal(canTapeBlanchard(recipes), false);

  const taped = markListingBlanchard(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(blanchardCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingBlanchardOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingBlanchardOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingBlanchardOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingBlanchardOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a blanchard write", () => {
  const whisk = listingById(BLANCHARD_WHISK_ID);
  const mug = listingById(BLANCHARD_MUG_ID);
  const recipes = listingById(BLANCHARD_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(BLANCHARD_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeBlanchard(whisk), false);
  assert.equal(canTapeBlanchard(mug), false);
  assert.equal(canTapeBlanchard(recipes), false);
  assert.equal(canTapeBlanchard(gift), false);
  assert.equal(canTapeBlanchard(zine), false);
  assert.equal(canTapeBlanchard(chair), false);
  assert.equal(canTapeBlanchard(boy), false);

  assert.equal(markListingBlanchard(whisk, []), null);
  assert.equal(markListingBlanchard(mug, []), null);
  assert.equal(markListingBlanchard(recipes, []), null);
  assert.equal(markListingBlanchard(gift, []), null);
  assert.equal(markListingBlanchard(zine, []), null);
  assert.equal(markListingBlanchard(chair, []), null);
  assert.equal(markListingBlanchard(boy, []), null);
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
  const taped = markListingBlanchard(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingBlanchard(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(blanchardCookieValue(cleared), "[]");
  assert.equal(isListingBlanchardOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingBlanchard(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingBlanchard(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BLANCHARD_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBlanchard(chair, []), null);
});

test("write never touches dress, flycut, snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeBlanchardListingIds(["kdr-lid-no-pot"]);
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(BLANCHARD_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(BLANCHARD_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-rotary-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-cupwheel-listing-ids");
  assert.notEqual(BLANCHARD_COOKIE_NAME, "iss-surfacegrind-listing-ids");
});
