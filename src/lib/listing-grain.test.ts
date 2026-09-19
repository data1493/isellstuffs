import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONVERT_STORAGE_KEY } from "./listing-convert";
import { GRADE_STORAGE_KEY } from "./listing-grade";
import { WARM_STORAGE_KEY } from "./listing-warm";
import { BALANCE_STORAGE_KEY } from "./listing-balance";
import {
  GRAIN_BOY_ID,
  GRAIN_CHAIR_ID,
  GRAIN_COOKIE_NAME,
  GRAIN_FONT_ID,
  GRAIN_HOST_ID,
  GRAIN_LEAVE_LINE,
  GRAIN_NOTICE_TITLE,
  GRAIN_PACK_ID,
  GRAIN_STORAGE_KEY,
  canTapeGrain,
  clearListingGrain,
  grainCookieValue,
  isListingGrainOverlay,
  markListingGrain,
  parseGrainListingIds,
} from "./listing-grain";

test("cookie and storage keys stay the grain paper names", () => {
  assert.equal(GRAIN_STORAGE_KEY, "iss:grain-listing-ids");
  assert.equal(GRAIN_COOKIE_NAME, "iss-grain-listing-ids");
  assert.equal(GRAIN_HOST_ID, "dl-camera-luts");
  assert.equal(
    GRAIN_NOTICE_TITLE,
    "I will not grain them. Still three looks. Still a cube.",
  );
  assert.equal(GRAIN_LEAVE_LINE, "Leave the looks");
  assert.notEqual(GRAIN_STORAGE_KEY, CONVERT_STORAGE_KEY);
  assert.notEqual(GRAIN_STORAGE_KEY, GRADE_STORAGE_KEY);
  assert.notEqual(GRAIN_STORAGE_KEY, WARM_STORAGE_KEY);
  assert.notEqual(GRAIN_STORAGE_KEY, BALANCE_STORAGE_KEY);
});

test("write-result objects never parse as a grain set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseGrainListingIds(writeResult), []);
  assert.equal(
    isListingGrainOverlay(
      "dl-camera-luts",
      parseGrainListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = grainCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseGrainListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(GRAIN_PACK_ID);
  const font = listingById(GRAIN_FONT_ID);
  const boy = listingById(GRAIN_BOY_ID);

  assert.ok(canTapeGrain(luts));
  assert.equal(canTapeGrain(pack), false);
  assert.equal(canTapeGrain(font), false);
  assert.equal(canTapeGrain(boy), false);

  const taped = markListingGrain(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(grainCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingGrainOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingGrainOverlay(GRAIN_PACK_ID, taped), false);
  assert.equal(isListingGrainOverlay(GRAIN_FONT_ID, taped), false);
  assert.equal(isListingGrainOverlay(GRAIN_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, Game Boy, gift, zine, and chair refuse a grain write", () => {
  const pack = listingById(GRAIN_PACK_ID);
  const font = listingById(GRAIN_FONT_ID);
  const boy = listingById(GRAIN_BOY_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(GRAIN_CHAIR_ID);

  assert.equal(canTapeGrain(pack), false);
  assert.equal(canTapeGrain(font), false);
  assert.equal(canTapeGrain(boy), false);
  assert.equal(canTapeGrain(gift), false);
  assert.equal(canTapeGrain(zine), false);
  assert.equal(canTapeGrain(chair), false);

  assert.equal(markListingGrain(pack, []), null);
  assert.equal(markListingGrain(font, []), null);
  assert.equal(markListingGrain(boy, []), null);
  assert.equal(markListingGrain(gift, []), null);
  assert.equal(markListingGrain(zine, []), null);
  assert.equal(markListingGrain(chair, []), null);
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
  const taped = markListingGrain(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingGrain(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(grainCookieValue(cleared), "[]");
  assert.equal(isListingGrainOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(GRAIN_BOY_ID);
  const taped = markListingGrain(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGrain(boy, []), null);

  const cleared = clearListingGrain(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GRAIN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGrain(chair, []), null);
});
