import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import { GLAZE_STORAGE_KEY } from "./listing-glaze";
import { PICKLE_STORAGE_KEY } from "./listing-pickle";
import {
  FETTLE_CHAIR_ID,
  FETTLE_COOKIE_NAME,
  FETTLE_HOST_ID,
  FETTLE_LEAVE_LINE,
  FETTLE_NOTICE_TITLE,
  FETTLE_STORAGE_KEY,
  canTapeFettle,
  clearListingFettle,
  fettleCookieValue,
  isListingFettleOverlay,
  markListingFettle,
  parseFettleListingIds,
} from "./listing-fettle";

test("cookie and storage keys stay the fettle paper names", () => {
  assert.equal(FETTLE_STORAGE_KEY, "iss:fettle-listing-ids");
  assert.equal(FETTLE_COOKIE_NAME, "iss-fettle-listing-ids");
  assert.equal(FETTLE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    FETTLE_NOTICE_TITLE,
    "I will not fettle it. Still a chip. Still a mug.",
  );
  assert.equal(FETTLE_LEAVE_LINE, "Leave the rim");
  assert.notEqual(FETTLE_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(FETTLE_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(FETTLE_STORAGE_KEY, CHIP_STORAGE_KEY);
});

test("write-result objects never parse as a fettle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseFettleListingIds(writeResult), []);
  assert.equal(
    isListingFettleOverlay(
      "kdr-chipped-mug",
      parseFettleListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = fettleCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseFettleListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeFettle(mug));
  assert.equal(canTapeFettle(lid), false);
  assert.equal(canTapeFettle(whisk), false);
  assert.equal(canTapeFettle(recipes), false);

  const taped = markListingFettle(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(fettleCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingFettleOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingFettleOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingFettleOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingFettleOverlay("dl-drawer-recipes", taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a fettle write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById(FETTLE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeFettle(lid), false);
  assert.equal(canTapeFettle(whisk), false);
  assert.equal(canTapeFettle(recipes), false);
  assert.equal(canTapeFettle(chair), false);
  assert.equal(canTapeFettle(gift), false);
  assert.equal(canTapeFettle(zine), false);
  assert.equal(canTapeFettle(jacket), false);
  assert.equal(canTapeFettle(lamp), false);

  assert.equal(markListingFettle(lid, []), null);
  assert.equal(markListingFettle(whisk, []), null);
  assert.equal(markListingFettle(recipes, []), null);
  assert.equal(markListingFettle(chair, []), null);
  assert.equal(markListingFettle(gift, []), null);
  assert.equal(markListingFettle(zine, []), null);
  assert.equal(markListingFettle(jacket, []), null);
  assert.equal(markListingFettle(lamp, []), null);
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
  const taped = markListingFettle(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingFettle(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(fettleCookieValue(cleared), "[]");
  assert.equal(isListingFettleOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingFettle(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFettle(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
