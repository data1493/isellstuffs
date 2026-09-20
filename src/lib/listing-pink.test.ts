import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DART_STORAGE_KEY } from "./listing-dart";
import { SERGE_STORAGE_KEY } from "./listing-serge";
import {
  PINK_CHAIR_ID,
  PINK_COOKIE_NAME,
  PINK_FONT_ID,
  PINK_HOST_ID,
  PINK_LEAVE_LINE,
  PINK_NOTICE_TITLE,
  PINK_STORAGE_KEY,
  canTapePink,
  clearListingPink,
  isListingPinkOverlay,
  markListingPink,
  parsePinkListingIds,
  pinkCookieValue,
} from "./listing-pink";

test("cookie and storage keys stay the pink paper names", () => {
  assert.equal(PINK_STORAGE_KEY, "iss:pink-listing-ids");
  assert.equal(PINK_COOKIE_NAME, "iss-pink-listing-ids");
  assert.equal(PINK_HOST_ID, "clo-windbreaker");
  assert.equal(
    PINK_NOTICE_TITLE,
    "I will not pink it. Still mint. Still a car.",
  );
  assert.equal(PINK_LEAVE_LINE, "Leave the zigzag");
  assert.notEqual(PINK_STORAGE_KEY, SERGE_STORAGE_KEY);
  assert.notEqual(PINK_STORAGE_KEY, DART_STORAGE_KEY);
  assert.notEqual(PINK_COOKIE_NAME, "iss-serge-listing-ids");
  assert.notEqual(PINK_COOKIE_NAME, "iss-dart-listing-ids");
});

test("write-result objects never parse as a pink set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parsePinkListingIds(writeResult), []);
  assert.equal(
    isListingPinkOverlay(
      "clo-windbreaker",
      parsePinkListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pinkCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parsePinkListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(PINK_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const font = listingById(PINK_FONT_ID);
  assert.ok(canTapePink(jacket));
  assert.equal(canTapePink(soles), false);
  assert.equal(canTapePink(chair), false);
  assert.equal(canTapePink(lamp), false);
  assert.equal(canTapePink(font), false);

  const taped = markListingPink(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(pinkCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingPinkOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingPinkOverlay("clo-split-soles", taped), false);
  assert.equal(isListingPinkOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingPinkOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, font, and overlay-owned rows refuse a pink write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const font = listingById(PINK_FONT_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapePink(soles), false);
  assert.equal(canTapePink(zine), false);
  assert.equal(canTapePink(chair), false);
  assert.equal(canTapePink(gift), false);
  assert.equal(canTapePink(font), false);
  assert.equal(canTapePink(lamp), false);
  assert.equal(canTapePink(drawer), false);

  assert.equal(markListingPink(soles, []), null);
  assert.equal(markListingPink(zine, []), null);
  assert.equal(markListingPink(chair, []), null);
  assert.equal(markListingPink(gift, []), null);
  assert.equal(markListingPink(font, []), null);
  assert.equal(markListingPink(lamp, []), null);
  assert.equal(markListingPink(drawer, []), null);
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
  const taped = markListingPink(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingPink(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pinkCookieValue(cleared), "[]");
  assert.equal(isListingPinkOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingPink(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPink(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
