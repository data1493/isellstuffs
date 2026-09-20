import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONTRAST_STORAGE_KEY } from "./listing-contrast";
import { DEOX_STORAGE_KEY } from "./listing-deox";
import { LINE_STORAGE_KEY } from "./listing-line";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import { SPEAKER_STORAGE_KEY } from "./listing-speaker";
import {
  SHIELD_CHAIR_ID,
  SHIELD_COOKIE_NAME,
  SHIELD_DISC_ID,
  SHIELD_DRAWER_ID,
  SHIELD_HOST_ID,
  SHIELD_LEAVE_LINE,
  SHIELD_NOTICE_TITLE,
  SHIELD_STORAGE_KEY,
  canTapeShield,
  clearListingShield,
  isListingShieldOverlay,
  markListingShield,
  parseShieldListingIds,
  shieldCookieValue,
} from "./listing-shield";

test("cookie and storage keys stay the shield paper names", () => {
  assert.equal(SHIELD_STORAGE_KEY, "iss:shield-listing-ids");
  assert.equal(SHIELD_COOKIE_NAME, "iss-shield-listing-ids");
  assert.equal(SHIELD_HOST_ID, "gtk-game-boy");
  assert.equal(
    SHIELD_NOTICE_TITLE,
    "I will not shield it. Still a line. Still Tetris.",
  );
  assert.equal(SHIELD_LEAVE_LINE, "Leave the can");
  assert.notEqual(SHIELD_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(SHIELD_STORAGE_KEY, CONTRAST_STORAGE_KEY);
  assert.notEqual(SHIELD_STORAGE_KEY, DEOX_STORAGE_KEY);
  assert.notEqual(SHIELD_STORAGE_KEY, SPEAKER_STORAGE_KEY);
  assert.notEqual(SHIELD_STORAGE_KEY, LINE_STORAGE_KEY);
});

test("write-result objects never parse as a shield set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseShieldListingIds(writeResult), []);
  assert.equal(
    isListingShieldOverlay(
      "gtk-game-boy",
      parseShieldListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = shieldCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseShieldListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, disc, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(SHIELD_DRAWER_ID);
  const disc = listingById(SHIELD_DISC_ID);
  const lut = listingById("dl-camera-luts");

  assert.ok(canTapeShield(boy));
  assert.equal(canTapeShield(drawer), false);
  assert.equal(canTapeShield(disc), false);
  assert.equal(canTapeShield(lut), false);

  const taped = markListingShield(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(shieldCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingShieldOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingShieldOverlay(SHIELD_DRAWER_ID, taped), false);
  assert.equal(isListingShieldOverlay(SHIELD_DISC_ID, taped), false);
  assert.equal(isListingShieldOverlay("dl-camera-luts", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, disc, gift, zine, and chair refuse a shield write", () => {
  const lut = listingById("dl-camera-luts");
  const drawer = listingById(SHIELD_DRAWER_ID);
  const disc = listingById(SHIELD_DISC_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SHIELD_CHAIR_ID);

  assert.equal(canTapeShield(lut), false);
  assert.equal(canTapeShield(drawer), false);
  assert.equal(canTapeShield(disc), false);
  assert.equal(canTapeShield(gift), false);
  assert.equal(canTapeShield(zine), false);
  assert.equal(canTapeShield(chair), false);

  assert.equal(markListingShield(lut, []), null);
  assert.equal(markListingShield(drawer, []), null);
  assert.equal(markListingShield(disc, []), null);
  assert.equal(markListingShield(gift, []), null);
  assert.equal(markListingShield(zine, []), null);
  assert.equal(markListingShield(chair, []), null);
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
  const taped = markListingShield(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingShield(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(shieldCookieValue(cleared), "[]");
  assert.equal(isListingShieldOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById("dl-camera-luts");
  const taped = markListingShield(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingShield(lut, []), null);

  const cleared = clearListingShield(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SHIELD_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingShield(chair, []), null);
});
