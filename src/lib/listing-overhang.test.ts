import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANTISTAT_COOKIE_NAME, ANTISTAT_STORAGE_KEY } from "./listing-antistat";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { HONE_COOKIE_NAME, HONE_STORAGE_KEY } from "./listing-hone";
import { LATHE_COOKIE_NAME, LATHE_STORAGE_KEY } from "./listing-lathe";
import {
  OVERHANG_CHAIR_ID,
  OVERHANG_COOKIE_NAME,
  OVERHANG_HOST_ID,
  OVERHANG_LEAVE_LINE,
  OVERHANG_NOTICE_TITLE,
  OVERHANG_STORAGE_KEY,
  canTapeOverhang,
  clearListingOverhang,
  isListingOverhangOverlay,
  markListingOverhang,
  overhangCookieValue,
  parseOverhangListingIds,
  writeOverhangListingIds,
} from "./listing-overhang";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";

test("cookie and storage keys stay the overhang paper names", () => {
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(OVERHANG_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.equal(OVERHANG_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    OVERHANG_NOTICE_TITLE,
    "I will not overhang it. Still a skip. Still unnamed.",
  );
  assert.equal(OVERHANG_LEAVE_LINE, "Leave the skip");
  assert.notEqual(OVERHANG_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, LATHE_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, ANTISTAT_STORAGE_KEY);
  assert.notEqual(OVERHANG_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, LATHE_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-bias-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-ion-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-baerwald-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-stevenson-listing-ids");
});

test("write-result objects never parse as an overhang set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseOverhangListingIds(writeResult), []);
  assert.equal(
    isListingOverhangOverlay(
      "mdb-scratched-lp",
      parseOverhangListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = overhangCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseOverhangListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeOverhang(lp));
  assert.equal(canTapeOverhang(mixtape), false);
  assert.equal(canTapeOverhang(jewels), false);
  assert.equal(canTapeOverhang(liner), false);

  const taped = markListingOverhang(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(overhangCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingOverhangOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingOverhangOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingOverhangOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingOverhangOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse an overhang write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(OVERHANG_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeOverhang(mixtape), false);
  assert.equal(canTapeOverhang(jewels), false);
  assert.equal(canTapeOverhang(liner), false);
  assert.equal(canTapeOverhang(chair), false);
  assert.equal(canTapeOverhang(gift), false);
  assert.equal(canTapeOverhang(zine), false);
  assert.equal(canTapeOverhang(lid), false);
  assert.equal(canTapeOverhang(boy), false);

  assert.equal(markListingOverhang(mixtape, []), null);
  assert.equal(markListingOverhang(jewels, []), null);
  assert.equal(markListingOverhang(liner, []), null);
  assert.equal(markListingOverhang(chair, []), null);
  assert.equal(markListingOverhang(gift, []), null);
  assert.equal(markListingOverhang(zine, []), null);
  assert.equal(markListingOverhang(lid, []), null);
  assert.equal(markListingOverhang(boy, []), null);
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
  const taped = markListingOverhang(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingOverhang(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(overhangCookieValue(cleared), "[]");
  assert.equal(isListingOverhangOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingOverhang(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingOverhang(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(OVERHANG_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingOverhang(chair, []), null);
});

test("write never touches vacuum, azimuth, lathe, hone, or antistat storage keys", () => {
  writeOverhangListingIds(["mdb-scratched-lp"]);
  assert.equal(OVERHANG_STORAGE_KEY, "iss:overhang-listing-ids");
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.equal(LATHE_STORAGE_KEY, "iss:lathe-listing-ids");
  assert.equal(HONE_STORAGE_KEY, "iss:hone-listing-ids");
  assert.equal(ANTISTAT_STORAGE_KEY, "iss:antistat-listing-ids");
  assert.notEqual(OVERHANG_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, LATHE_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(OVERHANG_STORAGE_KEY, ANTISTAT_STORAGE_KEY);
  assert.notEqual(OVERHANG_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, LATHE_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, HONE_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, ANTISTAT_COOKIE_NAME);
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-lathe-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-hone-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-antistat-listing-ids");
  assert.notEqual(OVERHANG_COOKIE_NAME, "iss-bias-listing-ids");
});
