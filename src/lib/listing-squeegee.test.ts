import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ACF_COOKIE_NAME, ACF_STORAGE_KEY } from "./listing-acf";
import { DAM_COOKIE_NAME, DAM_STORAGE_KEY } from "./listing-dam";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
import {
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_STORAGE_KEY,
} from "./listing-globtop";
import { HOTBAR_COOKIE_NAME, HOTBAR_STORAGE_KEY } from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_COOKIE_NAME, REFLOW_STORAGE_KEY } from "./listing-reflow";
import { SOAK_COOKIE_NAME, SOAK_STORAGE_KEY } from "./listing-soak";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  SQUEEGEE_CHAIR_ID,
  SQUEEGEE_COOKIE_NAME,
  SQUEEGEE_DRAWER_ID,
  SQUEEGEE_GIFT_ID,
  SQUEEGEE_HOST_ID,
  SQUEEGEE_LEAVE_LINE,
  SQUEEGEE_LID_ID,
  SQUEEGEE_LUT_ID,
  SQUEEGEE_NOTICE_TITLE,
  SQUEEGEE_STORAGE_KEY,
  SQUEEGEE_ZINE_ID,
  canTapeSqueegee,
  clearListingSqueegee,
  isListingSqueegeeOverlay,
  markListingSqueegee,
  parseSqueegeeListingIds,
  readSqueegeeListingIds,
  squeegeeCookieValue,
  writeSqueegeeListingIds,
} from "./listing-squeegee";

test("cookie and storage keys stay the squeegee paper names", () => {
  assert.equal(SQUEEGEE_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.equal(SQUEEGEE_COOKIE_NAME, "iss-squeegee-listing-ids");
  assert.equal(SQUEEGEE_HOST_ID, "gtk-game-boy");
  assert.equal(
    SQUEEGEE_NOTICE_TITLE,
    "I will not squeegee it. Still a crack. Still Tetris.",
  );
  assert.equal(SQUEEGEE_LEAVE_LINE, "Leave the paste");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:stencil-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:paste-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:hasl-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:aoi-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:void-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:wave-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:ncf-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:cof-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:encapsulant-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:wall-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:damfill-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:blob-listing-ids");
  assert.notEqual(SQUEEGEE_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, REFLOW_COOKIE_NAME);
});

test("write-result objects never parse as a squeegee set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseSqueegeeListingIds(writeResult), []);
  assert.equal(
    isListingSqueegeeOverlay(
      "gtk-game-boy",
      parseSqueegeeListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseSqueegeeListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = squeegeeCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseSqueegeeListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(SQUEEGEE_DRAWER_ID);
  const lid = listingById(SQUEEGEE_LID_ID);
  const lut = listingById(SQUEEGEE_LUT_ID);

  assert.ok(canTapeSqueegee(boy));
  assert.equal(canTapeSqueegee(drawer), false);
  assert.equal(canTapeSqueegee(lid), false);
  assert.equal(canTapeSqueegee(lut), false);

  const taped = markListingSqueegee(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(squeegeeCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingSqueegeeOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingSqueegeeOverlay(SQUEEGEE_DRAWER_ID, taped), false);
  assert.equal(isListingSqueegeeOverlay(SQUEEGEE_LID_ID, taped), false);
  assert.equal(isListingSqueegeeOverlay(SQUEEGEE_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a squeegee write", () => {
  const lut = listingById(SQUEEGEE_LUT_ID);
  const drawer = listingById(SQUEEGEE_DRAWER_ID);
  const lid = listingById(SQUEEGEE_LID_ID);
  const gift = listingById(SQUEEGEE_GIFT_ID);
  const zine = listingById(SQUEEGEE_ZINE_ID);
  const chair = listingById(SQUEEGEE_CHAIR_ID);

  assert.equal(canTapeSqueegee(lut), false);
  assert.equal(canTapeSqueegee(drawer), false);
  assert.equal(canTapeSqueegee(lid), false);
  assert.equal(canTapeSqueegee(gift), false);
  assert.equal(canTapeSqueegee(zine), false);
  assert.equal(canTapeSqueegee(chair), false);

  assert.equal(markListingSqueegee(lut, []), null);
  assert.equal(markListingSqueegee(drawer, []), null);
  assert.equal(markListingSqueegee(lid, []), null);
  assert.equal(markListingSqueegee(gift, []), null);
  assert.equal(markListingSqueegee(zine, []), null);
  assert.equal(markListingSqueegee(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const boy = listingById("gtk-game-boy");
  assert.ok(boy);
  const before = {
    price: boy.price,
    status: boy.status,
    cartEligible: boy.cartEligible,
  };
  const taped = markListingSqueegee(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingSqueegee(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(squeegeeCookieValue(cleared), "[]");
  assert.equal(isListingSqueegeeOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(SQUEEGEE_LUT_ID);
  const taped = markListingSqueegee(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingSqueegee(lut, []), null);

  const cleared = clearListingSqueegee(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SQUEEGEE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSqueegee(chair, []), null);
});

test("squeegee write does not write dam, globtop, acf, soak, hotbar, pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingSqueegee(boy, []);
  assert.ok(taped);
  writeSqueegeeListingIds(taped);
  assert.deepEqual(readSqueegeeListingIds(), ["gtk-game-boy"]);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:stencil-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:paste-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:wall-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:damfill-listing-ids");
  assert.notEqual(SQUEEGEE_STORAGE_KEY, "iss:blob-listing-ids");
  assert.notEqual(SQUEEGEE_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(SQUEEGEE_COOKIE_NAME, "iss-clock-listing-ids");
  writeSqueegeeListingIds([]);
});
