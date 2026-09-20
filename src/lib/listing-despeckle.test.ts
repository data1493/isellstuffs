import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DESCREEN_STORAGE_KEY } from "./listing-descreen";
import { GANG_STORAGE_KEY } from "./listing-gang";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { VARNISH_STORAGE_KEY } from "./listing-varnish";
import {
  DESPECKLE_CHAIR_ID,
  DESPECKLE_COOKIE_NAME,
  DESPECKLE_GIFT_ID,
  DESPECKLE_HOST_ID,
  DESPECKLE_LEAVE_LINE,
  DESPECKLE_LINER_ID,
  DESPECKLE_NOTICE_TITLE,
  DESPECKLE_PDF_ID,
  DESPECKLE_STORAGE_KEY,
  DESPECKLE_WHISK_ID,
  canTapeDespeckle,
  clearListingDespeckle,
  despeckleCookieValue,
  isListingDespeckleOverlay,
  markListingDespeckle,
  parseDespeckleListingIds,
  writeDespeckleListingIds,
} from "./listing-despeckle";

test("cookie and storage keys stay the despeckle paper names", () => {
  assert.equal(DESPECKLE_STORAGE_KEY, "iss:despeckle-listing-ids");
  assert.equal(DESPECKLE_COOKIE_NAME, "iss-despeckle-listing-ids");
  assert.equal(DESPECKLE_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    DESPECKLE_NOTICE_TITLE,
    "I will not despeckle them. Still three cards. Still grease.",
  );
  assert.equal(DESPECKLE_LEAVE_LINE, "Leave the cards");
  assert.notEqual(DESPECKLE_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, DESCREEN_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, MAT_STORAGE_KEY);
});

test("write-result objects never parse as a despeckle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseDespeckleListingIds(writeResult), []);
  assert.equal(
    isListingDespeckleOverlay(
      "dl-drawer-recipes",
      parseDespeckleListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseDespeckleListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = despeckleCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseDespeckleListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; liner, junk PDF, and whisk stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(DESPECKLE_LINER_ID);
  const pdf = listingById(DESPECKLE_PDF_ID);
  const whisk = listingById(DESPECKLE_WHISK_ID);

  assert.ok(canTapeDespeckle(recipes));
  assert.equal(canTapeDespeckle(liner), false);
  assert.equal(canTapeDespeckle(pdf), false);
  assert.equal(canTapeDespeckle(whisk), false);

  const taped = markListingDespeckle(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(despeckleCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingDespeckleOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingDespeckleOverlay(DESPECKLE_LINER_ID, taped), false);
  assert.equal(isListingDespeckleOverlay(DESPECKLE_PDF_ID, taped), false);
  assert.equal(isListingDespeckleOverlay(DESPECKLE_WHISK_ID, taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("whisk, gift, sold chair, liner, and junk PDF refuse a despeckle write", () => {
  const whisk = listingById(DESPECKLE_WHISK_ID);
  const gift = listingById(DESPECKLE_GIFT_ID);
  const chair = listingById(DESPECKLE_CHAIR_ID);
  const liner = listingById(DESPECKLE_LINER_ID);
  const pdf = listingById(DESPECKLE_PDF_ID);
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeDespeckle(whisk), false);
  assert.equal(canTapeDespeckle(gift), false);
  assert.equal(canTapeDespeckle(chair), false);
  assert.equal(canTapeDespeckle(liner), false);
  assert.equal(canTapeDespeckle(pdf), false);
  assert.equal(canTapeDespeckle(zine), false);

  assert.equal(markListingDespeckle(whisk, []), null);
  assert.equal(markListingDespeckle(gift, []), null);
  assert.equal(markListingDespeckle(chair, []), null);
  assert.equal(markListingDespeckle(liner, []), null);
  assert.equal(markListingDespeckle(pdf, []), null);
  assert.equal(markListingDespeckle(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(recipes);
  const before = {
    price: recipes.price,
    status: recipes.status,
    cartEligible: recipes.cartEligible,
  };
  const taped = markListingDespeckle(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingDespeckle(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(despeckleCookieValue(cleared), "[]");
  assert.equal(isListingDespeckleOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(DESPECKLE_LINER_ID);
  const taped = markListingDespeckle(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingDespeckle(liner, []), null);

  const cleared = clearListingDespeckle(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DESPECKLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDespeckle(chair, []), null);
});

test("write never touches gang, crop, descreen, emboss, varnish, or mat storage keys", () => {
  writeDespeckleListingIds(["dl-drawer-recipes"]);
  assert.equal(DESPECKLE_STORAGE_KEY, "iss:despeckle-listing-ids");
  assert.equal(GANG_STORAGE_KEY, "iss:gang-listing-ids");
  assert.equal(DESCREEN_STORAGE_KEY, "iss:descreen-listing-ids");
  assert.equal(VARNISH_STORAGE_KEY, "iss:varnish-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.notEqual(DESPECKLE_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, DESCREEN_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(DESPECKLE_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-gang-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-crop-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-descreen-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-emboss-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-varnish-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-mat-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-heal-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-clone-listing-ids");
  assert.notEqual(DESPECKLE_COOKIE_NAME, "iss-dust-listing-ids");
});
