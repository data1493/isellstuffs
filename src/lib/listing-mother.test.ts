import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { ECCENTRIC_COOKIE_NAME, ECCENTRIC_STORAGE_KEY } from "./listing-eccentric";
import { MISTRACK_COOKIE_NAME, MISTRACK_STORAGE_KEY } from "./listing-mistrack";
import {
  MOTHER_CHAIR_ID,
  MOTHER_COOKIE_NAME,
  MOTHER_GIFT_ID,
  MOTHER_HOST_ID,
  MOTHER_JEWELS_ID,
  MOTHER_LEAVE_LINE,
  MOTHER_LINER_ID,
  MOTHER_MIXTAPE_ID,
  MOTHER_NOTICE_TITLE,
  MOTHER_STORAGE_KEY,
  MOTHER_ZINE_ID,
  canTapeMother,
  clearListingMother,
  isListingMotherOverlay,
  markListingMother,
  motherCookieValue,
  parseMotherListingIds,
  writeMotherListingIds,
} from "./listing-mother";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RAKE_COOKIE_NAME, RAKE_STORAGE_KEY } from "./listing-rake";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the mother paper names", () => {
  assert.equal(MOTHER_STORAGE_KEY, "iss:mother-listing-ids");
  assert.equal(MOTHER_COOKIE_NAME, "iss-mother-listing-ids");
  assert.equal(MOTHER_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    MOTHER_NOTICE_TITLE,
    "I will not mother it. Still a skip. Still unnamed.",
  );
  assert.equal(MOTHER_LEAVE_LINE, "Leave the mother");
  assert.notEqual(MOTHER_STORAGE_KEY, ECCENTRIC_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, MISTRACK_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:pivot-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:dashpot-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:gimbal-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:antiskate-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:rumble-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:vta-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:riaa-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:flywheel-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:offcenter-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, MISTRACK_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-eccentric-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-brewster-listing-ids");
});

test("write-result objects never parse as a mother set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseMotherListingIds(writeResult), []);
  assert.equal(
    isListingMotherOverlay(
      "mdb-scratched-lp",
      parseMotherListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = motherCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseMotherListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById(MOTHER_MIXTAPE_ID);
  const jewels = listingById(MOTHER_JEWELS_ID);
  const liner = listingById(MOTHER_LINER_ID);

  assert.ok(canTapeMother(lp));
  assert.equal(canTapeMother(mixtape), false);
  assert.equal(canTapeMother(jewels), false);
  assert.equal(canTapeMother(liner), false);

  const taped = markListingMother(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(motherCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingMotherOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingMotherOverlay(MOTHER_MIXTAPE_ID, taped), false);
  assert.equal(isListingMotherOverlay(MOTHER_JEWELS_ID, taped), false);
  assert.equal(isListingMotherOverlay(MOTHER_LINER_ID, taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a mother write", () => {
  const mixtape = listingById(MOTHER_MIXTAPE_ID);
  const jewels = listingById(MOTHER_JEWELS_ID);
  const liner = listingById(MOTHER_LINER_ID);
  const chair = listingById(MOTHER_CHAIR_ID);
  const gift = listingById(MOTHER_GIFT_ID);
  const zine = listingById(MOTHER_ZINE_ID);
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");
  const font = listingById("dl-booth-font");

  assert.equal(canTapeMother(mixtape), false);
  assert.equal(canTapeMother(jewels), false);
  assert.equal(canTapeMother(liner), false);
  assert.equal(canTapeMother(chair), false);
  assert.equal(canTapeMother(gift), false);
  assert.equal(canTapeMother(zine), false);
  assert.equal(canTapeMother(lid), false);
  assert.equal(canTapeMother(boy), false);
  assert.equal(canTapeMother(font), false);

  assert.equal(markListingMother(mixtape, []), null);
  assert.equal(markListingMother(jewels, []), null);
  assert.equal(markListingMother(liner, []), null);
  assert.equal(markListingMother(chair, []), null);
  assert.equal(markListingMother(gift, []), null);
  assert.equal(markListingMother(zine, []), null);
  assert.equal(markListingMother(lid, []), null);
  assert.equal(markListingMother(boy, []), null);
  assert.equal(markListingMother(font, []), null);
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
  const taped = markListingMother(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingMother(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(motherCookieValue(cleared), "[]");
  assert.equal(isListingMotherOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById(MOTHER_LINER_ID);
  const taped = markListingMother(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingMother(liner, []), null);

  const cleared = clearListingMother(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(MOTHER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingMother(chair, []), null);
});

test("mother write never aliases leftover eccentric, mistrack, vacuum, or leftover paper", () => {
  writeMotherListingIds(["mdb-scratched-lp"]);
  assert.equal(MOTHER_STORAGE_KEY, "iss:mother-listing-ids");
  assert.equal(ECCENTRIC_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.equal(MISTRACK_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.equal(RAKE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(ZENITH_STORAGE_KEY, "iss:zenith-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, ECCENTRIC_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, MISTRACK_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, RAKE_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:flywheel-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(MOTHER_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, MISTRACK_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, RAKE_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-eccentric-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(MOTHER_COOKIE_NAME, "iss-brewster-listing-ids");
});
