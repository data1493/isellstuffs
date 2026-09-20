import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ACF_COOKIE_NAME, ACF_STORAGE_KEY } from "./listing-acf";
import { DAM_COOKIE_NAME, DAM_STORAGE_KEY } from "./listing-dam";
import {
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_STORAGE_KEY,
} from "./listing-globtop";
import { HOTBAR_COOKIE_NAME, HOTBAR_STORAGE_KEY } from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { SOAK_COOKIE_NAME, SOAK_STORAGE_KEY } from "./listing-soak";
import {
  SQUEEGEE_COOKIE_NAME,
  SQUEEGEE_STORAGE_KEY,
} from "./listing-squeegee";
import {
  TOMBSTONE_COOKIE_NAME,
  TOMBSTONE_STORAGE_KEY,
} from "./listing-tombstone";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  BILLBOARD_CHAIR_ID,
  BILLBOARD_COOKIE_NAME,
  BILLBOARD_DRAWER_ID,
  BILLBOARD_GIFT_ID,
  BILLBOARD_HOST_ID,
  BILLBOARD_LEAVE_LINE,
  BILLBOARD_LID_ID,
  BILLBOARD_LUT_ID,
  BILLBOARD_NOTICE_TITLE,
  BILLBOARD_STORAGE_KEY,
  BILLBOARD_ZINE_ID,
  billboardCookieValue,
  canTapeBillboard,
  clearListingBillboard,
  isListingBillboardOverlay,
  markListingBillboard,
  parseBillboardListingIds,
  readBillboardListingIds,
  writeBillboardListingIds,
} from "./listing-billboard";

test("cookie and storage keys stay the billboard paper names", () => {
  assert.equal(BILLBOARD_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.equal(BILLBOARD_COOKIE_NAME, "iss-billboard-listing-ids");
  assert.equal(BILLBOARD_HOST_ID, "gtk-game-boy");
  assert.equal(
    BILLBOARD_NOTICE_TITLE,
    "I will not billboard it. Still a crack. Still Tetris.",
  );
  assert.equal(BILLBOARD_LEAVE_LINE, "Leave the stand");
  assert.notEqual(BILLBOARD_STORAGE_KEY, TOMBSTONE_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, SQUEEGEE_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:nozzle-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:fiducial-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:vcut-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:mousebite-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:ict-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:spi-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:xray-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:hotair-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:rework-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:pnp-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:qfn-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:selective-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:stencil-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:paste-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:hasl-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:aoi-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:void-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:wave-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:grape-listing-ids");
  assert.notEqual(BILLBOARD_COOKIE_NAME, TOMBSTONE_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, SQUEEGEE_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, REBALL_COOKIE_NAME);
});

test("write-result objects never parse as a billboard set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseBillboardListingIds(writeResult), []);
  assert.equal(
    isListingBillboardOverlay(
      "gtk-game-boy",
      parseBillboardListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseBillboardListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = billboardCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseBillboardListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(BILLBOARD_DRAWER_ID);
  const lid = listingById(BILLBOARD_LID_ID);
  const lut = listingById(BILLBOARD_LUT_ID);

  assert.ok(canTapeBillboard(boy));
  assert.equal(canTapeBillboard(drawer), false);
  assert.equal(canTapeBillboard(lid), false);
  assert.equal(canTapeBillboard(lut), false);

  const taped = markListingBillboard(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(billboardCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingBillboardOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingBillboardOverlay(BILLBOARD_DRAWER_ID, taped), false);
  assert.equal(isListingBillboardOverlay(BILLBOARD_LID_ID, taped), false);
  assert.equal(isListingBillboardOverlay(BILLBOARD_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a billboard write", () => {
  const lut = listingById(BILLBOARD_LUT_ID);
  const drawer = listingById(BILLBOARD_DRAWER_ID);
  const lid = listingById(BILLBOARD_LID_ID);
  const gift = listingById(BILLBOARD_GIFT_ID);
  const zine = listingById(BILLBOARD_ZINE_ID);
  const chair = listingById(BILLBOARD_CHAIR_ID);

  assert.equal(canTapeBillboard(lut), false);
  assert.equal(canTapeBillboard(drawer), false);
  assert.equal(canTapeBillboard(lid), false);
  assert.equal(canTapeBillboard(gift), false);
  assert.equal(canTapeBillboard(zine), false);
  assert.equal(canTapeBillboard(chair), false);

  assert.equal(markListingBillboard(lut, []), null);
  assert.equal(markListingBillboard(drawer, []), null);
  assert.equal(markListingBillboard(lid, []), null);
  assert.equal(markListingBillboard(gift, []), null);
  assert.equal(markListingBillboard(zine, []), null);
  assert.equal(markListingBillboard(chair, []), null);
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
  const taped = markListingBillboard(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingBillboard(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(billboardCookieValue(cleared), "[]");
  assert.equal(isListingBillboardOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(BILLBOARD_LUT_ID);
  const taped = markListingBillboard(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingBillboard(lut, []), null);

  const cleared = clearListingBillboard(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BILLBOARD_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBillboard(chair, []), null);
});

test("billboard write does not write tombstone, squeegee, dam, globtop, acf, soak, hotbar, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingBillboard(boy, []);
  assert.ok(taped);
  writeBillboardListingIds(taped);
  assert.deepEqual(readBillboardListingIds(), ["gtk-game-boy"]);
  assert.notEqual(BILLBOARD_STORAGE_KEY, TOMBSTONE_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, SQUEEGEE_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(BILLBOARD_STORAGE_KEY, "iss:nozzle-listing-ids");
  assert.notEqual(BILLBOARD_COOKIE_NAME, TOMBSTONE_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, SQUEEGEE_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(BILLBOARD_COOKIE_NAME, REBALL_COOKIE_NAME);
  writeBillboardListingIds([]);
});
