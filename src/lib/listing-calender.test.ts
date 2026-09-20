import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DARN_COOKIE_NAME, DARN_STORAGE_KEY } from "./listing-darn";
import { NOTCH_COOKIE_NAME, NOTCH_STORAGE_KEY } from "./listing-notch";
import { SINGE_COOKIE_NAME, SINGE_STORAGE_KEY } from "./listing-singe";
import {
  CALENDER_CHAIR_ID,
  CALENDER_COOKIE_NAME,
  CALENDER_GIFT_ID,
  CALENDER_HOST_ID,
  CALENDER_LEAVE_LINE,
  CALENDER_NOTICE_TITLE,
  CALENDER_SNEAKER_ID,
  CALENDER_STORAGE_KEY,
  CALENDER_ZINE_ID,
  canTapeCalender,
  calenderCookieValue,
  clearListingCalender,
  isListingCalenderOverlay,
  markListingCalender,
  parseCalenderListingIds,
  writeCalenderListingIds,
} from "./listing-calender";

test("cookie and storage keys stay the calender paper names", () => {
  assert.equal(CALENDER_STORAGE_KEY, "iss:calender-listing-ids");
  assert.equal(CALENDER_COOKIE_NAME, "iss-calender-listing-ids");
  assert.equal(CALENDER_HOST_ID, "clo-windbreaker");
  assert.equal(
    CALENDER_NOTICE_TITLE,
    "I will not calender it. Still mint-green. Still smells like a car.",
  );
  assert.equal(CALENDER_LEAVE_LINE, "Leave the nylon");
  assert.notEqual(CALENDER_STORAGE_KEY, SINGE_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(CALENDER_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, SINGE_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, NOTCH_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, DARN_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-steam-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-teasel-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-hotroll-listing-ids");
});

test("write-result objects never parse as a calender set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseCalenderListingIds(writeResult), []);
  assert.equal(
    isListingCalenderOverlay(
      "clo-windbreaker",
      parseCalenderListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = calenderCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseCalenderListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; split soles, chair, gift, and zine stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(CALENDER_SNEAKER_ID);
  const chair = listingById(CALENDER_CHAIR_ID);
  const gift = listingById(CALENDER_GIFT_ID);
  const zine = listingById(CALENDER_ZINE_ID);
  assert.ok(canTapeCalender(jacket));
  assert.equal(canTapeCalender(soles), false);
  assert.equal(canTapeCalender(chair), false);
  assert.equal(canTapeCalender(gift), false);
  assert.equal(canTapeCalender(zine), false);

  const taped = markListingCalender(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(calenderCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingCalenderOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingCalenderOverlay("clo-split-soles", taped), false);
  assert.equal(isListingCalenderOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingCalenderOverlay("dl-mall-gift-card", taped), false);
  assert.equal(isListingCalenderOverlay("dl-stain-zine", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("soles, gift, zine, chair, and overlay-owned rows refuse a calender write", () => {
  const soles = listingById(CALENDER_SNEAKER_ID);
  const gift = listingById(CALENDER_GIFT_ID);
  const zine = listingById(CALENDER_ZINE_ID);
  const chair = listingById(CALENDER_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeCalender(soles), false);
  assert.equal(canTapeCalender(gift), false);
  assert.equal(canTapeCalender(zine), false);
  assert.equal(canTapeCalender(chair), false);
  assert.equal(canTapeCalender(mug), false);
  assert.equal(canTapeCalender(recipes), false);

  assert.equal(markListingCalender(soles, []), null);
  assert.equal(markListingCalender(gift, []), null);
  assert.equal(markListingCalender(zine, []), null);
  assert.equal(markListingCalender(chair, []), null);
  assert.equal(markListingCalender(mug, []), null);
  assert.equal(markListingCalender(recipes, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jacket = listingById("clo-windbreaker");
  assert.ok(jacket);
  const before = {
    price: jacket.price,
    status: jacket.status,
    cartEligible: jacket.cartEligible,
  };
  const taped = markListingCalender(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingCalender(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(calenderCookieValue(cleared), "[]");
  assert.equal(isListingCalenderOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingCalender(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingCalender(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(CALENDER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCalender(chair, []), null);
});

test("write never touches singe, notch, darn, nap, or cream storage keys", () => {
  writeCalenderListingIds(["clo-windbreaker"]);
  assert.equal(CALENDER_STORAGE_KEY, "iss:calender-listing-ids");
  assert.equal(SINGE_STORAGE_KEY, "iss:singe-listing-ids");
  assert.equal(NOTCH_STORAGE_KEY, "iss:notch-listing-ids");
  assert.equal(DARN_STORAGE_KEY, "iss:darn-listing-ids");
  assert.notEqual(CALENDER_STORAGE_KEY, SINGE_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(CALENDER_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(CALENDER_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, SINGE_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, NOTCH_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, DARN_COOKIE_NAME);
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(CALENDER_COOKIE_NAME, "iss-cream-listing-ids");
});
