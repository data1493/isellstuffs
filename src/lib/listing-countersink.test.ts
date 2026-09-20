import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  COUNTERSINK_CHAIR_ID,
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_GIFT_ID,
  COUNTERSINK_HOST_ID,
  COUNTERSINK_LAMP_ID,
  COUNTERSINK_LEAVE_LINE,
  COUNTERSINK_MUG_ID,
  COUNTERSINK_NOTICE_TITLE,
  COUNTERSINK_RECIPES_ID,
  COUNTERSINK_STORAGE_KEY,
  COUNTERSINK_WHISK_ID,
  COUNTERSINK_ZINE_ID,
  canTapeCountersink,
  clearListingCountersink,
  countersinkCookieValue,
  isListingCountersinkOverlay,
  markListingCountersink,
  parseCountersinkListingIds,
  writeCountersinkListingIds,
} from "./listing-countersink";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";

test("cookie and storage keys stay the countersink paper names", () => {
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(COUNTERSINK_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.equal(COUNTERSINK_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    COUNTERSINK_NOTICE_TITLE,
    "I will not countersink it. Still a lid. Still no pot.",
  );
  assert.equal(COUNTERSINK_LEAVE_LINE, "Leave the hole");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(COUNTERSINK_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:face-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(COUNTERSINK_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-face-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-braze-listing-ids");
});

test("write-result objects never parse as a countersink set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseCountersinkListingIds(writeResult), []);
  assert.equal(
    isListingCountersinkOverlay(
      "kdr-lid-no-pot",
      parseCountersinkListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = countersinkCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseCountersinkListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, whisk, and lamp stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(COUNTERSINK_MUG_ID);
  const recipes = listingById(COUNTERSINK_RECIPES_ID);
  const whisk = listingById(COUNTERSINK_WHISK_ID);
  const lamp = listingById(COUNTERSINK_LAMP_ID);

  assert.ok(canTapeCountersink(lid));
  assert.equal(canTapeCountersink(mug), false);
  assert.equal(canTapeCountersink(recipes), false);
  assert.equal(canTapeCountersink(whisk), false);
  assert.equal(canTapeCountersink(lamp), false);

  const taped = markListingCountersink(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(countersinkCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingCountersinkOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingCountersinkOverlay(COUNTERSINK_MUG_ID, taped), false);
  assert.equal(isListingCountersinkOverlay(COUNTERSINK_WHISK_ID, taped), false);
  assert.equal(isListingCountersinkOverlay(COUNTERSINK_RECIPES_ID, taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, gift, zine, and chair refuse a countersink write", () => {
  const mug = listingById(COUNTERSINK_MUG_ID);
  const recipes = listingById(COUNTERSINK_RECIPES_ID);
  const whisk = listingById(COUNTERSINK_WHISK_ID);
  const gift = listingById(COUNTERSINK_GIFT_ID);
  const zine = listingById(COUNTERSINK_ZINE_ID);
  const chair = listingById(COUNTERSINK_CHAIR_ID);

  assert.equal(canTapeCountersink(mug), false);
  assert.equal(canTapeCountersink(recipes), false);
  assert.equal(canTapeCountersink(whisk), false);
  assert.equal(canTapeCountersink(gift), false);
  assert.equal(canTapeCountersink(zine), false);
  assert.equal(canTapeCountersink(chair), false);

  assert.equal(markListingCountersink(mug, []), null);
  assert.equal(markListingCountersink(recipes, []), null);
  assert.equal(markListingCountersink(whisk, []), null);
  assert.equal(markListingCountersink(gift, []), null);
  assert.equal(markListingCountersink(zine, []), null);
  assert.equal(markListingCountersink(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lid = listingById("kdr-lid-no-pot");
  assert.ok(lid);
  const before = {
    price: lid.price,
    status: lid.status,
    cartEligible: lid.cartEligible,
  };
  const taped = markListingCountersink(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingCountersink(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(countersinkCookieValue(cleared), "[]");
  assert.equal(isListingCountersinkOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(COUNTERSINK_MUG_ID);
  const taped = markListingCountersink(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCountersink(mug, []), null);

  const cleared = clearListingCountersink(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(COUNTERSINK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCountersink(chair, []), null);
});

test("write never touches snug, tap, spotface, lap, face, or braze storage keys", () => {
  writeCountersinkListingIds(["kdr-lid-no-pot"]);
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(COUNTERSINK_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:face-listing-ids");
  assert.notEqual(COUNTERSINK_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(COUNTERSINK_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-face-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-braze-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-cone-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-flush-listing-ids");
  assert.notEqual(COUNTERSINK_COOKIE_NAME, "iss-csink-listing-ids");
});
