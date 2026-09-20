import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GANG_STORAGE_KEY } from "./listing-gang";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { VARNISH_STORAGE_KEY } from "./listing-varnish";
import {
  DESCREEN_CHAIR_ID,
  DESCREEN_COOKIE_NAME,
  DESCREEN_GIFT_ID,
  DESCREEN_HOST_ID,
  DESCREEN_LEAVE_LINE,
  DESCREEN_LINER_ID,
  DESCREEN_NOTICE_TITLE,
  DESCREEN_PDF_ID,
  DESCREEN_STORAGE_KEY,
  DESCREEN_WHISK_ID,
  canTapeDescreen,
  clearListingDescreen,
  descreenCookieValue,
  isListingDescreenOverlay,
  markListingDescreen,
  parseDescreenListingIds,
  writeDescreenListingIds,
} from "./listing-descreen";

test("cookie and storage keys stay the descreen paper names", () => {
  assert.equal(DESCREEN_STORAGE_KEY, "iss:descreen-listing-ids");
  assert.equal(DESCREEN_COOKIE_NAME, "iss-descreen-listing-ids");
  assert.equal(DESCREEN_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    DESCREEN_NOTICE_TITLE,
    "I will not descreen them. Still three cards. Still grease.",
  );
  assert.equal(DESCREEN_LEAVE_LINE, "Leave the cards");
  assert.notEqual(DESCREEN_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(DESCREEN_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(DESCREEN_STORAGE_KEY, MAT_STORAGE_KEY);
});

test("write-result objects never parse as a descreen set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseDescreenListingIds(writeResult), []);
  assert.equal(
    isListingDescreenOverlay(
      "dl-drawer-recipes",
      parseDescreenListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = descreenCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseDescreenListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; liner, junk PDF, and whisk stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(DESCREEN_LINER_ID);
  const pdf = listingById(DESCREEN_PDF_ID);
  const whisk = listingById(DESCREEN_WHISK_ID);

  assert.ok(canTapeDescreen(recipes));
  assert.equal(canTapeDescreen(liner), false);
  assert.equal(canTapeDescreen(pdf), false);
  assert.equal(canTapeDescreen(whisk), false);

  const taped = markListingDescreen(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(descreenCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingDescreenOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingDescreenOverlay(DESCREEN_LINER_ID, taped), false);
  assert.equal(isListingDescreenOverlay(DESCREEN_PDF_ID, taped), false);
  assert.equal(isListingDescreenOverlay(DESCREEN_WHISK_ID, taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("whisk, gift, sold chair, liner, and junk PDF refuse a descreen write", () => {
  const whisk = listingById(DESCREEN_WHISK_ID);
  const gift = listingById(DESCREEN_GIFT_ID);
  const chair = listingById(DESCREEN_CHAIR_ID);
  const liner = listingById(DESCREEN_LINER_ID);
  const pdf = listingById(DESCREEN_PDF_ID);
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeDescreen(whisk), false);
  assert.equal(canTapeDescreen(gift), false);
  assert.equal(canTapeDescreen(chair), false);
  assert.equal(canTapeDescreen(liner), false);
  assert.equal(canTapeDescreen(pdf), false);
  assert.equal(canTapeDescreen(zine), false);

  assert.equal(markListingDescreen(whisk, []), null);
  assert.equal(markListingDescreen(gift, []), null);
  assert.equal(markListingDescreen(chair, []), null);
  assert.equal(markListingDescreen(liner, []), null);
  assert.equal(markListingDescreen(pdf, []), null);
  assert.equal(markListingDescreen(zine, []), null);
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
  const taped = markListingDescreen(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingDescreen(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(descreenCookieValue(cleared), "[]");
  assert.equal(isListingDescreenOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(DESCREEN_LINER_ID);
  const taped = markListingDescreen(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingDescreen(liner, []), null);

  const cleared = clearListingDescreen(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DESCREEN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDescreen(chair, []), null);
});

test("write never touches gang, crop, emboss, varnish, mat, or galley storage keys", () => {
  writeDescreenListingIds(["dl-drawer-recipes"]);
  assert.equal(DESCREEN_STORAGE_KEY, "iss:descreen-listing-ids");
  assert.equal(GANG_STORAGE_KEY, "iss:gang-listing-ids");
  assert.equal(VARNISH_STORAGE_KEY, "iss:varnish-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.notEqual(DESCREEN_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(DESCREEN_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(DESCREEN_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-gang-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-crop-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-emboss-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-varnish-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-mat-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-galley-listing-ids");
  assert.notEqual(DESCREEN_COOKIE_NAME, "iss-halftone-listing-ids");
});
