import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CALENDER_COOKIE_NAME, CALENDER_STORAGE_KEY } from "./listing-calender";
import { DARN_COOKIE_NAME, DARN_STORAGE_KEY } from "./listing-darn";
import { NOTCH_COOKIE_NAME, NOTCH_STORAGE_KEY } from "./listing-notch";
import { SINGE_COOKIE_NAME, SINGE_STORAGE_KEY } from "./listing-singe";
import { TENTER_COOKIE_NAME, TENTER_STORAGE_KEY } from "./listing-tenter";
import {
  SHEAR_CHAIR_ID,
  SHEAR_COOKIE_NAME,
  SHEAR_GIFT_ID,
  SHEAR_HOST_ID,
  SHEAR_LEAVE_LINE,
  SHEAR_LID_ID,
  SHEAR_NOTICE_TITLE,
  SHEAR_SOLES_ID,
  SHEAR_STORAGE_KEY,
  SHEAR_ZINE_ID,
  canTapeShear,
  clearListingShear,
  isListingShearOverlay,
  markListingShear,
  parseShearListingIds,
  readShearListingIds,
  shearCookieValue,
  writeShearListingIds,
} from "./listing-shear";

test("cookie and storage keys stay the shear paper names", () => {
  assert.equal(SHEAR_STORAGE_KEY, "iss:shear-listing-ids");
  assert.equal(SHEAR_COOKIE_NAME, "iss-shear-listing-ids");
  assert.equal(SHEAR_HOST_ID, "clo-windbreaker");
  assert.equal(
    SHEAR_NOTICE_TITLE,
    "I will not shear it. Still mint-green. Still smells like a car.",
  );
  assert.equal(SHEAR_LEAVE_LINE, "Leave the nylon");
  assert.notEqual(SHEAR_STORAGE_KEY, SINGE_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, TENTER_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, CALENDER_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:clipper-listing-ids");
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:guillotine-listing-ids");
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:pilecut-listing-ids");
  assert.notEqual(SHEAR_COOKIE_NAME, SINGE_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, TENTER_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, CALENDER_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, NOTCH_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, DARN_COOKIE_NAME);
});

test("write-result objects never parse as a shear set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseShearListingIds(writeResult), []);
  assert.equal(
    isListingShearOverlay(
      "clo-windbreaker",
      parseShearListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseShearListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = shearCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseShearListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; soles, lid, and zine stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(SHEAR_SOLES_ID);
  const lid = listingById(SHEAR_LID_ID);
  const zine = listingById(SHEAR_ZINE_ID);

  assert.ok(canTapeShear(jacket));
  assert.equal(canTapeShear(soles), false);
  assert.equal(canTapeShear(lid), false);
  assert.equal(canTapeShear(zine), false);

  const taped = markListingShear(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(shearCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingShearOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingShearOverlay(SHEAR_SOLES_ID, taped), false);
  assert.equal(isListingShearOverlay(SHEAR_LID_ID, taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("soles, lid, gift, zine, and chair refuse a shear write", () => {
  const soles = listingById(SHEAR_SOLES_ID);
  const lid = listingById(SHEAR_LID_ID);
  const gift = listingById(SHEAR_GIFT_ID);
  const zine = listingById(SHEAR_ZINE_ID);
  const chair = listingById(SHEAR_CHAIR_ID);

  assert.equal(canTapeShear(soles), false);
  assert.equal(canTapeShear(lid), false);
  assert.equal(canTapeShear(gift), false);
  assert.equal(canTapeShear(zine), false);
  assert.equal(canTapeShear(chair), false);

  assert.equal(markListingShear(soles, []), null);
  assert.equal(markListingShear(lid, []), null);
  assert.equal(markListingShear(gift, []), null);
  assert.equal(markListingShear(zine, []), null);
  assert.equal(markListingShear(chair, []), null);
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
  const taped = markListingShear(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingShear(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(shearCookieValue(cleared), "[]");
  assert.equal(isListingShearOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById(SHEAR_SOLES_ID);
  const taped = markListingShear(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingShear(soles, []), null);

  const cleared = clearListingShear(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SHEAR_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingShear(chair, []), null);
});

test("shear write does not write singe, tenter, calender, nap, notch, or darn paper", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingShear(jacket, []);
  assert.ok(taped);
  writeShearListingIds(taped);
  assert.deepEqual(readShearListingIds(), ["clo-windbreaker"]);
  assert.notEqual(SHEAR_STORAGE_KEY, SINGE_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, TENTER_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, CALENDER_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, "iss:nap-listing-ids");
  assert.notEqual(SHEAR_STORAGE_KEY, NOTCH_STORAGE_KEY);
  assert.notEqual(SHEAR_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(SHEAR_COOKIE_NAME, SINGE_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, TENTER_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, CALENDER_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, "iss-nap-listing-ids");
  assert.notEqual(SHEAR_COOKIE_NAME, NOTCH_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, DARN_COOKIE_NAME);
  assert.notEqual(SHEAR_COOKIE_NAME, "iss-clipper-listing-ids");
  assert.notEqual(SHEAR_COOKIE_NAME, "iss-guillotine-listing-ids");
  assert.notEqual(SHEAR_COOKIE_NAME, "iss-pilecut-listing-ids");
  writeShearListingIds([]);
});
