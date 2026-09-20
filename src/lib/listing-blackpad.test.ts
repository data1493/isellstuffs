import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLOWHOLE_COOKIE_NAME, BLOWHOLE_STORAGE_KEY } from "./listing-blowhole";
import { DEWET_COOKIE_NAME, DEWET_STORAGE_KEY } from "./listing-dewet";
import { ICICLE_COOKIE_NAME, ICICLE_STORAGE_KEY } from "./listing-icicle";
import { PILLOW_COOKIE_NAME, PILLOW_STORAGE_KEY } from "./listing-pillow";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  BLACKPAD_CHAIR_ID,
  BLACKPAD_COOKIE_NAME,
  BLACKPAD_DRAWER_ID,
  BLACKPAD_GIFT_ID,
  BLACKPAD_HOST_ID,
  BLACKPAD_LEAVE_LINE,
  BLACKPAD_LID_ID,
  BLACKPAD_LUT_ID,
  BLACKPAD_NOTICE_TITLE,
  BLACKPAD_STORAGE_KEY,
  BLACKPAD_ZINE_ID,
  canTapeBlackpad,
  clearListingBlackpad,
  isListingBlackpadOverlay,
  markListingBlackpad,
  parseBlackpadListingIds,
  blackpadCookieValue,
  readBlackpadListingIds,
  writeBlackpadListingIds,
} from "./listing-blackpad";

test("cookie and storage keys stay the blackpad paper names", () => {
  assert.equal(BLACKPAD_STORAGE_KEY, "iss:blackpad-listing-ids");
  assert.equal(BLACKPAD_COOKIE_NAME, "iss-blackpad-listing-ids");
  assert.equal(BLACKPAD_HOST_ID, "gtk-game-boy");
  assert.equal(
    BLACKPAD_NOTICE_TITLE,
    "I will not blackpad it. Still a crack. Still Tetris.",
  );
  assert.equal(BLACKPAD_LEAVE_LINE, "Leave the blackpad");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:dam-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:acf-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:soak-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:mother-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:ebdt-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, BLOWHOLE_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pinhole-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:outgas-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-eccentric-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-mother-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-brewster-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-ebdt-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, DEWET_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, BLOWHOLE_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-stator");
});

test("write-result objects never parse as a blackpad set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseBlackpadListingIds(writeResult), []);
  assert.equal(
    isListingBlackpadOverlay(
      "gtk-game-boy",
      parseBlackpadListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseBlackpadListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = blackpadCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseBlackpadListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(BLACKPAD_DRAWER_ID);
  const lid = listingById(BLACKPAD_LID_ID);
  const lut = listingById(BLACKPAD_LUT_ID);

  assert.ok(canTapeBlackpad(boy));
  assert.equal(canTapeBlackpad(drawer), false);
  assert.equal(canTapeBlackpad(lid), false);
  assert.equal(canTapeBlackpad(lut), false);

  const taped = markListingBlackpad(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(blackpadCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingBlackpadOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingBlackpadOverlay(BLACKPAD_DRAWER_ID, taped), false);
  assert.equal(isListingBlackpadOverlay(BLACKPAD_LID_ID, taped), false);
  assert.equal(isListingBlackpadOverlay(BLACKPAD_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a blackpad write", () => {
  const lut = listingById(BLACKPAD_LUT_ID);
  const drawer = listingById(BLACKPAD_DRAWER_ID);
  const lid = listingById(BLACKPAD_LID_ID);
  const gift = listingById(BLACKPAD_GIFT_ID);
  const zine = listingById(BLACKPAD_ZINE_ID);
  const chair = listingById(BLACKPAD_CHAIR_ID);

  assert.equal(canTapeBlackpad(lut), false);
  assert.equal(canTapeBlackpad(drawer), false);
  assert.equal(canTapeBlackpad(lid), false);
  assert.equal(canTapeBlackpad(gift), false);
  assert.equal(canTapeBlackpad(zine), false);
  assert.equal(canTapeBlackpad(chair), false);

  assert.equal(markListingBlackpad(lut, []), null);
  assert.equal(markListingBlackpad(drawer, []), null);
  assert.equal(markListingBlackpad(lid, []), null);
  assert.equal(markListingBlackpad(gift, []), null);
  assert.equal(markListingBlackpad(zine, []), null);
  assert.equal(markListingBlackpad(chair, []), null);
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
  const taped = markListingBlackpad(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingBlackpad(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(blackpadCookieValue(cleared), "[]");
  assert.equal(isListingBlackpadOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(BLACKPAD_LUT_ID);
  const taped = markListingBlackpad(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingBlackpad(lut, []), null);

  const cleared = clearListingBlackpad(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BLACKPAD_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBlackpad(chair, []), null);
});

test("blackpad write does not write leftover blowhole, leftover mother, leftover brewster, leftover pclt, leftover eddy, leftover eccentric, leftover haidinger, leftover icicle, leftover frost, leftover billboard, leftover reflex, ebdt, or stator paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingBlackpad(boy, []);
  assert.ok(taped);
  writeBlackpadListingIds(taped);
  assert.deepEqual(readBlackpadListingIds(), ["gtk-game-boy"]);
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:mother-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:ebdt-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, BLOWHOLE_STORAGE_KEY);
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BLACKPAD_STORAGE_KEY, "iss:pinhole-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(BLACKPAD_COOKIE_NAME, "iss-booth-stator");
  assert.notEqual(BLACKPAD_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, DEWET_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(BLACKPAD_COOKIE_NAME, BLOWHOLE_COOKIE_NAME);
  writeBlackpadListingIds([]);
});
