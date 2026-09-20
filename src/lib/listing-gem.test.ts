import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHANNEL_COOKIE_NAME, CHANNEL_STORAGE_KEY } from "./listing-channel";
import { EDGE_COOKIE_NAME, EDGE_STORAGE_KEY } from "./listing-edge";
import { SHANK_COOKIE_NAME, SHANK_STORAGE_KEY } from "./listing-shank";
import { SKIVE_STORAGE_KEY } from "./listing-skive";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  GEM_CHAIR_ID,
  GEM_COOKIE_NAME,
  GEM_GIFT_ID,
  GEM_HOST_ID,
  GEM_JACKET_ID,
  GEM_LEAVE_LINE,
  GEM_LID_ID,
  GEM_NOTICE_TITLE,
  GEM_RECIPES_ID,
  GEM_STORAGE_KEY,
  GEM_ZINE_ID,
  canTapeGem,
  clearListingGem,
  gemCookieValue,
  isListingGemOverlay,
  markListingGem,
  parseGemListingIds,
  writeGemListingIds,
} from "./listing-gem";

test("cookie and storage keys stay the gem paper names", () => {
  assert.equal(GEM_STORAGE_KEY, "iss:gem-listing-ids");
  assert.equal(GEM_COOKIE_NAME, "iss-gem-listing-ids");
  assert.equal(GEM_HOST_ID, "clo-split-soles");
  assert.equal(
    GEM_NOTICE_TITLE,
    "I will not gem them. Still a flex. Still original laces.",
  );
  assert.equal(GEM_LEAVE_LINE, "Leave the flex");
  assert.notEqual(GEM_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, CHANNEL_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(GEM_STORAGE_KEY, "iss:rand-listing-ids");
  assert.notEqual(GEM_STORAGE_KEY, "iss:holdfast-listing-ids");
  assert.notEqual(GEM_STORAGE_KEY, "iss:gemming-listing-ids");
  assert.notEqual(GEM_STORAGE_KEY, "iss:inseam-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, SHANK_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, EDGE_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, CHANNEL_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-welt-listing-ids");
});

test("write-result objects never parse as a gem set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseGemListingIds(writeResult), []);
  assert.equal(
    isListingGemOverlay(
      "clo-split-soles",
      parseGemListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gemCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseGemListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, lid, and recipes stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(GEM_JACKET_ID);
  const lid = listingById(GEM_LID_ID);
  const recipes = listingById(GEM_RECIPES_ID);

  assert.ok(canTapeGem(soles));
  assert.equal(canTapeGem(jacket), false);
  assert.equal(canTapeGem(lid), false);
  assert.equal(canTapeGem(recipes), false);

  const taped = markListingGem(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(gemCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingGemOverlay("clo-split-soles", taped), true);
  assert.equal(isListingGemOverlay(GEM_JACKET_ID, taped), false);
  assert.equal(isListingGemOverlay(GEM_LID_ID, taped), false);
  assert.equal(isListingGemOverlay(GEM_RECIPES_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("jacket, lid, recipes, gift, zine, and chair refuse a gem write", () => {
  const jacket = listingById(GEM_JACKET_ID);
  const lid = listingById(GEM_LID_ID);
  const recipes = listingById(GEM_RECIPES_ID);
  const gift = listingById(GEM_GIFT_ID);
  const zine = listingById(GEM_ZINE_ID);
  const chair = listingById(GEM_CHAIR_ID);

  assert.equal(canTapeGem(jacket), false);
  assert.equal(canTapeGem(lid), false);
  assert.equal(canTapeGem(recipes), false);
  assert.equal(canTapeGem(gift), false);
  assert.equal(canTapeGem(zine), false);
  assert.equal(canTapeGem(chair), false);

  assert.equal(markListingGem(jacket, []), null);
  assert.equal(markListingGem(lid, []), null);
  assert.equal(markListingGem(recipes, []), null);
  assert.equal(markListingGem(gift, []), null);
  assert.equal(markListingGem(zine, []), null);
  assert.equal(markListingGem(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const soles = listingById("clo-split-soles");
  assert.ok(soles);
  const before = {
    price: soles.price,
    status: soles.status,
    cartEligible: soles.cartEligible,
  };
  const taped = markListingGem(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingGem(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gemCookieValue(cleared), "[]");
  assert.equal(isListingGemOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(GEM_JACKET_ID);
  const taped = markListingGem(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGem(jacket, []), null);

  const cleared = clearListingGem(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GEM_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGem(chair, []), null);
});

test("gem write does not write shank, edge, channel, or welt paper", () => {
  const soles = listingById("clo-split-soles");
  const taped = markListingGem(soles, []);
  assert.ok(taped);
  writeGemListingIds(taped);
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(GEM_STORAGE_KEY, "iss:gem-listing-ids");
  assert.equal(SHANK_STORAGE_KEY, "iss:shank-listing-ids");
  assert.equal(EDGE_STORAGE_KEY, "iss:edge-listing-ids");
  assert.equal(CHANNEL_STORAGE_KEY, "iss:channel-listing-ids");
  assert.equal(SKIVE_STORAGE_KEY, "iss:skive-listing-ids");
  assert.equal(WELT_STORAGE_KEY, "iss:welt-listing-ids");
  assert.notEqual(GEM_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(GEM_STORAGE_KEY, CHANNEL_STORAGE_KEY);
  assert.notEqual(GEM_COOKIE_NAME, SHANK_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, EDGE_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, CHANNEL_COOKIE_NAME);
  assert.notEqual(GEM_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-welt-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-holdfast-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-gemming-listing-ids");
  assert.notEqual(GEM_COOKIE_NAME, "iss-inseam-listing-ids");
});
