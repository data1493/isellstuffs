import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_STORAGE_KEY } from "./listing-anneal";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import { TEMPER_STORAGE_KEY } from "./listing-temper";
import { TRUSS_STORAGE_KEY } from "./listing-truss";
import {
  QUENCH_CHAIR_ID,
  QUENCH_COOKIE_NAME,
  QUENCH_HOST_ID,
  QUENCH_LEAVE_LINE,
  QUENCH_NOTICE_TITLE,
  QUENCH_STORAGE_KEY,
  canTapeQuench,
  clearListingQuench,
  isListingQuenchOverlay,
  markListingQuench,
  parseQuenchListingIds,
  quenchCookieValue,
} from "./listing-quench";

test("cookie and storage keys stay the quench paper names", () => {
  assert.equal(QUENCH_STORAGE_KEY, "iss:quench-listing-ids");
  assert.equal(QUENCH_COOKIE_NAME, "iss-quench-listing-ids");
  assert.equal(QUENCH_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    QUENCH_NOTICE_TITLE,
    "I will not quench it. Still a splay. Still a whisk.",
  );
  assert.equal(QUENCH_LEAVE_LINE, "Leave the splay");
  assert.notEqual(QUENCH_STORAGE_KEY, TEMPER_STORAGE_KEY);
  assert.notEqual(QUENCH_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(QUENCH_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(QUENCH_STORAGE_KEY, TRUSS_STORAGE_KEY);
  assert.notEqual(QUENCH_COOKIE_NAME, "iss-temper-listing-ids");
  assert.notEqual(QUENCH_COOKIE_NAME, "iss-anneal-listing-ids");
});

test("write-result objects never parse as a quench set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseQuenchListingIds(writeResult), []);
  assert.equal(
    isListingQuenchOverlay(
      "kdr-bent-whisk",
      parseQuenchListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = quenchCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseQuenchListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeQuench(whisk));
  assert.equal(canTapeQuench(mug), false);
  assert.equal(canTapeQuench(lid), false);
  assert.equal(canTapeQuench(recipes), false);

  const taped = markListingQuench(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(quenchCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingQuenchOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingQuenchOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingQuenchOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingQuenchOverlay("dl-drawer-recipes", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, and overlay-owned rows refuse a quench write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeQuench(mug), false);
  assert.equal(canTapeQuench(lid), false);
  assert.equal(canTapeQuench(recipes), false);
  assert.equal(canTapeQuench(gift), false);
  assert.equal(canTapeQuench(zine), false);
  assert.equal(canTapeQuench(jacket), false);
  assert.equal(canTapeQuench(soles), false);
  assert.equal(canTapeQuench(disc), false);
  assert.equal(canTapeQuench(mixtape), false);

  assert.equal(markListingQuench(mug, []), null);
  assert.equal(markListingQuench(lid, []), null);
  assert.equal(markListingQuench(recipes, []), null);
  assert.equal(markListingQuench(gift, []), null);
  assert.equal(markListingQuench(zine, []), null);
  assert.equal(markListingQuench(jacket, []), null);
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
  const taped = markListingQuench(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingQuench(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(quenchCookieValue(cleared), "[]");
  assert.equal(isListingQuenchOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const taped = markListingQuench(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingQuench(recipes, []), null);

  const cleared = clearListingQuench(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(QUENCH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingQuench(chair, []), null);
});

test("quench write never aliases temper or anneal paper", () => {
  assert.notEqual(QUENCH_STORAGE_KEY, "iss:temper-listing-ids");
  assert.notEqual(QUENCH_STORAGE_KEY, "iss:anneal-listing-ids");
  assert.notEqual(QUENCH_STORAGE_KEY, "iss:peen-listing-ids");
  assert.notEqual(QUENCH_STORAGE_KEY, "iss:truss-listing-ids");
  assert.notEqual(QUENCH_COOKIE_NAME, "iss-temper-listing-ids");
  assert.notEqual(QUENCH_COOKIE_NAME, "iss-anneal-listing-ids");
});
