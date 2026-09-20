import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { MASK_STORAGE_KEY } from "./listing-mask";
import { RECAP_STORAGE_KEY } from "./listing-recap";
import { SHIELD_STORAGE_KEY } from "./listing-shield";
import {
  POGO_CHAIR_ID,
  POGO_COOKIE_NAME,
  POGO_DISC_ID,
  POGO_DRAWER_ID,
  POGO_HOST_ID,
  POGO_LEAVE_LINE,
  POGO_LUT_ID,
  POGO_NOTICE_TITLE,
  POGO_STORAGE_KEY,
  canTapePogo,
  clearListingPogo,
  isListingPogoOverlay,
  markListingPogo,
  parsePogoListingIds,
  pogoCookieValue,
} from "./listing-pogo";

test("cookie and storage keys stay the pogo paper names", () => {
  assert.equal(POGO_STORAGE_KEY, "iss:pogo-listing-ids");
  assert.equal(POGO_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.equal(POGO_HOST_ID, "gtk-game-boy");
  assert.equal(
    POGO_NOTICE_TITLE,
    "I will not pogo it. Still a cart. Still Tetris.",
  );
  assert.equal(POGO_LEAVE_LINE, "Leave the cart");
  assert.notEqual(POGO_STORAGE_KEY, SHIELD_STORAGE_KEY);
  assert.notEqual(POGO_STORAGE_KEY, RECAP_STORAGE_KEY);
  assert.notEqual(POGO_STORAGE_KEY, MASK_STORAGE_KEY);
  assert.notEqual(POGO_COOKIE_NAME, "iss-shield-listing-ids");
  assert.notEqual(POGO_COOKIE_NAME, "iss-recap-listing-ids");
});

test("write-result objects never parse as a pogo set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parsePogoListingIds(writeResult), []);
  assert.equal(
    isListingPogoOverlay(
      "gtk-game-boy",
      parsePogoListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pogoCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parsePogoListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, disc, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(POGO_DRAWER_ID);
  const disc = listingById(POGO_DISC_ID);
  const lut = listingById(POGO_LUT_ID);

  assert.ok(canTapePogo(boy));
  assert.equal(canTapePogo(drawer), false);
  assert.equal(canTapePogo(disc), false);
  assert.equal(canTapePogo(lut), false);

  const taped = markListingPogo(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(pogoCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingPogoOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingPogoOverlay(POGO_DRAWER_ID, taped), false);
  assert.equal(isListingPogoOverlay(POGO_DISC_ID, taped), false);
  assert.equal(isListingPogoOverlay(POGO_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, disc, gift, zine, and chair refuse a pogo write", () => {
  const lut = listingById(POGO_LUT_ID);
  const drawer = listingById(POGO_DRAWER_ID);
  const disc = listingById(POGO_DISC_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(POGO_CHAIR_ID);

  assert.equal(canTapePogo(lut), false);
  assert.equal(canTapePogo(drawer), false);
  assert.equal(canTapePogo(disc), false);
  assert.equal(canTapePogo(gift), false);
  assert.equal(canTapePogo(zine), false);
  assert.equal(canTapePogo(chair), false);

  assert.equal(markListingPogo(lut, []), null);
  assert.equal(markListingPogo(drawer, []), null);
  assert.equal(markListingPogo(disc, []), null);
  assert.equal(markListingPogo(gift, []), null);
  assert.equal(markListingPogo(zine, []), null);
  assert.equal(markListingPogo(chair, []), null);
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
  const taped = markListingPogo(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingPogo(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pogoCookieValue(cleared), "[]");
  assert.equal(isListingPogoOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(POGO_LUT_ID);
  const taped = markListingPogo(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingPogo(lut, []), null);

  const cleared = clearListingPogo(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(POGO_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPogo(chair, []), null);
});

test("pogo write never aliases shield or recap paper", () => {
  assert.notEqual(POGO_STORAGE_KEY, "iss:shield-listing-ids");
  assert.notEqual(POGO_STORAGE_KEY, "iss:recap-listing-ids");
  assert.notEqual(POGO_STORAGE_KEY, "iss:mask-listing-ids");
  assert.notEqual(POGO_COOKIE_NAME, "iss-shield-listing-ids");
  assert.notEqual(POGO_COOKIE_NAME, "iss-recap-listing-ids");
});
