import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUBE_STORAGE_KEY } from "./listing-cube";
import {
  LATTICE_BOY_ID,
  LATTICE_CHAIR_ID,
  LATTICE_COOKIE_NAME,
  LATTICE_FONT_ID,
  LATTICE_GIFT_ID,
  LATTICE_HOST_ID,
  LATTICE_LEAVE_LINE,
  LATTICE_NOTICE_TITLE,
  LATTICE_PACK_ID,
  LATTICE_PDF_ID,
  LATTICE_STORAGE_KEY,
  canTapeLattice,
  clearListingLattice,
  isListingLatticeOverlay,
  latticeCookieValue,
  markListingLattice,
  parseLatticeListingIds,
} from "./listing-lattice";
import { POSTERIZE_STORAGE_KEY } from "./listing-posterize";
import { SHAPER_STORAGE_KEY } from "./listing-shaper";

test("cookie and storage keys stay the lattice paper names", () => {
  assert.equal(LATTICE_STORAGE_KEY, "iss:lattice-listing-ids");
  assert.equal(LATTICE_COOKIE_NAME, "iss-lattice-listing-ids");
  assert.equal(LATTICE_HOST_ID, "dl-camera-luts");
  assert.equal(
    LATTICE_NOTICE_TITLE,
    "I will not lattice them. Still a parking lot. Still fluorescent.",
  );
  assert.equal(LATTICE_LEAVE_LINE, "Leave the looks");
  assert.notEqual(LATTICE_STORAGE_KEY, POSTERIZE_STORAGE_KEY);
  assert.notEqual(LATTICE_STORAGE_KEY, CUBE_STORAGE_KEY);
  assert.notEqual(LATTICE_STORAGE_KEY, SHAPER_STORAGE_KEY);
});

test("write-result objects never parse as a lattice set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseLatticeListingIds(writeResult), []);
  assert.equal(
    isListingLatticeOverlay(
      "dl-camera-luts",
      parseLatticeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = latticeCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseLatticeListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, junk PDF, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(LATTICE_PACK_ID);
  const font = listingById(LATTICE_FONT_ID);
  const pdf = listingById(LATTICE_PDF_ID);
  const boy = listingById(LATTICE_BOY_ID);

  assert.ok(canTapeLattice(luts));
  assert.equal(canTapeLattice(pack), false);
  assert.equal(canTapeLattice(font), false);
  assert.equal(canTapeLattice(pdf), false);
  assert.equal(canTapeLattice(boy), false);

  const taped = markListingLattice(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(latticeCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingLatticeOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingLatticeOverlay(LATTICE_PACK_ID, taped), false);
  assert.equal(isListingLatticeOverlay(LATTICE_FONT_ID, taped), false);
  assert.equal(isListingLatticeOverlay(LATTICE_PDF_ID, taped), false);
  assert.equal(isListingLatticeOverlay(LATTICE_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, junk PDF, Game Boy, gift, zine, and chair refuse a lattice write", () => {
  const pack = listingById(LATTICE_PACK_ID);
  const font = listingById(LATTICE_FONT_ID);
  const pdf = listingById(LATTICE_PDF_ID);
  const boy = listingById(LATTICE_BOY_ID);
  const gift = listingById(LATTICE_GIFT_ID);
  const zine = listingById("dl-stain-zine");
  const chair = listingById(LATTICE_CHAIR_ID);

  assert.equal(canTapeLattice(pack), false);
  assert.equal(canTapeLattice(font), false);
  assert.equal(canTapeLattice(pdf), false);
  assert.equal(canTapeLattice(boy), false);
  assert.equal(canTapeLattice(gift), false);
  assert.equal(canTapeLattice(zine), false);
  assert.equal(canTapeLattice(chair), false);

  assert.equal(markListingLattice(pack, []), null);
  assert.equal(markListingLattice(font, []), null);
  assert.equal(markListingLattice(pdf, []), null);
  assert.equal(markListingLattice(boy, []), null);
  assert.equal(markListingLattice(gift, []), null);
  assert.equal(markListingLattice(zine, []), null);
  assert.equal(markListingLattice(chair, []), null);
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
  const taped = markListingLattice(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingLattice(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(latticeCookieValue(cleared), "[]");
  assert.equal(isListingLatticeOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(LATTICE_BOY_ID);
  const taped = markListingLattice(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingLattice(boy, []), null);

  const cleared = clearListingLattice(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(LATTICE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingLattice(chair, []), null);
});
