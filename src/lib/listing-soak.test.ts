import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
import { HOTBAR_COOKIE_NAME, HOTBAR_STORAGE_KEY } from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_COOKIE_NAME, REFLOW_STORAGE_KEY } from "./listing-reflow";
import {
  SOAK_CHAIR_ID,
  SOAK_COOKIE_NAME,
  SOAK_DRAWER_ID,
  SOAK_GIFT_ID,
  SOAK_HOST_ID,
  SOAK_LEAVE_LINE,
  SOAK_LID_ID,
  SOAK_LUT_ID,
  SOAK_NOTICE_TITLE,
  SOAK_STORAGE_KEY,
  SOAK_ZINE_ID,
  canTapeSoak,
  clearListingSoak,
  isListingSoakOverlay,
  markListingSoak,
  parseSoakListingIds,
  readSoakListingIds,
  soakCookieValue,
  writeSoakListingIds,
} from "./listing-soak";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";

test("cookie and storage keys stay the soak paper names", () => {
  assert.equal(SOAK_STORAGE_KEY, "iss:soak-listing-ids");
  assert.equal(SOAK_COOKIE_NAME, "iss-soak-listing-ids");
  assert.equal(SOAK_HOST_ID, "gtk-game-boy");
  assert.equal(
    SOAK_NOTICE_TITLE,
    "I will not soak it. Still a crack. Still Tetris.",
  );
  assert.equal(SOAK_LEAVE_LINE, "Leave the flex");
  assert.notEqual(SOAK_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:dwell-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:ramp-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:zone-listing-ids");
  assert.notEqual(SOAK_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, REFLOW_COOKIE_NAME);
});

test("write-result objects never parse as a soak set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseSoakListingIds(writeResult), []);
  assert.equal(
    isListingSoakOverlay(
      "gtk-game-boy",
      parseSoakListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseSoakListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = soakCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseSoakListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(SOAK_DRAWER_ID);
  const lid = listingById(SOAK_LID_ID);
  const lut = listingById(SOAK_LUT_ID);

  assert.ok(canTapeSoak(boy));
  assert.equal(canTapeSoak(drawer), false);
  assert.equal(canTapeSoak(lid), false);
  assert.equal(canTapeSoak(lut), false);

  const taped = markListingSoak(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(soakCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingSoakOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingSoakOverlay(SOAK_DRAWER_ID, taped), false);
  assert.equal(isListingSoakOverlay(SOAK_LID_ID, taped), false);
  assert.equal(isListingSoakOverlay(SOAK_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a soak write", () => {
  const lut = listingById(SOAK_LUT_ID);
  const drawer = listingById(SOAK_DRAWER_ID);
  const lid = listingById(SOAK_LID_ID);
  const gift = listingById(SOAK_GIFT_ID);
  const zine = listingById(SOAK_ZINE_ID);
  const chair = listingById(SOAK_CHAIR_ID);

  assert.equal(canTapeSoak(lut), false);
  assert.equal(canTapeSoak(drawer), false);
  assert.equal(canTapeSoak(lid), false);
  assert.equal(canTapeSoak(gift), false);
  assert.equal(canTapeSoak(zine), false);
  assert.equal(canTapeSoak(chair), false);

  assert.equal(markListingSoak(lut, []), null);
  assert.equal(markListingSoak(drawer, []), null);
  assert.equal(markListingSoak(lid, []), null);
  assert.equal(markListingSoak(gift, []), null);
  assert.equal(markListingSoak(zine, []), null);
  assert.equal(markListingSoak(chair, []), null);
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
  const taped = markListingSoak(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingSoak(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(soakCookieValue(cleared), "[]");
  assert.equal(isListingSoakOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(SOAK_LUT_ID);
  const taped = markListingSoak(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingSoak(lut, []), null);

  const cleared = clearListingSoak(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SOAK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSoak(chair, []), null);
});

test("soak write does not write hotbar, pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingSoak(boy, []);
  assert.ok(taped);
  writeSoakListingIds(taped);
  assert.deepEqual(readSoakListingIds(), ["gtk-game-boy"]);
  assert.notEqual(SOAK_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(SOAK_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:dwell-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:ramp-listing-ids");
  assert.notEqual(SOAK_STORAGE_KEY, "iss:zone-listing-ids");
  assert.notEqual(SOAK_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(SOAK_COOKIE_NAME, "iss-clock-listing-ids");
  writeSoakListingIds([]);
});
