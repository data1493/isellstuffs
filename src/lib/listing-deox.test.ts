import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LINE_STORAGE_KEY } from "./listing-line";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import {
  DEOX_CHAIR_ID,
  DEOX_COOKIE_NAME,
  DEOX_HOST_ID,
  DEOX_LEAVE_LINE,
  DEOX_NOTICE_TITLE,
  DEOX_STORAGE_KEY,
  canTapeDeox,
  clearListingDeox,
  deoxCookieValue,
  isListingDeoxOverlay,
  markListingDeox,
  parseDeoxListingIds,
} from "./listing-deox";

test("cookie and storage keys stay the deox paper names", () => {
  assert.equal(DEOX_STORAGE_KEY, "iss:deox-listing-ids");
  assert.equal(DEOX_COOKIE_NAME, "iss-deox-listing-ids");
  assert.equal(DEOX_HOST_ID, "gtk-game-boy");
  assert.equal(
    DEOX_NOTICE_TITLE,
    "I will not deox it. Still a line. Still Tetris.",
  );
  assert.equal(DEOX_LEAVE_LINE, "Leave the slot");
  assert.notEqual(DEOX_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(DEOX_STORAGE_KEY, LINE_STORAGE_KEY);
});

test("write-result objects never parse as a deox set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseDeoxListingIds(writeResult), []);
  assert.equal(
    isListingDeoxOverlay("gtk-game-boy", parseDeoxListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = deoxCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseDeoxListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lamp, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById("gtk-cable-drawer");
  const lamp = listingById("ysk-wobbly-lamp");
  const lut = listingById("dl-camera-luts");

  assert.ok(canTapeDeox(boy));
  assert.equal(canTapeDeox(drawer), false);
  assert.equal(canTapeDeox(lamp), false);
  assert.equal(canTapeDeox(lut), false);

  const taped = markListingDeox(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(deoxCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingDeoxOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingDeoxOverlay("gtk-cable-drawer", taped), false);
  assert.equal(isListingDeoxOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingDeoxOverlay("dl-camera-luts", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lamp, gift, zine, and chair refuse a deox write", () => {
  const lut = listingById("dl-camera-luts");
  const drawer = listingById("gtk-cable-drawer");
  const lamp = listingById("ysk-wobbly-lamp");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(DEOX_CHAIR_ID);

  assert.equal(canTapeDeox(lut), false);
  assert.equal(canTapeDeox(drawer), false);
  assert.equal(canTapeDeox(lamp), false);
  assert.equal(canTapeDeox(gift), false);
  assert.equal(canTapeDeox(zine), false);
  assert.equal(canTapeDeox(chair), false);

  assert.equal(markListingDeox(lut, []), null);
  assert.equal(markListingDeox(drawer, []), null);
  assert.equal(markListingDeox(lamp, []), null);
  assert.equal(markListingDeox(gift, []), null);
  assert.equal(markListingDeox(zine, []), null);
  assert.equal(markListingDeox(chair, []), null);
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
  const taped = markListingDeox(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingDeox(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(deoxCookieValue(cleared), "[]");
  assert.equal(isListingDeoxOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById("dl-camera-luts");
  const taped = markListingDeox(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingDeox(lut, []), null);

  const cleared = clearListingDeox(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DEOX_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDeox(chair, []), null);
});
