import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUBE_STORAGE_KEY } from "./listing-cube";
import { GRAIN_STORAGE_KEY } from "./listing-grain";
import {
  POSTERIZE_BOY_ID,
  POSTERIZE_CHAIR_ID,
  POSTERIZE_COOKIE_NAME,
  POSTERIZE_FONT_ID,
  POSTERIZE_GIFT_ID,
  POSTERIZE_HOST_ID,
  POSTERIZE_LEAVE_LINE,
  POSTERIZE_NOTICE_TITLE,
  POSTERIZE_PACK_ID,
  POSTERIZE_PDF_ID,
  POSTERIZE_STORAGE_KEY,
  canTapePosterize,
  clearListingPosterize,
  isListingPosterizeOverlay,
  markListingPosterize,
  parsePosterizeListingIds,
  posterizeCookieValue,
} from "./listing-posterize";
import { SHAPER_STORAGE_KEY } from "./listing-shaper";

test("cookie and storage keys stay the posterize paper names", () => {
  assert.equal(POSTERIZE_STORAGE_KEY, "iss:posterize-listing-ids");
  assert.equal(POSTERIZE_COOKIE_NAME, "iss-posterize-listing-ids");
  assert.equal(POSTERIZE_HOST_ID, "dl-camera-luts");
  assert.equal(
    POSTERIZE_NOTICE_TITLE,
    "I will not posterize them. Still three looks. Still a parking lot.",
  );
  assert.equal(POSTERIZE_LEAVE_LINE, "Leave the looks");
  assert.notEqual(POSTERIZE_STORAGE_KEY, CUBE_STORAGE_KEY);
  assert.notEqual(POSTERIZE_STORAGE_KEY, SHAPER_STORAGE_KEY);
  assert.notEqual(POSTERIZE_STORAGE_KEY, GRAIN_STORAGE_KEY);
});

test("write-result objects never parse as a posterize set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parsePosterizeListingIds(writeResult), []);
  assert.equal(
    isListingPosterizeOverlay(
      "dl-camera-luts",
      parsePosterizeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = posterizeCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parsePosterizeListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, junk PDF, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(POSTERIZE_PACK_ID);
  const font = listingById(POSTERIZE_FONT_ID);
  const pdf = listingById(POSTERIZE_PDF_ID);
  const boy = listingById(POSTERIZE_BOY_ID);

  assert.ok(canTapePosterize(luts));
  assert.equal(canTapePosterize(pack), false);
  assert.equal(canTapePosterize(font), false);
  assert.equal(canTapePosterize(pdf), false);
  assert.equal(canTapePosterize(boy), false);

  const taped = markListingPosterize(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(posterizeCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingPosterizeOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingPosterizeOverlay(POSTERIZE_PACK_ID, taped), false);
  assert.equal(isListingPosterizeOverlay(POSTERIZE_FONT_ID, taped), false);
  assert.equal(isListingPosterizeOverlay(POSTERIZE_PDF_ID, taped), false);
  assert.equal(isListingPosterizeOverlay(POSTERIZE_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, junk PDF, Game Boy, gift, zine, and chair refuse a posterize write", () => {
  const pack = listingById(POSTERIZE_PACK_ID);
  const font = listingById(POSTERIZE_FONT_ID);
  const pdf = listingById(POSTERIZE_PDF_ID);
  const boy = listingById(POSTERIZE_BOY_ID);
  const gift = listingById(POSTERIZE_GIFT_ID);
  const zine = listingById("dl-stain-zine");
  const chair = listingById(POSTERIZE_CHAIR_ID);

  assert.equal(canTapePosterize(pack), false);
  assert.equal(canTapePosterize(font), false);
  assert.equal(canTapePosterize(pdf), false);
  assert.equal(canTapePosterize(boy), false);
  assert.equal(canTapePosterize(gift), false);
  assert.equal(canTapePosterize(zine), false);
  assert.equal(canTapePosterize(chair), false);

  assert.equal(markListingPosterize(pack, []), null);
  assert.equal(markListingPosterize(font, []), null);
  assert.equal(markListingPosterize(pdf, []), null);
  assert.equal(markListingPosterize(boy, []), null);
  assert.equal(markListingPosterize(gift, []), null);
  assert.equal(markListingPosterize(zine, []), null);
  assert.equal(markListingPosterize(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const luts = listingById("dl-camera-luts");
  assert.ok(luts);
  const before = {
    price: luts.price,
    status: luts.status,
    cartEligible: luts.cartEligible,
  };
  const taped = markListingPosterize(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingPosterize(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(posterizeCookieValue(cleared), "[]");
  assert.equal(isListingPosterizeOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(POSTERIZE_BOY_ID);
  const taped = markListingPosterize(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingPosterize(boy, []), null);

  const cleared = clearListingPosterize(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(POSTERIZE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPosterize(chair, []), null);
});
