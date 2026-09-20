import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { EDGE_STORAGE_KEY } from "./listing-edge";
import { NOTCH_STORAGE_KEY } from "./listing-notch";
import { PINK_STORAGE_KEY } from "./listing-pink";
import { PLEAT_STORAGE_KEY } from "./listing-pleat";
import {
  SINGE_CHAIR_ID,
  SINGE_COOKIE_NAME,
  SINGE_GIFT_ID,
  SINGE_HOST_ID,
  SINGE_LEAVE_LINE,
  SINGE_MUG_ID,
  SINGE_NOTICE_TITLE,
  SINGE_RECIPES_ID,
  SINGE_SNEAKER_ID,
  SINGE_STORAGE_KEY,
  SINGE_ZINE_ID,
  canTapeSinge,
  clearListingSinge,
  isListingSingeOverlay,
  markListingSinge,
  parseSingeListingIds,
  singeCookieValue,
  writeSingeListingIds,
} from "./listing-singe";

test("cookie and storage keys stay the singe paper names", () => {
  assert.equal(SINGE_STORAGE_KEY, "iss:singe-listing-ids");
  assert.equal(SINGE_COOKIE_NAME, "iss-singe-listing-ids");
  assert.equal(SINGE_HOST_ID, "clo-windbreaker");
  assert.equal(
    SINGE_NOTICE_TITLE,
    "I will not singe it. Still a jacket. Still a hole.",
  );
  assert.equal(SINGE_LEAVE_LINE, "Leave the pills");
  assert.notEqual(SINGE_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(SINGE_STORAGE_KEY, PINK_STORAGE_KEY);
  assert.notEqual(SINGE_STORAGE_KEY, PLEAT_STORAGE_KEY);
  assert.notEqual(SINGE_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(SINGE_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(SINGE_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(SINGE_STORAGE_KEY, "iss:bartack-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-notch-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-pink-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-pleat-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-bartack-listing-ids");
});

test("write-result objects never parse as a singe set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseSingeListingIds(writeResult), []);
  assert.equal(
    isListingSingeOverlay(
      "clo-windbreaker",
      parseSingeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = singeCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseSingeListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, mug, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(SINGE_SNEAKER_ID);
  const mug = listingById(SINGE_MUG_ID);
  const recipes = listingById(SINGE_RECIPES_ID);
  assert.ok(canTapeSinge(jacket));
  assert.equal(canTapeSinge(soles), false);
  assert.equal(canTapeSinge(mug), false);
  assert.equal(canTapeSinge(recipes), false);

  const taped = markListingSinge(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(singeCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingSingeOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingSingeOverlay("clo-split-soles", taped), false);
  assert.equal(isListingSingeOverlay("kdr-chipped-mug", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, mug, gift, zine, chair, and overlay-owned rows refuse a singe write", () => {
  const soles = listingById(SINGE_SNEAKER_ID);
  const mug = listingById(SINGE_MUG_ID);
  const gift = listingById(SINGE_GIFT_ID);
  const zine = listingById(SINGE_ZINE_ID);
  const chair = listingById(SINGE_CHAIR_ID);
  const recipes = listingById(SINGE_RECIPES_ID);

  assert.equal(canTapeSinge(soles), false);
  assert.equal(canTapeSinge(mug), false);
  assert.equal(canTapeSinge(gift), false);
  assert.equal(canTapeSinge(zine), false);
  assert.equal(canTapeSinge(chair), false);
  assert.equal(canTapeSinge(recipes), false);

  assert.equal(markListingSinge(soles, []), null);
  assert.equal(markListingSinge(mug, []), null);
  assert.equal(markListingSinge(gift, []), null);
  assert.equal(markListingSinge(zine, []), null);
  assert.equal(markListingSinge(chair, []), null);
  assert.equal(markListingSinge(recipes, []), null);
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
  const taped = markListingSinge(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingSinge(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(singeCookieValue(cleared), "[]");
  assert.equal(isListingSingeOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(SINGE_SNEAKER_ID);
  const taped = markListingSinge(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSinge(soles, []), null);

  const cleared = clearListingSinge(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SINGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSinge(chair, []), null);
});

test("write never touches notch, pink, pleat, nap, cream, or bartack storage keys", () => {
  writeSingeListingIds(["clo-windbreaker"]);
  assert.equal(SINGE_STORAGE_KEY, "iss:singe-listing-ids");
  assert.equal(NOTCH_STORAGE_KEY, "iss:notch-listing-ids");
  assert.equal(PINK_STORAGE_KEY, "iss:pink-listing-ids");
  assert.equal(PLEAT_STORAGE_KEY, "iss:pleat-listing-ids");
  assert.notEqual(SINGE_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(SINGE_STORAGE_KEY, PINK_STORAGE_KEY);
  assert.notEqual(SINGE_COOKIE_NAME, "iss-notch-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-pink-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-pleat-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-bartack-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-steam-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-teasel-listing-ids");
  assert.notEqual(SINGE_COOKIE_NAME, "iss-dye-listing-ids");
});
