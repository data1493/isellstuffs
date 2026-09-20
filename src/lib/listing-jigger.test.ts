import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BISQUE_COOKIE_NAME, BISQUE_STORAGE_KEY } from "./listing-bisque";
import { GLAZE_COOKIE_NAME, GLAZE_STORAGE_KEY } from "./listing-glaze";
import {
  JIGGER_CHAIR_ID,
  JIGGER_COOKIE_NAME,
  JIGGER_GIFT_ID,
  JIGGER_HOST_ID,
  JIGGER_LEAVE_LINE,
  JIGGER_LID_ID,
  JIGGER_NOTICE_TITLE,
  JIGGER_RECIPES_ID,
  JIGGER_STORAGE_KEY,
  JIGGER_WHISK_ID,
  JIGGER_ZINE_ID,
  canTapeJigger,
  clearListingJigger,
  isListingJiggerOverlay,
  jiggerCookieValue,
  markListingJigger,
  parseJiggerListingIds,
  writeJiggerListingIds,
} from "./listing-jigger";
import { PICKLE_COOKIE_NAME, PICKLE_STORAGE_KEY } from "./listing-pickle";
import { SPRIG_COOKIE_NAME, SPRIG_STORAGE_KEY } from "./listing-sprig";

test("cookie and storage keys stay the jigger paper names", () => {
  assert.equal(JIGGER_STORAGE_KEY, "iss:jigger-listing-ids");
  assert.equal(JIGGER_COOKIE_NAME, "iss-jigger-listing-ids");
  assert.equal(JIGGER_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    JIGGER_NOTICE_TITLE,
    "I will not jigger it. Still a diner rim. Still holds coffee.",
  );
  assert.equal(JIGGER_LEAVE_LINE, "Leave the rim");
  assert.notEqual(JIGGER_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, BISQUE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, "iss:salt-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, SPRIG_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, PICKLE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, GLAZE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, BISQUE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-salt-listing-ids");
});

test("write-result objects never parse as a jigger set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseJiggerListingIds(writeResult), []);
  assert.equal(
    isListingJiggerOverlay(
      "kdr-chipped-mug",
      parseJiggerListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = jiggerCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseJiggerListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(JIGGER_LID_ID);
  const whisk = listingById(JIGGER_WHISK_ID);
  const recipes = listingById(JIGGER_RECIPES_ID);

  assert.ok(canTapeJigger(mug));
  assert.equal(canTapeJigger(lid), false);
  assert.equal(canTapeJigger(whisk), false);
  assert.equal(canTapeJigger(recipes), false);

  const taped = markListingJigger(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(jiggerCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingJiggerOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingJiggerOverlay(JIGGER_LID_ID, taped), false);
  assert.equal(isListingJiggerOverlay(JIGGER_WHISK_ID, taped), false);
  assert.equal(isListingJiggerOverlay(JIGGER_RECIPES_ID, taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a jigger write", () => {
  const lid = listingById(JIGGER_LID_ID);
  const whisk = listingById(JIGGER_WHISK_ID);
  const recipes = listingById(JIGGER_RECIPES_ID);
  const chair = listingById(JIGGER_CHAIR_ID);
  const gift = listingById(JIGGER_GIFT_ID);
  const zine = listingById(JIGGER_ZINE_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const pack = listingById("dl-sample-pack");
  const lp = listingById("mdb-scratched-lp");

  assert.equal(canTapeJigger(lid), false);
  assert.equal(canTapeJigger(whisk), false);
  assert.equal(canTapeJigger(recipes), false);
  assert.equal(canTapeJigger(chair), false);
  assert.equal(canTapeJigger(gift), false);
  assert.equal(canTapeJigger(zine), false);
  assert.equal(canTapeJigger(lamp), false);
  assert.equal(canTapeJigger(pack), false);
  assert.equal(canTapeJigger(lp), false);

  assert.equal(markListingJigger(lid, []), null);
  assert.equal(markListingJigger(whisk, []), null);
  assert.equal(markListingJigger(recipes, []), null);
  assert.equal(markListingJigger(chair, []), null);
  assert.equal(markListingJigger(gift, []), null);
  assert.equal(markListingJigger(zine, []), null);
  assert.equal(markListingJigger(lamp, []), null);
  assert.equal(markListingJigger(pack, []), null);
  assert.equal(markListingJigger(lp, []), null);
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
  const taped = markListingJigger(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingJigger(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(jiggerCookieValue(cleared), "[]");
  assert.equal(isListingJiggerOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(JIGGER_LID_ID);
  const taped = markListingJigger(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingJigger(lid, []), null);

  const cleared = clearListingJigger(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(JIGGER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingJigger(chair, []), null);
});

test("write never touches sprig, pickle, glaze, bisque, or salt storage keys", () => {
  writeJiggerListingIds(["kdr-chipped-mug"]);
  assert.equal(JIGGER_STORAGE_KEY, "iss:jigger-listing-ids");
  assert.equal(SPRIG_STORAGE_KEY, "iss:sprig-listing-ids");
  assert.equal(PICKLE_STORAGE_KEY, "iss:pickle-listing-ids");
  assert.equal(GLAZE_STORAGE_KEY, "iss:glaze-listing-ids");
  assert.equal(BISQUE_STORAGE_KEY, "iss:bisque-listing-ids");
  assert.notEqual(JIGGER_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, BISQUE_STORAGE_KEY);
  assert.notEqual(JIGGER_STORAGE_KEY, "iss:salt-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, SPRIG_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, PICKLE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, GLAZE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, BISQUE_COOKIE_NAME);
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-sprig-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-pickle-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-glaze-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-bisque-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-salt-listing-ids");
  assert.notEqual(JIGGER_COOKIE_NAME, "iss-quench-listing-ids");
});
