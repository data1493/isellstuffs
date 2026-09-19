import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import { HANDLE_STORAGE_KEY } from "./listing-handle";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import {
  GLAZE_CHAIR_ID,
  GLAZE_COOKIE_NAME,
  GLAZE_HOST_ID,
  GLAZE_LEAVE_LINE,
  GLAZE_NOTICE_TITLE,
  GLAZE_STORAGE_KEY,
  canTapeGlaze,
  clearListingGlaze,
  glazeCookieValue,
  isListingGlazeOverlay,
  markListingGlaze,
  parseGlazeListingIds,
} from "./listing-glaze";

test("cookie and storage keys stay the glaze paper names", () => {
  assert.equal(GLAZE_STORAGE_KEY, "iss:glaze-listing-ids");
  assert.equal(GLAZE_COOKIE_NAME, "iss-glaze-listing-ids");
  assert.equal(GLAZE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    GLAZE_NOTICE_TITLE,
    "I will not glaze it. Still a chip. Still a mug.",
  );
  assert.equal(GLAZE_LEAVE_LINE, "Leave the chip");
  assert.notEqual(GLAZE_STORAGE_KEY, CHIP_STORAGE_KEY);
  assert.notEqual(GLAZE_STORAGE_KEY, HANDLE_STORAGE_KEY);
  assert.notEqual(GLAZE_STORAGE_KEY, PEEN_STORAGE_KEY);
});

test("write-result objects never parse as a glaze set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseGlazeListingIds(writeResult), []);
  assert.equal(
    isListingGlazeOverlay(
      "kdr-chipped-mug",
      parseGlazeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = glazeCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseGlazeListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeGlaze(mug));
  assert.equal(canTapeGlaze(lid), false);
  assert.equal(canTapeGlaze(whisk), false);
  assert.equal(canTapeGlaze(recipes), false);

  const taped = markListingGlaze(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(glazeCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingGlazeOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingGlazeOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingGlazeOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingGlazeOverlay("dl-drawer-recipes", taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a glaze write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const chair = listingById(GLAZE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeGlaze(lid), false);
  assert.equal(canTapeGlaze(whisk), false);
  assert.equal(canTapeGlaze(recipes), false);
  assert.equal(canTapeGlaze(chair), false);
  assert.equal(canTapeGlaze(gift), false);
  assert.equal(canTapeGlaze(zine), false);
  assert.equal(canTapeGlaze(jacket), false);
  assert.equal(canTapeGlaze(lamp), false);

  assert.equal(markListingGlaze(lid, []), null);
  assert.equal(markListingGlaze(whisk, []), null);
  assert.equal(markListingGlaze(recipes, []), null);
  assert.equal(markListingGlaze(chair, []), null);
  assert.equal(markListingGlaze(gift, []), null);
  assert.equal(markListingGlaze(zine, []), null);
  assert.equal(markListingGlaze(jacket, []), null);
  assert.equal(markListingGlaze(lamp, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mug = listingById("kdr-chipped-mug");
  assert.ok(mug);
  const before = {
    price: mug.price,
    status: mug.status,
    cartEligible: mug.cartEligible,
  };
  const taped = markListingGlaze(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingGlaze(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(glazeCookieValue(cleared), "[]");
  assert.equal(isListingGlazeOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingGlaze(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingGlaze(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
