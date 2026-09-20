import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { NABS_COOKIE_NAME, NABS_STORAGE_KEY } from "./listing-nabs";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { RETIP_COOKIE_NAME, RETIP_STORAGE_KEY } from "./listing-retip";
import { RIAA_COOKIE_NAME, RIAA_STORAGE_KEY } from "./listing-riaa";
import {
  RUMBLE_CHAIR_ID,
  RUMBLE_COOKIE_NAME,
  RUMBLE_HOST_ID,
  RUMBLE_LEAVE_LINE,
  RUMBLE_NOTICE_TITLE,
  RUMBLE_STORAGE_KEY,
  canTapeRumble,
  clearListingRumble,
  isListingRumbleOverlay,
  markListingRumble,
  parseRumbleListingIds,
  readRumbleListingIds,
  rumbleCookieValue,
  writeRumbleListingIds,
} from "./listing-rumble";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { VTA_COOKIE_NAME, VTA_STORAGE_KEY } from "./listing-vta";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the rumble paper names", () => {
  assert.equal(RUMBLE_STORAGE_KEY, "iss:rumble-listing-ids");
  assert.equal(RUMBLE_COOKIE_NAME, "iss-rumble-listing-ids");
  assert.equal(RUMBLE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RUMBLE_NOTICE_TITLE,
    "I will not rumble it. Still unnamed. Still a skip.",
  );
  assert.equal(RUMBLE_LEAVE_LINE, "Leave the skip");
  assert.notEqual(RUMBLE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, NABS_COOKIE_NAME);
});

test("write-result objects never parse as a rumble set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseRumbleListingIds(writeResult), []);
  assert.equal(
    isListingRumbleOverlay(
      "mdb-scratched-lp",
      parseRumbleListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseRumbleListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = rumbleCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseRumbleListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeRumble(lp));
  assert.equal(canTapeRumble(mixtape), false);
  assert.equal(canTapeRumble(jewels), false);
  assert.equal(canTapeRumble(liner), false);

  const taped = markListingRumble(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(rumbleCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingRumbleOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingRumbleOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingRumbleOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRumbleOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a rumble write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RUMBLE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeRumble(mixtape), false);
  assert.equal(canTapeRumble(jewels), false);
  assert.equal(canTapeRumble(liner), false);
  assert.equal(canTapeRumble(chair), false);
  assert.equal(canTapeRumble(gift), false);
  assert.equal(canTapeRumble(zine), false);
  assert.equal(canTapeRumble(lid), false);
  assert.equal(canTapeRumble(boy), false);

  assert.equal(markListingRumble(mixtape, []), null);
  assert.equal(markListingRumble(jewels, []), null);
  assert.equal(markListingRumble(liner, []), null);
  assert.equal(markListingRumble(chair, []), null);
  assert.equal(markListingRumble(gift, []), null);
  assert.equal(markListingRumble(zine, []), null);
  assert.equal(markListingRumble(lid, []), null);
  assert.equal(markListingRumble(boy, []), null);
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
  const taped = markListingRumble(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingRumble(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(rumbleCookieValue(cleared), "[]");
  assert.equal(isListingRumbleOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingRumble(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRumble(mixtape, []), null);

  const cleared = clearListingRumble(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RUMBLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRumble(chair, []), null);
});

test("rumble write does not write vta, riaa, vacuum, zenith, overhang, retip, azimuth, or nabs paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingRumble(lp, []);
  assert.ok(taped);
  writeRumbleListingIds(taped);
  assert.deepEqual(readRumbleListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(RUMBLE_STORAGE_KEY, VTA_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, RIAA_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, RETIP_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, NABS_STORAGE_KEY);
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:hum-listing-ids");
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:isolation-listing-ids");
  assert.notEqual(RUMBLE_STORAGE_KEY, "iss:subsonic-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, VTA_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, RIAA_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, RETIP_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, NABS_COOKIE_NAME);
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-vta-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-riaa-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(RUMBLE_COOKIE_NAME, "iss-retip-listing-ids");
  writeRumbleListingIds([]);
});
