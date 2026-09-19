import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LINING_STORAGE_KEY } from "./listing-lining";
import { SPRAY_STORAGE_KEY } from "./listing-spray";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { WASH_STORAGE_KEY } from "./listing-wash";
import {
  CINCH_COOKIE_NAME,
  CINCH_LEAVE_LINE,
  CINCH_NOTICE_TITLE,
  CINCH_STORAGE_KEY,
  canTapeCinch,
  cinchCookieValue,
  clearListingCinch,
  isListingCinchOverlay,
  markListingCinch,
  parseCinchListingIds,
} from "./listing-cinch";

test("cookie and storage keys stay the cinch paper names", () => {
  assert.equal(CINCH_STORAGE_KEY, "iss:cinch-listing-ids");
  assert.equal(CINCH_COOKIE_NAME, "iss-cinch-listing-ids");
  assert.equal(
    CINCH_NOTICE_TITLE,
    "I will not cinch it. Still pits. Still a hopeful L.",
  );
  assert.equal(CINCH_LEAVE_LINE, "Leave the waist");
  assert.notEqual(CINCH_STORAGE_KEY, WASH_STORAGE_KEY);
  assert.notEqual(CINCH_STORAGE_KEY, SPRAY_STORAGE_KEY);
  assert.notEqual(CINCH_STORAGE_KEY, LINING_STORAGE_KEY);
  assert.notEqual(CINCH_STORAGE_KEY, STITCH_STORAGE_KEY);
});

test("write-result objects never parse as a cinch set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseCinchListingIds(writeResult), []);
  assert.equal(
    isListingCinchOverlay("clo-windbreaker", parseCinchListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = cinchCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseCinchListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers and Game Boy stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const boy = listingById("gtk-game-boy");
  assert.ok(canTapeCinch(jacket));
  assert.equal(canTapeCinch(soles), false);
  assert.ok(canTapeCinch(boy));

  const taped = markListingCinch(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(cinchCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingCinchOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingCinchOverlay("clo-split-soles", taped), false);
  assert.equal(isListingCinchOverlay("gtk-game-boy", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, LUTs, sample pack, gift, and stain zine refuse a cinch write", () => {
  const soles = listingById("clo-split-soles");
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeCinch(soles), false);
  assert.equal(canTapeCinch(luts), false);
  assert.equal(canTapeCinch(pack), false);
  assert.equal(canTapeCinch(gift), false);
  assert.equal(canTapeCinch(zine), false);

  assert.equal(markListingCinch(soles, []), null);
  assert.equal(markListingCinch(luts, []), null);
  assert.equal(markListingCinch(pack, []), null);
  assert.equal(markListingCinch(gift, []), null);
  assert.equal(markListingCinch(zine, []), null);
  assert.equal(soles?.status, "available");
  assert.equal(zine?.status, "file-gone");
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingCinch(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(cinchCookieValue(cleared), "[]");
  assert.equal(isListingCinchOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingCinch(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingCinch(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
