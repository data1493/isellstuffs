import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DESCREEN_STORAGE_KEY } from "./listing-descreen";
import { DESPECKLE_STORAGE_KEY } from "./listing-despeckle";
import { GANG_STORAGE_KEY } from "./listing-gang";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { VARNISH_STORAGE_KEY } from "./listing-varnish";
import {
  KNOCKOUT_CHAIR_ID,
  KNOCKOUT_COOKIE_NAME,
  KNOCKOUT_GIFT_ID,
  KNOCKOUT_HOST_ID,
  KNOCKOUT_LEAVE_LINE,
  KNOCKOUT_LINER_ID,
  KNOCKOUT_NOTICE_TITLE,
  KNOCKOUT_PDF_ID,
  KNOCKOUT_STORAGE_KEY,
  KNOCKOUT_WHISK_ID,
  canTapeKnockout,
  clearListingKnockout,
  isListingKnockoutOverlay,
  knockoutCookieValue,
  markListingKnockout,
  parseKnockoutListingIds,
  writeKnockoutListingIds,
} from "./listing-knockout";

test("cookie and storage keys stay the knockout paper names", () => {
  assert.equal(KNOCKOUT_STORAGE_KEY, "iss:knockout-listing-ids");
  assert.equal(KNOCKOUT_COOKIE_NAME, "iss-knockout-listing-ids");
  assert.equal(KNOCKOUT_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    KNOCKOUT_NOTICE_TITLE,
    "I will not knockout them. Still three cards. Still grease.",
  );
  assert.equal(KNOCKOUT_LEAVE_LINE, "Leave the cards");
  assert.notEqual(KNOCKOUT_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, DESPECKLE_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, DESCREEN_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, MAT_STORAGE_KEY);
});

test("write-result objects never parse as a knockout set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseKnockoutListingIds(writeResult), []);
  assert.equal(
    isListingKnockoutOverlay(
      "dl-drawer-recipes",
      parseKnockoutListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = knockoutCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseKnockoutListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; liner, junk PDF, and font stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(KNOCKOUT_LINER_ID);
  const pdf = listingById(KNOCKOUT_PDF_ID);
  const font = listingById("dl-booth-font");

  assert.ok(canTapeKnockout(recipes));
  assert.equal(canTapeKnockout(liner), false);
  assert.equal(canTapeKnockout(pdf), false);
  assert.equal(canTapeKnockout(font), false);

  const taped = markListingKnockout(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(knockoutCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingKnockoutOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingKnockoutOverlay(KNOCKOUT_LINER_ID, taped), false);
  assert.equal(isListingKnockoutOverlay(KNOCKOUT_PDF_ID, taped), false);
  assert.equal(isListingKnockoutOverlay("dl-booth-font", taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("whisk, gift, sold chair, liner, and junk PDF refuse a knockout write", () => {
  const boy = listingById("gtk-game-boy");
  const gift = listingById(KNOCKOUT_GIFT_ID);
  const chair = listingById(KNOCKOUT_CHAIR_ID);
  const whisk = listingById(KNOCKOUT_WHISK_ID);
  const liner = listingById(KNOCKOUT_LINER_ID);
  const pdf = listingById(KNOCKOUT_PDF_ID);
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeKnockout(boy), false);
  assert.equal(canTapeKnockout(gift), false);
  assert.equal(canTapeKnockout(chair), false);
  assert.equal(canTapeKnockout(whisk), false);
  assert.equal(canTapeKnockout(liner), false);
  assert.equal(canTapeKnockout(pdf), false);
  assert.equal(canTapeKnockout(zine), false);

  assert.equal(markListingKnockout(boy, []), null);
  assert.equal(markListingKnockout(gift, []), null);
  assert.equal(markListingKnockout(chair, []), null);
  assert.equal(markListingKnockout(whisk, []), null);
  assert.equal(markListingKnockout(liner, []), null);
  assert.equal(markListingKnockout(pdf, []), null);
  assert.equal(markListingKnockout(zine, []), null);
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
  const taped = markListingKnockout(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingKnockout(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(knockoutCookieValue(cleared), "[]");
  assert.equal(isListingKnockoutOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(KNOCKOUT_LINER_ID);
  const taped = markListingKnockout(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingKnockout(liner, []), null);

  const cleared = clearListingKnockout(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(KNOCKOUT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingKnockout(chair, []), null);
});

test("write never touches gang, despeckle, descreen, crop, emboss, or varnish storage keys", () => {
  writeKnockoutListingIds(["dl-drawer-recipes"]);
  assert.equal(KNOCKOUT_STORAGE_KEY, "iss:knockout-listing-ids");
  assert.equal(GANG_STORAGE_KEY, "iss:gang-listing-ids");
  assert.equal(DESPECKLE_STORAGE_KEY, "iss:despeckle-listing-ids");
  assert.equal(DESCREEN_STORAGE_KEY, "iss:descreen-listing-ids");
  assert.equal(VARNISH_STORAGE_KEY, "iss:varnish-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.notEqual(KNOCKOUT_STORAGE_KEY, GANG_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, DESPECKLE_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, DESCREEN_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-gang-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-despeckle-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-descreen-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-crop-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-emboss-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-varnish-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-overprint-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-sepr-listing-ids");
  assert.notEqual(KNOCKOUT_COOKIE_NAME, "iss-knock-listing-ids");
});
