import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONVERT_STORAGE_KEY } from "./listing-convert";
import { CUBE_STORAGE_KEY } from "./listing-cube";
import { GRADE_STORAGE_KEY } from "./listing-grade";
import { GRAIN_STORAGE_KEY } from "./listing-grain";
import { LOG_STORAGE_KEY } from "./listing-log";
import {
  SHAPER_BOY_ID,
  SHAPER_CHAIR_ID,
  SHAPER_COOKIE_NAME,
  SHAPER_FONT_ID,
  SHAPER_HOST_ID,
  SHAPER_LEAVE_LINE,
  SHAPER_NOTICE_TITLE,
  SHAPER_PACK_ID,
  SHAPER_PDF_ID,
  SHAPER_STORAGE_KEY,
  canTapeShaper,
  clearListingShaper,
  isListingShaperOverlay,
  markListingShaper,
  parseShaperListingIds,
  shaperCookieValue,
} from "./listing-shaper";

test("cookie and storage keys stay the shaper paper names", () => {
  assert.equal(SHAPER_STORAGE_KEY, "iss:shaper-listing-ids");
  assert.equal(SHAPER_COOKIE_NAME, "iss-shaper-listing-ids");
  assert.equal(SHAPER_HOST_ID, "dl-camera-luts");
  assert.equal(
    SHAPER_NOTICE_TITLE,
    "I will not shaper them. Still three looks. Still fluorescent.",
  );
  assert.equal(SHAPER_LEAVE_LINE, "Leave the looks");
  assert.notEqual(SHAPER_STORAGE_KEY, CUBE_STORAGE_KEY);
  assert.notEqual(SHAPER_STORAGE_KEY, GRAIN_STORAGE_KEY);
  assert.notEqual(SHAPER_STORAGE_KEY, CONVERT_STORAGE_KEY);
  assert.notEqual(SHAPER_STORAGE_KEY, GRADE_STORAGE_KEY);
  assert.notEqual(SHAPER_STORAGE_KEY, LOG_STORAGE_KEY);
});

test("write-result objects never parse as a shaper set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseShaperListingIds(writeResult), []);
  assert.equal(
    isListingShaperOverlay(
      "dl-camera-luts",
      parseShaperListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = shaperCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseShaperListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, junk PDF, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(SHAPER_PACK_ID);
  const font = listingById(SHAPER_FONT_ID);
  const pdf = listingById(SHAPER_PDF_ID);
  const boy = listingById(SHAPER_BOY_ID);

  assert.ok(canTapeShaper(luts));
  assert.equal(canTapeShaper(pack), false);
  assert.equal(canTapeShaper(font), false);
  assert.equal(canTapeShaper(pdf), false);
  assert.equal(canTapeShaper(boy), false);

  const taped = markListingShaper(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(shaperCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingShaperOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingShaperOverlay(SHAPER_PACK_ID, taped), false);
  assert.equal(isListingShaperOverlay(SHAPER_FONT_ID, taped), false);
  assert.equal(isListingShaperOverlay(SHAPER_PDF_ID, taped), false);
  assert.equal(isListingShaperOverlay(SHAPER_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, junk PDF, Game Boy, gift, zine, and chair refuse a shaper write", () => {
  const pack = listingById(SHAPER_PACK_ID);
  const font = listingById(SHAPER_FONT_ID);
  const pdf = listingById(SHAPER_PDF_ID);
  const boy = listingById(SHAPER_BOY_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SHAPER_CHAIR_ID);

  assert.equal(canTapeShaper(pack), false);
  assert.equal(canTapeShaper(font), false);
  assert.equal(canTapeShaper(pdf), false);
  assert.equal(canTapeShaper(boy), false);
  assert.equal(canTapeShaper(gift), false);
  assert.equal(canTapeShaper(zine), false);
  assert.equal(canTapeShaper(chair), false);

  assert.equal(markListingShaper(pack, []), null);
  assert.equal(markListingShaper(font, []), null);
  assert.equal(markListingShaper(pdf, []), null);
  assert.equal(markListingShaper(boy, []), null);
  assert.equal(markListingShaper(gift, []), null);
  assert.equal(markListingShaper(zine, []), null);
  assert.equal(markListingShaper(chair, []), null);
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
  const taped = markListingShaper(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingShaper(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(shaperCookieValue(cleared), "[]");
  assert.equal(isListingShaperOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(SHAPER_BOY_ID);
  const taped = markListingShaper(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingShaper(boy, []), null);

  const cleared = clearListingShaper(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SHAPER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingShaper(chair, []), null);
});
