import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { DOLBY_STORAGE_KEY } from "./listing-dolby";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import { FLUTTER_STORAGE_KEY } from "./listing-flutter";
import { PINCH_STORAGE_KEY } from "./listing-pinch";
import {
  TORQUE_CHAIR_ID,
  TORQUE_COOKIE_NAME,
  TORQUE_HOST_ID,
  TORQUE_JEWELS_ID,
  TORQUE_LEAVE_LINE,
  TORQUE_LINER_ID,
  TORQUE_LP_ID,
  TORQUE_NOTICE_TITLE,
  TORQUE_STORAGE_KEY,
  canTapeTorque,
  clearListingTorque,
  isListingTorqueOverlay,
  markListingTorque,
  parseTorqueListingIds,
  torqueCookieValue,
  writeTorqueListingIds,
} from "./listing-torque";

test("cookie and storage keys stay the torque paper names", () => {
  assert.equal(TORQUE_STORAGE_KEY, "iss:torque-listing-ids");
  assert.equal(TORQUE_COOKIE_NAME, "iss-torque-listing-ids");
  assert.equal(TORQUE_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    TORQUE_NOTICE_TITLE,
    "I will not torque it. Still hiss. Still a radio edit.",
  );
  assert.equal(TORQUE_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(TORQUE_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, DOLBY_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(TORQUE_STORAGE_KEY, "iss:wow-listing-ids");
  assert.notEqual(TORQUE_STORAGE_KEY, "iss:capstan-listing-ids");
});

test("write-result objects never parse as a torque set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseTorqueListingIds(writeResult), []);
  assert.equal(
    isListingTorqueOverlay(
      "mdb-mixtape-93",
      parseTorqueListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = torqueCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseTorqueListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(TORQUE_LP_ID);
  const jewels = listingById(TORQUE_JEWELS_ID);
  const liner = listingById(TORQUE_LINER_ID);
  assert.ok(canTapeTorque(mixtape));
  assert.equal(canTapeTorque(lp), false);
  assert.equal(canTapeTorque(jewels), false);
  assert.equal(canTapeTorque(liner), false);

  const taped = markListingTorque(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(torqueCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingTorqueOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingTorqueOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingTorqueOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingTorqueOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a torque write", () => {
  const lp = listingById(TORQUE_LP_ID);
  const jewels = listingById(TORQUE_JEWELS_ID);
  const liner = listingById(TORQUE_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TORQUE_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeTorque(lp), false);
  assert.equal(canTapeTorque(jewels), false);
  assert.equal(canTapeTorque(liner), false);
  assert.equal(canTapeTorque(gift), false);
  assert.equal(canTapeTorque(zine), false);
  assert.equal(canTapeTorque(chair), false);
  assert.equal(canTapeTorque(mug), false);

  assert.equal(markListingTorque(lp, []), null);
  assert.equal(markListingTorque(jewels, []), null);
  assert.equal(markListingTorque(liner, []), null);
  assert.equal(markListingTorque(gift, []), null);
  assert.equal(markListingTorque(zine, []), null);
  assert.equal(markListingTorque(chair, []), null);
  assert.equal(markListingTorque(mug, []), null);
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
  const taped = markListingTorque(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingTorque(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(torqueCookieValue(cleared), "[]");
  assert.equal(isListingTorqueOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(TORQUE_LP_ID);
  const taped = markListingTorque(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingTorque(lp, []), null);

  const cleared = clearListingTorque(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TORQUE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTorque(chair, []), null);
});

test("write never touches flutter, pinch, erase, azimuth, or bias storage keys", () => {
  writeTorqueListingIds(["mdb-mixtape-93"]);
  assert.equal(TORQUE_STORAGE_KEY, "iss:torque-listing-ids");
  assert.equal(FLUTTER_STORAGE_KEY, "iss:flutter-listing-ids");
  assert.equal(PINCH_STORAGE_KEY, "iss:pinch-listing-ids");
  assert.equal(ERASE_STORAGE_KEY, "iss:erase-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.notEqual(TORQUE_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(TORQUE_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-flutter-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-pinch-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-erase-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-dolby-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-bias-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-wow-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-speed-listing-ids");
  assert.notEqual(TORQUE_COOKIE_NAME, "iss-capstan-listing-ids");
});
