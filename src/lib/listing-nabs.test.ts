import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import { FLUTTER_COOKIE_NAME, FLUTTER_STORAGE_KEY } from "./listing-flutter";
import {
  NABS_CHAIR_ID,
  NABS_COOKIE_NAME,
  NABS_HOST_ID,
  NABS_JEWELS_ID,
  NABS_LEAVE_LINE,
  NABS_LINER_ID,
  NABS_LP_ID,
  NABS_NOTICE_TITLE,
  NABS_STORAGE_KEY,
  canTapeNabs,
  clearListingNabs,
  isListingNabsOverlay,
  markListingNabs,
  nabsCookieValue,
  parseNabsListingIds,
  readNabsListingIds,
  writeNabsListingIds,
} from "./listing-nabs";
import { PINCH_STORAGE_KEY } from "./listing-pinch";
import { RELAP_COOKIE_NAME, RELAP_STORAGE_KEY } from "./listing-relap";
import { TORQUE_COOKIE_NAME, TORQUE_STORAGE_KEY } from "./listing-torque";

test("cookie and storage keys stay the nabs paper names", () => {
  assert.equal(NABS_STORAGE_KEY, "iss:nabs-listing-ids");
  assert.equal(NABS_COOKIE_NAME, "iss-nabs-listing-ids");
  assert.equal(NABS_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    NABS_NOTICE_TITLE,
    "I will not nabs it. Still hiss. Still a radio edit.",
  );
  assert.equal(NABS_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(NABS_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, RELAP_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:dbx-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:ccir-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:eq-listing-ids");
  assert.notEqual(NABS_COOKIE_NAME, FLUTTER_COOKIE_NAME);
  assert.notEqual(NABS_COOKIE_NAME, RELAP_COOKIE_NAME);
  assert.notEqual(NABS_COOKIE_NAME, TORQUE_COOKIE_NAME);
});

test("write-result objects never parse as a nabs set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseNabsListingIds(writeResult), []);
  assert.equal(
    isListingNabsOverlay(
      "mdb-mixtape-93",
      parseNabsListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseNabsListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = nabsCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseNabsListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(NABS_LP_ID);
  const jewels = listingById(NABS_JEWELS_ID);
  const liner = listingById(NABS_LINER_ID);
  assert.ok(canTapeNabs(mixtape));
  assert.equal(canTapeNabs(lp), false);
  assert.equal(canTapeNabs(jewels), false);
  assert.equal(canTapeNabs(liner), false);

  const taped = markListingNabs(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(nabsCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingNabsOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingNabsOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingNabsOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingNabsOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a nabs write", () => {
  const lp = listingById(NABS_LP_ID);
  const jewels = listingById(NABS_JEWELS_ID);
  const liner = listingById(NABS_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(NABS_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeNabs(lp), false);
  assert.equal(canTapeNabs(jewels), false);
  assert.equal(canTapeNabs(liner), false);
  assert.equal(canTapeNabs(gift), false);
  assert.equal(canTapeNabs(zine), false);
  assert.equal(canTapeNabs(chair), false);
  assert.equal(canTapeNabs(mug), false);

  assert.equal(markListingNabs(lp, []), null);
  assert.equal(markListingNabs(jewels, []), null);
  assert.equal(markListingNabs(liner, []), null);
  assert.equal(markListingNabs(gift, []), null);
  assert.equal(markListingNabs(zine, []), null);
  assert.equal(markListingNabs(chair, []), null);
  assert.equal(markListingNabs(mug, []), null);
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
  const taped = markListingNabs(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingNabs(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(nabsCookieValue(cleared), "[]");
  assert.equal(isListingNabsOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(NABS_LP_ID);
  const taped = markListingNabs(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingNabs(lp, []), null);

  const cleared = clearListingNabs(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(NABS_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingNabs(chair, []), null);
});

test("nabs write does not write flutter, relap, torque, bias, pinch, or azimuth paper", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingNabs(mixtape, []);
  assert.ok(taped);
  writeNabsListingIds(taped);
  assert.deepEqual(readNabsListingIds(), ["mdb-mixtape-93"]);
  assert.notEqual(NABS_STORAGE_KEY, FLUTTER_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, RELAP_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, PINCH_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(NABS_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:dbx-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:ccir-listing-ids");
  assert.notEqual(NABS_STORAGE_KEY, "iss:eq-listing-ids");
  assert.notEqual(NABS_COOKIE_NAME, FLUTTER_COOKIE_NAME);
  assert.notEqual(NABS_COOKIE_NAME, RELAP_COOKIE_NAME);
  assert.notEqual(NABS_COOKIE_NAME, TORQUE_COOKIE_NAME);
  assert.notEqual(NABS_COOKIE_NAME, "iss-pinch-listing-ids");
  assert.notEqual(NABS_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(NABS_COOKIE_NAME, "iss-bias-listing-ids");
  writeNabsListingIds([]);
});
