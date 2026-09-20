import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import {
  VTA_CHAIR_ID,
  VTA_COOKIE_NAME,
  VTA_HOST_ID,
  VTA_LEAVE_LINE,
  VTA_NOTICE_TITLE,
  VTA_STORAGE_KEY,
  canTapeVta,
  clearListingVta,
  isListingVtaOverlay,
  markListingVta,
  parseVtaListingIds,
  readVtaListingIds,
  vtaCookieValue,
  writeVtaListingIds,
} from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the vta paper names", () => {
  assert.equal(VTA_STORAGE_KEY, "iss:vta-listing-ids");
  assert.equal(VTA_COOKIE_NAME, "iss-vta-listing-ids");
  assert.equal(VTA_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    VTA_NOTICE_TITLE,
    "I will not vta it. Still a skip. Still unnamed.",
  );
  assert.equal(VTA_LEAVE_LINE, "Leave the skip");
  assert.notEqual(VTA_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(VTA_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(VTA_STORAGE_KEY, "iss:sfa-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a vta set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseVtaListingIds(writeResult), []);
  assert.equal(
    isListingVtaOverlay(
      "mdb-scratched-lp",
      parseVtaListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseVtaListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = vtaCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseVtaListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeVta(lp));
  assert.equal(canTapeVta(mixtape), false);
  assert.equal(canTapeVta(jewels), false);
  assert.equal(canTapeVta(liner), false);

  const taped = markListingVta(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(vtaCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingVtaOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingVtaOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingVtaOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingVtaOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a vta write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(VTA_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeVta(mixtape), false);
  assert.equal(canTapeVta(jewels), false);
  assert.equal(canTapeVta(liner), false);
  assert.equal(canTapeVta(chair), false);
  assert.equal(canTapeVta(gift), false);
  assert.equal(canTapeVta(zine), false);
  assert.equal(canTapeVta(lid), false);
  assert.equal(canTapeVta(boy), false);

  assert.equal(markListingVta(mixtape, []), null);
  assert.equal(markListingVta(jewels, []), null);
  assert.equal(markListingVta(liner, []), null);
  assert.equal(markListingVta(chair, []), null);
  assert.equal(markListingVta(gift, []), null);
  assert.equal(markListingVta(zine, []), null);
  assert.equal(markListingVta(lid, []), null);
  assert.equal(markListingVta(boy, []), null);
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
  const taped = markListingVta(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingVta(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(vtaCookieValue(cleared), "[]");
  assert.equal(isListingVtaOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingVta(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingVta(mixtape, []), null);

  const cleared = clearListingVta(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(VTA_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingVta(chair, []), null);
});

test("vta write does not write riaa, vacuum, zenith, overhang, retip, azimuth, or nabs paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingVta(lp, []);
  assert.ok(taped);
  writeVtaListingIds(taped);
  assert.deepEqual(readVtaListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(VTA_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(VTA_STORAGE_KEY, "iss:sral-listing-ids");
  assert.notEqual(VTA_STORAGE_KEY, "iss:vtf-listing-ids");
  assert.notEqual(VTA_STORAGE_KEY, "iss:sfa-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, NABS_COOKIE_NAME);
  assert.notEqual(VTA_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-retip-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.notEqual(VTA_COOKIE_NAME, "iss-nabs-listing-ids");
  writeVtaListingIds([]);
});
