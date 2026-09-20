import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
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
  BLOWHOLE_CHAIR_ID,
  BLOWHOLE_COOKIE_NAME,
  BLOWHOLE_DRAWER_ID,
  BLOWHOLE_GIFT_ID,
  BLOWHOLE_HOST_ID,
  BLOWHOLE_LEAVE_LINE,
  BLOWHOLE_LID_ID,
  BLOWHOLE_LUT_ID,
  BLOWHOLE_NOTICE_TITLE,
  BLOWHOLE_STORAGE_KEY,
  BLOWHOLE_ZINE_ID,
  canTapeBlowhole,
  clearListingBlowhole,
  isListingBlowholeOverlay,
  markListingBlowhole,
  parseBlowholeListingIds,
  blowholeCookieValue,
  readBlowholeListingIds,
  writeBlowholeListingIds,
} from "./listing-blowhole";

test("cookie and storage keys stay the blowhole paper names", () => {
  assert.equal(BLOWHOLE_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.equal(BLOWHOLE_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.equal(BLOWHOLE_HOST_ID, "gtk-game-boy");
  assert.equal(
    BLOWHOLE_NOTICE_TITLE,
    "I will not blowhole it. Still a crack. Still Tetris.",
  );
  assert.equal(BLOWHOLE_LEAVE_LINE, "Leave the blowhole");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:dam-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:acf-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:soak-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:bridging-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-eccentric-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, DEWET_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-eddy");
});

test("write-result objects never parse as a blowhole set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseBlowholeListingIds(writeResult), []);
  assert.equal(
    isListingBlowholeOverlay(
      "gtk-game-boy",
      parseBlowholeListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseBlowholeListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = blowholeCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseBlowholeListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(BLOWHOLE_DRAWER_ID);
  const lid = listingById(BLOWHOLE_LID_ID);
  const lut = listingById(BLOWHOLE_LUT_ID);

  assert.ok(canTapeBlowhole(boy));
  assert.equal(canTapeBlowhole(drawer), false);
  assert.equal(canTapeBlowhole(lid), false);
  assert.equal(canTapeBlowhole(lut), false);

  const taped = markListingBlowhole(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(blowholeCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingBlowholeOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingBlowholeOverlay(BLOWHOLE_DRAWER_ID, taped), false);
  assert.equal(isListingBlowholeOverlay(BLOWHOLE_LID_ID, taped), false);
  assert.equal(isListingBlowholeOverlay(BLOWHOLE_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a blowhole write", () => {
  const lut = listingById(BLOWHOLE_LUT_ID);
  const drawer = listingById(BLOWHOLE_DRAWER_ID);
  const lid = listingById(BLOWHOLE_LID_ID);
  const gift = listingById(BLOWHOLE_GIFT_ID);
  const zine = listingById(BLOWHOLE_ZINE_ID);
  const chair = listingById(BLOWHOLE_CHAIR_ID);

  assert.equal(canTapeBlowhole(lut), false);
  assert.equal(canTapeBlowhole(drawer), false);
  assert.equal(canTapeBlowhole(lid), false);
  assert.equal(canTapeBlowhole(gift), false);
  assert.equal(canTapeBlowhole(zine), false);
  assert.equal(canTapeBlowhole(chair), false);

  assert.equal(markListingBlowhole(lut, []), null);
  assert.equal(markListingBlowhole(drawer, []), null);
  assert.equal(markListingBlowhole(lid, []), null);
  assert.equal(markListingBlowhole(gift, []), null);
  assert.equal(markListingBlowhole(zine, []), null);
  assert.equal(markListingBlowhole(chair, []), null);
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
  const taped = markListingBlowhole(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingBlowhole(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(blowholeCookieValue(cleared), "[]");
  assert.equal(isListingBlowholeOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(BLOWHOLE_LUT_ID);
  const taped = markListingBlowhole(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingBlowhole(lut, []), null);

  const cleared = clearListingBlowhole(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BLOWHOLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBlowhole(chair, []), null);
});

test("blowhole write does not write leftover icicle, dewet, pillow, fringe, rake, opbd, race, mistrack, fizeau, frost, billboard, reflex, ltsh, flywheel, eccentric, haidinger, pclt, eddy, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingBlowhole(boy, []);
  assert.ok(taped);
  writeBlowholeListingIds(taped);
  assert.deepEqual(readBlowholeListingIds(), ["gtk-game-boy"]);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BLOWHOLE_STORAGE_KEY, "iss:bridging-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(BLOWHOLE_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, DEWET_COOKIE_NAME);
  assert.notEqual(BLOWHOLE_COOKIE_NAME, ICICLE_COOKIE_NAME);
  writeBlowholeListingIds([]);
});
