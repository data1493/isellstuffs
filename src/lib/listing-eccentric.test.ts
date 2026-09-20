import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import {
  ECCENTRIC_CHAIR_ID,
  ECCENTRIC_COOKIE_NAME,
  ECCENTRIC_GIFT_ID,
  ECCENTRIC_HOST_ID,
  ECCENTRIC_JEWELS_ID,
  ECCENTRIC_LEAVE_LINE,
  ECCENTRIC_LINER_ID,
  ECCENTRIC_MIXTAPE_ID,
  ECCENTRIC_NOTICE_TITLE,
  ECCENTRIC_STORAGE_KEY,
  ECCENTRIC_ZINE_ID,
  canTapeEccentric,
  clearListingEccentric,
  eccentricCookieValue,
  isListingEccentricOverlay,
  markListingEccentric,
  parseEccentricListingIds,
  writeEccentricListingIds,
} from "./listing-eccentric";
import { MISTRACK_COOKIE_NAME, MISTRACK_STORAGE_KEY } from "./listing-mistrack";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RAKE_COOKIE_NAME, RAKE_STORAGE_KEY } from "./listing-rake";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the eccentric paper names", () => {
  assert.equal(ECCENTRIC_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.equal(ECCENTRIC_COOKIE_NAME, "iss-eccentric-listing-ids");
  assert.equal(ECCENTRIC_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    ECCENTRIC_NOTICE_TITLE,
    "I will not eccentric it. Still a skip. Still unnamed.",
  );
  assert.equal(ECCENTRIC_LEAVE_LINE, "Leave the eccentric");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, MISTRACK_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:pivot-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:dashpot-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:gimbal-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:antiskate-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:rumble-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:vta-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:riaa-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:offcenter-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, MISTRACK_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-zenith-listing-ids");
});

test("write-result objects never parse as an eccentric set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseEccentricListingIds(writeResult), []);
  assert.equal(
    isListingEccentricOverlay(
      "mdb-scratched-lp",
      parseEccentricListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = eccentricCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseEccentricListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById(ECCENTRIC_MIXTAPE_ID);
  const jewels = listingById(ECCENTRIC_JEWELS_ID);
  const liner = listingById(ECCENTRIC_LINER_ID);

  assert.ok(canTapeEccentric(lp));
  assert.equal(canTapeEccentric(mixtape), false);
  assert.equal(canTapeEccentric(jewels), false);
  assert.equal(canTapeEccentric(liner), false);

  const taped = markListingEccentric(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(eccentricCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingEccentricOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingEccentricOverlay(ECCENTRIC_MIXTAPE_ID, taped), false);
  assert.equal(isListingEccentricOverlay(ECCENTRIC_JEWELS_ID, taped), false);
  assert.equal(isListingEccentricOverlay(ECCENTRIC_LINER_ID, taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse an eccentric write", () => {
  const mixtape = listingById(ECCENTRIC_MIXTAPE_ID);
  const jewels = listingById(ECCENTRIC_JEWELS_ID);
  const liner = listingById(ECCENTRIC_LINER_ID);
  const chair = listingById(ECCENTRIC_CHAIR_ID);
  const gift = listingById(ECCENTRIC_GIFT_ID);
  const zine = listingById(ECCENTRIC_ZINE_ID);
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeEccentric(mixtape), false);
  assert.equal(canTapeEccentric(jewels), false);
  assert.equal(canTapeEccentric(liner), false);
  assert.equal(canTapeEccentric(chair), false);
  assert.equal(canTapeEccentric(gift), false);
  assert.equal(canTapeEccentric(zine), false);
  assert.equal(canTapeEccentric(lid), false);
  assert.equal(canTapeEccentric(boy), false);

  assert.equal(markListingEccentric(mixtape, []), null);
  assert.equal(markListingEccentric(jewels, []), null);
  assert.equal(markListingEccentric(liner, []), null);
  assert.equal(markListingEccentric(chair, []), null);
  assert.equal(markListingEccentric(gift, []), null);
  assert.equal(markListingEccentric(zine, []), null);
  assert.equal(markListingEccentric(lid, []), null);
  assert.equal(markListingEccentric(boy, []), null);
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
  const taped = markListingEccentric(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingEccentric(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(eccentricCookieValue(cleared), "[]");
  assert.equal(isListingEccentricOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById(ECCENTRIC_LINER_ID);
  const taped = markListingEccentric(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingEccentric(liner, []), null);

  const cleared = clearListingEccentric(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ECCENTRIC_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingEccentric(chair, []), null);
});

test("eccentric write never aliases mistrack, rake, vacuum, overhang, zenith, or leftover paper", () => {
  writeEccentricListingIds(["mdb-scratched-lp"]);
  assert.equal(ECCENTRIC_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.equal(MISTRACK_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.equal(RAKE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(ZENITH_STORAGE_KEY, "iss:zenith-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, MISTRACK_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(ECCENTRIC_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, MISTRACK_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(ECCENTRIC_COOKIE_NAME, "iss-haidinger-listing-ids");
});
