import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CARDS_STORAGE_KEY } from "./listing-cards";
import { DOUBLE_STORAGE_KEY } from "./listing-double";
import { PAGINATE_STORAGE_KEY } from "./listing-paginate";
import {
  SCALE_COOKIE_NAME,
  SCALE_HOST_ID,
  SCALE_LEAVE_LINE,
  SCALE_NOTICE_TITLE,
  SCALE_STORAGE_KEY,
  canTapeScale,
  clearListingScale,
  isListingScaleOverlay,
  markListingScale,
  parseScaleListingIds,
  scaleCookieValue,
} from "./listing-scale";
import { VIBE_STORAGE_KEY } from "./listing-vibe";

test("cookie and storage keys stay the scale paper names", () => {
  assert.equal(SCALE_STORAGE_KEY, "iss:scale-listing-ids");
  assert.equal(SCALE_COOKIE_NAME, "iss-scale-listing-ids");
  assert.equal(SCALE_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    SCALE_NOTICE_TITLE,
    "I will not scale them. Still vibes. Still three cards.",
  );
  assert.equal(SCALE_LEAVE_LINE, "Leave the vibes");
  assert.notEqual(SCALE_STORAGE_KEY, CARDS_STORAGE_KEY);
  assert.notEqual(SCALE_STORAGE_KEY, VIBE_STORAGE_KEY);
  assert.notEqual(SCALE_STORAGE_KEY, DOUBLE_STORAGE_KEY);
  assert.notEqual(SCALE_STORAGE_KEY, PAGINATE_STORAGE_KEY);
});

test("write-result objects never parse as a scale set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseScaleListingIds(writeResult), []);
  assert.equal(
    isListingScaleOverlay(
      "dl-drawer-recipes",
      parseScaleListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = scaleCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseScaleListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; PDF, font, and lid stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const lid = listingById("kdr-lid-no-pot");

  assert.ok(canTapeScale(recipes));
  assert.equal(canTapeScale(pdf), false);
  assert.equal(canTapeScale(font), false);
  assert.equal(canTapeScale(lid), false);

  const taped = markListingScale(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(scaleCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingScaleOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingScaleOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingScaleOverlay("dl-booth-font", taped), false);
  assert.equal(isListingScaleOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("lid, gift, zine, PDF, font, and overlay-owned rows refuse a scale write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const chair = listingById("ysk-folding-chair");
  const pack = listingById("dl-sample-pack");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeScale(lid), false);
  assert.equal(canTapeScale(gift), false);
  assert.equal(canTapeScale(zine), false);
  assert.equal(canTapeScale(pdf), false);
  assert.equal(canTapeScale(font), false);
  assert.equal(canTapeScale(chair), false);
  assert.equal(canTapeScale(pack), false);
  assert.equal(canTapeScale(mixtape), false);

  assert.equal(markListingScale(lid, []), null);
  assert.equal(markListingScale(gift, []), null);
  assert.equal(markListingScale(zine, []), null);
  assert.equal(markListingScale(pdf, []), null);
  assert.equal(markListingScale(font, []), null);
  assert.equal(markListingScale(chair, []), null);
  assert.equal(markListingScale(pack, []), null);
  assert.equal(markListingScale(mixtape, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(recipes);
  const before = {
    price: recipes.price,
    status: recipes.status,
    cartEligible: recipes.cartEligible,
  };
  const taped = markListingScale(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingScale(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(scaleCookieValue(cleared), "[]");
  assert.equal(isListingScaleOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingScale(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingScale(lid, []), null);

  const cleared = clearListingScale(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
