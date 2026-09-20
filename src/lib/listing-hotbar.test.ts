import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
import {
  HOTBAR_CHAIR_ID,
  HOTBAR_COOKIE_NAME,
  HOTBAR_DRAWER_ID,
  HOTBAR_GIFT_ID,
  HOTBAR_HOST_ID,
  HOTBAR_LEAVE_LINE,
  HOTBAR_LID_ID,
  HOTBAR_LUT_ID,
  HOTBAR_NOTICE_TITLE,
  HOTBAR_STORAGE_KEY,
  HOTBAR_ZINE_ID,
  canTapeHotbar,
  clearListingHotbar,
  hotbarCookieValue,
  isListingHotbarOverlay,
  markListingHotbar,
  parseHotbarListingIds,
  readHotbarListingIds,
  writeHotbarListingIds,
} from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_COOKIE_NAME, REFLOW_STORAGE_KEY } from "./listing-reflow";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";

test("cookie and storage keys stay the hotbar paper names", () => {
  assert.equal(HOTBAR_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.equal(HOTBAR_COOKIE_NAME, "iss-hotbar-listing-ids");
  assert.equal(HOTBAR_HOST_ID, "gtk-game-boy");
  assert.equal(
    HOTBAR_NOTICE_TITLE,
    "I will not hotbar it. Still a crack. Still Tetris.",
  );
  assert.equal(HOTBAR_LEAVE_LINE, "Leave the flex");
  assert.notEqual(HOTBAR_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:pulse-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:anvil-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:tcp-listing-ids");
  assert.notEqual(HOTBAR_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, REFLOW_COOKIE_NAME);
});

test("write-result objects never parse as a hotbar set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseHotbarListingIds(writeResult), []);
  assert.equal(
    isListingHotbarOverlay(
      "gtk-game-boy",
      parseHotbarListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseHotbarListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = hotbarCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseHotbarListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(HOTBAR_DRAWER_ID);
  const lid = listingById(HOTBAR_LID_ID);
  const lut = listingById(HOTBAR_LUT_ID);

  assert.ok(canTapeHotbar(boy));
  assert.equal(canTapeHotbar(drawer), false);
  assert.equal(canTapeHotbar(lid), false);
  assert.equal(canTapeHotbar(lut), false);

  const taped = markListingHotbar(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(hotbarCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingHotbarOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingHotbarOverlay(HOTBAR_DRAWER_ID, taped), false);
  assert.equal(isListingHotbarOverlay(HOTBAR_LID_ID, taped), false);
  assert.equal(isListingHotbarOverlay(HOTBAR_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a hotbar write", () => {
  const lut = listingById(HOTBAR_LUT_ID);
  const drawer = listingById(HOTBAR_DRAWER_ID);
  const lid = listingById(HOTBAR_LID_ID);
  const gift = listingById(HOTBAR_GIFT_ID);
  const zine = listingById(HOTBAR_ZINE_ID);
  const chair = listingById(HOTBAR_CHAIR_ID);

  assert.equal(canTapeHotbar(lut), false);
  assert.equal(canTapeHotbar(drawer), false);
  assert.equal(canTapeHotbar(lid), false);
  assert.equal(canTapeHotbar(gift), false);
  assert.equal(canTapeHotbar(zine), false);
  assert.equal(canTapeHotbar(chair), false);

  assert.equal(markListingHotbar(lut, []), null);
  assert.equal(markListingHotbar(drawer, []), null);
  assert.equal(markListingHotbar(lid, []), null);
  assert.equal(markListingHotbar(gift, []), null);
  assert.equal(markListingHotbar(zine, []), null);
  assert.equal(markListingHotbar(chair, []), null);
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
  const taped = markListingHotbar(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingHotbar(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(hotbarCookieValue(cleared), "[]");
  assert.equal(isListingHotbarOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(HOTBAR_LUT_ID);
  const taped = markListingHotbar(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingHotbar(lut, []), null);

  const cleared = clearListingHotbar(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(HOTBAR_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingHotbar(chair, []), null);
});

test("hotbar write does not write pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingHotbar(boy, []);
  assert.ok(taped);
  writeHotbarListingIds(taped);
  assert.deepEqual(readHotbarListingIds(), ["gtk-game-boy"]);
  assert.notEqual(HOTBAR_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:pulse-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:anvil-listing-ids");
  assert.notEqual(HOTBAR_STORAGE_KEY, "iss:tcp-listing-ids");
  assert.notEqual(HOTBAR_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(HOTBAR_COOKIE_NAME, "iss-clock-listing-ids");
  writeHotbarListingIds([]);
});
