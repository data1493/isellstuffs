import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DART_STORAGE_KEY } from "./listing-dart";
import { FELL_STORAGE_KEY } from "./listing-fell";
import { PINK_STORAGE_KEY } from "./listing-pink";
import { SERGE_STORAGE_KEY } from "./listing-serge";
import {
  DARN_CHAIR_ID,
  DARN_COOKIE_NAME,
  DARN_FONT_ID,
  DARN_HOST_ID,
  DARN_LEAVE_LINE,
  DARN_MUG_ID,
  DARN_NOTICE_TITLE,
  DARN_RECIPES_ID,
  DARN_STORAGE_KEY,
  canTapeDarn,
  clearListingDarn,
  darnCookieValue,
  isListingDarnOverlay,
  markListingDarn,
  parseDarnListingIds,
} from "./listing-darn";

test("cookie and storage keys stay the darn paper names", () => {
  assert.equal(DARN_STORAGE_KEY, "iss:darn-listing-ids");
  assert.equal(DARN_COOKIE_NAME, "iss-darn-listing-ids");
  assert.equal(DARN_HOST_ID, "clo-windbreaker");
  assert.equal(
    DARN_NOTICE_TITLE,
    "I will not darn it. Still a jacket. Still a hole.",
  );
  assert.equal(DARN_LEAVE_LINE, "Leave the hole");
  assert.notEqual(DARN_STORAGE_KEY, SERGE_STORAGE_KEY);
  assert.notEqual(DARN_STORAGE_KEY, DART_STORAGE_KEY);
  assert.notEqual(DARN_STORAGE_KEY, PINK_STORAGE_KEY);
  assert.notEqual(DARN_STORAGE_KEY, FELL_STORAGE_KEY);
  assert.notEqual(DARN_COOKIE_NAME, "iss-serge-listing-ids");
  assert.notEqual(DARN_COOKIE_NAME, "iss-dart-listing-ids");
  assert.notEqual(DARN_COOKIE_NAME, "iss-pink-listing-ids");
  assert.notEqual(DARN_COOKIE_NAME, "iss-fell-listing-ids");
});

test("write-result objects never parse as a darn set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseDarnListingIds(writeResult), []);
  assert.equal(
    isListingDarnOverlay(
      "clo-windbreaker",
      parseDarnListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = darnCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseDarnListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, mug, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(DARN_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const font = listingById(DARN_FONT_ID);
  const mug = listingById(DARN_MUG_ID);
  assert.ok(canTapeDarn(jacket));
  assert.equal(canTapeDarn(soles), false);
  assert.equal(canTapeDarn(chair), false);
  assert.equal(canTapeDarn(lamp), false);
  assert.equal(canTapeDarn(font), false);
  assert.equal(canTapeDarn(mug), false);

  const taped = markListingDarn(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(darnCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingDarnOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingDarnOverlay("clo-split-soles", taped), false);
  assert.equal(isListingDarnOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingDarnOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingDarnOverlay("kdr-chipped-mug", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, recipes, mug, and overlay-owned rows refuse a darn write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const recipes = listingById(DARN_RECIPES_ID);
  const mug = listingById(DARN_MUG_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeDarn(soles), false);
  assert.equal(canTapeDarn(zine), false);
  assert.equal(canTapeDarn(chair), false);
  assert.equal(canTapeDarn(gift), false);
  assert.equal(canTapeDarn(recipes), false);
  assert.equal(canTapeDarn(mug), false);
  assert.equal(canTapeDarn(lamp), false);
  assert.equal(canTapeDarn(drawer), false);

  assert.equal(markListingDarn(soles, []), null);
  assert.equal(markListingDarn(zine, []), null);
  assert.equal(markListingDarn(chair, []), null);
  assert.equal(markListingDarn(gift, []), null);
  assert.equal(markListingDarn(recipes, []), null);
  assert.equal(markListingDarn(mug, []), null);
  assert.equal(markListingDarn(lamp, []), null);
  assert.equal(markListingDarn(drawer, []), null);
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
  const taped = markListingDarn(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingDarn(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(darnCookieValue(cleared), "[]");
  assert.equal(isListingDarnOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingDarn(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingDarn(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("neighbor sew / pink / serge / dart / fell cookies stay unowned", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingDarn(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(DARN_STORAGE_KEY, "iss:darn-listing-ids");
  assert.notEqual(darnCookieValue(taped), PINK_STORAGE_KEY);
  assert.notEqual(darnCookieValue(taped), SERGE_STORAGE_KEY);
  assert.notEqual(darnCookieValue(taped), DART_STORAGE_KEY);
  assert.notEqual(darnCookieValue(taped), FELL_STORAGE_KEY);
});
