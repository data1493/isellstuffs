import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BUSH_STORAGE_KEY } from "./listing-bush";
import {
  REAM_BURNED_ID,
  REAM_CHAIR_ID,
  REAM_COOKIE_NAME,
  REAM_HOST_ID,
  REAM_LEAVE_LINE,
  REAM_NOTICE_TITLE,
  REAM_STORAGE_KEY,
  canTapeReam,
  clearListingReam,
  isListingReamOverlay,
  markListingReam,
  parseReamListingIds,
  reamCookieValue,
} from "./listing-ream";
import { SWAGE_STORAGE_KEY } from "./listing-swage";
import { TWIST_STORAGE_KEY } from "./listing-twist";

test("cookie and storage keys stay the ream paper names", () => {
  assert.equal(REAM_STORAGE_KEY, "iss:ream-listing-ids");
  assert.equal(REAM_COOKIE_NAME, "iss-ream-listing-ids");
  assert.equal(REAM_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    REAM_NOTICE_TITLE,
    "I will not ream it. Still a crack. Still lights.",
  );
  assert.equal(REAM_LEAVE_LINE, "Leave the crack");
  assert.notEqual(REAM_STORAGE_KEY, BUSH_STORAGE_KEY);
  assert.notEqual(REAM_STORAGE_KEY, TWIST_STORAGE_KEY);
  assert.notEqual(REAM_STORAGE_KEY, SWAGE_STORAGE_KEY);
});

test("write-result objects never parse as a ream set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseReamListingIds(writeResult), []);
  assert.equal(
    isListingReamOverlay(
      "ysk-wobbly-lamp",
      parseReamListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = reamCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseReamListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, junk PDF, and burned CD-R stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById(REAM_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const burned = listingById(REAM_BURNED_ID);
  assert.ok(canTapeReam(lamp));
  assert.equal(canTapeReam(chair), false);
  assert.equal(canTapeReam(junk), false);
  assert.equal(canTapeReam(burned), false);

  const taped = markListingReam(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(reamCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingReamOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingReamOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingReamOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingReamOverlay("ysk-burned-cdr", taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, junk PDF, burned CD-R, gift, zine, and overlay-owned rows refuse a ream write", () => {
  const chair = listingById(REAM_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const burned = listingById(REAM_BURNED_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeReam(chair), false);
  assert.equal(canTapeReam(junk), false);
  assert.equal(canTapeReam(burned), false);
  assert.equal(canTapeReam(gift), false);
  assert.equal(canTapeReam(zine), false);
  assert.equal(canTapeReam(jacket), false);
  assert.equal(canTapeReam(mixtape), false);

  assert.equal(markListingReam(chair, []), null);
  assert.equal(markListingReam(junk, []), null);
  assert.equal(markListingReam(burned, []), null);
  assert.equal(markListingReam(gift, []), null);
  assert.equal(markListingReam(zine, []), null);
  assert.equal(markListingReam(jacket, []), null);
  assert.equal(markListingReam(mixtape, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  assert.ok(lamp);
  const before = {
    price: lamp.price,
    status: lamp.status,
    cartEligible: lamp.cartEligible,
  };
  const taped = markListingReam(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingReam(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(reamCookieValue(cleared), "[]");
  assert.equal(isListingReamOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingReam(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingReam(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(REAM_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingReam(chair, []), null);
});
