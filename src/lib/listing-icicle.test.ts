import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DEWET_COOKIE_NAME, DEWET_STORAGE_KEY } from "./listing-dewet";
import { PILLOW_COOKIE_NAME, PILLOW_STORAGE_KEY } from "./listing-pillow";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  ICICLE_CHAIR_ID,
  ICICLE_COOKIE_NAME,
  ICICLE_DRAWER_ID,
  ICICLE_GIFT_ID,
  ICICLE_HOST_ID,
  ICICLE_LEAVE_LINE,
  ICICLE_LID_ID,
  ICICLE_LUT_ID,
  ICICLE_NOTICE_TITLE,
  ICICLE_STORAGE_KEY,
  ICICLE_ZINE_ID,
  canTapeIcicle,
  clearListingIcicle,
  isListingIcicleOverlay,
  markListingIcicle,
  parseIcicleListingIds,
  icicleCookieValue,
  readIcicleListingIds,
  writeIcicleListingIds,
} from "./listing-icicle";

test("cookie and storage keys stay the icicle paper names", () => {
  assert.equal(ICICLE_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.equal(ICICLE_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.equal(ICICLE_HOST_ID, "gtk-game-boy");
  assert.equal(
    ICICLE_NOTICE_TITLE,
    "I will not icicle it. Still a crack. Still Tetris.",
  );
  assert.equal(ICICLE_LEAVE_LINE, "Leave the icicle");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:squeegee-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:dam-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:acf-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:soak-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:hotbar-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:bridging-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-rake-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-opbd-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-mistrack-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, DEWET_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-flywheel");
});

test("write-result objects never parse as an icicle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseIcicleListingIds(writeResult), []);
  assert.equal(
    isListingIcicleOverlay(
      "gtk-game-boy",
      parseIcicleListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseIcicleListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = icicleCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseIcicleListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(ICICLE_DRAWER_ID);
  const lid = listingById(ICICLE_LID_ID);
  const lut = listingById(ICICLE_LUT_ID);

  assert.ok(canTapeIcicle(boy));
  assert.equal(canTapeIcicle(drawer), false);
  assert.equal(canTapeIcicle(lid), false);
  assert.equal(canTapeIcicle(lut), false);

  const taped = markListingIcicle(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(icicleCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingIcicleOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingIcicleOverlay(ICICLE_DRAWER_ID, taped), false);
  assert.equal(isListingIcicleOverlay(ICICLE_LID_ID, taped), false);
  assert.equal(isListingIcicleOverlay(ICICLE_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse an icicle write", () => {
  const lut = listingById(ICICLE_LUT_ID);
  const drawer = listingById(ICICLE_DRAWER_ID);
  const lid = listingById(ICICLE_LID_ID);
  const gift = listingById(ICICLE_GIFT_ID);
  const zine = listingById(ICICLE_ZINE_ID);
  const chair = listingById(ICICLE_CHAIR_ID);

  assert.equal(canTapeIcicle(lut), false);
  assert.equal(canTapeIcicle(drawer), false);
  assert.equal(canTapeIcicle(lid), false);
  assert.equal(canTapeIcicle(gift), false);
  assert.equal(canTapeIcicle(zine), false);
  assert.equal(canTapeIcicle(chair), false);

  assert.equal(markListingIcicle(lut, []), null);
  assert.equal(markListingIcicle(drawer, []), null);
  assert.equal(markListingIcicle(lid, []), null);
  assert.equal(markListingIcicle(gift, []), null);
  assert.equal(markListingIcicle(zine, []), null);
  assert.equal(markListingIcicle(chair, []), null);
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
  const taped = markListingIcicle(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingIcicle(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(icicleCookieValue(cleared), "[]");
  assert.equal(isListingIcicleOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(ICICLE_LUT_ID);
  const taped = markListingIcicle(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingIcicle(lut, []), null);

  const cleared = clearListingIcicle(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ICICLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingIcicle(chair, []), null);
});

test("icicle write does not write leftover dewet, pillow, fringe, rake, opbd, race, mistrack, fizeau, frost, billboard, reflex, ltsh, flywheel, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingIcicle(boy, []);
  assert.ok(taped);
  writeIcicleListingIds(taped);
  assert.deepEqual(readIcicleListingIds(), ["gtk-game-boy"]);
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:pillow-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:rake-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:opbd-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:frost-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:ltsh-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, PILLOW_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(ICICLE_STORAGE_KEY, "iss:bridging-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-dewet-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-pillow-listing-ids");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-race");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(ICICLE_COOKIE_NAME, "iss-booth-flywheel");
  assert.notEqual(ICICLE_COOKIE_NAME, PILLOW_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(ICICLE_COOKIE_NAME, DEWET_COOKIE_NAME);
  writeIcicleListingIds([]);
});
