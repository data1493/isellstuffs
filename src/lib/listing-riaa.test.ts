import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import {
  RIAA_CHAIR_ID,
  RIAA_COOKIE_NAME,
  RIAA_HOST_ID,
  RIAA_LEAVE_LINE,
  RIAA_NOTICE_TITLE,
  RIAA_STORAGE_KEY,
  canTapeRiaa,
  clearListingRiaa,
  isListingRiaaOverlay,
  markListingRiaa,
  parseRiaaListingIds,
  readRiaaListingIds,
  riaaCookieValue,
  writeRiaaListingIds,
} from "./listing-riaa";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the riaa paper names", () => {
  assert.equal(RIAA_STORAGE_KEY, "iss:riaa-listing-ids");
  assert.equal(RIAA_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.equal(RIAA_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RIAA_NOTICE_TITLE,
    "I will not riaa it. Still a skip. Still unnamed.",
  );
  assert.equal(RIAA_LEAVE_LINE, "Leave the skip");
  assert.notEqual(RIAA_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, "iss:iec98-listing-ids");
  assert.notEqual(RIAA_STORAGE_KEY, "iss:nartb-listing-ids");
  assert.notEqual(RIAA_STORAGE_KEY, "iss:emphasis-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a riaa set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseRiaaListingIds(writeResult), []);
  assert.equal(
    isListingRiaaOverlay(
      "mdb-scratched-lp",
      parseRiaaListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseRiaaListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = riaaCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseRiaaListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeRiaa(lp));
  assert.equal(canTapeRiaa(mixtape), false);
  assert.equal(canTapeRiaa(jewels), false);
  assert.equal(canTapeRiaa(liner), false);

  const taped = markListingRiaa(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(riaaCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingRiaaOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingRiaaOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingRiaaOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRiaaOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a riaa write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RIAA_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeRiaa(mixtape), false);
  assert.equal(canTapeRiaa(jewels), false);
  assert.equal(canTapeRiaa(liner), false);
  assert.equal(canTapeRiaa(chair), false);
  assert.equal(canTapeRiaa(gift), false);
  assert.equal(canTapeRiaa(zine), false);
  assert.equal(canTapeRiaa(lid), false);
  assert.equal(canTapeRiaa(boy), false);

  assert.equal(markListingRiaa(mixtape, []), null);
  assert.equal(markListingRiaa(jewels, []), null);
  assert.equal(markListingRiaa(liner, []), null);
  assert.equal(markListingRiaa(chair, []), null);
  assert.equal(markListingRiaa(gift, []), null);
  assert.equal(markListingRiaa(zine, []), null);
  assert.equal(markListingRiaa(lid, []), null);
  assert.equal(markListingRiaa(boy, []), null);
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
  const taped = markListingRiaa(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingRiaa(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(riaaCookieValue(cleared), "[]");
  assert.equal(isListingRiaaOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingRiaa(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRiaa(mixtape, []), null);

  const cleared = clearListingRiaa(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RIAA_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRiaa(chair, []), null);
});

test("riaa write does not write vacuum, zenith, overhang, retip, azimuth, or nabs paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingRiaa(lp, []);
  assert.ok(taped);
  writeRiaaListingIds(taped);
  assert.deepEqual(readRiaaListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(RIAA_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RIAA_STORAGE_KEY, "iss:iec98-listing-ids");
  assert.notEqual(RIAA_STORAGE_KEY, "iss:nartb-listing-ids");
  assert.notEqual(RIAA_STORAGE_KEY, "iss:emphasis-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, NABS_COOKIE_NAME);
  assert.notEqual(RIAA_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, "iss-retip-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(RIAA_COOKIE_NAME, "iss-nabs-listing-ids");
  writeRiaaListingIds([]);
});
