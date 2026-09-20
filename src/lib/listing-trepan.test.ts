import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import {
  TREPAN_CHAIR_ID,
  TREPAN_COOKIE_NAME,
  TREPAN_GIFT_ID,
  TREPAN_HOST_ID,
  TREPAN_LEAVE_LINE,
  TREPAN_MUG_ID,
  TREPAN_NOTICE_TITLE,
  TREPAN_RECIPES_ID,
  TREPAN_STORAGE_KEY,
  TREPAN_WHISK_ID,
  TREPAN_ZINE_ID,
  canTapeTrepan,
  clearListingTrepan,
  isListingTrepanOverlay,
  markListingTrepan,
  parseTrepanListingIds,
  readTrepanListingIds,
  trepanCookieValue,
  writeTrepanListingIds,
} from "./listing-trepan";

test("cookie and storage keys stay the trepan paper names", () => {
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TREPAN_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.equal(TREPAN_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    TREPAN_NOTICE_TITLE,
    "I will not trepan it. Still a lid. Still no pot.",
  );
  assert.equal(TREPAN_LEAVE_LINE, "Leave the hole");
  assert.notEqual(TREPAN_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(TREPAN_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:joggle-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:groove-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:annulus-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:circular-listing-ids");
  assert.notEqual(TREPAN_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(TREPAN_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(TREPAN_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(TREPAN_COOKIE_NAME, "iss-spotface-listing-ids");
});

test("write-result objects never parse as a trepan set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseTrepanListingIds(writeResult), []);
  assert.equal(
    isListingTrepanOverlay(
      "kdr-lid-no-pot",
      parseTrepanListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseTrepanListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = trepanCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseTrepanListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById(TREPAN_HOST_ID);
  const whisk = listingById(TREPAN_WHISK_ID);
  const mug = listingById(TREPAN_MUG_ID);
  const recipes = listingById(TREPAN_RECIPES_ID);
  assert.ok(canTapeTrepan(lid));
  assert.equal(canTapeTrepan(whisk), false);
  assert.equal(canTapeTrepan(mug), false);
  assert.equal(canTapeTrepan(recipes), false);

  const taped = markListingTrepan(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(trepanCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingTrepanOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingTrepanOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingTrepanOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingTrepanOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, and overlay-owned rows refuse a trepan write", () => {
  const whisk = listingById(TREPAN_WHISK_ID);
  const mug = listingById(TREPAN_MUG_ID);
  const recipes = listingById(TREPAN_RECIPES_ID);
  const gift = listingById(TREPAN_GIFT_ID);
  const zine = listingById(TREPAN_ZINE_ID);
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeTrepan(whisk), false);
  assert.equal(canTapeTrepan(mug), false);
  assert.equal(canTapeTrepan(recipes), false);
  assert.equal(canTapeTrepan(gift), false);
  assert.equal(canTapeTrepan(zine), false);
  assert.equal(canTapeTrepan(mixtape), false);

  assert.equal(markListingTrepan(whisk, []), null);
  assert.equal(markListingTrepan(mug, []), null);
  assert.equal(markListingTrepan(recipes, []), null);
  assert.equal(markListingTrepan(gift, []), null);
  assert.equal(markListingTrepan(zine, []), null);
  assert.equal(markListingTrepan(mixtape, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lid = listingById(TREPAN_HOST_ID);
  assert.ok(lid);
  const before = {
    price: lid.price,
    status: lid.status,
    cartEligible: lid.cartEligible,
  };
  const taped = markListingTrepan(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById(TREPAN_HOST_ID);
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById(TREPAN_HOST_ID);
  const cleared = clearListingTrepan(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(trepanCookieValue(cleared), "[]");
  assert.equal(isListingTrepanOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById(TREPAN_HOST_ID);
  const recipes = listingById(TREPAN_RECIPES_ID);
  const taped = markListingTrepan(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingTrepan(recipes, []), null);

  const cleared = clearListingTrepan(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TREPAN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTrepan(chair, []), null);
});

test("trepan write never aliases snug, countersink, spotface, or tap paper", () => {
  const lid = listingById(TREPAN_HOST_ID);
  const taped = markListingTrepan(lid, []);
  assert.ok(taped);
  writeTrepanListingIds(taped);
  assert.deepEqual(readTrepanListingIds(), ["kdr-lid-no-pot"]);
  assert.notEqual(TREPAN_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(TREPAN_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(TREPAN_STORAGE_KEY, "iss:joggle-listing-ids");
  assert.notEqual(TREPAN_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(TREPAN_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(TREPAN_COOKIE_NAME, "iss-countersink-listing-ids");
  writeTrepanListingIds([]);
});
