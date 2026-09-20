import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DOLBY_STORAGE_KEY, readDolbyListingIds } from "./listing-dolby";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import { PANCAKE_STORAGE_KEY, readPancakeListingIds } from "./listing-pancake";
import { RECASE_STORAGE_KEY } from "./listing-recase";
import {
  PINCH_CHAIR_ID,
  PINCH_COOKIE_NAME,
  PINCH_HOST_ID,
  PINCH_JEWELS_ID,
  PINCH_LEAVE_LINE,
  PINCH_LINER_ID,
  PINCH_LP_ID,
  PINCH_NOTICE_TITLE,
  PINCH_STORAGE_KEY,
  canTapePinch,
  clearListingPinch,
  isListingPinchOverlay,
  markListingPinch,
  parsePinchListingIds,
  pinchCookieValue,
  readPinchListingIds,
  writePinchListingIds,
} from "./listing-pinch";

test("cookie and storage keys stay the pinch paper names", () => {
  assert.equal(PINCH_STORAGE_KEY, "iss:pinch-listing-ids");
  assert.equal(PINCH_COOKIE_NAME, "iss-pinch-listing-ids");
  assert.equal(PINCH_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    PINCH_NOTICE_TITLE,
    "I will not pinch it. Still a hiss. Still a radio edit.",
  );
  assert.equal(PINCH_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(PINCH_STORAGE_KEY, PANCAKE_STORAGE_KEY);
  assert.notEqual(PINCH_STORAGE_KEY, DOLBY_STORAGE_KEY);
  assert.notEqual(PINCH_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(PINCH_STORAGE_KEY, RECASE_STORAGE_KEY);
});

test("write-result objects never parse as a pinch set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parsePinchListingIds(writeResult), []);
  assert.equal(
    isListingPinchOverlay(
      "mdb-mixtape-93",
      parsePinchListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pinchCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parsePinchListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(PINCH_LP_ID);
  const jewels = listingById(PINCH_JEWELS_ID);
  const liner = listingById(PINCH_LINER_ID);
  assert.ok(canTapePinch(mixtape));
  assert.equal(canTapePinch(lp), false);
  assert.equal(canTapePinch(jewels), false);
  assert.equal(canTapePinch(liner), false);

  const taped = markListingPinch(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(pinchCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingPinchOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingPinchOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingPinchOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingPinchOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a pinch write", () => {
  const lp = listingById(PINCH_LP_ID);
  const jewels = listingById(PINCH_JEWELS_ID);
  const liner = listingById(PINCH_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(PINCH_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapePinch(lp), false);
  assert.equal(canTapePinch(jewels), false);
  assert.equal(canTapePinch(liner), false);
  assert.equal(canTapePinch(gift), false);
  assert.equal(canTapePinch(zine), false);
  assert.equal(canTapePinch(chair), false);
  assert.equal(canTapePinch(mug), false);

  assert.equal(markListingPinch(lp, []), null);
  assert.equal(markListingPinch(jewels, []), null);
  assert.equal(markListingPinch(liner, []), null);
  assert.equal(markListingPinch(gift, []), null);
  assert.equal(markListingPinch(zine, []), null);
  assert.equal(markListingPinch(chair, []), null);
  assert.equal(markListingPinch(mug, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(mixtape);
  const before = {
    price: mixtape.price,
    status: mixtape.status,
    cartEligible: mixtape.cartEligible,
  };
  const taped = markListingPinch(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingPinch(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pinchCookieValue(cleared), "[]");
  assert.equal(isListingPinchOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingPinch(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPinch(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PINCH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPinch(chair, []), null);
});

test("pinch write does not write pancake or Dolby paper", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingPinch(mixtape, []);
  assert.ok(taped);
  writePinchListingIds(taped);
  assert.deepEqual(readPinchListingIds(), ["mdb-mixtape-93"]);
  assert.deepEqual(readPancakeListingIds(), []);
  assert.deepEqual(readDolbyListingIds(), []);
  writePinchListingIds([]);
});
