import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUBE_COOKIE_NAME, CUBE_STORAGE_KEY } from "./listing-cube";
import {
  GAMUT_BOY_ID,
  GAMUT_CHAIR_ID,
  GAMUT_COOKIE_NAME,
  GAMUT_FONT_ID,
  GAMUT_GIFT_ID,
  GAMUT_HOST_ID,
  GAMUT_LEAVE_LINE,
  GAMUT_NOTICE_TITLE,
  GAMUT_PACK_ID,
  GAMUT_PDF_ID,
  GAMUT_STORAGE_KEY,
  canTapeGamut,
  clearListingGamut,
  gamutCookieValue,
  isListingGamutOverlay,
  markListingGamut,
  parseGamutListingIds,
  readGamutListingIds,
  writeGamutListingIds,
} from "./listing-gamut";
import { LATTICE_COOKIE_NAME, LATTICE_STORAGE_KEY } from "./listing-lattice";
import {
  POSTERIZE_COOKIE_NAME,
  POSTERIZE_STORAGE_KEY,
} from "./listing-posterize";
import { SHAPER_STORAGE_KEY } from "./listing-shaper";

test("cookie and storage keys stay the gamut paper names", () => {
  assert.equal(GAMUT_STORAGE_KEY, "iss:gamut-listing-ids");
  assert.equal(GAMUT_COOKIE_NAME, "iss-gamut-listing-ids");
  assert.equal(GAMUT_HOST_ID, "dl-camera-luts");
  assert.equal(
    GAMUT_NOTICE_TITLE,
    "I will not gamut it. Still a parking lot. Still fluorescent.",
  );
  assert.equal(GAMUT_LEAVE_LINE, "Leave the looks");
  assert.notEqual(GAMUT_STORAGE_KEY, POSTERIZE_STORAGE_KEY);
  assert.notEqual(GAMUT_STORAGE_KEY, LATTICE_STORAGE_KEY);
  assert.notEqual(GAMUT_STORAGE_KEY, CUBE_STORAGE_KEY);
  assert.notEqual(GAMUT_STORAGE_KEY, SHAPER_STORAGE_KEY);
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:gamma-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:scope-listing-ids");
  assert.notEqual(GAMUT_COOKIE_NAME, POSTERIZE_COOKIE_NAME);
  assert.notEqual(GAMUT_COOKIE_NAME, LATTICE_COOKIE_NAME);
});

test("write-result objects never parse as a gamut set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseGamutListingIds(writeResult), []);
  assert.equal(
    isListingGamutOverlay(
      "dl-camera-luts",
      parseGamutListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gamutCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseGamutListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, junk PDF, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(GAMUT_PACK_ID);
  const font = listingById(GAMUT_FONT_ID);
  const pdf = listingById(GAMUT_PDF_ID);
  const boy = listingById(GAMUT_BOY_ID);

  assert.ok(canTapeGamut(luts));
  assert.equal(canTapeGamut(pack), false);
  assert.equal(canTapeGamut(font), false);
  assert.equal(canTapeGamut(pdf), false);
  assert.equal(canTapeGamut(boy), false);

  const taped = markListingGamut(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(gamutCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingGamutOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingGamutOverlay(GAMUT_PACK_ID, taped), false);
  assert.equal(isListingGamutOverlay(GAMUT_FONT_ID, taped), false);
  assert.equal(isListingGamutOverlay(GAMUT_PDF_ID, taped), false);
  assert.equal(isListingGamutOverlay(GAMUT_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, junk PDF, Game Boy, gift, zine, and chair refuse a gamut write", () => {
  const pack = listingById(GAMUT_PACK_ID);
  const font = listingById(GAMUT_FONT_ID);
  const pdf = listingById(GAMUT_PDF_ID);
  const boy = listingById(GAMUT_BOY_ID);
  const gift = listingById(GAMUT_GIFT_ID);
  const zine = listingById("dl-stain-zine");
  const chair = listingById(GAMUT_CHAIR_ID);

  assert.equal(canTapeGamut(pack), false);
  assert.equal(canTapeGamut(font), false);
  assert.equal(canTapeGamut(pdf), false);
  assert.equal(canTapeGamut(boy), false);
  assert.equal(canTapeGamut(gift), false);
  assert.equal(canTapeGamut(zine), false);
  assert.equal(canTapeGamut(chair), false);

  assert.equal(markListingGamut(pack, []), null);
  assert.equal(markListingGamut(font, []), null);
  assert.equal(markListingGamut(pdf, []), null);
  assert.equal(markListingGamut(boy, []), null);
  assert.equal(markListingGamut(gift, []), null);
  assert.equal(markListingGamut(zine, []), null);
  assert.equal(markListingGamut(chair, []), null);
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
  const taped = markListingGamut(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingGamut(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gamutCookieValue(cleared), "[]");
  assert.equal(isListingGamutOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(GAMUT_BOY_ID);
  const taped = markListingGamut(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGamut(boy, []), null);

  const cleared = clearListingGamut(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GAMUT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGamut(chair, []), null);
});

test("gamut write does not write posterize, lattice, cube, gamma, or scope paper", () => {
  const luts = listingById("dl-camera-luts");
  const taped = markListingGamut(luts, []);
  assert.ok(taped);
  writeGamutListingIds(taped);
  assert.deepEqual(readGamutListingIds(), ["dl-camera-luts"]);
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:posterize-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:gamma-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:lattice-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:scope-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:cube-listing-ids");
  assert.notEqual(GAMUT_STORAGE_KEY, "iss:shaper-listing-ids");
  assert.notEqual(GAMUT_COOKIE_NAME, POSTERIZE_COOKIE_NAME);
  assert.notEqual(GAMUT_COOKIE_NAME, LATTICE_COOKIE_NAME);
  assert.notEqual(GAMUT_COOKIE_NAME, CUBE_COOKIE_NAME);
  assert.notEqual(GAMUT_COOKIE_NAME, "iss-gamma-listing-ids");
  assert.notEqual(GAMUT_COOKIE_NAME, "iss-scope-listing-ids");
  assert.notEqual(GAMUT_COOKIE_NAME, "iss-aces-listing-ids");
  assert.notEqual(GAMUT_COOKIE_NAME, "iss-rec709-listing-ids");
  writeGamutListingIds([]);
});
