import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { DOLBY_STORAGE_KEY } from "./listing-dolby";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import {
  FLUTTER_CHAIR_ID,
  FLUTTER_COOKIE_NAME,
  FLUTTER_HOST_ID,
  FLUTTER_JEWELS_ID,
  FLUTTER_LEAVE_LINE,
  FLUTTER_LINER_ID,
  FLUTTER_LP_ID,
  FLUTTER_NOTICE_TITLE,
  FLUTTER_STORAGE_KEY,
  canTapeFlutter,
  clearListingFlutter,
  flutterCookieValue,
  isListingFlutterOverlay,
  markListingFlutter,
  parseFlutterListingIds,
  writeFlutterListingIds,
} from "./listing-flutter";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import { PINCH_STORAGE_KEY } from "./listing-pinch";

test("cookie and storage keys stay the flutter paper names", () => {
  assert.equal(FLUTTER_STORAGE_KEY, "iss:flutter-listing-ids");
  assert.equal(FLUTTER_COOKIE_NAME, "iss-flutter-listing-ids");
  assert.equal(FLUTTER_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    FLUTTER_NOTICE_TITLE,
    "I will not flutter it. Still hiss. Still a radio edit.",
  );
  assert.equal(FLUTTER_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(FLUTTER_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, DOLBY_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, "iss:bias-listing-ids");
});

test("write-result objects never parse as a flutter set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseFlutterListingIds(writeResult), []);
  assert.equal(
    isListingFlutterOverlay(
      "mdb-mixtape-93",
      parseFlutterListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = flutterCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseFlutterListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(FLUTTER_LP_ID);
  const jewels = listingById(FLUTTER_JEWELS_ID);
  const liner = listingById(FLUTTER_LINER_ID);
  assert.ok(canTapeFlutter(mixtape));
  assert.equal(canTapeFlutter(lp), false);
  assert.equal(canTapeFlutter(jewels), false);
  assert.equal(canTapeFlutter(liner), false);

  const taped = markListingFlutter(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(flutterCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingFlutterOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingFlutterOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingFlutterOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingFlutterOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a flutter write", () => {
  const lp = listingById(FLUTTER_LP_ID);
  const jewels = listingById(FLUTTER_JEWELS_ID);
  const liner = listingById(FLUTTER_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FLUTTER_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeFlutter(lp), false);
  assert.equal(canTapeFlutter(jewels), false);
  assert.equal(canTapeFlutter(liner), false);
  assert.equal(canTapeFlutter(gift), false);
  assert.equal(canTapeFlutter(zine), false);
  assert.equal(canTapeFlutter(chair), false);
  assert.equal(canTapeFlutter(mug), false);

  assert.equal(markListingFlutter(lp, []), null);
  assert.equal(markListingFlutter(jewels, []), null);
  assert.equal(markListingFlutter(liner, []), null);
  assert.equal(markListingFlutter(gift, []), null);
  assert.equal(markListingFlutter(zine, []), null);
  assert.equal(markListingFlutter(chair, []), null);
  assert.equal(markListingFlutter(mug, []), null);
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
  const taped = markListingFlutter(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingFlutter(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(flutterCookieValue(cleared), "[]");
  assert.equal(isListingFlutterOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(FLUTTER_LP_ID);
  const taped = markListingFlutter(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingFlutter(lp, []), null);

  const cleared = clearListingFlutter(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FLUTTER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFlutter(chair, []), null);
});

test("write never touches pinch, erase, azimuth, or bias storage keys", () => {
  writeFlutterListingIds(["mdb-mixtape-93"]);
  assert.equal(FLUTTER_STORAGE_KEY, "iss:flutter-listing-ids");
  assert.equal(PINCH_STORAGE_KEY, "iss:pinch-listing-ids");
  assert.equal(ERASE_STORAGE_KEY, "iss:erase-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.notEqual(FLUTTER_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(FLUTTER_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-pinch-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-erase-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-dolby-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-bias-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-wow-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-speed-listing-ids");
  assert.notEqual(FLUTTER_COOKIE_NAME, "iss-capstan-listing-ids");
});
