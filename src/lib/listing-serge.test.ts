import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CINCH_STORAGE_KEY } from "./listing-cinch";
import { DART_STORAGE_KEY } from "./listing-dart";
import { WASH_STORAGE_KEY } from "./listing-wash";
import {
  SERGE_CHAIR_ID,
  SERGE_COOKIE_NAME,
  SERGE_HOST_ID,
  SERGE_LEAVE_LINE,
  SERGE_NOTICE_TITLE,
  SERGE_STORAGE_KEY,
  canTapeSerge,
  clearListingSerge,
  isListingSergeOverlay,
  markListingSerge,
  parseSergeListingIds,
  sergeCookieValue,
} from "./listing-serge";

test("cookie and storage keys stay the serge paper names", () => {
  assert.equal(SERGE_STORAGE_KEY, "iss:serge-listing-ids");
  assert.equal(SERGE_COOKIE_NAME, "iss-serge-listing-ids");
  assert.equal(SERGE_HOST_ID, "clo-windbreaker");
  assert.equal(
    SERGE_NOTICE_TITLE,
    "I will not serge it. Still worn twice. Still a car.",
  );
  assert.equal(SERGE_LEAVE_LINE, "Leave the raw edge");
  assert.notEqual(SERGE_STORAGE_KEY, DART_STORAGE_KEY);
  assert.notEqual(SERGE_STORAGE_KEY, WASH_STORAGE_KEY);
  assert.notEqual(SERGE_STORAGE_KEY, CINCH_STORAGE_KEY);
});

test("write-result objects never parse as a serge set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseSergeListingIds(writeResult), []);
  assert.equal(
    isListingSergeOverlay(
      "clo-windbreaker",
      parseSergeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = sergeCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseSergeListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(SERGE_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(canTapeSerge(jacket));
  assert.equal(canTapeSerge(soles), false);
  assert.equal(canTapeSerge(chair), false);
  assert.equal(canTapeSerge(lamp), false);
  assert.equal(canTapeSerge(mixtape), false);

  const taped = markListingSerge(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(sergeCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingSergeOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingSergeOverlay("clo-split-soles", taped), false);
  assert.equal(isListingSergeOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingSergeOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, and overlay-owned rows refuse a serge write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeSerge(soles), false);
  assert.equal(canTapeSerge(zine), false);
  assert.equal(canTapeSerge(chair), false);
  assert.equal(canTapeSerge(gift), false);
  assert.equal(canTapeSerge(junk), false);
  assert.equal(canTapeSerge(lamp), false);
  assert.equal(canTapeSerge(drawer), false);

  assert.equal(markListingSerge(soles, []), null);
  assert.equal(markListingSerge(zine, []), null);
  assert.equal(markListingSerge(chair, []), null);
  assert.equal(markListingSerge(gift, []), null);
  assert.equal(markListingSerge(junk, []), null);
  assert.equal(markListingSerge(lamp, []), null);
  assert.equal(markListingSerge(drawer, []), null);
  assert.equal(chair?.status, "sold");
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
  const taped = markListingSerge(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingSerge(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(sergeCookieValue(cleared), "[]");
  assert.equal(isListingSergeOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingSerge(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSerge(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
