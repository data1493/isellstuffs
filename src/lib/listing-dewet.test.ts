import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { PILLOW_COOKIE_NAME, PILLOW_STORAGE_KEY } from "./listing-pillow";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  DEWET_CHAIR_ID,
  DEWET_COOKIE_NAME,
  DEWET_DRAWER_ID,
  DEWET_GIFT_ID,
  DEWET_HOST_ID,
  DEWET_LEAVE_LINE,
  DEWET_LID_ID,
  DEWET_LUT_ID,
  DEWET_NOTICE_TITLE,
  DEWET_STORAGE_KEY,
  DEWET_ZINE_ID,
  canTapeDewet,
  clearListingDewet,
  isListingDewetOverlay,
  markListingDewet,
  parseDewetListingIds,
  dewetCookieValue,
  readDewetListingIds,
  writeDewetListingIds,
} from "./listing-dewet";

test("cookie and storage keys stay the dewet paper names", () => {
  assert.equal(DEWET_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.equal(DEWET_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.equal(DEWET_HOST_ID, "gtk-game-boy");
  assert.equal(
    DEWET_NOTICE_TITLE,
    "I will not dewet it. Still a crack. Still Tetris.",
  );
  assert.equal(DEWET_LEAVE_LINE, "Leave the dewet");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:dam-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:acf-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:soak-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:hip-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:nonwet-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:dewetting-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:wetout-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-resonance-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-booth-reflex");
});

test("write-result objects never parse as a dewet set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseDewetListingIds(writeResult), []);
  assert.equal(
    isListingDewetOverlay(
      "gtk-game-boy",
      parseDewetListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseDewetListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = dewetCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseDewetListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(DEWET_DRAWER_ID);
  const lid = listingById(DEWET_LID_ID);
  const lut = listingById(DEWET_LUT_ID);

  assert.ok(canTapeDewet(boy));
  assert.equal(canTapeDewet(drawer), false);
  assert.equal(canTapeDewet(lid), false);
  assert.equal(canTapeDewet(lut), false);

  const taped = markListingDewet(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(dewetCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingDewetOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingDewetOverlay(DEWET_DRAWER_ID, taped), false);
  assert.equal(isListingDewetOverlay(DEWET_LID_ID, taped), false);
  assert.equal(isListingDewetOverlay(DEWET_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a dewet write", () => {
  const lut = listingById(DEWET_LUT_ID);
  const drawer = listingById(DEWET_DRAWER_ID);
  const lid = listingById(DEWET_LID_ID);
  const gift = listingById(DEWET_GIFT_ID);
  const zine = listingById(DEWET_ZINE_ID);
  const chair = listingById(DEWET_CHAIR_ID);

  assert.equal(canTapeDewet(lut), false);
  assert.equal(canTapeDewet(drawer), false);
  assert.equal(canTapeDewet(lid), false);
  assert.equal(canTapeDewet(gift), false);
  assert.equal(canTapeDewet(zine), false);
  assert.equal(canTapeDewet(chair), false);

  assert.equal(markListingDewet(lut, []), null);
  assert.equal(markListingDewet(drawer, []), null);
  assert.equal(markListingDewet(lid, []), null);
  assert.equal(markListingDewet(gift, []), null);
  assert.equal(markListingDewet(zine, []), null);
  assert.equal(markListingDewet(chair, []), null);
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
  const taped = markListingDewet(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingDewet(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(dewetCookieValue(cleared), "[]");
  assert.equal(isListingDewetOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(DEWET_LUT_ID);
  const taped = markListingDewet(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingDewet(lut, []), null);

  const cleared = clearListingDewet(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DEWET_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDewet(chair, []), null);
});

test("dewet write does not write leftover pillow, fringe, rake, opbd, race, resonance, frost, billboard, reflex, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingDewet(boy, []);
  assert.ok(taped);
  writeDewetListingIds(taped);
  assert.deepEqual(readDewetListingIds(), ["gtk-game-boy"]);
  assert.notEqual(DEWET_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:resonance-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(DEWET_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(DEWET_STORAGE_KEY, "iss:hip-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(DEWET_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(DEWET_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(DEWET_COOKIE_NAME, REBALL_COOKIE_NAME);
  writeDewetListingIds([]);
});
