import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CALENDER_COOKIE_NAME, CALENDER_STORAGE_KEY } from "./listing-calender";
import { NOTCH_COOKIE_NAME, NOTCH_STORAGE_KEY } from "./listing-notch";
import { SINGE_COOKIE_NAME, SINGE_STORAGE_KEY } from "./listing-singe";
import {
  TENTER_CHAIR_ID,
  TENTER_COOKIE_NAME,
  TENTER_GIFT_ID,
  TENTER_HOST_ID,
  TENTER_LEAVE_LINE,
  TENTER_LID_ID,
  TENTER_NOTICE_TITLE,
  TENTER_SOLES_ID,
  TENTER_STORAGE_KEY,
  TENTER_ZINE_ID,
  canTapeTenter,
  clearListingTenter,
  isListingTenterOverlay,
  markListingTenter,
  parseTenterListingIds,
  readTenterListingIds,
  tenterCookieValue,
  writeTenterListingIds,
} from "./listing-tenter";

test("cookie and storage keys stay the tenter paper names", () => {
  assert.equal(TENTER_STORAGE_KEY, "iss:tenter-listing-ids");
  assert.equal(TENTER_COOKIE_NAME, "iss-tenter-listing-ids");
  assert.equal(TENTER_HOST_ID, "clo-windbreaker");
  assert.equal(
    TENTER_NOTICE_TITLE,
    "I will not tenter it. Still mint-green. Still smells like a car.",
  );
  assert.equal(TENTER_LEAVE_LINE, "Leave the nylon");
  assert.notEqual(TENTER_STORAGE_KEY, SINGE_STORAGE_KEY);
  assert.notEqual(TENTER_STORAGE_KEY, CALENDER_STORAGE_KEY);
  assert.notEqual(TENTER_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(TENTER_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:darn-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, SINGE_COOKIE_NAME);
  assert.notEqual(TENTER_COOKIE_NAME, CALENDER_COOKIE_NAME);
  assert.notEqual(TENTER_COOKIE_NAME, NOTCH_COOKIE_NAME);
});

test("write-result objects never parse as a tenter set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseTenterListingIds(writeResult), []);
  assert.equal(
    isListingTenterOverlay(
      "clo-windbreaker",
      parseTenterListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = tenterCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseTenterListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; soles, lid, and zine stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(TENTER_SOLES_ID);
  const lid = listingById(TENTER_LID_ID);
  const zine = listingById(TENTER_ZINE_ID);

  assert.ok(canTapeTenter(jacket));
  assert.equal(canTapeTenter(soles), false);
  assert.equal(canTapeTenter(lid), false);
  assert.equal(canTapeTenter(zine), false);

  const taped = markListingTenter(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(tenterCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingTenterOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingTenterOverlay(TENTER_SOLES_ID, taped), false);
  assert.equal(isListingTenterOverlay(TENTER_LID_ID, taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
});

test("soles, lid, gift, zine, and chair refuse a tenter write", () => {
  const soles = listingById(TENTER_SOLES_ID);
  const lid = listingById(TENTER_LID_ID);
  const gift = listingById(TENTER_GIFT_ID);
  const zine = listingById(TENTER_ZINE_ID);
  const chair = listingById(TENTER_CHAIR_ID);

  assert.equal(canTapeTenter(soles), false);
  assert.equal(canTapeTenter(lid), false);
  assert.equal(canTapeTenter(gift), false);
  assert.equal(canTapeTenter(zine), false);
  assert.equal(canTapeTenter(chair), false);

  assert.equal(markListingTenter(soles, []), null);
  assert.equal(markListingTenter(lid, []), null);
  assert.equal(markListingTenter(gift, []), null);
  assert.equal(markListingTenter(zine, []), null);
  assert.equal(markListingTenter(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jacket = listingById("clo-windbreaker");
  assert.ok(jacket);
  const before = {
    price: jacket.price,
    status: jacket.status,
    cartEligible: jacket.cartEligible,
  };
  const taped = markListingTenter(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingTenter(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(tenterCookieValue(cleared), "[]");
  assert.equal(isListingTenterOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(TENTER_SOLES_ID);
  const taped = markListingTenter(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingTenter(soles, []), null);

  const cleared = clearListingTenter(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TENTER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTenter(chair, []), null);
});

test("tenter write does not write singe, nap, calender, notch, darn, or cream paper", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingTenter(jacket, []);
  assert.ok(taped);
  writeTenterListingIds(taped);
  assert.deepEqual(readTenterListingIds(), ["clo-windbreaker"]);
  assert.notEqual(TENTER_STORAGE_KEY, "iss:singe-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:calender-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:notch-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:darn-listing-ids");
  assert.notEqual(TENTER_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-singe-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-calender-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-stenter-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-rail-listing-ids");
  assert.notEqual(TENTER_COOKIE_NAME, "iss-overfeed-listing-ids");
  writeTenterListingIds([]);
});
