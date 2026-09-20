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
  WRING_COOKIE_NAME,
  WRING_STORAGE_KEY,
} from "./listing-wring";
import {
  SINE_CHAIR_ID,
  SINE_COOKIE_NAME,
  SINE_HOST_ID,
  SINE_LEAVE_LINE,
  SINE_MUG_ID,
  SINE_NOTICE_TITLE,
  SINE_RECIPES_ID,
  SINE_STORAGE_KEY,
  SINE_WHISK_ID,
  canTapeSine,
  clearListingSine,
  isListingSineOverlay,
  markListingSine,
  parseSineListingIds,
  sineCookieValue,
  writeSineListingIds,
} from "./listing-sine";

test("cookie and storage keys stay the sine paper names", () => {
  assert.equal(SINE_STORAGE_KEY, "iss:sine-listing-ids");
  assert.equal(SINE_COOKIE_NAME, "iss-sine-listing-ids");
  assert.equal(SINE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    SINE_NOTICE_TITLE,
    "I will not sine it. Still a lid. Still no pot.",
  );
  assert.equal(SINE_LEAVE_LINE, "Leave the plate");
  assert.notEqual(SINE_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:rotary-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:cupwheel-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:surfacegrind-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:granite-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:joblock-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:interferometer-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:sinebar-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:angleblock-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, "iss:jo-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, WRING_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a sine set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseSineListingIds(writeResult), []);
  assert.equal(
    isListingSineOverlay(
      "kdr-lid-no-pot",
      parseSineListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseSineListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = sineCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseSineListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(SINE_WHISK_ID);
  const mug = listingById(SINE_MUG_ID);
  const recipes = listingById(SINE_RECIPES_ID);
  assert.ok(canTapeSine(lid));
  assert.equal(canTapeSine(whisk), false);
  assert.equal(canTapeSine(mug), false);
  assert.equal(canTapeSine(recipes), false);

  const taped = markListingSine(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(sineCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingSineOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingSineOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingSineOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingSineOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a sine write", () => {
  const whisk = listingById(SINE_WHISK_ID);
  const mug = listingById(SINE_MUG_ID);
  const recipes = listingById(SINE_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SINE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeSine(whisk), false);
  assert.equal(canTapeSine(mug), false);
  assert.equal(canTapeSine(recipes), false);
  assert.equal(canTapeSine(gift), false);
  assert.equal(canTapeSine(zine), false);
  assert.equal(canTapeSine(chair), false);
  assert.equal(canTapeSine(boy), false);

  assert.equal(markListingSine(whisk, []), null);
  assert.equal(markListingSine(mug, []), null);
  assert.equal(markListingSine(recipes, []), null);
  assert.equal(markListingSine(gift, []), null);
  assert.equal(markListingSine(zine, []), null);
  assert.equal(markListingSine(chair, []), null);
  assert.equal(markListingSine(boy, []), null);
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
  const taped = markListingSine(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingSine(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(sineCookieValue(cleared), "[]");
  assert.equal(isListingSineOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingSine(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSine(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SINE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSine(chair, []), null);
});

test("write never touches wring, blanchard, dress, flycut, snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeSineListingIds(["kdr-lid-no-pot"]);
  assert.equal(SINE_STORAGE_KEY, "iss:sine-listing-ids");
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(SINE_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SINE_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, WRING_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(SINE_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-rotary-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-cupwheel-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-surfacegrind-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-granite-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-joblock-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-interferometer-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-sinebar-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-angleblock-listing-ids");
  assert.notEqual(SINE_COOKIE_NAME, "iss-jo-listing-ids");
});
