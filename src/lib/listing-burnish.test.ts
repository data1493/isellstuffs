import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  BURNISH_CHAIR_ID,
  BURNISH_COOKIE_NAME,
  BURNISH_FONT_ID,
  BURNISH_HOST_ID,
  BURNISH_JACKET_ID,
  BURNISH_LAMP_ID,
  BURNISH_LEAVE_LINE,
  BURNISH_NOTICE_TITLE,
  BURNISH_STORAGE_KEY,
  burnishCookieValue,
  canTapeBurnish,
  clearListingBurnish,
  isListingBurnishOverlay,
  markListingBurnish,
  parseBurnishListingIds,
} from "./listing-burnish";

test("cookie and storage keys stay the burnish paper names", () => {
  assert.equal(BURNISH_STORAGE_KEY, "iss:burnish-listing-ids");
  assert.equal(BURNISH_COOKIE_NAME, "iss-burnish-listing-ids");
  assert.equal(BURNISH_HOST_ID, "clo-split-soles");
  assert.equal(
    BURNISH_NOTICE_TITLE,
    "I will not burnish it. Still a pair. Still peeling.",
  );
  assert.equal(BURNISH_LEAVE_LINE, "Leave the peel");
  assert.notEqual(BURNISH_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(BURNISH_STORAGE_KEY, STITCH_STORAGE_KEY);
});

test("write-result objects never parse as a burnish set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseBurnishListingIds(writeResult), []);
  assert.equal(
    isListingBurnishOverlay(
      "clo-split-soles",
      parseBurnishListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = burnishCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseBurnishListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, lamp, and font stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(BURNISH_JACKET_ID);
  const lamp = listingById(BURNISH_LAMP_ID);
  const font = listingById(BURNISH_FONT_ID);

  assert.ok(canTapeBurnish(soles));
  assert.equal(canTapeBurnish(jacket), false);
  assert.equal(canTapeBurnish(lamp), false);
  assert.equal(canTapeBurnish(font), false);

  const taped = markListingBurnish(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(burnishCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingBurnishOverlay("clo-split-soles", taped), true);
  assert.equal(isListingBurnishOverlay(BURNISH_JACKET_ID, taped), false);
  assert.equal(isListingBurnishOverlay(BURNISH_LAMP_ID, taped), false);
  assert.equal(isListingBurnishOverlay(BURNISH_FONT_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("font, gift, zine, and chair refuse a burnish write", () => {
  const font = listingById(BURNISH_FONT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(BURNISH_CHAIR_ID);

  assert.equal(canTapeBurnish(font), false);
  assert.equal(canTapeBurnish(gift), false);
  assert.equal(canTapeBurnish(zine), false);
  assert.equal(canTapeBurnish(chair), false);

  assert.equal(markListingBurnish(font, []), null);
  assert.equal(markListingBurnish(gift, []), null);
  assert.equal(markListingBurnish(zine, []), null);
  assert.equal(markListingBurnish(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const soles = listingById("clo-split-soles");
  assert.ok(soles);
  const before = {
    price: soles.price,
    status: soles.status,
    cartEligible: soles.cartEligible,
  };
  const taped = markListingBurnish(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingBurnish(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(burnishCookieValue(cleared), "[]");
  assert.equal(isListingBurnishOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const font = listingById(BURNISH_FONT_ID);
  const taped = markListingBurnish(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingBurnish(font, []), null);

  const cleared = clearListingBurnish(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BURNISH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBurnish(chair, []), null);
});
