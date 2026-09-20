import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { TORQUE_COOKIE_NAME, TORQUE_STORAGE_KEY } from "./listing-torque";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import {
  ZENITH_CHAIR_ID,
  ZENITH_COOKIE_NAME,
  ZENITH_GIFT_ID,
  ZENITH_HOST_ID,
  ZENITH_JEWELS_ID,
  ZENITH_LEAVE_LINE,
  ZENITH_LINER_ID,
  ZENITH_MIXTAPE_ID,
  ZENITH_NOTICE_TITLE,
  ZENITH_STORAGE_KEY,
  ZENITH_ZINE_ID,
  canTapeZenith,
  clearListingZenith,
  isListingZenithOverlay,
  markListingZenith,
  parseZenithListingIds,
  writeZenithListingIds,
  zenithCookieValue,
} from "./listing-zenith";

test("cookie and storage keys stay the zenith paper names", () => {
  assert.equal(ZENITH_STORAGE_KEY, "iss:zenith-listing-ids");
  assert.equal(ZENITH_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.equal(ZENITH_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    ZENITH_NOTICE_TITLE,
    "I will not zenith it. Still a skip. Still unnamed.",
  );
  assert.equal(ZENITH_LEAVE_LINE, "Leave the skip");
  assert.notEqual(ZENITH_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(ZENITH_STORAGE_KEY, "iss:flutter-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, TORQUE_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-bias-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-flutter-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-offset-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-srael-listing-ids");
});

test("write-result objects never parse as a zenith set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseZenithListingIds(writeResult), []);
  assert.equal(
    isListingZenithOverlay(
      "mdb-scratched-lp",
      parseZenithListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = zenithCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseZenithListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById(ZENITH_MIXTAPE_ID);
  const jewels = listingById(ZENITH_JEWELS_ID);
  const liner = listingById(ZENITH_LINER_ID);

  assert.ok(canTapeZenith(lp));
  assert.equal(canTapeZenith(mixtape), false);
  assert.equal(canTapeZenith(jewels), false);
  assert.equal(canTapeZenith(liner), false);

  const taped = markListingZenith(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(zenithCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingZenithOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingZenithOverlay(ZENITH_MIXTAPE_ID, taped), false);
  assert.equal(isListingZenithOverlay(ZENITH_JEWELS_ID, taped), false);
  assert.equal(isListingZenithOverlay(ZENITH_LINER_ID, taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a zenith write", () => {
  const mixtape = listingById(ZENITH_MIXTAPE_ID);
  const jewels = listingById(ZENITH_JEWELS_ID);
  const liner = listingById(ZENITH_LINER_ID);
  const chair = listingById(ZENITH_CHAIR_ID);
  const gift = listingById(ZENITH_GIFT_ID);
  const zine = listingById(ZENITH_ZINE_ID);
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeZenith(mixtape), false);
  assert.equal(canTapeZenith(jewels), false);
  assert.equal(canTapeZenith(liner), false);
  assert.equal(canTapeZenith(chair), false);
  assert.equal(canTapeZenith(gift), false);
  assert.equal(canTapeZenith(zine), false);
  assert.equal(canTapeZenith(lid), false);
  assert.equal(canTapeZenith(boy), false);

  assert.equal(markListingZenith(mixtape, []), null);
  assert.equal(markListingZenith(jewels, []), null);
  assert.equal(markListingZenith(liner, []), null);
  assert.equal(markListingZenith(chair, []), null);
  assert.equal(markListingZenith(gift, []), null);
  assert.equal(markListingZenith(zine, []), null);
  assert.equal(markListingZenith(lid, []), null);
  assert.equal(markListingZenith(boy, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lp = listingById("mdb-scratched-lp");
  assert.ok(lp);
  const before = {
    price: lp.price,
    status: lp.status,
    cartEligible: lp.cartEligible,
  };
  const taped = markListingZenith(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingZenith(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(zenithCookieValue(cleared), "[]");
  assert.equal(isListingZenithOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById(ZENITH_LINER_ID);
  const taped = markListingZenith(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingZenith(liner, []), null);

  const cleared = clearListingZenith(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ZENITH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingZenith(chair, []), null);
});

test("zenith write never aliases vacuum, azimuth, overhang, bias, flutter, or torque paper", () => {
  writeZenithListingIds(["mdb-scratched-lp"]);
  assert.equal(ZENITH_STORAGE_KEY, "iss:zenith-listing-ids");
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(TORQUE_STORAGE_KEY, "iss:torque-listing-ids");
  assert.notEqual(ZENITH_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ZENITH_STORAGE_KEY, "iss:bias-listing-ids");
  assert.notEqual(ZENITH_STORAGE_KEY, "iss:flutter-listing-ids");
  assert.notEqual(ZENITH_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(ZENITH_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, TORQUE_COOKIE_NAME);
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-bias-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-flutter-listing-ids");
  assert.notEqual(ZENITH_COOKIE_NAME, "iss-torque-listing-ids");
});
