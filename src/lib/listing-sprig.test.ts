import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BISQUE_STORAGE_KEY } from "./listing-bisque";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import { GLAZE_STORAGE_KEY } from "./listing-glaze";
import { PICKLE_STORAGE_KEY } from "./listing-pickle";
import {
  SPRIG_CHAIR_ID,
  SPRIG_COOKIE_NAME,
  SPRIG_GIFT_ID,
  SPRIG_HOST_ID,
  SPRIG_LEAVE_LINE,
  SPRIG_LID_ID,
  SPRIG_NOTICE_TITLE,
  SPRIG_RECIPES_ID,
  SPRIG_STORAGE_KEY,
  SPRIG_WHISK_ID,
  SPRIG_ZINE_ID,
  canTapeSprig,
  clearListingSprig,
  isListingSprigOverlay,
  markListingSprig,
  parseSprigListingIds,
  sprigCookieValue,
  writeSprigListingIds,
} from "./listing-sprig";

test("cookie and storage keys stay the sprig paper names", () => {
  assert.equal(SPRIG_STORAGE_KEY, "iss:sprig-listing-ids");
  assert.equal(SPRIG_COOKIE_NAME, "iss-sprig-listing-ids");
  assert.equal(SPRIG_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    SPRIG_NOTICE_TITLE,
    "I will not sprig it. Still a chip. Still a mug.",
  );
  assert.equal(SPRIG_LEAVE_LINE, "Leave the chip");
  assert.notEqual(SPRIG_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(SPRIG_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(SPRIG_STORAGE_KEY, BISQUE_STORAGE_KEY);
  assert.notEqual(SPRIG_STORAGE_KEY, CHIP_STORAGE_KEY);
});

test("write-result objects never parse as a sprig set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseSprigListingIds(writeResult), []);
  assert.equal(
    isListingSprigOverlay(
      "kdr-chipped-mug",
      parseSprigListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = sprigCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseSprigListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(SPRIG_LID_ID);
  const whisk = listingById(SPRIG_WHISK_ID);
  const recipes = listingById(SPRIG_RECIPES_ID);

  assert.ok(canTapeSprig(mug));
  assert.equal(canTapeSprig(lid), false);
  assert.equal(canTapeSprig(whisk), false);
  assert.equal(canTapeSprig(recipes), false);

  const taped = markListingSprig(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(sprigCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingSprigOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingSprigOverlay(SPRIG_LID_ID, taped), false);
  assert.equal(isListingSprigOverlay(SPRIG_WHISK_ID, taped), false);
  assert.equal(isListingSprigOverlay(SPRIG_RECIPES_ID, taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a sprig write", () => {
  const lid = listingById(SPRIG_LID_ID);
  const whisk = listingById(SPRIG_WHISK_ID);
  const recipes = listingById(SPRIG_RECIPES_ID);
  const chair = listingById(SPRIG_CHAIR_ID);
  const gift = listingById(SPRIG_GIFT_ID);
  const zine = listingById(SPRIG_ZINE_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const pack = listingById("dl-sample-pack");

  assert.equal(canTapeSprig(lid), false);
  assert.equal(canTapeSprig(whisk), false);
  assert.equal(canTapeSprig(recipes), false);
  assert.equal(canTapeSprig(chair), false);
  assert.equal(canTapeSprig(gift), false);
  assert.equal(canTapeSprig(zine), false);
  assert.equal(canTapeSprig(lamp), false);
  assert.equal(canTapeSprig(pack), false);

  assert.equal(markListingSprig(lid, []), null);
  assert.equal(markListingSprig(whisk, []), null);
  assert.equal(markListingSprig(recipes, []), null);
  assert.equal(markListingSprig(chair, []), null);
  assert.equal(markListingSprig(gift, []), null);
  assert.equal(markListingSprig(zine, []), null);
  assert.equal(markListingSprig(lamp, []), null);
  assert.equal(markListingSprig(pack, []), null);
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
  const taped = markListingSprig(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingSprig(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(sprigCookieValue(cleared), "[]");
  assert.equal(isListingSprigOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(SPRIG_LID_ID);
  const taped = markListingSprig(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSprig(lid, []), null);

  const cleared = clearListingSprig(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SPRIG_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSprig(chair, []), null);
});

test("write never touches pickle, glaze, bisque, or chip storage keys", () => {
  writeSprigListingIds(["kdr-chipped-mug"]);
  assert.equal(SPRIG_STORAGE_KEY, "iss:sprig-listing-ids");
  assert.equal(PICKLE_STORAGE_KEY, "iss:pickle-listing-ids");
  assert.equal(GLAZE_STORAGE_KEY, "iss:glaze-listing-ids");
  assert.equal(BISQUE_STORAGE_KEY, "iss:bisque-listing-ids");
  assert.equal(CHIP_STORAGE_KEY, "iss:chip-listing-ids");
  assert.notEqual(SPRIG_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(SPRIG_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(SPRIG_COOKIE_NAME, "iss-pickle-listing-ids");
  assert.notEqual(SPRIG_COOKIE_NAME, "iss-glaze-listing-ids");
  assert.notEqual(SPRIG_COOKIE_NAME, "iss-bisque-listing-ids");
  assert.notEqual(SPRIG_COOKIE_NAME, "iss-chip-listing-ids");
  assert.notEqual(SPRIG_COOKIE_NAME, "iss-salt-listing-ids");
});
