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
import { PIVOT_COOKIE_NAME, PIVOT_STORAGE_KEY } from "./listing-pivot";
import {
  RESONANCE_CHAIR_ID,
  RESONANCE_COOKIE_NAME,
  RESONANCE_HOST_ID,
  RESONANCE_LEAVE_LINE,
  RESONANCE_NOTICE_TITLE,
  RESONANCE_STORAGE_KEY,
  canTapeResonance,
  clearListingResonance,
  isListingResonanceOverlay,
  markListingResonance,
  parseResonanceListingIds,
  readResonanceListingIds,
  resonanceCookieValue,
  writeResonanceListingIds,
} from "./listing-resonance";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import { RUMBLE_COOKIE_NAME, RUMBLE_STORAGE_KEY } from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the resonance paper names", () => {
  assert.equal(RESONANCE_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.equal(RESONANCE_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.equal(RESONANCE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RESONANCE_NOTICE_TITLE,
    "I will not resonance it. Still a skip. Still unnamed.",
  );
  assert.equal(RESONANCE_LEAVE_LINE, "Leave the resonance");
  assert.notEqual(RESONANCE_STORAGE_KEY, PIVOT_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, DASHPOT_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:stylus-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:cartridge-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:sra-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, PIVOT_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, DASHPOT_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, NABS_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-bsln-listing-ids");
});

test("write-result objects never parse as a resonance set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseResonanceListingIds(writeResult), []);
  assert.equal(
    isListingResonanceOverlay(
      "mdb-scratched-lp",
      parseResonanceListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseResonanceListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = resonanceCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseResonanceListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeResonance(lp));
  assert.equal(canTapeResonance(mixtape), false);
  assert.equal(canTapeResonance(jewels), false);
  assert.equal(canTapeResonance(liner), false);

  const taped = markListingResonance(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(resonanceCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingResonanceOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingResonanceOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingResonanceOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingResonanceOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a resonance write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RESONANCE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");
  const font = listingById("dl-booth-font");

  assert.equal(canTapeResonance(mixtape), false);
  assert.equal(canTapeResonance(jewels), false);
  assert.equal(canTapeResonance(liner), false);
  assert.equal(canTapeResonance(chair), false);
  assert.equal(canTapeResonance(gift), false);
  assert.equal(canTapeResonance(zine), false);
  assert.equal(canTapeResonance(lid), false);
  assert.equal(canTapeResonance(boy), false);
  assert.equal(canTapeResonance(font), false);

  assert.equal(markListingResonance(mixtape, []), null);
  assert.equal(markListingResonance(jewels, []), null);
  assert.equal(markListingResonance(liner, []), null);
  assert.equal(markListingResonance(chair, []), null);
  assert.equal(markListingResonance(gift, []), null);
  assert.equal(markListingResonance(zine, []), null);
  assert.equal(markListingResonance(lid, []), null);
  assert.equal(markListingResonance(boy, []), null);
  assert.equal(markListingResonance(font, []), null);
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
  const taped = markListingResonance(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingResonance(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(resonanceCookieValue(cleared), "[]");
  assert.equal(isListingResonanceOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingResonance(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingResonance(mixtape, []), null);

  const cleared = clearListingResonance(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RESONANCE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingResonance(chair, []), null);
});

test("resonance write does not write pivot, dashpot, vacuum, zenith, or overhang paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingResonance(lp, []);
  assert.ok(taped);
  writeResonanceListingIds(taped);
  assert.deepEqual(readResonanceListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(RESONANCE_STORAGE_KEY, PIVOT_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, DASHPOT_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, GIMBAL_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, ANTISKATE_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RUMBLE_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:hmtx-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(RESONANCE_STORAGE_KEY, "iss:stylus-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, PIVOT_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, DASHPOT_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, GIMBAL_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, ANTISKATE_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, RUMBLE_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-pivot-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-dashpot-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-hmtx-listing-ids");
  assert.notEqual(RESONANCE_COOKIE_NAME, "iss-bsln-listing-ids");
  writeResonanceListingIds([]);
});
