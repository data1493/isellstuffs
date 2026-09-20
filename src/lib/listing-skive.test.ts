import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  SKIVE_CHAIR_ID,
  SKIVE_COOKIE_NAME,
  SKIVE_FONT_ID,
  SKIVE_HOST_ID,
  SKIVE_JACKET_ID,
  SKIVE_LEAVE_LINE,
  SKIVE_NOTICE_TITLE,
  SKIVE_STORAGE_KEY,
  canTapeSkive,
  clearListingSkive,
  isListingSkiveOverlay,
  markListingSkive,
  parseSkiveListingIds,
  skiveCookieValue,
} from "./listing-skive";

test("cookie and storage keys stay the skive paper names", () => {
  assert.equal(SKIVE_STORAGE_KEY, "iss:skive-listing-ids");
  assert.equal(SKIVE_COOKIE_NAME, "iss-skive-listing-ids");
  assert.equal(SKIVE_HOST_ID, "clo-split-soles");
  assert.equal(
    SKIVE_NOTICE_TITLE,
    "I will not skive it. Still peeling. Still a pair.",
  );
  assert.equal(SKIVE_LEAVE_LINE, "Leave the split");
  assert.notEqual(SKIVE_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(SKIVE_STORAGE_KEY, STITCH_STORAGE_KEY);
});

test("write-result objects never parse as a skive set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseSkiveListingIds(writeResult), []);
  assert.equal(
    isListingSkiveOverlay("clo-split-soles", parseSkiveListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = skiveCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseSkiveListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket and font stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(SKIVE_JACKET_ID);
  const font = listingById(SKIVE_FONT_ID);

  assert.ok(canTapeSkive(soles));
  assert.equal(canTapeSkive(jacket), false);
  assert.equal(canTapeSkive(font), false);

  const taped = markListingSkive(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(skiveCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingSkiveOverlay("clo-split-soles", taped), true);
  assert.equal(isListingSkiveOverlay(SKIVE_JACKET_ID, taped), false);
  assert.equal(isListingSkiveOverlay(SKIVE_FONT_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("font, gift, zine, and chair refuse a skive write", () => {
  const font = listingById(SKIVE_FONT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SKIVE_CHAIR_ID);

  assert.equal(canTapeSkive(font), false);
  assert.equal(canTapeSkive(gift), false);
  assert.equal(canTapeSkive(zine), false);
  assert.equal(canTapeSkive(chair), false);

  assert.equal(markListingSkive(font, []), null);
  assert.equal(markListingSkive(gift, []), null);
  assert.equal(markListingSkive(zine, []), null);
  assert.equal(markListingSkive(chair, []), null);
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
  const taped = markListingSkive(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingSkive(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(skiveCookieValue(cleared), "[]");
  assert.equal(isListingSkiveOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const font = listingById(SKIVE_FONT_ID);
  const taped = markListingSkive(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingSkive(font, []), null);

  const cleared = clearListingSkive(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SKIVE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSkive(chair, []), null);
});
