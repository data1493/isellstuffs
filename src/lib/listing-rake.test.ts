import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_COOKIE_NAME, AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { OVERHANG_COOKIE_NAME, OVERHANG_STORAGE_KEY } from "./listing-overhang";
import { PIVOT_COOKIE_NAME, PIVOT_STORAGE_KEY } from "./listing-pivot";
import {
  RAKE_CHAIR_ID,
  RAKE_COOKIE_NAME,
  RAKE_HOST_ID,
  RAKE_LEAVE_LINE,
  RAKE_NOTICE_TITLE,
  RAKE_STORAGE_KEY,
  canTapeRake,
  clearListingRake,
  isListingRakeOverlay,
  markListingRake,
  parseRakeListingIds,
  rakeCookieValue,
  readRakeListingIds,
  writeRakeListingIds,
} from "./listing-rake";
import { RESONANCE_COOKIE_NAME, RESONANCE_STORAGE_KEY } from "./listing-resonance";
import { VACUUM_COOKIE_NAME, VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_COOKIE_NAME, ZENITH_STORAGE_KEY } from "./listing-zenith";

test("cookie and storage keys stay the rake paper names", () => {
  assert.equal(RAKE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.equal(RAKE_COOKIE_NAME, "iss-rake-listing-ids");
  assert.equal(RAKE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RAKE_NOTICE_TITLE,
    "I will not rake it. Still a skip. Still unnamed.",
  );
  assert.equal(RAKE_LEAVE_LINE, "Leave the rake");
  assert.notEqual(RAKE_STORAGE_KEY, RESONANCE_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, PIVOT_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:thrust-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:reflex-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:stylus-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:sra-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, RESONANCE_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, PIVOT_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, AZIMUTH_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-fringe-listing-ids");
});

test("write-result objects never parse as a rake set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseRakeListingIds(writeResult), []);
  assert.equal(
    isListingRakeOverlay(
      "mdb-scratched-lp",
      parseRakeListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseRakeListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = rakeCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseRakeListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeRake(lp));
  assert.equal(canTapeRake(mixtape), false);
  assert.equal(canTapeRake(jewels), false);
  assert.equal(canTapeRake(liner), false);

  const taped = markListingRake(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(rakeCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingRakeOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingRakeOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingRakeOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRakeOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a rake write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RAKE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lid = listingById("kdr-lid-no-pot");
  const boy = listingById("gtk-game-boy");
  const font = listingById("dl-booth-font");

  assert.equal(canTapeRake(mixtape), false);
  assert.equal(canTapeRake(jewels), false);
  assert.equal(canTapeRake(liner), false);
  assert.equal(canTapeRake(chair), false);
  assert.equal(canTapeRake(gift), false);
  assert.equal(canTapeRake(zine), false);
  assert.equal(canTapeRake(lid), false);
  assert.equal(canTapeRake(boy), false);
  assert.equal(canTapeRake(font), false);

  assert.equal(markListingRake(mixtape, []), null);
  assert.equal(markListingRake(jewels, []), null);
  assert.equal(markListingRake(liner, []), null);
  assert.equal(markListingRake(chair, []), null);
  assert.equal(markListingRake(gift, []), null);
  assert.equal(markListingRake(zine, []), null);
  assert.equal(markListingRake(lid, []), null);
  assert.equal(markListingRake(boy, []), null);
  assert.equal(markListingRake(font, []), null);
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
  const taped = markListingRake(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingRake(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(rakeCookieValue(cleared), "[]");
  assert.equal(isListingRakeOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingRake(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRake(mixtape, []), null);

  const cleared = clearListingRake(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RAKE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRake(chair, []), null);
});

test("rake write does not write leftover resonance, vacuum, zenith, or overhang paper", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingRake(lp, []);
  assert.ok(taped);
  writeRakeListingIds(taped);
  assert.deepEqual(readRakeListingIds(), ["mdb-scratched-lp"]);
  assert.notEqual(RAKE_STORAGE_KEY, RESONANCE_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, PIVOT_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, OVERHANG_STORAGE_KEY);
  assert.notEqual(RAKE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:bsln-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(RAKE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, RESONANCE_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, PIVOT_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, VACUUM_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, ZENITH_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, OVERHANG_COOKIE_NAME);
  assert.notEqual(RAKE_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-zenith-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-overhang-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-bsln-listing-ids");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-booth-thrust");
  assert.notEqual(RAKE_COOKIE_NAME, "iss-booth-reflex");
  writeRakeListingIds([]);
});
