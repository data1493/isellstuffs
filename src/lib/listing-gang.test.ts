import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GALLEY_STORAGE_KEY } from "./listing-galley";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { REGISTER_STORAGE_KEY } from "./listing-register";
import { VARNISH_STORAGE_KEY } from "./listing-varnish";
import {
  GANG_BOY_ID,
  GANG_CHAIR_ID,
  GANG_COOKIE_NAME,
  GANG_GIFT_ID,
  GANG_HOST_ID,
  GANG_LEAVE_LINE,
  GANG_LINER_ID,
  GANG_NOTICE_TITLE,
  GANG_PDF_ID,
  GANG_STORAGE_KEY,
  GANG_WHISK_ID,
  canTapeGang,
  clearListingGang,
  gangCookieValue,
  isListingGangOverlay,
  markListingGang,
  parseGangListingIds,
  writeGangListingIds,
} from "./listing-gang";

test("cookie and storage keys stay the gang paper names", () => {
  assert.equal(GANG_STORAGE_KEY, "iss:gang-listing-ids");
  assert.equal(GANG_COOKIE_NAME, "iss-gang-listing-ids");
  assert.equal(GANG_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    GANG_NOTICE_TITLE,
    "I will not gang them. Still three cards. Still grease.",
  );
  assert.equal(GANG_LEAVE_LINE, "Leave the cards");
  assert.notEqual(GANG_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, GALLEY_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, REGISTER_STORAGE_KEY);
});

test("write-result objects never parse as a gang set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseGangListingIds(writeResult), []);
  assert.equal(
    isListingGangOverlay(
      "dl-drawer-recipes",
      parseGangListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gangCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseGangListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; liner, junk PDF, and font stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(GANG_LINER_ID);
  const pdf = listingById(GANG_PDF_ID);
  const font = listingById("dl-booth-font");

  assert.ok(canTapeGang(recipes));
  assert.equal(canTapeGang(liner), false);
  assert.equal(canTapeGang(pdf), false);
  assert.equal(canTapeGang(font), false);

  const taped = markListingGang(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(gangCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingGangOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingGangOverlay(GANG_LINER_ID, taped), false);
  assert.equal(isListingGangOverlay(GANG_PDF_ID, taped), false);
  assert.equal(isListingGangOverlay("dl-booth-font", taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("Game Boy, gift, sold chair, whisk, liner, and junk PDF refuse a gang write", () => {
  const boy = listingById(GANG_BOY_ID);
  const gift = listingById(GANG_GIFT_ID);
  const chair = listingById(GANG_CHAIR_ID);
  const whisk = listingById(GANG_WHISK_ID);
  const liner = listingById(GANG_LINER_ID);
  const pdf = listingById(GANG_PDF_ID);
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeGang(boy), false);
  assert.equal(canTapeGang(gift), false);
  assert.equal(canTapeGang(chair), false);
  assert.equal(canTapeGang(whisk), false);
  assert.equal(canTapeGang(liner), false);
  assert.equal(canTapeGang(pdf), false);
  assert.equal(canTapeGang(zine), false);

  assert.equal(markListingGang(boy, []), null);
  assert.equal(markListingGang(gift, []), null);
  assert.equal(markListingGang(chair, []), null);
  assert.equal(markListingGang(whisk, []), null);
  assert.equal(markListingGang(liner, []), null);
  assert.equal(markListingGang(pdf, []), null);
  assert.equal(markListingGang(zine, []), null);
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
  const taped = markListingGang(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingGang(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gangCookieValue(cleared), "[]");
  assert.equal(isListingGangOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const liner = listingById(GANG_LINER_ID);
  const taped = markListingGang(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingGang(liner, []), null);

  const cleared = clearListingGang(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GANG_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGang(chair, []), null);
});

test("write never touches crop, emboss, varnish, mat, galley, or register storage keys", () => {
  writeGangListingIds(["dl-drawer-recipes"]);
  assert.equal(GANG_STORAGE_KEY, "iss:gang-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.equal(GALLEY_STORAGE_KEY, "iss:galley-listing-ids");
  assert.equal(VARNISH_STORAGE_KEY, "iss:varnish-listing-ids");
  assert.equal(REGISTER_STORAGE_KEY, "iss:register-listing-ids");
  assert.notEqual(GANG_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, GALLEY_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, VARNISH_STORAGE_KEY);
  assert.notEqual(GANG_STORAGE_KEY, REGISTER_STORAGE_KEY);
  assert.notEqual(GANG_COOKIE_NAME, "iss-crop-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-emboss-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-varnish-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-mat-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-galley-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-impose-listing-ids");
  assert.notEqual(GANG_COOKIE_NAME, "iss-register-listing-ids");
});
