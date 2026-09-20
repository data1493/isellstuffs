import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import { FETTLE_STORAGE_KEY, readFettleListingIds } from "./listing-fettle";
import { GLAZE_STORAGE_KEY, readGlazeListingIds } from "./listing-glaze";
import { PICKLE_STORAGE_KEY, readPickleListingIds } from "./listing-pickle";
import { SAND_STORAGE_KEY } from "./listing-sand";
import {
  BISQUE_CHAIR_ID,
  BISQUE_COOKIE_NAME,
  BISQUE_HOST_ID,
  BISQUE_LEAVE_LINE,
  BISQUE_NOTICE_TITLE,
  BISQUE_STORAGE_KEY,
  bisqueCookieValue,
  canTapeBisque,
  clearListingBisque,
  isListingBisqueOverlay,
  markListingBisque,
  parseBisqueListingIds,
  readBisqueListingIds,
  writeBisqueListingIds,
} from "./listing-bisque";

test("cookie and storage keys stay the bisque paper names", () => {
  assert.equal(BISQUE_STORAGE_KEY, "iss:bisque-listing-ids");
  assert.equal(BISQUE_COOKIE_NAME, "iss-bisque-listing-ids");
  assert.equal(BISQUE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    BISQUE_NOTICE_TITLE,
    "I will not bisque it. Still a mug. Still a chip.",
  );
  assert.equal(BISQUE_LEAVE_LINE, "Leave the kiln");
  assert.notEqual(BISQUE_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(BISQUE_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(BISQUE_STORAGE_KEY, FETTLE_STORAGE_KEY);
  assert.notEqual(BISQUE_STORAGE_KEY, SAND_STORAGE_KEY);
  assert.notEqual(BISQUE_STORAGE_KEY, CHIP_STORAGE_KEY);
});

test("write-result objects never parse as a bisque set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseBisqueListingIds(writeResult), []);
  assert.equal(
    isListingBisqueOverlay(
      "kdr-chipped-mug",
      parseBisqueListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = bisqueCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseBisqueListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeBisque(mug));
  assert.equal(canTapeBisque(lid), false);
  assert.equal(canTapeBisque(whisk), false);
  assert.equal(canTapeBisque(recipes), false);

  const taped = markListingBisque(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(bisqueCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingBisqueOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingBisqueOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingBisqueOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingBisqueOverlay("dl-drawer-recipes", taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a bisque write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById(BISQUE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeBisque(lid), false);
  assert.equal(canTapeBisque(whisk), false);
  assert.equal(canTapeBisque(recipes), false);
  assert.equal(canTapeBisque(chair), false);
  assert.equal(canTapeBisque(gift), false);
  assert.equal(canTapeBisque(zine), false);
  assert.equal(canTapeBisque(jacket), false);
  assert.equal(canTapeBisque(lamp), false);

  assert.equal(markListingBisque(lid, []), null);
  assert.equal(markListingBisque(whisk, []), null);
  assert.equal(markListingBisque(recipes, []), null);
  assert.equal(markListingBisque(chair, []), null);
  assert.equal(markListingBisque(gift, []), null);
  assert.equal(markListingBisque(zine, []), null);
  assert.equal(markListingBisque(jacket, []), null);
  assert.equal(markListingBisque(lamp, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mug = listingById("kdr-chipped-mug");
  assert.ok(mug);
  const before = {
    price: mug.price,
    status: mug.status,
    cartEligible: mug.cartEligible,
  };
  const taped = markListingBisque(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingBisque(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(bisqueCookieValue(cleared), "[]");
  assert.equal(isListingBisqueOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingBisque(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingBisque(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("bisque write does not write glaze, pickle, or fettle paper", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingBisque(mug, []);
  assert.ok(taped);
  writeBisqueListingIds(taped);
  assert.deepEqual(readBisqueListingIds(), ["kdr-chipped-mug"]);
  assert.deepEqual(readGlazeListingIds(), []);
  assert.deepEqual(readPickleListingIds(), []);
  assert.deepEqual(readFettleListingIds(), []);
  writeBisqueListingIds([]);
});
