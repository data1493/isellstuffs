import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BOX_STORAGE_KEY } from "./listing-box";
import { GROMMET_STORAGE_KEY } from "./listing-grommet";
import {
  RIVET_COOKIE_NAME,
  RIVET_HOST_ID,
  RIVET_LEAVE_LINE,
  RIVET_NOTICE_TITLE,
  RIVET_STORAGE_KEY,
  canTapeRivet,
  clearListingRivet,
  isListingRivetOverlay,
  markListingRivet,
  parseRivetListingIds,
  rivetCookieValue,
} from "./listing-rivet";

test("cookie and storage keys stay the rivet paper names", () => {
  assert.equal(RIVET_STORAGE_KEY, "iss:rivet-listing-ids");
  assert.equal(RIVET_COOKIE_NAME, "iss-rivet-listing-ids");
  assert.equal(RIVET_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    RIVET_NOTICE_TITLE,
    "I will not rivet it. Still optional. Still in the box.",
  );
  assert.equal(RIVET_LEAVE_LINE, "Leave the shade");
  assert.notEqual(RIVET_STORAGE_KEY, GROMMET_STORAGE_KEY);
  assert.notEqual(RIVET_STORAGE_KEY, BOX_STORAGE_KEY);
});

test("write-result objects never parse as a rivet set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseRivetListingIds(writeResult), []);
  assert.equal(
    isListingRivetOverlay(
      "ysk-wobbly-lamp",
      parseRivetListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = rivetCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseRivetListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, junk PDF, and CD-R stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById("ysk-folding-chair");
  const junk = listingById("dl-junk-pricing-pdf");
  const disc = listingById("ysk-burned-cdr");
  assert.ok(canTapeRivet(lamp));
  assert.equal(canTapeRivet(chair), false);
  assert.equal(canTapeRivet(junk), false);
  assert.equal(canTapeRivet(disc), false);

  const taped = markListingRivet(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(rivetCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingRivetOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingRivetOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingRivetOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingRivetOverlay("ysk-burned-cdr", taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, junk PDF, CD-R, gift, zine, and overlay-owned rows refuse a rivet write", () => {
  const chair = listingById("ysk-folding-chair");
  const junk = listingById("dl-junk-pricing-pdf");
  const disc = listingById("ysk-burned-cdr");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeRivet(chair), false);
  assert.equal(canTapeRivet(junk), false);
  assert.equal(canTapeRivet(disc), false);
  assert.equal(canTapeRivet(gift), false);
  assert.equal(canTapeRivet(zine), false);
  assert.equal(canTapeRivet(jacket), false);
  assert.equal(canTapeRivet(mixtape), false);
  assert.equal(canTapeRivet(lid), false);
  assert.equal(canTapeRivet(recipes), false);

  assert.equal(markListingRivet(chair, []), null);
  assert.equal(markListingRivet(junk, []), null);
  assert.equal(markListingRivet(disc, []), null);
  assert.equal(markListingRivet(gift, []), null);
  assert.equal(markListingRivet(zine, []), null);
  assert.equal(markListingRivet(jacket, []), null);
  assert.equal(markListingRivet(mixtape, []), null);
  assert.equal(markListingRivet(lid, []), null);
  assert.equal(markListingRivet(recipes, []), null);
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
  const taped = markListingRivet(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingRivet(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(rivetCookieValue(cleared), "[]");
  assert.equal(isListingRivetOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingRivet(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingRivet(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
