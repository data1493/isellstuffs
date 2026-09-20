import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DARN_STORAGE_KEY } from "./listing-darn";
import { DART_STORAGE_KEY } from "./listing-dart";
import { FELL_STORAGE_KEY } from "./listing-fell";
import { PINK_STORAGE_KEY } from "./listing-pink";
import {
  PLEAT_CHAIR_ID,
  PLEAT_COOKIE_NAME,
  PLEAT_FONT_ID,
  PLEAT_HOST_ID,
  PLEAT_LEAVE_LINE,
  PLEAT_MUG_ID,
  PLEAT_NOTICE_TITLE,
  PLEAT_RECIPES_ID,
  PLEAT_STORAGE_KEY,
  canTapePleat,
  clearListingPleat,
  isListingPleatOverlay,
  markListingPleat,
  parsePleatListingIds,
  pleatCookieValue,
} from "./listing-pleat";

test("cookie and storage keys stay the pleat paper names", () => {
  assert.equal(PLEAT_STORAGE_KEY, "iss:pleat-listing-ids");
  assert.equal(PLEAT_COOKIE_NAME, "iss-pleat-listing-ids");
  assert.equal(PLEAT_HOST_ID, "clo-windbreaker");
  assert.equal(
    PLEAT_NOTICE_TITLE,
    "I will not pleat it. Still a jacket. Still a hole.",
  );
  assert.equal(PLEAT_LEAVE_LINE, "Leave the front");
  assert.notEqual(PLEAT_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(PLEAT_STORAGE_KEY, DART_STORAGE_KEY);
  assert.notEqual(PLEAT_STORAGE_KEY, PINK_STORAGE_KEY);
  assert.notEqual(PLEAT_STORAGE_KEY, FELL_STORAGE_KEY);
  assert.notEqual(PLEAT_COOKIE_NAME, "iss-darn-listing-ids");
  assert.notEqual(PLEAT_COOKIE_NAME, "iss-dart-listing-ids");
  assert.notEqual(PLEAT_COOKIE_NAME, "iss-pink-listing-ids");
  assert.notEqual(PLEAT_COOKIE_NAME, "iss-fell-listing-ids");
});

test("write-result objects never parse as a pleat set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parsePleatListingIds(writeResult), []);
  assert.equal(
    isListingPleatOverlay(
      "clo-windbreaker",
      parsePleatListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pleatCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parsePleatListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, mug, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(PLEAT_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const font = listingById(PLEAT_FONT_ID);
  const mug = listingById(PLEAT_MUG_ID);
  assert.ok(canTapePleat(jacket));
  assert.equal(canTapePleat(soles), false);
  assert.equal(canTapePleat(chair), false);
  assert.equal(canTapePleat(lamp), false);
  assert.equal(canTapePleat(font), false);
  assert.equal(canTapePleat(mug), false);

  const taped = markListingPleat(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(pleatCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingPleatOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingPleatOverlay("clo-split-soles", taped), false);
  assert.equal(isListingPleatOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingPleatOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingPleatOverlay("kdr-chipped-mug", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, recipes, mug, and overlay-owned rows refuse a pleat write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const recipes = listingById(PLEAT_RECIPES_ID);
  const mug = listingById(PLEAT_MUG_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapePleat(soles), false);
  assert.equal(canTapePleat(zine), false);
  assert.equal(canTapePleat(chair), false);
  assert.equal(canTapePleat(gift), false);
  assert.equal(canTapePleat(recipes), false);
  assert.equal(canTapePleat(mug), false);
  assert.equal(canTapePleat(lamp), false);
  assert.equal(canTapePleat(drawer), false);

  assert.equal(markListingPleat(soles, []), null);
  assert.equal(markListingPleat(zine, []), null);
  assert.equal(markListingPleat(chair, []), null);
  assert.equal(markListingPleat(gift, []), null);
  assert.equal(markListingPleat(recipes, []), null);
  assert.equal(markListingPleat(mug, []), null);
  assert.equal(markListingPleat(lamp, []), null);
  assert.equal(markListingPleat(drawer, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jacket = listingById("clo-windbreaker");
  assert.ok(jacket);
  const before = {
    price: jacket.price,
    status: jacket.status,
    cartEligible: jacket.cartEligible,
  };
  const taped = markListingPleat(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingPleat(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pleatCookieValue(cleared), "[]");
  assert.equal(isListingPleatOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingPleat(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPleat(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("neighbor darn / dart / fell / pink cookies stay unowned", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingPleat(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(PLEAT_STORAGE_KEY, "iss:pleat-listing-ids");
  assert.notEqual(pleatCookieValue(taped), DARN_STORAGE_KEY);
  assert.notEqual(pleatCookieValue(taped), DART_STORAGE_KEY);
  assert.notEqual(pleatCookieValue(taped), FELL_STORAGE_KEY);
  assert.notEqual(pleatCookieValue(taped), PINK_STORAGE_KEY);
});
