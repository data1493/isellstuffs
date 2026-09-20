import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AVAR_COOKIE_NAME, AVAR_STORAGE_KEY } from "./listing-avar";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
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
  ACF_CHAIR_ID,
  ACF_COOKIE_NAME,
  ACF_DRAWER_ID,
  ACF_GIFT_ID,
  ACF_HOST_ID,
  ACF_LEAVE_LINE,
  ACF_LID_ID,
  ACF_LUT_ID,
  ACF_NOTICE_TITLE,
  ACF_STORAGE_KEY,
  ACF_ZINE_ID,
  acfCookieValue,
  canTapeAcf,
  clearListingAcf,
  isListingAcfOverlay,
  markListingAcf,
  parseAcfListingIds,
  readAcfListingIds,
  writeAcfListingIds,
} from "./listing-acf";

test("cookie and storage keys stay the acf paper names", () => {
  assert.equal(ACF_STORAGE_KEY, "iss:acf-listing-ids");
  assert.equal(ACF_COOKIE_NAME, "iss-acf-listing-ids");
  assert.equal(ACF_HOST_ID, "gtk-game-boy");
  assert.equal(
    ACF_NOTICE_TITLE,
    "I will not acf it. Still a crack. Still Tetris.",
  );
  assert.equal(ACF_LEAVE_LINE, "Leave the film");
  assert.notEqual(ACF_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(ACF_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, AVAR_COOKIE_NAME);
});

test("write-result objects never parse as an acf set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseAcfListingIds(writeResult), []);
  assert.equal(
    isListingAcfOverlay(
      "gtk-game-boy",
      parseAcfListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseAcfListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = acfCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseAcfListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(ACF_DRAWER_ID);
  const lid = listingById(ACF_LID_ID);
  const lut = listingById(ACF_LUT_ID);

  assert.ok(canTapeAcf(boy));
  assert.equal(canTapeAcf(drawer), false);
  assert.equal(canTapeAcf(lid), false);
  assert.equal(canTapeAcf(lut), false);

  const taped = markListingAcf(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(acfCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingAcfOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingAcfOverlay(ACF_DRAWER_ID, taped), false);
  assert.equal(isListingAcfOverlay(ACF_LID_ID, taped), false);
  assert.equal(isListingAcfOverlay(ACF_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse an acf write", () => {
  const lut = listingById(ACF_LUT_ID);
  const drawer = listingById(ACF_DRAWER_ID);
  const lid = listingById(ACF_LID_ID);
  const gift = listingById(ACF_GIFT_ID);
  const zine = listingById(ACF_ZINE_ID);
  const chair = listingById(ACF_CHAIR_ID);

  assert.equal(canTapeAcf(lut), false);
  assert.equal(canTapeAcf(drawer), false);
  assert.equal(canTapeAcf(lid), false);
  assert.equal(canTapeAcf(gift), false);
  assert.equal(canTapeAcf(zine), false);
  assert.equal(canTapeAcf(chair), false);

  assert.equal(markListingAcf(lut, []), null);
  assert.equal(markListingAcf(drawer, []), null);
  assert.equal(markListingAcf(lid, []), null);
  assert.equal(markListingAcf(gift, []), null);
  assert.equal(markListingAcf(zine, []), null);
  assert.equal(markListingAcf(chair, []), null);
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
  const taped = markListingAcf(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingAcf(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(acfCookieValue(cleared), "[]");
  assert.equal(isListingAcfOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(ACF_LUT_ID);
  const taped = markListingAcf(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingAcf(lut, []), null);

  const cleared = clearListingAcf(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ACF_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAcf(chair, []), null);
});

test("acf write does not write soak, hotbar, pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingAcf(boy, []);
  assert.ok(taped);
  writeAcfListingIds(taped);
  assert.deepEqual(readAcfListingIds(), ["gtk-game-boy"]);
  assert.notEqual(ACF_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, AVAR_STORAGE_KEY);
  assert.notEqual(ACF_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(ACF_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(ACF_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(ACF_COOKIE_NAME, "iss-clock-listing-ids");
  writeAcfListingIds([]);
});
