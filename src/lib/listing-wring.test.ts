import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  BLANCHARD_COOKIE_NAME,
  BLANCHARD_STORAGE_KEY,
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
import {
  WRING_CHAIR_ID,
  WRING_COOKIE_NAME,
  WRING_HOST_ID,
  WRING_LEAVE_LINE,
  WRING_MUG_ID,
  WRING_NOTICE_TITLE,
  WRING_RECIPES_ID,
  WRING_STORAGE_KEY,
  WRING_WHISK_ID,
  canTapeWring,
  clearListingWring,
  isListingWringOverlay,
  markListingWring,
  parseWringListingIds,
  wringCookieValue,
  writeWringListingIds,
} from "./listing-wring";

test("cookie and storage keys stay the wring paper names", () => {
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(WRING_COOKIE_NAME, "iss-wring-listing-ids");
  assert.equal(WRING_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    WRING_NOTICE_TITLE,
    "I will not wring it. Still a lid. Still no pot.",
  );
  assert.equal(WRING_LEAVE_LINE, "Leave the blocks");
  assert.notEqual(WRING_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:rotary-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:cupwheel-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:surfacegrind-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:granite-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:joblock-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, "iss:interferometer-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a wring set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseWringListingIds(writeResult), []);
  assert.equal(
    isListingWringOverlay(
      "kdr-lid-no-pot",
      parseWringListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseWringListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = wringCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseWringListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(WRING_WHISK_ID);
  const mug = listingById(WRING_MUG_ID);
  const recipes = listingById(WRING_RECIPES_ID);
  assert.ok(canTapeWring(lid));
  assert.equal(canTapeWring(whisk), false);
  assert.equal(canTapeWring(mug), false);
  assert.equal(canTapeWring(recipes), false);

  const taped = markListingWring(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(wringCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingWringOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingWringOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingWringOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingWringOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a wring write", () => {
  const whisk = listingById(WRING_WHISK_ID);
  const mug = listingById(WRING_MUG_ID);
  const recipes = listingById(WRING_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(WRING_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeWring(whisk), false);
  assert.equal(canTapeWring(mug), false);
  assert.equal(canTapeWring(recipes), false);
  assert.equal(canTapeWring(gift), false);
  assert.equal(canTapeWring(zine), false);
  assert.equal(canTapeWring(chair), false);
  assert.equal(canTapeWring(boy), false);

  assert.equal(markListingWring(whisk, []), null);
  assert.equal(markListingWring(mug, []), null);
  assert.equal(markListingWring(recipes, []), null);
  assert.equal(markListingWring(gift, []), null);
  assert.equal(markListingWring(zine, []), null);
  assert.equal(markListingWring(chair, []), null);
  assert.equal(markListingWring(boy, []), null);
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
  const taped = markListingWring(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingWring(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(wringCookieValue(cleared), "[]");
  assert.equal(isListingWringOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingWring(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingWring(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(WRING_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingWring(chair, []), null);
});

test("write never touches blanchard, dress, flycut, snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeWringListingIds(["kdr-lid-no-pot"]);
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(WRING_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(WRING_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(WRING_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-rotary-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-cupwheel-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-surfacegrind-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-granite-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-joblock-listing-ids");
  assert.notEqual(WRING_COOKIE_NAME, "iss-interferometer-listing-ids");
});
