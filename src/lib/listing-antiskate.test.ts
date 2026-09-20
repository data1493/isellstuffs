import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import {
  ANTISKATE_CHAIR_ID,
  ANTISKATE_COOKIE_NAME,
  ANTISKATE_HOST_ID,
  ANTISKATE_LEAVE_LINE,
  ANTISKATE_NOTICE_TITLE,
  ANTISKATE_STORAGE_KEY,
  antiskateCookieValue,
  canTapeAntiskate,
  clearListingAntiskate,
  isListingAntiskateOverlay,
  markListingAntiskate,
  parseAntiskateListingIds,
  readAntiskateListingIds,
  writeAntiskateListingIds,
} from "./listing-antiskate";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { RUMBLE_COOKIE_NAME, RUMBLE_STORAGE_KEY } from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the antiskate paper names", () => {
  assert.equal(ANTISKATE_STORAGE_KEY, "iss:antiskate-listing-ids");
  assert.equal(ANTISKATE_COOKIE_NAME, "iss-antiskate-listing-ids");
  assert.equal(ANTISKATE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    ANTISKATE_NOTICE_TITLE,
    "I will not antiskate it. Still a skip. Still unnamed.",
  );
  assert.equal(ANTISKATE_LEAVE_LINE, "Leave the pull");
  assert.notEqual(ANTISKATE_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:wow-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as an antiskate set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseAntiskateListingIds(writeResult), []);
  assert.equal(
    isListingAntiskateOverlay(
      "mdb-scratched-lp",
      parseAntiskateListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseAntiskateListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = antiskateCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseAntiskateListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeAntiskate(lp));
  assert.equal(canTapeAntiskate(mixtape), false);
  assert.equal(canTapeAntiskate(jewels), false);
  assert.equal(canTapeAntiskate(liner), false);

  const taped = markListingAntiskate(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(antiskateCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingAntiskateOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingAntiskateOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingAntiskateOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingAntiskateOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse an antiskate write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(ANTISKATE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeAntiskate(mixtape), false);
  assert.equal(canTapeAntiskate(jewels), false);
  assert.equal(canTapeAntiskate(liner), false);
  assert.equal(canTapeAntiskate(chair), false);
  assert.equal(canTapeAntiskate(gift), false);
  assert.equal(canTapeAntiskate(zine), false);
  assert.equal(canTapeAntiskate(lid), false);
  assert.equal(canTapeAntiskate(boy), false);

  assert.equal(markListingAntiskate(mixtape, []), null);
  assert.equal(markListingAntiskate(jewels, []), null);
  assert.equal(markListingAntiskate(liner, []), null);
  assert.equal(markListingAntiskate(chair, []), null);
  assert.equal(markListingAntiskate(gift, []), null);
  assert.equal(markListingAntiskate(zine, []), null);
  assert.equal(markListingAntiskate(lid, []), null);
  assert.equal(markListingAntiskate(boy, []), null);
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
  const taped = markListingAntiskate(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingAntiskate(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(antiskateCookieValue(cleared), "[]");
  assert.equal(isListingAntiskateOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingAntiskate(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingAntiskate(mixtape, []), null);

  const cleared = clearListingAntiskate(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ANTISKATE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAntiskate(chair, []), null);
});

test("antiskate write does not write rumble, vta, riaa, vacuum, zenith, overhang, retip, or azimuth paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingAntiskate(lp, []);
  assert.ok(taped);
  writeAntiskateListingIds(taped);
  assert.deepEqual(readAntiskateListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(ANTISKATE_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(ANTISKATE_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, NABS_COOKIE_NAME);
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-rumble-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(ANTISKATE_COOKIE_NAME, "iss-overhang-listing-ids");
  writeAntiskateListingIds([]);
});
