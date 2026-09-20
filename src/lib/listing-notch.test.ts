import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DARN_STORAGE_KEY } from "./listing-darn";
import { PINK_STORAGE_KEY } from "./listing-pink";
import { PLEAT_STORAGE_KEY } from "./listing-pleat";
import {
  NOTCH_CHAIR_ID,
  NOTCH_COOKIE_NAME,
  NOTCH_FONT_ID,
  NOTCH_HOST_ID,
  NOTCH_LEAVE_LINE,
  NOTCH_MUG_ID,
  NOTCH_NOTICE_TITLE,
  NOTCH_RECIPES_ID,
  NOTCH_STORAGE_KEY,
  canTapeNotch,
  clearListingNotch,
  isListingNotchOverlay,
  markListingNotch,
  notchCookieValue,
  parseNotchListingIds,
} from "./listing-notch";

test("cookie and storage keys stay the notch paper names", () => {
  assert.equal(NOTCH_STORAGE_KEY, "iss:notch-listing-ids");
  assert.equal(NOTCH_COOKIE_NAME, "iss-notch-listing-ids");
  assert.equal(NOTCH_HOST_ID, "clo-windbreaker");
  assert.equal(
    NOTCH_NOTICE_TITLE,
    "I will not notch it. Still pits. Still a car smell.",
  );
  assert.equal(NOTCH_LEAVE_LINE, "Leave the pits");
  assert.notEqual(NOTCH_STORAGE_KEY, PINK_STORAGE_KEY);
  assert.notEqual(NOTCH_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(NOTCH_STORAGE_KEY, PLEAT_STORAGE_KEY);
  assert.notEqual(NOTCH_COOKIE_NAME, "iss-pink-listing-ids");
  assert.notEqual(NOTCH_COOKIE_NAME, "iss-darn-listing-ids");
  assert.notEqual(NOTCH_COOKIE_NAME, "iss-pleat-listing-ids");
});

test("write-result objects never parse as a notch set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseNotchListingIds(writeResult), []);
  assert.equal(
    isListingNotchOverlay(
      "clo-windbreaker",
      parseNotchListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = notchCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseNotchListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, mug, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(NOTCH_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const font = listingById(NOTCH_FONT_ID);
  const mug = listingById(NOTCH_MUG_ID);
  assert.ok(canTapeNotch(jacket));
  assert.equal(canTapeNotch(soles), false);
  assert.equal(canTapeNotch(chair), false);
  assert.equal(canTapeNotch(lamp), false);
  assert.equal(canTapeNotch(font), false);
  assert.equal(canTapeNotch(mug), false);

  const taped = markListingNotch(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(notchCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingNotchOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingNotchOverlay("clo-split-soles", taped), false);
  assert.equal(isListingNotchOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingNotchOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingNotchOverlay("kdr-chipped-mug", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, recipes, mug, and overlay-owned rows refuse a notch write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const recipes = listingById(NOTCH_RECIPES_ID);
  const mug = listingById(NOTCH_MUG_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeNotch(soles), false);
  assert.equal(canTapeNotch(zine), false);
  assert.equal(canTapeNotch(chair), false);
  assert.equal(canTapeNotch(gift), false);
  assert.equal(canTapeNotch(recipes), false);
  assert.equal(canTapeNotch(mug), false);
  assert.equal(canTapeNotch(lamp), false);
  assert.equal(canTapeNotch(drawer), false);

  assert.equal(markListingNotch(soles, []), null);
  assert.equal(markListingNotch(zine, []), null);
  assert.equal(markListingNotch(chair, []), null);
  assert.equal(markListingNotch(gift, []), null);
  assert.equal(markListingNotch(recipes, []), null);
  assert.equal(markListingNotch(mug, []), null);
  assert.equal(markListingNotch(lamp, []), null);
  assert.equal(markListingNotch(drawer, []), null);
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
  const taped = markListingNotch(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingNotch(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(notchCookieValue(cleared), "[]");
  assert.equal(isListingNotchOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingNotch(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingNotch(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("neighbor pink / darn / pleat cookies stay unowned", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingNotch(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(NOTCH_STORAGE_KEY, "iss:notch-listing-ids");
  assert.notEqual(notchCookieValue(taped), PINK_STORAGE_KEY);
  assert.notEqual(notchCookieValue(taped), DARN_STORAGE_KEY);
  assert.notEqual(notchCookieValue(taped), PLEAT_STORAGE_KEY);
});
