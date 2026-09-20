import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { HONE_STORAGE_KEY } from "./listing-hone";
import {
  SNUG_COOKIE_NAME,
  SNUG_STORAGE_KEY,
} from "./listing-snug";
import {
  SPOTFACE_CHAIR_ID,
  SPOTFACE_COOKIE_NAME,
  SPOTFACE_HOST_ID,
  SPOTFACE_LEAVE_LINE,
  SPOTFACE_MUG_ID,
  SPOTFACE_NOTICE_TITLE,
  SPOTFACE_RECIPES_ID,
  SPOTFACE_STORAGE_KEY,
  SPOTFACE_WHISK_ID,
  canTapeSpotface,
  clearListingSpotface,
  isListingSpotfaceOverlay,
  markListingSpotface,
  parseSpotfaceListingIds,
  spotfaceCookieValue,
  writeSpotfaceListingIds,
} from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import { UPSET_STORAGE_KEY } from "./listing-upset";

test("cookie and storage keys stay the spotface paper names", () => {
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(SPOTFACE_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.equal(SPOTFACE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    SPOTFACE_NOTICE_TITLE,
    "I will not spotface it. Still a lid. Still no pot.",
  );
  assert.equal(SPOTFACE_LEAVE_LINE, "Leave the hole");
  assert.notEqual(SPOTFACE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, UPSET_STORAGE_KEY);
  assert.notEqual(SPOTFACE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(SPOTFACE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-face-listing-ids");
});

test("write-result objects never parse as a spotface set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseSpotfaceListingIds(writeResult), []);
  assert.equal(
    isListingSpotfaceOverlay(
      "kdr-lid-no-pot",
      parseSpotfaceListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = spotfaceCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseSpotfaceListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(SPOTFACE_WHISK_ID);
  const mug = listingById(SPOTFACE_MUG_ID);
  const recipes = listingById(SPOTFACE_RECIPES_ID);
  assert.ok(canTapeSpotface(lid));
  assert.equal(canTapeSpotface(whisk), false);
  assert.equal(canTapeSpotface(mug), false);
  assert.equal(canTapeSpotface(recipes), false);

  const taped = markListingSpotface(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(spotfaceCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingSpotfaceOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingSpotfaceOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingSpotfaceOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingSpotfaceOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a spotface write", () => {
  const whisk = listingById(SPOTFACE_WHISK_ID);
  const mug = listingById(SPOTFACE_MUG_ID);
  const recipes = listingById(SPOTFACE_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SPOTFACE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeSpotface(whisk), false);
  assert.equal(canTapeSpotface(mug), false);
  assert.equal(canTapeSpotface(recipes), false);
  assert.equal(canTapeSpotface(gift), false);
  assert.equal(canTapeSpotface(zine), false);
  assert.equal(canTapeSpotface(chair), false);
  assert.equal(canTapeSpotface(boy), false);

  assert.equal(markListingSpotface(whisk, []), null);
  assert.equal(markListingSpotface(mug, []), null);
  assert.equal(markListingSpotface(recipes, []), null);
  assert.equal(markListingSpotface(gift, []), null);
  assert.equal(markListingSpotface(zine, []), null);
  assert.equal(markListingSpotface(chair, []), null);
  assert.equal(markListingSpotface(boy, []), null);
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
  const taped = markListingSpotface(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingSpotface(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(spotfaceCookieValue(cleared), "[]");
  assert.equal(isListingSpotfaceOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingSpotface(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSpotface(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SPOTFACE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSpotface(chair, []), null);
});

test("write never touches snug, tap, hone, or upset storage keys", () => {
  writeSpotfaceListingIds(["kdr-lid-no-pot"]);
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.equal(HONE_STORAGE_KEY, "iss:hone-listing-ids");
  assert.equal(UPSET_STORAGE_KEY, "iss:upset-listing-ids");
  assert.notEqual(SPOTFACE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(SPOTFACE_STORAGE_KEY, UPSET_STORAGE_KEY);
  assert.notEqual(SPOTFACE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(SPOTFACE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-face-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-hone-listing-ids");
  assert.notEqual(SPOTFACE_COOKIE_NAME, "iss-upset-listing-ids");
});
