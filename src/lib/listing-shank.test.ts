import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { EDGE_STORAGE_KEY } from "./listing-edge";
import { SKIVE_STORAGE_KEY } from "./listing-skive";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  SHANK_CHAIR_ID,
  SHANK_COOKIE_NAME,
  SHANK_HOST_ID,
  SHANK_JACKET_ID,
  SHANK_LEAVE_LINE,
  SHANK_LID_ID,
  SHANK_NOTICE_TITLE,
  SHANK_RECIPES_ID,
  SHANK_STORAGE_KEY,
  canTapeShank,
  clearListingShank,
  isListingShankOverlay,
  markListingShank,
  parseShankListingIds,
  shankCookieValue,
  writeShankListingIds,
} from "./listing-shank";

test("cookie and storage keys stay the shank paper names", () => {
  assert.equal(SHANK_STORAGE_KEY, "iss:shank-listing-ids");
  assert.equal(SHANK_COOKIE_NAME, "iss-shank-listing-ids");
  assert.equal(SHANK_HOST_ID, "clo-split-soles");
  assert.equal(
    SHANK_NOTICE_TITLE,
    "I will not shank them. Still a flex. Still original laces.",
  );
  assert.equal(SHANK_LEAVE_LINE, "Leave the flex");
  assert.notEqual(SHANK_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(SHANK_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(SHANK_STORAGE_KEY, WELT_STORAGE_KEY);
});

test("write-result objects never parse as a shank set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseShankListingIds(writeResult), []);
  assert.equal(
    isListingShankOverlay("clo-split-soles", parseShankListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = shankCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseShankListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, lid, and recipes stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(SHANK_JACKET_ID);
  const lid = listingById(SHANK_LID_ID);
  const recipes = listingById(SHANK_RECIPES_ID);

  assert.ok(canTapeShank(soles));
  assert.equal(canTapeShank(jacket), false);
  assert.equal(canTapeShank(lid), false);
  assert.equal(canTapeShank(recipes), false);

  const taped = markListingShank(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(shankCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingShankOverlay("clo-split-soles", taped), true);
  assert.equal(isListingShankOverlay(SHANK_JACKET_ID, taped), false);
  assert.equal(isListingShankOverlay(SHANK_LID_ID, taped), false);
  assert.equal(isListingShankOverlay(SHANK_RECIPES_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("jacket, lid, recipes, gift, zine, and chair refuse a shank write", () => {
  const jacket = listingById(SHANK_JACKET_ID);
  const lid = listingById(SHANK_LID_ID);
  const recipes = listingById(SHANK_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SHANK_CHAIR_ID);

  assert.equal(canTapeShank(jacket), false);
  assert.equal(canTapeShank(lid), false);
  assert.equal(canTapeShank(recipes), false);
  assert.equal(canTapeShank(gift), false);
  assert.equal(canTapeShank(zine), false);
  assert.equal(canTapeShank(chair), false);

  assert.equal(markListingShank(jacket, []), null);
  assert.equal(markListingShank(lid, []), null);
  assert.equal(markListingShank(recipes, []), null);
  assert.equal(markListingShank(gift, []), null);
  assert.equal(markListingShank(zine, []), null);
  assert.equal(markListingShank(chair, []), null);
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
  const taped = markListingShank(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingShank(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(shankCookieValue(cleared), "[]");
  assert.equal(isListingShankOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(SHANK_JACKET_ID);
  const taped = markListingShank(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingShank(jacket, []), null);

  const cleared = clearListingShank(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SHANK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingShank(chair, []), null);
});

test("write never touches edge or skive storage keys", () => {
  writeShankListingIds(["clo-split-soles"]);
  assert.equal(SHANK_STORAGE_KEY, "iss:shank-listing-ids");
  assert.equal(EDGE_STORAGE_KEY, "iss:edge-listing-ids");
  assert.equal(SKIVE_STORAGE_KEY, "iss:skive-listing-ids");
  assert.notEqual(SHANK_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(SHANK_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(SHANK_COOKIE_NAME, "iss-edge-listing-ids");
  assert.notEqual(SHANK_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(SHANK_COOKIE_NAME, "iss-welt-listing-ids");
  assert.notEqual(SHANK_COOKIE_NAME, "iss-foxing-listing-ids");
});
