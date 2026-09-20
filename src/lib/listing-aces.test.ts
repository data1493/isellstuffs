import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUBE_COOKIE_NAME, CUBE_STORAGE_KEY } from "./listing-cube";
import {
  GAMUT_COOKIE_NAME,
  GAMUT_STORAGE_KEY,
} from "./listing-gamut";
import { LATTICE_COOKIE_NAME, LATTICE_STORAGE_KEY } from "./listing-lattice";
import {
  POSTERIZE_COOKIE_NAME,
  POSTERIZE_STORAGE_KEY,
} from "./listing-posterize";
import { SHAPER_STORAGE_KEY } from "./listing-shaper";
import {
  ACES_BOY_ID,
  ACES_CHAIR_ID,
  ACES_COOKIE_NAME,
  ACES_FONT_ID,
  ACES_GIFT_ID,
  ACES_HOST_ID,
  ACES_LEAVE_LINE,
  ACES_NOTICE_TITLE,
  ACES_PACK_ID,
  ACES_PDF_ID,
  ACES_STORAGE_KEY,
  acesCookieValue,
  canTapeAces,
  clearListingAces,
  isListingAcesOverlay,
  markListingAces,
  parseAcesListingIds,
  readAcesListingIds,
  writeAcesListingIds,
} from "./listing-aces";

test("cookie and storage keys stay the aces paper names", () => {
  assert.equal(ACES_STORAGE_KEY, "iss:aces-listing-ids");
  assert.equal(ACES_COOKIE_NAME, "iss-aces-listing-ids");
  assert.equal(ACES_HOST_ID, "dl-camera-luts");
  assert.equal(
    ACES_NOTICE_TITLE,
    "I will not aces it. Still a parking lot. Still fluorescent.",
  );
  assert.equal(ACES_LEAVE_LINE, "Leave the looks");
  assert.notEqual(ACES_STORAGE_KEY, POSTERIZE_STORAGE_KEY);
  assert.notEqual(ACES_STORAGE_KEY, GAMUT_STORAGE_KEY);
  assert.notEqual(ACES_STORAGE_KEY, LATTICE_STORAGE_KEY);
  assert.notEqual(ACES_STORAGE_KEY, CUBE_STORAGE_KEY);
  assert.notEqual(ACES_STORAGE_KEY, SHAPER_STORAGE_KEY);
  assert.notEqual(ACES_STORAGE_KEY, "iss:gamma-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:scope-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:idt-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:odt-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:acescg-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, POSTERIZE_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, GAMUT_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, LATTICE_COOKIE_NAME);
});

test("write-result objects never parse as an aces set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseAcesListingIds(writeResult), []);
  assert.equal(
    isListingAcesOverlay(
      "dl-camera-luts",
      parseAcesListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = acesCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseAcesListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, junk PDF, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(ACES_PACK_ID);
  const font = listingById(ACES_FONT_ID);
  const pdf = listingById(ACES_PDF_ID);
  const boy = listingById(ACES_BOY_ID);

  assert.ok(canTapeAces(luts));
  assert.equal(canTapeAces(pack), false);
  assert.equal(canTapeAces(font), false);
  assert.equal(canTapeAces(pdf), false);
  assert.equal(canTapeAces(boy), false);

  const taped = markListingAces(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(acesCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingAcesOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingAcesOverlay(ACES_PACK_ID, taped), false);
  assert.equal(isListingAcesOverlay(ACES_FONT_ID, taped), false);
  assert.equal(isListingAcesOverlay(ACES_PDF_ID, taped), false);
  assert.equal(isListingAcesOverlay(ACES_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, junk PDF, Game Boy, gift, zine, and chair refuse an aces write", () => {
  const pack = listingById(ACES_PACK_ID);
  const font = listingById(ACES_FONT_ID);
  const pdf = listingById(ACES_PDF_ID);
  const boy = listingById(ACES_BOY_ID);
  const gift = listingById(ACES_GIFT_ID);
  const zine = listingById("dl-stain-zine");
  const chair = listingById(ACES_CHAIR_ID);

  assert.equal(canTapeAces(pack), false);
  assert.equal(canTapeAces(font), false);
  assert.equal(canTapeAces(pdf), false);
  assert.equal(canTapeAces(boy), false);
  assert.equal(canTapeAces(gift), false);
  assert.equal(canTapeAces(zine), false);
  assert.equal(canTapeAces(chair), false);

  assert.equal(markListingAces(pack, []), null);
  assert.equal(markListingAces(font, []), null);
  assert.equal(markListingAces(pdf, []), null);
  assert.equal(markListingAces(boy, []), null);
  assert.equal(markListingAces(gift, []), null);
  assert.equal(markListingAces(zine, []), null);
  assert.equal(markListingAces(chair, []), null);
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
  const taped = markListingAces(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingAces(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(acesCookieValue(cleared), "[]");
  assert.equal(isListingAcesOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(ACES_BOY_ID);
  const taped = markListingAces(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingAces(boy, []), null);

  const cleared = clearListingAces(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ACES_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAces(chair, []), null);
});

test("aces write does not write posterize, gamut, lattice, cube, gamma, or scope paper", () => {
  const luts = listingById("dl-camera-luts");
  const taped = markListingAces(luts, []);
  assert.ok(taped);
  writeAcesListingIds(taped);
  assert.deepEqual(readAcesListingIds(), ["dl-camera-luts"]);
  assert.notEqual(ACES_STORAGE_KEY, "iss:posterize-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:gamut-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:gamma-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:lattice-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:scope-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:cube-listing-ids");
  assert.notEqual(ACES_STORAGE_KEY, "iss:shaper-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, POSTERIZE_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, GAMUT_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, LATTICE_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, CUBE_COOKIE_NAME);
  assert.notEqual(ACES_COOKIE_NAME, "iss-gamma-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, "iss-scope-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, "iss-idt-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, "iss-odt-listing-ids");
  assert.notEqual(ACES_COOKIE_NAME, "iss-acescg-listing-ids");
  writeAcesListingIds([]);
});
