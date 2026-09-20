import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  ANTISKATE_COOKIE_NAME,
  ANTISKATE_STORAGE_KEY,
} from "./listing-antiskate";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import {
  GIMBAL_CHAIR_ID,
  GIMBAL_COOKIE_NAME,
  GIMBAL_HOST_ID,
  GIMBAL_LEAVE_LINE,
  GIMBAL_NOTICE_TITLE,
  GIMBAL_STORAGE_KEY,
  canTapeGimbal,
  clearListingGimbal,
  gimbalCookieValue,
  isListingGimbalOverlay,
  markListingGimbal,
  parseGimbalListingIds,
  readGimbalListingIds,
  writeGimbalListingIds,
} from "./listing-gimbal";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { RUMBLE_COOKIE_NAME, RUMBLE_STORAGE_KEY } from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the gimbal paper names", () => {
  assert.equal(GIMBAL_STORAGE_KEY, "iss:gimbal-listing-ids");
  assert.equal(GIMBAL_COOKIE_NAME, "iss-gimbal-listing-ids");
  assert.equal(GIMBAL_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    GIMBAL_NOTICE_TITLE,
    "I will not gimbal it. Still a skip. Still unnamed.",
  );
  assert.equal(GIMBAL_LEAVE_LINE, "Leave the yoke");
  assert.notEqual(GIMBAL_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:wow-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:unipivot-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:yoke-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:knifeedge-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a gimbal set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseGimbalListingIds(writeResult), []);
  assert.equal(
    isListingGimbalOverlay(
      "mdb-scratched-lp",
      parseGimbalListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseGimbalListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = gimbalCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseGimbalListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeGimbal(lp));
  assert.equal(canTapeGimbal(mixtape), false);
  assert.equal(canTapeGimbal(jewels), false);
  assert.equal(canTapeGimbal(liner), false);

  const taped = markListingGimbal(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(gimbalCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingGimbalOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingGimbalOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingGimbalOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingGimbalOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a gimbal write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(GIMBAL_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeGimbal(mixtape), false);
  assert.equal(canTapeGimbal(jewels), false);
  assert.equal(canTapeGimbal(liner), false);
  assert.equal(canTapeGimbal(chair), false);
  assert.equal(canTapeGimbal(gift), false);
  assert.equal(canTapeGimbal(zine), false);
  assert.equal(canTapeGimbal(lid), false);
  assert.equal(canTapeGimbal(boy), false);

  assert.equal(markListingGimbal(mixtape, []), null);
  assert.equal(markListingGimbal(jewels, []), null);
  assert.equal(markListingGimbal(liner, []), null);
  assert.equal(markListingGimbal(chair, []), null);
  assert.equal(markListingGimbal(gift, []), null);
  assert.equal(markListingGimbal(zine, []), null);
  assert.equal(markListingGimbal(lid, []), null);
  assert.equal(markListingGimbal(boy, []), null);
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
  const taped = markListingGimbal(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingGimbal(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gimbalCookieValue(cleared), "[]");
  assert.equal(isListingGimbalOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingGimbal(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGimbal(mixtape, []), null);

  const cleared = clearListingGimbal(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GIMBAL_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGimbal(chair, []), null);
});

test("gimbal write does not write antiskate, rumble, vta, riaa, vacuum, zenith, or overhang paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingGimbal(lp, []);
  assert.ok(taped);
  writeGimbalListingIds(taped);
  assert.deepEqual(readGimbalListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(GIMBAL_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(GIMBAL_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-antiskate-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-rumble-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(GIMBAL_COOKIE_NAME, "iss-overhang-listing-ids");
  writeGimbalListingIds([]);
});
