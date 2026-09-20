import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  ANTISKATE_COOKIE_NAME,
  ANTISKATE_STORAGE_KEY,
} from "./listing-antiskate";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import {
  DASHPOT_CHAIR_ID,
  DASHPOT_COOKIE_NAME,
  DASHPOT_HOST_ID,
  DASHPOT_LEAVE_LINE,
  DASHPOT_NOTICE_TITLE,
  DASHPOT_STORAGE_KEY,
  canTapeDashpot,
  clearListingDashpot,
  dashpotCookieValue,
  isListingDashpotOverlay,
  markListingDashpot,
  parseDashpotListingIds,
  readDashpotListingIds,
  writeDashpotListingIds,
} from "./listing-dashpot";
import { GIMBAL_COOKIE_NAME, GIMBAL_STORAGE_KEY } from "./listing-gimbal";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { RUMBLE_COOKIE_NAME, RUMBLE_STORAGE_KEY } from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the dashpot paper names", () => {
  assert.equal(DASHPOT_STORAGE_KEY, "iss:dashpot-listing-ids");
  assert.equal(DASHPOT_COOKIE_NAME, "iss-dashpot-listing-ids");
  assert.equal(DASHPOT_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    DASHPOT_NOTICE_TITLE,
    "I will not dashpot it. Still a skip. Still unnamed.",
  );
  assert.equal(DASHPOT_LEAVE_LINE, "Leave the damper");
  assert.notEqual(DASHPOT_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:fluid-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:silicone-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:damper-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:compliance-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:offset-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:wow-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:unipivot-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:yoke-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:knifeedge-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:cantilever-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a dashpot set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseDashpotListingIds(writeResult), []);
  assert.equal(
    isListingDashpotOverlay(
      "mdb-scratched-lp",
      parseDashpotListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseDashpotListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = dashpotCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseDashpotListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeDashpot(lp));
  assert.equal(canTapeDashpot(mixtape), false);
  assert.equal(canTapeDashpot(jewels), false);
  assert.equal(canTapeDashpot(liner), false);

  const taped = markListingDashpot(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(dashpotCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingDashpotOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingDashpotOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingDashpotOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingDashpotOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a dashpot write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(DASHPOT_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeDashpot(mixtape), false);
  assert.equal(canTapeDashpot(jewels), false);
  assert.equal(canTapeDashpot(liner), false);
  assert.equal(canTapeDashpot(chair), false);
  assert.equal(canTapeDashpot(gift), false);
  assert.equal(canTapeDashpot(zine), false);
  assert.equal(canTapeDashpot(lid), false);
  assert.equal(canTapeDashpot(boy), false);

  assert.equal(markListingDashpot(mixtape, []), null);
  assert.equal(markListingDashpot(jewels, []), null);
  assert.equal(markListingDashpot(liner, []), null);
  assert.equal(markListingDashpot(chair, []), null);
  assert.equal(markListingDashpot(gift, []), null);
  assert.equal(markListingDashpot(zine, []), null);
  assert.equal(markListingDashpot(lid, []), null);
  assert.equal(markListingDashpot(boy, []), null);
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
  const taped = markListingDashpot(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingDashpot(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(dashpotCookieValue(cleared), "[]");
  assert.equal(isListingDashpotOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingDashpot(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingDashpot(mixtape, []), null);

  const cleared = clearListingDashpot(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DASHPOT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDashpot(chair, []), null);
});

test("dashpot write does not write gimbal, antiskate, rumble, vta, riaa, vacuum, zenith, or overhang paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingDashpot(lp, []);
  assert.ok(taped);
  writeDashpotListingIds(taped);
  assert.deepEqual(readDashpotListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(DASHPOT_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:fluid-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:silicone-listing-ids");
  assert.notEqual(DASHPOT_STORAGE_KEY, "iss:damper-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-gimbal-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-antiskate-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-rumble-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(DASHPOT_COOKIE_NAME, "iss-overhang-listing-ids");
  writeDashpotListingIds([]);
});
