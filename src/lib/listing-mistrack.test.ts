import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import {
  MISTRACK_CHAIR_ID,
  MISTRACK_COOKIE_NAME,
  MISTRACK_GIFT_ID,
  MISTRACK_HOST_ID,
  MISTRACK_JEWELS_ID,
  MISTRACK_LEAVE_LINE,
  MISTRACK_LINER_ID,
  MISTRACK_MIXTAPE_ID,
  MISTRACK_NOTICE_TITLE,
  MISTRACK_STORAGE_KEY,
  MISTRACK_ZINE_ID,
  canTapeMistrack,
  clearListingMistrack,
  isListingMistrackOverlay,
  markListingMistrack,
  mistrackCookieValue,
  parseMistrackListingIds,
  writeMistrackListingIds,
} from "./listing-mistrack";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RAKE_COOKIE_NAME, RAKE_STORAGE_KEY } from "./listing-rake";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the mistrack paper names", () => {
  assert.equal(MISTRACK_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.equal(MISTRACK_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.equal(MISTRACK_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    MISTRACK_NOTICE_TITLE,
    "I will not mistrack it. Still a skip. Still unnamed.",
  );
  assert.equal(MISTRACK_LEAVE_LINE, "Leave the mistrack");
  assert.notEqual(MISTRACK_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:pivot-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:dashpot-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:gimbal-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:antiskate-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:rumble-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:vta-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:riaa-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:sibilance-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-zenith-listing-ids");
});

test("write-result objects never parse as a mistrack set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseMistrackListingIds(writeResult), []);
  assert.equal(
    isListingMistrackOverlay(
      "mdb-scratched-lp",
      parseMistrackListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = mistrackCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseMistrackListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById(MISTRACK_MIXTAPE_ID);
  const jewels = listingById(MISTRACK_JEWELS_ID);
  const liner = listingById(MISTRACK_LINER_ID);

  assert.ok(canTapeMistrack(lp));
  assert.equal(canTapeMistrack(mixtape), false);
  assert.equal(canTapeMistrack(jewels), false);
  assert.equal(canTapeMistrack(liner), false);

  const taped = markListingMistrack(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(mistrackCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingMistrackOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingMistrackOverlay(MISTRACK_MIXTAPE_ID, taped), false);
  assert.equal(isListingMistrackOverlay(MISTRACK_JEWELS_ID, taped), false);
  assert.equal(isListingMistrackOverlay(MISTRACK_LINER_ID, taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a mistrack write", () => {
  const mixtape = listingById(MISTRACK_MIXTAPE_ID);
  const jewels = listingById(MISTRACK_JEWELS_ID);
  const liner = listingById(MISTRACK_LINER_ID);
  const chair = listingById(MISTRACK_CHAIR_ID);
  const gift = listingById(MISTRACK_GIFT_ID);
  const zine = listingById(MISTRACK_ZINE_ID);
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeMistrack(mixtape), false);
  assert.equal(canTapeMistrack(jewels), false);
  assert.equal(canTapeMistrack(liner), false);
  assert.equal(canTapeMistrack(chair), false);
  assert.equal(canTapeMistrack(gift), false);
  assert.equal(canTapeMistrack(zine), false);
  assert.equal(canTapeMistrack(lid), false);
  assert.equal(canTapeMistrack(boy), false);

  assert.equal(markListingMistrack(mixtape, []), null);
  assert.equal(markListingMistrack(jewels, []), null);
  assert.equal(markListingMistrack(liner, []), null);
  assert.equal(markListingMistrack(chair, []), null);
  assert.equal(markListingMistrack(gift, []), null);
  assert.equal(markListingMistrack(zine, []), null);
  assert.equal(markListingMistrack(lid, []), null);
  assert.equal(markListingMistrack(boy, []), null);
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
  const taped = markListingMistrack(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingMistrack(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(mistrackCookieValue(cleared), "[]");
  assert.equal(isListingMistrackOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById(MISTRACK_LINER_ID);
  const taped = markListingMistrack(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingMistrack(liner, []), null);

  const cleared = clearListingMistrack(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(MISTRACK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingMistrack(chair, []), null);
});

test("mistrack write never aliases rake, vacuum, overhang, zenith, or leftover paper", () => {
  writeMistrackListingIds(["mdb-scratched-lp"]);
  assert.equal(MISTRACK_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.equal(RAKE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(ZENITH_STORAGE_KEY, "iss:zenith-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(MISTRACK_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(MISTRACK_COOKIE_NAME, "iss-billboard-listing-ids");
});
