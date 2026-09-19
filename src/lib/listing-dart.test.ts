import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CINCH_STORAGE_KEY } from "./listing-cinch";
import { LINING_STORAGE_KEY } from "./listing-lining";
import { SPRAY_STORAGE_KEY } from "./listing-spray";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { WASH_STORAGE_KEY } from "./listing-wash";
import {
  DART_COOKIE_NAME,
  DART_HOST_ID,
  DART_LEAVE_LINE,
  DART_NOTICE_TITLE,
  DART_STORAGE_KEY,
  canTapeDart,
  clearListingDart,
  dartCookieValue,
  isListingDartOverlay,
  markListingDart,
  parseDartListingIds,
} from "./listing-dart";

test("cookie and storage keys stay the dart paper names", () => {
  assert.equal(DART_STORAGE_KEY, "iss:dart-listing-ids");
  assert.equal(DART_COOKIE_NAME, "iss-dart-listing-ids");
  assert.equal(DART_HOST_ID, "clo-windbreaker");
  assert.equal(
    DART_NOTICE_TITLE,
    "I will not dart it. Still worn twice. Still a car.",
  );
  assert.equal(DART_LEAVE_LINE, "Leave the hang");
  assert.notEqual(DART_STORAGE_KEY, WASH_STORAGE_KEY);
  assert.notEqual(DART_STORAGE_KEY, SPRAY_STORAGE_KEY);
  assert.notEqual(DART_STORAGE_KEY, LINING_STORAGE_KEY);
  assert.notEqual(DART_STORAGE_KEY, CINCH_STORAGE_KEY);
  assert.notEqual(DART_STORAGE_KEY, STITCH_STORAGE_KEY);
});

test("write-result objects never parse as a dart set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseDartListingIds(writeResult), []);
  assert.equal(
    isListingDartOverlay(
      "clo-windbreaker",
      parseDartListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = dartCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseDartListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, lamp, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const lamp = listingById("ysk-wobbly-lamp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(canTapeDart(jacket));
  assert.equal(canTapeDart(soles), false);
  assert.equal(canTapeDart(lamp), false);
  assert.equal(canTapeDart(mixtape), false);
  assert.equal(canTapeDart(jewels), false);
  assert.equal(canTapeDart(whisk), false);

  const taped = markListingDart(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(dartCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingDartOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingDartOverlay("clo-split-soles", taped), false);
  assert.equal(isListingDartOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingDartOverlay("mdb-mixtape-93", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, lamp, gift, and overlay-owned rows refuse a dart write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const lamp = listingById("ysk-wobbly-lamp");
  const gift = listingById("dl-mall-gift-card");
  const junk = listingById("dl-junk-pricing-pdf");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const whisk = listingById("kdr-bent-whisk");

  assert.equal(canTapeDart(soles), false);
  assert.equal(canTapeDart(zine), false);
  assert.equal(canTapeDart(lamp), false);
  assert.equal(canTapeDart(gift), false);
  assert.equal(canTapeDart(junk), false);
  assert.equal(canTapeDart(drawer), false);
  assert.equal(canTapeDart(disc), false);
  assert.equal(canTapeDart(mixtape), false);
  assert.equal(canTapeDart(jewels), false);
  assert.equal(canTapeDart(whisk), false);

  assert.equal(markListingDart(soles, []), null);
  assert.equal(markListingDart(zine, []), null);
  assert.equal(markListingDart(lamp, []), null);
  assert.equal(markListingDart(gift, []), null);
  assert.equal(markListingDart(junk, []), null);
  assert.equal(markListingDart(drawer, []), null);
  assert.equal(markListingDart(disc, []), null);
  assert.equal(markListingDart(mixtape, []), null);
  assert.equal(markListingDart(jewels, []), null);
  assert.equal(markListingDart(whisk, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jacket = listingById("clo-windbreaker");
  assert.ok(jacket);
  const before = {
    price: jacket.price,
    status: jacket.status,
    cartEligible: jacket.cartEligible,
  };
  const taped = markListingDart(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingDart(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(dartCookieValue(cleared), "[]");
  assert.equal(isListingDartOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingDart(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingDart(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
