import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BISQUE_STORAGE_KEY } from "./listing-bisque";
import { GLAZE_STORAGE_KEY } from "./listing-glaze";
import { JIGGER_COOKIE_NAME, JIGGER_STORAGE_KEY } from "./listing-jigger";
import { PICKLE_STORAGE_KEY } from "./listing-pickle";
import { SPRIG_COOKIE_NAME, SPRIG_STORAGE_KEY } from "./listing-sprig";
import {
  STILT_CHAIR_ID,
  STILT_COOKIE_NAME,
  STILT_GIFT_ID,
  STILT_HOST_ID,
  STILT_LEAVE_LINE,
  STILT_LID_ID,
  STILT_NOTICE_TITLE,
  STILT_RECIPES_ID,
  STILT_STORAGE_KEY,
  STILT_WHISK_ID,
  STILT_ZINE_ID,
  canTapeStilt,
  clearListingStilt,
  isListingStiltOverlay,
  markListingStilt,
  parseStiltListingIds,
  readStiltListingIds,
  stiltCookieValue,
  writeStiltListingIds,
} from "./listing-stilt";

test("cookie and storage keys stay the stilt paper names", () => {
  assert.equal(STILT_STORAGE_KEY, "iss:stilt-listing-ids");
  assert.equal(STILT_COOKIE_NAME, "iss-stilt-listing-ids");
  assert.equal(STILT_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    STILT_NOTICE_TITLE,
    "I will not stilt it. Still a diner rim. Still holds coffee.",
  );
  assert.equal(STILT_LEAVE_LINE, "Leave the rim");
  assert.notEqual(STILT_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, JIGGER_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, BISQUE_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, "iss:salt-listing-ids");
});

test("write-result objects never parse as a stilt set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseStiltListingIds(writeResult), []);
  assert.equal(
    isListingStiltOverlay(
      "kdr-chipped-mug",
      parseStiltListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = stiltCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseStiltListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(STILT_LID_ID);
  const whisk = listingById(STILT_WHISK_ID);
  const recipes = listingById(STILT_RECIPES_ID);

  assert.ok(canTapeStilt(mug));
  assert.equal(canTapeStilt(lid), false);
  assert.equal(canTapeStilt(whisk), false);
  assert.equal(canTapeStilt(recipes), false);

  const taped = markListingStilt(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(stiltCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingStiltOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingStiltOverlay(STILT_LID_ID, taped), false);
  assert.equal(isListingStiltOverlay(STILT_WHISK_ID, taped), false);
  assert.equal(isListingStiltOverlay(STILT_RECIPES_ID, taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a stilt write", () => {
  const lid = listingById(STILT_LID_ID);
  const whisk = listingById(STILT_WHISK_ID);
  const recipes = listingById(STILT_RECIPES_ID);
  const chair = listingById(STILT_CHAIR_ID);
  const gift = listingById(STILT_GIFT_ID);
  const zine = listingById(STILT_ZINE_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const pack = listingById("dl-sample-pack");

  assert.equal(canTapeStilt(lid), false);
  assert.equal(canTapeStilt(whisk), false);
  assert.equal(canTapeStilt(recipes), false);
  assert.equal(canTapeStilt(chair), false);
  assert.equal(canTapeStilt(gift), false);
  assert.equal(canTapeStilt(zine), false);
  assert.equal(canTapeStilt(lamp), false);
  assert.equal(canTapeStilt(pack), false);

  assert.equal(markListingStilt(lid, []), null);
  assert.equal(markListingStilt(whisk, []), null);
  assert.equal(markListingStilt(recipes, []), null);
  assert.equal(markListingStilt(chair, []), null);
  assert.equal(markListingStilt(gift, []), null);
  assert.equal(markListingStilt(zine, []), null);
  assert.equal(markListingStilt(lamp, []), null);
  assert.equal(markListingStilt(pack, []), null);
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
  const taped = markListingStilt(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingStilt(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(stiltCookieValue(cleared), "[]");
  assert.equal(isListingStiltOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(STILT_LID_ID);
  const taped = markListingStilt(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingStilt(lid, []), null);

  const cleared = clearListingStilt(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(STILT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingStilt(chair, []), null);
});

test("stilt write does not write sprig, salt, or jigger paper", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingStilt(mug, []);
  assert.ok(taped);
  writeStiltListingIds(taped);
  assert.deepEqual(readStiltListingIds(), ["kdr-chipped-mug"]);
  assert.notEqual(STILT_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, JIGGER_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, "iss:salt-listing-ids");
  assert.notEqual(STILT_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(STILT_STORAGE_KEY, BISQUE_STORAGE_KEY);
  assert.notEqual(STILT_COOKIE_NAME, SPRIG_COOKIE_NAME);
  assert.notEqual(STILT_COOKIE_NAME, JIGGER_COOKIE_NAME);
  assert.notEqual(STILT_COOKIE_NAME, "iss-salt-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-pickle-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-glaze-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-bisque-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-prop-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-setter-listing-ids");
  assert.notEqual(STILT_COOKIE_NAME, "iss-spur-listing-ids");
  writeStiltListingIds([]);
});
