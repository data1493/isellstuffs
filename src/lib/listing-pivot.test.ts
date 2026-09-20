import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  ANTISKATE_COOKIE_NAME,
  ANTISKATE_STORAGE_KEY,
} from "./listing-antiskate";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { DASHPOT_COOKIE_NAME, DASHPOT_STORAGE_KEY } from "./listing-dashpot";
import { GIMBAL_COOKIE_NAME, GIMBAL_STORAGE_KEY } from "./listing-gimbal";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import {
  PIVOT_CHAIR_ID,
  PIVOT_COOKIE_NAME,
  PIVOT_HOST_ID,
  PIVOT_LEAVE_LINE,
  PIVOT_NOTICE_TITLE,
  PIVOT_STORAGE_KEY,
  canTapePivot,
  clearListingPivot,
  isListingPivotOverlay,
  markListingPivot,
  parsePivotListingIds,
  pivotCookieValue,
  readPivotListingIds,
  writePivotListingIds,
} from "./listing-pivot";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { RUMBLE_COOKIE_NAME, RUMBLE_STORAGE_KEY } from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the pivot paper names", () => {
  assert.equal(PIVOT_STORAGE_KEY, "iss:pivot-listing-ids");
  assert.equal(PIVOT_COOKIE_NAME, "iss-pivot-listing-ids");
  assert.equal(PIVOT_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    PIVOT_NOTICE_TITLE,
    "I will not pivot it. Still a skip. Still unnamed.",
  );
  assert.equal(PIVOT_LEAVE_LINE, "Leave the pivot");
  assert.notEqual(PIVOT_STORAGE_KEY, DASHPOT_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:stylus-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:cartridge-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:sra-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:loading-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:stepup-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:skating-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:innergroove-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:antiweight-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:counterweight-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:tonearm-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:fluid-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:silicone-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:damper-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:compliance-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:offset-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:wow-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:unipivot-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:yoke-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:knifeedge-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:cantilever-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, DASHPOT_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a pivot set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parsePivotListingIds(writeResult), []);
  assert.equal(
    isListingPivotOverlay(
      "mdb-scratched-lp",
      parsePivotListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parsePivotListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = pivotCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parsePivotListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapePivot(lp));
  assert.equal(canTapePivot(mixtape), false);
  assert.equal(canTapePivot(jewels), false);
  assert.equal(canTapePivot(liner), false);

  const taped = markListingPivot(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(pivotCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingPivotOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingPivotOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingPivotOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingPivotOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a pivot write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(PIVOT_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapePivot(mixtape), false);
  assert.equal(canTapePivot(jewels), false);
  assert.equal(canTapePivot(liner), false);
  assert.equal(canTapePivot(chair), false);
  assert.equal(canTapePivot(gift), false);
  assert.equal(canTapePivot(zine), false);
  assert.equal(canTapePivot(lid), false);
  assert.equal(canTapePivot(boy), false);

  assert.equal(markListingPivot(mixtape, []), null);
  assert.equal(markListingPivot(jewels, []), null);
  assert.equal(markListingPivot(liner, []), null);
  assert.equal(markListingPivot(chair, []), null);
  assert.equal(markListingPivot(gift, []), null);
  assert.equal(markListingPivot(zine, []), null);
  assert.equal(markListingPivot(lid, []), null);
  assert.equal(markListingPivot(boy, []), null);
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
  const taped = markListingPivot(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingPivot(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pivotCookieValue(cleared), "[]");
  assert.equal(isListingPivotOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingPivot(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingPivot(mixtape, []), null);

  const cleared = clearListingPivot(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PIVOT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPivot(chair, []), null);
});

test("pivot write does not write dashpot, gimbal, antiskate, rumble, vta, riaa, vacuum, zenith, or overhang paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingPivot(lp, []);
  assert.ok(taped);
  writePivotListingIds(taped);
  assert.deepEqual(readPivotListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(PIVOT_STORAGE_KEY, DASHPOT_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:stylus-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:cartridge-listing-ids");
  assert.notEqual(PIVOT_STORAGE_KEY, "iss:sra-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, DASHPOT_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-dashpot-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-gimbal-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-antiskate-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-rumble-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(PIVOT_COOKIE_NAME, "iss-overhang-listing-ids");
  writePivotListingIds([]);
});
