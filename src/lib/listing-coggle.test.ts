import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GLAZE_STORAGE_KEY } from "./listing-glaze";
import { JIGGER_COOKIE_NAME, JIGGER_STORAGE_KEY } from "./listing-jigger";
import { PICKLE_STORAGE_KEY } from "./listing-pickle";
import { SPRIG_COOKIE_NAME, SPRIG_STORAGE_KEY } from "./listing-sprig";
import { STILT_COOKIE_NAME, STILT_STORAGE_KEY } from "./listing-stilt";
import {
  COGGLE_CHAIR_ID,
  COGGLE_COOKIE_NAME,
  COGGLE_GIFT_ID,
  COGGLE_HOST_ID,
  COGGLE_LEAVE_LINE,
  COGGLE_LID_ID,
  COGGLE_NOTICE_TITLE,
  COGGLE_RECIPES_ID,
  COGGLE_STORAGE_KEY,
  COGGLE_WHISK_ID,
  COGGLE_ZINE_ID,
  canTapeCoggle,
  clearListingCoggle,
  coggleCookieValue,
  isListingCoggleOverlay,
  markListingCoggle,
  parseCoggleListingIds,
  readCoggleListingIds,
  writeCoggleListingIds,
} from "./listing-coggle";

test("cookie and storage keys stay the coggle paper names", () => {
  assert.equal(COGGLE_STORAGE_KEY, "iss:coggle-listing-ids");
  assert.equal(COGGLE_COOKIE_NAME, "iss-coggle-listing-ids");
  assert.equal(COGGLE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    COGGLE_NOTICE_TITLE,
    "I will not coggle it. Still a diner rim. Still holds coffee.",
  );
  assert.equal(COGGLE_LEAVE_LINE, "Leave the rim");
  assert.notEqual(COGGLE_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, STILT_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, JIGGER_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, "iss:salt-listing-ids");
  assert.notEqual(COGGLE_STORAGE_KEY, "iss:roulette-listing-ids");
  assert.notEqual(COGGLE_STORAGE_KEY, "iss:cog-listing-ids");
  assert.notEqual(COGGLE_STORAGE_KEY, "iss:fluting-listing-ids");
});

test("write-result objects never parse as a coggle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseCoggleListingIds(writeResult), []);
  assert.equal(
    isListingCoggleOverlay(
      "kdr-chipped-mug",
      parseCoggleListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseCoggleListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = coggleCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseCoggleListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; lid, whisk, and recipes stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(COGGLE_LID_ID);
  const whisk = listingById(COGGLE_WHISK_ID);
  const recipes = listingById(COGGLE_RECIPES_ID);

  assert.ok(canTapeCoggle(mug));
  assert.equal(canTapeCoggle(lid), false);
  assert.equal(canTapeCoggle(whisk), false);
  assert.equal(canTapeCoggle(recipes), false);

  const taped = markListingCoggle(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(coggleCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingCoggleOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingCoggleOverlay(COGGLE_LID_ID, taped), false);
  assert.equal(isListingCoggleOverlay(COGGLE_WHISK_ID, taped), false);
  assert.equal(isListingCoggleOverlay(COGGLE_RECIPES_ID, taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("lid, whisk, recipes, chair, gift, zine, and overlay-owned rows refuse a coggle write", () => {
  const lid = listingById(COGGLE_LID_ID);
  const whisk = listingById(COGGLE_WHISK_ID);
  const recipes = listingById(COGGLE_RECIPES_ID);
  const chair = listingById(COGGLE_CHAIR_ID);
  const gift = listingById(COGGLE_GIFT_ID);
  const zine = listingById(COGGLE_ZINE_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const pack = listingById("dl-sample-pack");

  assert.equal(canTapeCoggle(lid), false);
  assert.equal(canTapeCoggle(whisk), false);
  assert.equal(canTapeCoggle(recipes), false);
  assert.equal(canTapeCoggle(chair), false);
  assert.equal(canTapeCoggle(gift), false);
  assert.equal(canTapeCoggle(zine), false);
  assert.equal(canTapeCoggle(lamp), false);
  assert.equal(canTapeCoggle(pack), false);

  assert.equal(markListingCoggle(lid, []), null);
  assert.equal(markListingCoggle(whisk, []), null);
  assert.equal(markListingCoggle(recipes, []), null);
  assert.equal(markListingCoggle(chair, []), null);
  assert.equal(markListingCoggle(gift, []), null);
  assert.equal(markListingCoggle(zine, []), null);
  assert.equal(markListingCoggle(lamp, []), null);
  assert.equal(markListingCoggle(pack, []), null);
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
  const taped = markListingCoggle(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingCoggle(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(coggleCookieValue(cleared), "[]");
  assert.equal(isListingCoggleOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById(COGGLE_LID_ID);
  const taped = markListingCoggle(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCoggle(lid, []), null);

  const cleared = clearListingCoggle(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(COGGLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCoggle(chair, []), null);
});

test("coggle write does not write sprig, stilt, jigger, salt, pickle, or glaze paper", () => {
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingCoggle(mug, []);
  assert.ok(taped);
  writeCoggleListingIds(taped);
  assert.deepEqual(readCoggleListingIds(), ["kdr-chipped-mug"]);
  assert.notEqual(COGGLE_STORAGE_KEY, SPRIG_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, STILT_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, JIGGER_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, "iss:salt-listing-ids");
  assert.notEqual(COGGLE_STORAGE_KEY, PICKLE_STORAGE_KEY);
  assert.notEqual(COGGLE_STORAGE_KEY, GLAZE_STORAGE_KEY);
  assert.notEqual(COGGLE_COOKIE_NAME, SPRIG_COOKIE_NAME);
  assert.notEqual(COGGLE_COOKIE_NAME, STILT_COOKIE_NAME);
  assert.notEqual(COGGLE_COOKIE_NAME, JIGGER_COOKIE_NAME);
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-salt-listing-ids");
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-pickle-listing-ids");
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-glaze-listing-ids");
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-roulette-listing-ids");
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-cog-listing-ids");
  assert.notEqual(COGGLE_COOKIE_NAME, "iss-fluting-listing-ids");
  writeCoggleListingIds([]);
});
