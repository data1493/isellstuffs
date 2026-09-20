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
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  TOMBSTONE_CHAIR_ID,
  TOMBSTONE_COOKIE_NAME,
  TOMBSTONE_DRAWER_ID,
  TOMBSTONE_GIFT_ID,
  TOMBSTONE_HOST_ID,
  TOMBSTONE_LEAVE_LINE,
  TOMBSTONE_LID_ID,
  TOMBSTONE_LUT_ID,
  TOMBSTONE_NOTICE_TITLE,
  TOMBSTONE_STORAGE_KEY,
  TOMBSTONE_ZINE_ID,
  canTapeTombstone,
  clearListingTombstone,
  isListingTombstoneOverlay,
  markListingTombstone,
  parseTombstoneListingIds,
  readTombstoneListingIds,
  tombstoneCookieValue,
  writeTombstoneListingIds,
} from "./listing-tombstone";

test("cookie and storage keys stay the tombstone paper names", () => {
  assert.equal(TOMBSTONE_STORAGE_KEY, "iss:tombstone-listing-ids");
  assert.equal(TOMBSTONE_COOKIE_NAME, "iss-tombstone-listing-ids");
  assert.equal(TOMBSTONE_HOST_ID, "gtk-game-boy");
  assert.equal(
    TOMBSTONE_NOTICE_TITLE,
    "I will not tombstone it. Still a crack. Still Tetris.",
  );
  assert.equal(TOMBSTONE_LEAVE_LINE, "Leave the joint");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, SQUEEGEE_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:nozzle-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:fiducial-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:vcut-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:mousebite-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:ict-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:spi-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:xray-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:hotair-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:rework-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:pnp-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:qfn-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:selective-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:stencil-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:paste-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:hasl-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:aoi-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:void-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:wave-listing-ids");
  assert.notEqual(TOMBSTONE_COOKIE_NAME, SQUEEGEE_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, REBALL_COOKIE_NAME);
});

test("write-result objects never parse as a tombstone set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseTombstoneListingIds(writeResult), []);
  assert.equal(
    isListingTombstoneOverlay(
      "gtk-game-boy",
      parseTombstoneListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseTombstoneListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = tombstoneCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseTombstoneListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(TOMBSTONE_DRAWER_ID);
  const lid = listingById(TOMBSTONE_LID_ID);
  const lut = listingById(TOMBSTONE_LUT_ID);

  assert.ok(canTapeTombstone(boy));
  assert.equal(canTapeTombstone(drawer), false);
  assert.equal(canTapeTombstone(lid), false);
  assert.equal(canTapeTombstone(lut), false);

  const taped = markListingTombstone(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(tombstoneCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingTombstoneOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingTombstoneOverlay(TOMBSTONE_DRAWER_ID, taped), false);
  assert.equal(isListingTombstoneOverlay(TOMBSTONE_LID_ID, taped), false);
  assert.equal(isListingTombstoneOverlay(TOMBSTONE_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a tombstone write", () => {
  const lut = listingById(TOMBSTONE_LUT_ID);
  const drawer = listingById(TOMBSTONE_DRAWER_ID);
  const lid = listingById(TOMBSTONE_LID_ID);
  const gift = listingById(TOMBSTONE_GIFT_ID);
  const zine = listingById(TOMBSTONE_ZINE_ID);
  const chair = listingById(TOMBSTONE_CHAIR_ID);

  assert.equal(canTapeTombstone(lut), false);
  assert.equal(canTapeTombstone(drawer), false);
  assert.equal(canTapeTombstone(lid), false);
  assert.equal(canTapeTombstone(gift), false);
  assert.equal(canTapeTombstone(zine), false);
  assert.equal(canTapeTombstone(chair), false);

  assert.equal(markListingTombstone(lut, []), null);
  assert.equal(markListingTombstone(drawer, []), null);
  assert.equal(markListingTombstone(lid, []), null);
  assert.equal(markListingTombstone(gift, []), null);
  assert.equal(markListingTombstone(zine, []), null);
  assert.equal(markListingTombstone(chair, []), null);
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
  const taped = markListingTombstone(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingTombstone(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(tombstoneCookieValue(cleared), "[]");
  assert.equal(isListingTombstoneOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(TOMBSTONE_LUT_ID);
  const taped = markListingTombstone(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingTombstone(lut, []), null);

  const cleared = clearListingTombstone(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TOMBSTONE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTombstone(chair, []), null);
});

test("tombstone write does not write squeegee, dam, globtop, acf, soak, hotbar, pogo, underfill, or reball paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingTombstone(boy, []);
  assert.ok(taped);
  writeTombstoneListingIds(taped);
  assert.deepEqual(readTombstoneListingIds(), ["gtk-game-boy"]);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, SQUEEGEE_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, DAM_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:depanel-listing-ids");
  assert.notEqual(TOMBSTONE_STORAGE_KEY, "iss:nozzle-listing-ids");
  assert.notEqual(TOMBSTONE_COOKIE_NAME, SQUEEGEE_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, DAM_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(TOMBSTONE_COOKIE_NAME, REBALL_COOKIE_NAME);
  writeTombstoneListingIds([]);
});
