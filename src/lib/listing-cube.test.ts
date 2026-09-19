import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONVERT_STORAGE_KEY } from "./listing-convert";
import { GRADE_STORAGE_KEY } from "./listing-grade";
import { GRAIN_STORAGE_KEY } from "./listing-grain";
import { WARM_STORAGE_KEY } from "./listing-warm";
import {
  CUBE_BOY_ID,
  CUBE_CHAIR_ID,
  CUBE_COOKIE_NAME,
  CUBE_FONT_ID,
  CUBE_HOST_ID,
  CUBE_LEAVE_LINE,
  CUBE_NOTICE_TITLE,
  CUBE_PACK_ID,
  CUBE_STORAGE_KEY,
  canTapeCube,
  clearListingCube,
  cubeCookieValue,
  isListingCubeOverlay,
  markListingCube,
  parseCubeListingIds,
} from "./listing-cube";

test("cookie and storage keys stay the cube paper names", () => {
  assert.equal(CUBE_STORAGE_KEY, "iss:cube-listing-ids");
  assert.equal(CUBE_COOKIE_NAME, "iss-cube-listing-ids");
  assert.equal(CUBE_HOST_ID, "dl-camera-luts");
  assert.equal(
    CUBE_NOTICE_TITLE,
    "I will not cube them. Still three looks. Still a pack.",
  );
  assert.equal(CUBE_LEAVE_LINE, "Leave the three looks");
  assert.notEqual(CUBE_STORAGE_KEY, CONVERT_STORAGE_KEY);
  assert.notEqual(CUBE_STORAGE_KEY, GRADE_STORAGE_KEY);
  assert.notEqual(CUBE_STORAGE_KEY, WARM_STORAGE_KEY);
  assert.notEqual(CUBE_STORAGE_KEY, GRAIN_STORAGE_KEY);
});

test("write-result objects never parse as a cube set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-camera-luts"],
  });
  assert.deepEqual(parseCubeListingIds(writeResult), []);
  assert.equal(
    isListingCubeOverlay(
      "dl-camera-luts",
      parseCubeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = cubeCookieValue(["dl-camera-luts", "dl-camera-luts", ""]);
  assert.equal(raw, '["dl-camera-luts"]');
  assert.deepEqual(parseCubeListingIds(raw), ["dl-camera-luts"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LUT tapes; pack, font, and Game Boy stay off that cookie", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById(CUBE_PACK_ID);
  const font = listingById(CUBE_FONT_ID);
  const boy = listingById(CUBE_BOY_ID);

  assert.ok(canTapeCube(luts));
  assert.equal(canTapeCube(pack), false);
  assert.equal(canTapeCube(font), false);
  assert.equal(canTapeCube(boy), false);

  const taped = markListingCube(luts, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-camera-luts"]);
  assert.equal(cubeCookieValue(taped), '["dl-camera-luts"]');
  assert.equal(isListingCubeOverlay("dl-camera-luts", taped), true);
  assert.equal(isListingCubeOverlay(CUBE_PACK_ID, taped), false);
  assert.equal(isListingCubeOverlay(CUBE_FONT_ID, taped), false);
  assert.equal(isListingCubeOverlay(CUBE_BOY_ID, taped), false);
  assert.equal(luts?.cartEligible, true);
  assert.equal(luts?.status, "available");
  assert.equal(luts?.price.amountCents, 900);
});

test("pack, font, Game Boy, gift, zine, and chair refuse a cube write", () => {
  const pack = listingById(CUBE_PACK_ID);
  const font = listingById(CUBE_FONT_ID);
  const boy = listingById(CUBE_BOY_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(CUBE_CHAIR_ID);

  assert.equal(canTapeCube(pack), false);
  assert.equal(canTapeCube(font), false);
  assert.equal(canTapeCube(boy), false);
  assert.equal(canTapeCube(gift), false);
  assert.equal(canTapeCube(zine), false);
  assert.equal(canTapeCube(chair), false);

  assert.equal(markListingCube(pack, []), null);
  assert.equal(markListingCube(font, []), null);
  assert.equal(markListingCube(boy, []), null);
  assert.equal(markListingCube(gift, []), null);
  assert.equal(markListingCube(zine, []), null);
  assert.equal(markListingCube(chair, []), null);
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
  const taped = markListingCube(luts, []);
  assert.deepEqual(taped, ["dl-camera-luts"]);
  const after = listingById("dl-camera-luts");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LUT id", () => {
  const luts = listingById("dl-camera-luts");
  const cleared = clearListingCube(luts, ["dl-camera-luts"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(cubeCookieValue(cleared), "[]");
  assert.equal(isListingCubeOverlay("dl-camera-luts", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const luts = listingById("dl-camera-luts");
  const boy = listingById(CUBE_BOY_ID);
  const taped = markListingCube(luts, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCube(boy, []), null);

  const cleared = clearListingCube(luts, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(CUBE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCube(chair, []), null);
});
