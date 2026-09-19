import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import { GLAZE_STORAGE_KEY } from "./listing-glaze";
import { HANDLE_STORAGE_KEY } from "./listing-handle";
import {
  PICKLE_CHAIR_ID,
  PICKLE_COOKIE_NAME,
  PICKLE_HOST_ID,
  PICKLE_LEAVE_LINE,
  PICKLE_LUT_ID,
  PICKLE_NOTICE_TITLE,
  PICKLE_STORAGE_KEY,
  canTapePickle,
  clearListingPickle,
  isListingPickleOverlay,
  markListingPickle,
  parsePickleListingIds,
  pickleCookieValue,
} from "./listing-pickle";

test("cookie and storage keys stay the pickle paper names", () => {
  assert.equal(PICKLE_STORAGE_KEY, "iss:pickle-listing-ids");
  assert.equal(PICKLE_COOKIE_NAME, "iss-pickle-listing-ids");
  assert.equal(PICKLE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    PICKLE_NOTICE_TITLE,
    "I will not pickle it. Still chipped. Still a mug.",
  );
  assert.equal(PICKLE_LEAVE_LINE, "Leave the craze");
  assert.notEqual(PICKLE_STORAGE_KEY, CHIP_STORAGE_KEY);
  assert.notEqual(PICKLE_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(PICKLE_STORAGE_KEY, HANDLE_STORAGE_KEY);
});

test("write-result objects never parse as a pickle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parsePickleListingIds(writeResult), []);
  assert.equal(
    isListingPickleOverlay(
      "kdr-chipped-mug",
      parsePickleListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pickleCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parsePickleListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapePickle(mug));
  assert.equal(canTapePickle(lid), false);
  assert.equal(canTapePickle(whisk), false);
  assert.equal(canTapePickle(recipes), false);

  const taped = markListingPickle(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(pickleCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingPickleOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingPickleOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingPickleOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingPickleOverlay("dl-drawer-recipes", taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, LUT, and overlay-owned rows refuse a pickle write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById(PICKLE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const luts = listingById(PICKLE_LUT_ID);
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapePickle(lid), false);
  assert.equal(canTapePickle(whisk), false);
  assert.equal(canTapePickle(recipes), false);
  assert.equal(canTapePickle(chair), false);
  assert.equal(canTapePickle(gift), false);
  assert.equal(canTapePickle(zine), false);
  assert.equal(canTapePickle(luts), false);
  assert.equal(canTapePickle(jacket), false);
  assert.equal(canTapePickle(lamp), false);

  assert.equal(markListingPickle(lid, []), null);
  assert.equal(markListingPickle(whisk, []), null);
  assert.equal(markListingPickle(recipes, []), null);
  assert.equal(markListingPickle(chair, []), null);
  assert.equal(markListingPickle(gift, []), null);
  assert.equal(markListingPickle(zine, []), null);
  assert.equal(markListingPickle(luts, []), null);
  assert.equal(markListingPickle(jacket, []), null);
  assert.equal(markListingPickle(lamp, []), null);
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
  const taped = markListingPickle(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingPickle(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pickleCookieValue(cleared), "[]");
  assert.equal(isListingPickleOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingPickle(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPickle(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
