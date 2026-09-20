import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_STORAGE_KEY } from "./listing-anneal";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import { QUENCH_STORAGE_KEY } from "./listing-quench";
import { TEMPER_STORAGE_KEY } from "./listing-temper";
import { TRUSS_STORAGE_KEY } from "./listing-truss";
import {
  UPSET_CHAIR_ID,
  UPSET_COOKIE_NAME,
  UPSET_HOST_ID,
  UPSET_LEAVE_LINE,
  UPSET_NOTICE_TITLE,
  UPSET_STORAGE_KEY,
  canTapeUpset,
  clearListingUpset,
  isListingUpsetOverlay,
  markListingUpset,
  parseUpsetListingIds,
  upsetCookieValue,
  writeUpsetListingIds,
} from "./listing-upset";

test("cookie and storage keys stay the upset paper names", () => {
  assert.equal(UPSET_STORAGE_KEY, "iss:upset-listing-ids");
  assert.equal(UPSET_COOKIE_NAME, "iss-upset-listing-ids");
  assert.equal(UPSET_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    UPSET_NOTICE_TITLE,
    "I will not upset it. Still bent. Still metal.",
  );
  assert.equal(UPSET_LEAVE_LINE, "Leave the splay");
  assert.notEqual(UPSET_STORAGE_KEY, QUENCH_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, TRUSS_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, TEMPER_STORAGE_KEY);
  assert.notEqual(UPSET_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-planish-listing-ids");
});

test("write-result objects never parse as an upset set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseUpsetListingIds(writeResult), []);
  assert.equal(
    isListingUpsetOverlay(
      "kdr-bent-whisk",
      parseUpsetListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = upsetCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseUpsetListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeUpset(whisk));
  assert.equal(canTapeUpset(mug), false);
  assert.equal(canTapeUpset(lid), false);
  assert.equal(canTapeUpset(recipes), false);

  const taped = markListingUpset(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(upsetCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingUpsetOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingUpsetOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingUpsetOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingUpsetOverlay("dl-drawer-recipes", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, and overlay-owned rows refuse an upset write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeUpset(mug), false);
  assert.equal(canTapeUpset(lid), false);
  assert.equal(canTapeUpset(recipes), false);
  assert.equal(canTapeUpset(gift), false);
  assert.equal(canTapeUpset(zine), false);
  assert.equal(canTapeUpset(jacket), false);
  assert.equal(canTapeUpset(soles), false);
  assert.equal(canTapeUpset(disc), false);
  assert.equal(canTapeUpset(mixtape), false);

  assert.equal(markListingUpset(mug, []), null);
  assert.equal(markListingUpset(lid, []), null);
  assert.equal(markListingUpset(recipes, []), null);
  assert.equal(markListingUpset(gift, []), null);
  assert.equal(markListingUpset(zine, []), null);
  assert.equal(markListingUpset(jacket, []), null);
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
  const taped = markListingUpset(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingUpset(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(upsetCookieValue(cleared), "[]");
  assert.equal(isListingUpsetOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const taped = markListingUpset(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingUpset(recipes, []), null);

  const cleared = clearListingUpset(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(UPSET_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingUpset(chair, []), null);
});

test("upset write never aliases quench, planish, truss, or peen paper", () => {
  writeUpsetListingIds(["kdr-bent-whisk"]);
  assert.equal(UPSET_STORAGE_KEY, "iss:upset-listing-ids");
  assert.equal(QUENCH_STORAGE_KEY, "iss:quench-listing-ids");
  assert.equal(TRUSS_STORAGE_KEY, "iss:truss-listing-ids");
  assert.equal(PEEN_STORAGE_KEY, "iss:peen-listing-ids");
  assert.notEqual(UPSET_STORAGE_KEY, QUENCH_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, TRUSS_STORAGE_KEY);
  assert.notEqual(UPSET_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(UPSET_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-planish-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-truss-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-peen-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-anneal-listing-ids");
  assert.notEqual(UPSET_COOKIE_NAME, "iss-temper-listing-ids");
});
