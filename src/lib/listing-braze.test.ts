import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_COOKIE_NAME, ANNEAL_STORAGE_KEY } from "./listing-anneal";
import {
  BRAZE_CHAIR_ID,
  BRAZE_COOKIE_NAME,
  BRAZE_GIFT_ID,
  BRAZE_HOST_ID,
  BRAZE_LEAVE_LINE,
  BRAZE_LID_ID,
  BRAZE_MUG_ID,
  BRAZE_NOTICE_TITLE,
  BRAZE_RECIPES_ID,
  BRAZE_STORAGE_KEY,
  BRAZE_ZINE_ID,
  brazeCookieValue,
  canTapeBraze,
  clearListingBraze,
  isListingBrazeOverlay,
  markListingBraze,
  parseBrazeListingIds,
  writeBrazeListingIds,
} from "./listing-braze";
import { PEEN_COOKIE_NAME, PEEN_STORAGE_KEY } from "./listing-peen";
import { QUENCH_COOKIE_NAME, QUENCH_STORAGE_KEY } from "./listing-quench";
import { TRUSS_COOKIE_NAME, TRUSS_STORAGE_KEY } from "./listing-truss";
import { UPSET_COOKIE_NAME, UPSET_STORAGE_KEY } from "./listing-upset";

test("cookie and storage keys stay the braze paper names", () => {
  assert.equal(BRAZE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.equal(BRAZE_COOKIE_NAME, "iss-braze-listing-ids");
  assert.equal(BRAZE_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    BRAZE_NOTICE_TITLE,
    "I will not braze it. Still bent. Still metal.",
  );
  assert.equal(BRAZE_LEAVE_LINE, "Leave the splay");
  assert.notEqual(BRAZE_STORAGE_KEY, QUENCH_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, UPSET_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, TRUSS_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(BRAZE_COOKIE_NAME, QUENCH_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, UPSET_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, TRUSS_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, PEEN_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, ANNEAL_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, "iss-planish-listing-ids");
});

test("write-result objects never parse as a braze set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseBrazeListingIds(writeResult), []);
  assert.equal(
    isListingBrazeOverlay(
      "kdr-bent-whisk",
      parseBrazeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = brazeCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseBrazeListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById(BRAZE_MUG_ID);
  const lid = listingById(BRAZE_LID_ID);
  const recipes = listingById(BRAZE_RECIPES_ID);

  assert.ok(canTapeBraze(whisk));
  assert.equal(canTapeBraze(mug), false);
  assert.equal(canTapeBraze(lid), false);
  assert.equal(canTapeBraze(recipes), false);

  const taped = markListingBraze(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(brazeCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingBrazeOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingBrazeOverlay(BRAZE_MUG_ID, taped), false);
  assert.equal(isListingBrazeOverlay(BRAZE_LID_ID, taped), false);
  assert.equal(isListingBrazeOverlay(BRAZE_RECIPES_ID, taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, chair, gift, zine, and overlay-owned rows refuse a braze write", () => {
  const mug = listingById(BRAZE_MUG_ID);
  const lid = listingById(BRAZE_LID_ID);
  const recipes = listingById(BRAZE_RECIPES_ID);
  const chair = listingById(BRAZE_CHAIR_ID);
  const gift = listingById(BRAZE_GIFT_ID);
  const zine = listingById(BRAZE_ZINE_ID);
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeBraze(mug), false);
  assert.equal(canTapeBraze(lid), false);
  assert.equal(canTapeBraze(recipes), false);
  assert.equal(canTapeBraze(chair), false);
  assert.equal(canTapeBraze(gift), false);
  assert.equal(canTapeBraze(zine), false);
  assert.equal(canTapeBraze(jacket), false);
  assert.equal(canTapeBraze(soles), false);
  assert.equal(canTapeBraze(lamp), false);

  assert.equal(markListingBraze(mug, []), null);
  assert.equal(markListingBraze(lid, []), null);
  assert.equal(markListingBraze(recipes, []), null);
  assert.equal(markListingBraze(chair, []), null);
  assert.equal(markListingBraze(gift, []), null);
  assert.equal(markListingBraze(zine, []), null);
  assert.equal(markListingBraze(jacket, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(whisk);
  const before = {
    price: whisk.price,
    status: whisk.status,
    cartEligible: whisk.cartEligible,
  };
  const taped = markListingBraze(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingBraze(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(brazeCookieValue(cleared), "[]");
  assert.equal(isListingBrazeOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById(BRAZE_RECIPES_ID);
  const taped = markListingBraze(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingBraze(recipes, []), null);

  const cleared = clearListingBraze(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BRAZE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBraze(chair, []), null);
});

test("write never touches quench, planish, upset, truss, peen, or anneal storage keys", () => {
  writeBrazeListingIds(["kdr-bent-whisk"]);
  assert.equal(BRAZE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.equal(QUENCH_STORAGE_KEY, "iss:quench-listing-ids");
  assert.equal(UPSET_STORAGE_KEY, "iss:upset-listing-ids");
  assert.equal(TRUSS_STORAGE_KEY, "iss:truss-listing-ids");
  assert.equal(PEEN_STORAGE_KEY, "iss:peen-listing-ids");
  assert.equal(ANNEAL_STORAGE_KEY, "iss:anneal-listing-ids");
  assert.notEqual(BRAZE_STORAGE_KEY, QUENCH_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, UPSET_STORAGE_KEY);
  assert.notEqual(BRAZE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(BRAZE_COOKIE_NAME, QUENCH_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, UPSET_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, TRUSS_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, PEEN_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, ANNEAL_COOKIE_NAME);
  assert.notEqual(BRAZE_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(BRAZE_COOKIE_NAME, "iss-upset-listing-ids");
  assert.notEqual(BRAZE_COOKIE_NAME, "iss-planish-listing-ids");
});
