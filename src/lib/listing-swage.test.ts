import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BUSH_STORAGE_KEY } from "./listing-bush";
import { RIVET_STORAGE_KEY } from "./listing-rivet";
import {
  SWAGE_CHAIR_ID,
  SWAGE_COOKIE_NAME,
  SWAGE_HOST_ID,
  SWAGE_LEAVE_LINE,
  SWAGE_LID_ID,
  SWAGE_NOTICE_TITLE,
  SWAGE_STORAGE_KEY,
  canTapeSwage,
  clearListingSwage,
  isListingSwageOverlay,
  markListingSwage,
  parseSwageListingIds,
  swageCookieValue,
} from "./listing-swage";

test("cookie and storage keys stay the swage paper names", () => {
  assert.equal(SWAGE_STORAGE_KEY, "iss:swage-listing-ids");
  assert.equal(SWAGE_COOKIE_NAME, "iss-swage-listing-ids");
  assert.equal(SWAGE_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    SWAGE_NOTICE_TITLE,
    "I will not swage it. Still wobbly. Still lights.",
  );
  assert.equal(SWAGE_LEAVE_LINE, "Leave the neck");
  assert.notEqual(SWAGE_STORAGE_KEY, BUSH_STORAGE_KEY);
  assert.notEqual(SWAGE_STORAGE_KEY, RIVET_STORAGE_KEY);
});

test("write-result objects never parse as a swage set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseSwageListingIds(writeResult), []);
  assert.equal(
    isListingSwageOverlay(
      "ysk-wobbly-lamp",
      parseSwageListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = swageCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseSwageListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, junk PDF, and lid stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById(SWAGE_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const lid = listingById(SWAGE_LID_ID);
  assert.ok(canTapeSwage(lamp));
  assert.equal(canTapeSwage(chair), false);
  assert.equal(canTapeSwage(junk), false);
  assert.equal(canTapeSwage(lid), false);

  const taped = markListingSwage(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(swageCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingSwageOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingSwageOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingSwageOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingSwageOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, junk PDF, lid, gift, zine, and overlay-owned rows refuse a swage write", () => {
  const chair = listingById(SWAGE_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const lid = listingById(SWAGE_LID_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeSwage(chair), false);
  assert.equal(canTapeSwage(junk), false);
  assert.equal(canTapeSwage(lid), false);
  assert.equal(canTapeSwage(gift), false);
  assert.equal(canTapeSwage(zine), false);
  assert.equal(canTapeSwage(jacket), false);
  assert.equal(canTapeSwage(mixtape), false);

  assert.equal(markListingSwage(chair, []), null);
  assert.equal(markListingSwage(junk, []), null);
  assert.equal(markListingSwage(lid, []), null);
  assert.equal(markListingSwage(gift, []), null);
  assert.equal(markListingSwage(zine, []), null);
  assert.equal(markListingSwage(jacket, []), null);
  assert.equal(markListingSwage(mixtape, []), null);
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
  const taped = markListingSwage(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingSwage(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(swageCookieValue(cleared), "[]");
  assert.equal(isListingSwageOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingSwage(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSwage(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SWAGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSwage(chair, []), null);
});
