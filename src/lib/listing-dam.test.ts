import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ACF_COOKIE_NAME, ACF_STORAGE_KEY } from "./listing-acf";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
import {
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_STORAGE_KEY,
} from "./listing-globtop";
import { HOTBAR_COOKIE_NAME, HOTBAR_STORAGE_KEY } from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_COOKIE_NAME, REFLOW_STORAGE_KEY } from "./listing-reflow";
import { SOAK_COOKIE_NAME, SOAK_STORAGE_KEY } from "./listing-soak";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  DAM_CHAIR_ID,
  DAM_COOKIE_NAME,
  DAM_DRAWER_ID,
  DAM_GIFT_ID,
  DAM_HOST_ID,
  DAM_LEAVE_LINE,
  DAM_LID_ID,
  DAM_LUT_ID,
  DAM_NOTICE_TITLE,
  DAM_STORAGE_KEY,
  DAM_ZINE_ID,
  canTapeDam,
  clearListingDam,
  damCookieValue,
  isListingDamOverlay,
  markListingDam,
  parseDamListingIds,
  readDamListingIds,
  writeDamListingIds,
} from "./listing-dam";

test("cookie and storage keys stay the dam paper names", () => {
  assert.equal(DAM_STORAGE_KEY, "iss:dam-listing-ids");
  assert.equal(DAM_COOKIE_NAME, "iss-dam-listing-ids");
  assert.equal(DAM_HOST_ID, "gtk-game-boy");
  assert.equal(
    DAM_NOTICE_TITLE,
    "I will not dam it. Still a crack. Still Tetris.",
  );
  assert.equal(DAM_LEAVE_LINE, "Leave the wall");
  assert.notEqual(DAM_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:ncf-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:cof-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:encapsulant-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:wall-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:damfill-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:blob-listing-ids");
  assert.notEqual(DAM_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, REFLOW_COOKIE_NAME);
});

test("write-result objects never parse as a dam set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseDamListingIds(writeResult), []);
  assert.equal(
    isListingDamOverlay("gtk-game-boy", parseDamListingIds(writeResult)),
    false,
  );
  assert.deepEqual(parseDamListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = damCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseDamListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(DAM_DRAWER_ID);
  const lid = listingById(DAM_LID_ID);
  const lut = listingById(DAM_LUT_ID);

  assert.ok(canTapeDam(boy));
  assert.equal(canTapeDam(drawer), false);
  assert.equal(canTapeDam(lid), false);
  assert.equal(canTapeDam(lut), false);

  const taped = markListingDam(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(damCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingDamOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingDamOverlay(DAM_DRAWER_ID, taped), false);
  assert.equal(isListingDamOverlay(DAM_LID_ID, taped), false);
  assert.equal(isListingDamOverlay(DAM_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a dam write", () => {
  const lut = listingById(DAM_LUT_ID);
  const drawer = listingById(DAM_DRAWER_ID);
  const lid = listingById(DAM_LID_ID);
  const gift = listingById(DAM_GIFT_ID);
  const zine = listingById(DAM_ZINE_ID);
  const chair = listingById(DAM_CHAIR_ID);

  assert.equal(canTapeDam(lut), false);
  assert.equal(canTapeDam(drawer), false);
  assert.equal(canTapeDam(lid), false);
  assert.equal(canTapeDam(gift), false);
  assert.equal(canTapeDam(zine), false);
  assert.equal(canTapeDam(chair), false);

  assert.equal(markListingDam(lut, []), null);
  assert.equal(markListingDam(drawer, []), null);
  assert.equal(markListingDam(lid, []), null);
  assert.equal(markListingDam(gift, []), null);
  assert.equal(markListingDam(zine, []), null);
  assert.equal(markListingDam(chair, []), null);
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
  const taped = markListingDam(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingDam(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(damCookieValue(cleared), "[]");
  assert.equal(isListingDamOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(DAM_LUT_ID);
  const taped = markListingDam(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingDam(lut, []), null);

  const cleared = clearListingDam(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(DAM_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingDam(chair, []), null);
});

test("dam write does not write globtop, acf, soak, hotbar, pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingDam(boy, []);
  assert.ok(taped);
  writeDamListingIds(taped);
  assert.deepEqual(readDamListingIds(), ["gtk-game-boy"]);
  assert.notEqual(DAM_STORAGE_KEY, GLOBTOP_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(DAM_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:wall-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:damfill-listing-ids");
  assert.notEqual(DAM_STORAGE_KEY, "iss:blob-listing-ids");
  assert.notEqual(DAM_COOKIE_NAME, GLOBTOP_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(DAM_COOKIE_NAME, "iss-clock-listing-ids");
  writeDamListingIds([]);
});
