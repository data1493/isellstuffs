import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import { FLUTTER_COOKIE_NAME, FLUTTER_STORAGE_KEY } from "./listing-flutter";
import { PINCH_STORAGE_KEY } from "./listing-pinch";
import {
  RELAP_CHAIR_ID,
  RELAP_COOKIE_NAME,
  RELAP_HOST_ID,
  RELAP_JEWELS_ID,
  RELAP_LEAVE_LINE,
  RELAP_LINER_ID,
  RELAP_LP_ID,
  RELAP_NOTICE_TITLE,
  RELAP_STORAGE_KEY,
  canTapeRelap,
  clearListingRelap,
  isListingRelapOverlay,
  markListingRelap,
  parseRelapListingIds,
  relapCookieValue,
  readRelapListingIds,
  writeRelapListingIds,
} from "./listing-relap";
import { TORQUE_COOKIE_NAME, TORQUE_STORAGE_KEY } from "./listing-torque";

test("cookie and storage keys stay the relap paper names", () => {
  assert.equal(RELAP_STORAGE_KEY, "iss:relap-listing-ids");
  assert.equal(RELAP_COOKIE_NAME, "iss-relap-listing-ids");
  assert.equal(RELAP_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    RELAP_NOTICE_TITLE,
    "I will not relap it. Still hiss. Still a radio edit.",
  );
  assert.equal(RELAP_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(RELAP_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(RELAP_STORAGE_KEY, "iss:headstack-listing-ids");
  assert.notEqual(RELAP_COOKIE_NAME, FLUTTER_COOKIE_NAME);
  assert.notEqual(RELAP_COOKIE_NAME, TORQUE_COOKIE_NAME);
});

test("write-result objects never parse as a relap set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseRelapListingIds(writeResult), []);
  assert.equal(
    isListingRelapOverlay(
      "mdb-mixtape-93",
      parseRelapListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = relapCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseRelapListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(RELAP_LP_ID);
  const jewels = listingById(RELAP_JEWELS_ID);
  const liner = listingById(RELAP_LINER_ID);
  assert.ok(canTapeRelap(mixtape));
  assert.equal(canTapeRelap(lp), false);
  assert.equal(canTapeRelap(jewels), false);
  assert.equal(canTapeRelap(liner), false);

  const taped = markListingRelap(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(relapCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingRelapOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingRelapOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingRelapOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRelapOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a relap write", () => {
  const lp = listingById(RELAP_LP_ID);
  const jewels = listingById(RELAP_JEWELS_ID);
  const liner = listingById(RELAP_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(RELAP_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeRelap(lp), false);
  assert.equal(canTapeRelap(jewels), false);
  assert.equal(canTapeRelap(liner), false);
  assert.equal(canTapeRelap(gift), false);
  assert.equal(canTapeRelap(zine), false);
  assert.equal(canTapeRelap(chair), false);
  assert.equal(canTapeRelap(mug), false);

  assert.equal(markListingRelap(lp, []), null);
  assert.equal(markListingRelap(jewels, []), null);
  assert.equal(markListingRelap(liner, []), null);
  assert.equal(markListingRelap(gift, []), null);
  assert.equal(markListingRelap(zine, []), null);
  assert.equal(markListingRelap(chair, []), null);
  assert.equal(markListingRelap(mug, []), null);
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
  const taped = markListingRelap(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingRelap(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(relapCookieValue(cleared), "[]");
  assert.equal(isListingRelapOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(RELAP_LP_ID);
  const taped = markListingRelap(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRelap(lp, []), null);

  const cleared = clearListingRelap(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RELAP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRelap(chair, []), null);
});

test("relap write does not write flutter, torque, bias, pinch, or erase paper", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingRelap(mixtape, []);
  assert.ok(taped);
  writeRelapListingIds(taped);
  assert.deepEqual(readRelapListingIds(), ["mdb-mixtape-93"]);
  assert.notEqual(RELAP_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(RELAP_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(RELAP_STORAGE_KEY, "iss:headstack-listing-ids");
  assert.notEqual(RELAP_STORAGE_KEY, "iss:lapping-listing-ids");
  assert.notEqual(RELAP_COOKIE_NAME, FLUTTER_COOKIE_NAME);
  assert.notEqual(RELAP_COOKIE_NAME, TORQUE_COOKIE_NAME);
  assert.notEqual(RELAP_COOKIE_NAME, "iss-pinch-listing-ids");
  assert.notEqual(RELAP_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(RELAP_COOKIE_NAME, "iss-erase-listing-ids");
  assert.notEqual(RELAP_COOKIE_NAME, "iss-bias-listing-ids");
  writeRelapListingIds([]);
});
