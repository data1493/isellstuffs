import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { RIVET_STORAGE_KEY } from "./listing-rivet";
import { TWIST_STORAGE_KEY } from "./listing-twist";
import {
  BUSH_CHAIR_ID,
  BUSH_COOKIE_NAME,
  BUSH_HOST_ID,
  BUSH_LEAVE_LINE,
  BUSH_LID_ID,
  BUSH_NOTICE_TITLE,
  BUSH_STORAGE_KEY,
  bushCookieValue,
  canTapeBush,
  clearListingBush,
  isListingBushOverlay,
  markListingBush,
  parseBushListingIds,
} from "./listing-bush";

test("cookie and storage keys stay the bush paper names", () => {
  assert.equal(BUSH_STORAGE_KEY, "iss:bush-listing-ids");
  assert.equal(BUSH_COOKIE_NAME, "iss-bush-listing-ids");
  assert.equal(BUSH_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    BUSH_NOTICE_TITLE,
    "I will not bush it. Still wobbly. Still lights.",
  );
  assert.equal(BUSH_LEAVE_LINE, "Leave the wobble");
  assert.notEqual(BUSH_STORAGE_KEY, TWIST_STORAGE_KEY);
  assert.notEqual(BUSH_STORAGE_KEY, RIVET_STORAGE_KEY);
});

test("write-result objects never parse as a bush set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseBushListingIds(writeResult), []);
  assert.equal(
    isListingBushOverlay(
      "ysk-wobbly-lamp",
      parseBushListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = bushCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseBushListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, junk PDF, and lid stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById(BUSH_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const lid = listingById(BUSH_LID_ID);
  assert.ok(canTapeBush(lamp));
  assert.equal(canTapeBush(chair), false);
  assert.equal(canTapeBush(junk), false);
  assert.equal(canTapeBush(lid), false);

  const taped = markListingBush(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(bushCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingBushOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingBushOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingBushOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingBushOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, junk PDF, lid, gift, zine, and overlay-owned rows refuse a bush write", () => {
  const chair = listingById(BUSH_CHAIR_ID);
  const junk = listingById("dl-junk-pricing-pdf");
  const lid = listingById(BUSH_LID_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeBush(chair), false);
  assert.equal(canTapeBush(junk), false);
  assert.equal(canTapeBush(lid), false);
  assert.equal(canTapeBush(gift), false);
  assert.equal(canTapeBush(zine), false);
  assert.equal(canTapeBush(jacket), false);
  assert.equal(canTapeBush(mixtape), false);

  assert.equal(markListingBush(chair, []), null);
  assert.equal(markListingBush(junk, []), null);
  assert.equal(markListingBush(lid, []), null);
  assert.equal(markListingBush(gift, []), null);
  assert.equal(markListingBush(zine, []), null);
  assert.equal(markListingBush(jacket, []), null);
  assert.equal(markListingBush(mixtape, []), null);
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
  const taped = markListingBush(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingBush(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(bushCookieValue(cleared), "[]");
  assert.equal(isListingBushOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingBush(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingBush(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BUSH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBush(chair, []), null);
});
