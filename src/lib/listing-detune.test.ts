import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GATE_STORAGE_KEY } from "./listing-gate";
import { NORM_STORAGE_KEY } from "./listing-norm";
import { QUANTIZE_STORAGE_KEY } from "./listing-quantize";
import { SATURATE_STORAGE_KEY } from "./listing-saturate";
import {
  DETUNE_BOY_ID,
  DETUNE_CHAIR_ID,
  DETUNE_COOKIE_NAME,
  DETUNE_FONT_ID,
  DETUNE_GIFT_ID,
  DETUNE_HOST_ID,
  DETUNE_LEAVE_LINE,
  DETUNE_LUT_ID,
  DETUNE_NOTICE_TITLE,
  DETUNE_STORAGE_KEY,
  DETUNE_ZINE_ID,
  canTapeDetune,
  clearListingDetune,
  detuneCookieValue,
  isListingDetuneOverlay,
  markListingDetune,
  parseDetuneListingIds,
  writeDetuneListingIds,
} from "./listing-detune";

test("cookie and storage keys stay the detune paper names", () => {
  assert.equal(DETUNE_STORAGE_KEY, "iss:detune-listing-ids");
  assert.equal(DETUNE_COOKIE_NAME, "iss-detune-listing-ids");
  assert.equal(DETUNE_HOST_ID, "dl-sample-pack");
  assert.equal(
    DETUNE_NOTICE_TITLE,
    "I will not detune them. Still slaps. Still four dollars.",
  );
  assert.equal(DETUNE_LEAVE_LINE, "Leave the shots");
  assert.notEqual(DETUNE_STORAGE_KEY, SATURATE_STORAGE_KEY);
  assert.notEqual(DETUNE_STORAGE_KEY, QUANTIZE_STORAGE_KEY);
  assert.notEqual(DETUNE_STORAGE_KEY, GATE_STORAGE_KEY);
  assert.notEqual(DETUNE_STORAGE_KEY, NORM_STORAGE_KEY);
});

test("write-result objects never parse as a detune set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-sample-pack"],
  });
  assert.deepEqual(parseDetuneListingIds(writeResult), []);
  assert.equal(
    isListingDetuneOverlay(
      "dl-sample-pack",
      parseDetuneListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = detuneCookieValue(["dl-sample-pack", "dl-sample-pack", ""]);
  assert.equal(raw, '["dl-sample-pack"]');
  assert.deepEqual(parseDetuneListingIds(raw), ["dl-sample-pack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("sample pack tapes; font, LUT, and Game Boy stay off that cookie", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById(DETUNE_FONT_ID);
  const luts = listingById(DETUNE_LUT_ID);
  const boy = listingById(DETUNE_BOY_ID);

  assert.ok(canTapeDetune(pack));
  assert.equal(canTapeDetune(font), false);
  assert.equal(canTapeDetune(luts), false);
  assert.equal(canTapeDetune(boy), false);

  const taped = markListingDetune(pack, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-sample-pack"]);
  assert.equal(detuneCookieValue(taped), '["dl-sample-pack"]');
  assert.equal(isListingDetuneOverlay("dl-sample-pack", taped), true);
  assert.equal(isListingDetuneOverlay(DETUNE_FONT_ID, taped), false);
  assert.equal(isListingDetuneOverlay(DETUNE_LUT_ID, taped), false);
  assert.equal(isListingDetuneOverlay(DETUNE_BOY_ID, taped), false);
  assert.equal(pack?.cartEligible, true);
  assert.equal(pack?.status, "available");
  assert.equal(pack?.price.amountCents, 400);
});

test("font, LUT, Game Boy, gift, zine, and chair refuse a detune write", () => {
  const font = listingById(DETUNE_FONT_ID);
  const luts = listingById(DETUNE_LUT_ID);
  const boy = listingById(DETUNE_BOY_ID);
  const gift = listingById(DETUNE_GIFT_ID);
  const zine = listingById(DETUNE_ZINE_ID);
  const chair = listingById(DETUNE_CHAIR_ID);

  assert.equal(canTapeDetune(font), false);
  assert.equal(canTapeDetune(luts), false);
  assert.equal(canTapeDetune(boy), false);
  assert.equal(canTapeDetune(gift), false);
  assert.equal(canTapeDetune(zine), false);
  assert.equal(canTapeDetune(chair), false);

  assert.equal(markListingDetune(font, []), null);
  assert.equal(markListingDetune(luts, []), null);
  assert.equal(markListingDetune(boy, []), null);
  assert.equal(markListingDetune(gift, []), null);
  assert.equal(markListingDetune(zine, []), null);
  assert.equal(markListingDetune(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const pack = listingById("dl-sample-pack");
  assert.ok(pack);
  const before = {
    price: pack.price,
    status: pack.status,
    cartEligible: pack.cartEligible,
  };
  const taped = markListingDetune(pack, []);
  assert.deepEqual(taped, ["dl-sample-pack"]);
  const after = listingById("dl-sample-pack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that sample-pack id", () => {
  const pack = listingById("dl-sample-pack");
  const cleared = clearListingDetune(pack, ["dl-sample-pack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(detuneCookieValue(cleared), "[]");
  assert.equal(isListingDetuneOverlay("dl-sample-pack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pack = listingById("dl-sample-pack");
  const boy = listingById(DETUNE_BOY_ID);
  const taped = markListingDetune(pack, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingDetune(boy, []), null);

  const cleared = clearListingDetune(pack, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DETUNE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDetune(chair, []), null);
});

test("write never touches saturate or quantize storage keys", () => {
  writeDetuneListingIds(["dl-sample-pack"]);
  assert.equal(DETUNE_STORAGE_KEY, "iss:detune-listing-ids");
  assert.equal(SATURATE_STORAGE_KEY, "iss:saturate-listing-ids");
  assert.equal(QUANTIZE_STORAGE_KEY, "iss:quantize-listing-ids");
  assert.notEqual(DETUNE_STORAGE_KEY, SATURATE_STORAGE_KEY);
  assert.notEqual(DETUNE_STORAGE_KEY, QUANTIZE_STORAGE_KEY);
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-saturate-listing-ids");
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-quantize-listing-ids");
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-resample-listing-ids");
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-dither-listing-ids");
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-gate-listing-ids");
  assert.notEqual(DETUNE_COOKIE_NAME, "iss-norm-listing-ids");
});
