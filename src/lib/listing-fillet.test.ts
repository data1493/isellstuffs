import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FLUX_STORAGE_KEY } from "./listing-flux";
import { POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import { UNDERFILL_STORAGE_KEY } from "./listing-underfill";
import {
  FILLET_CHAIR_ID,
  FILLET_COOKIE_NAME,
  FILLET_DRAWER_ID,
  FILLET_GIFT_ID,
  FILLET_HOST_ID,
  FILLET_LEAVE_LINE,
  FILLET_LID_ID,
  FILLET_LUT_ID,
  FILLET_NOTICE_TITLE,
  FILLET_STORAGE_KEY,
  FILLET_ZINE_ID,
  canTapeFillet,
  clearListingFillet,
  filletCookieValue,
  isListingFilletOverlay,
  markListingFillet,
  parseFilletListingIds,
  readFilletListingIds,
  writeFilletListingIds,
} from "./listing-fillet";

test("cookie and storage keys stay the fillet paper names", () => {
  assert.equal(FILLET_STORAGE_KEY, "iss:fillet-listing-ids");
  assert.equal(FILLET_COOKIE_NAME, "iss-fillet-listing-ids");
  assert.equal(FILLET_HOST_ID, "gtk-game-boy");
  assert.equal(
    FILLET_NOTICE_TITLE,
    "I will not fillet it. Still a crack. Still Tetris.",
  );
  assert.equal(FILLET_LEAVE_LINE, "Leave the crack");
  assert.notEqual(FILLET_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(FILLET_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(FILLET_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(FILLET_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(FILLET_STORAGE_KEY, FLUX_STORAGE_KEY);
  assert.notEqual(FILLET_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-underfill-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-reball-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-clock-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-flux-listing-ids");
});

test("write-result objects never parse as a fillet set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseFilletListingIds(writeResult), []);
  assert.equal(
    isListingFilletOverlay(
      "gtk-game-boy",
      parseFilletListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseFilletListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = filletCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseFilletListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(FILLET_DRAWER_ID);
  const lid = listingById(FILLET_LID_ID);
  const lut = listingById(FILLET_LUT_ID);

  assert.ok(canTapeFillet(boy));
  assert.equal(canTapeFillet(drawer), false);
  assert.equal(canTapeFillet(lid), false);
  assert.equal(canTapeFillet(lut), false);

  const taped = markListingFillet(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(filletCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingFilletOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingFilletOverlay(FILLET_DRAWER_ID, taped), false);
  assert.equal(isListingFilletOverlay(FILLET_LID_ID, taped), false);
  assert.equal(isListingFilletOverlay(FILLET_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a fillet write", () => {
  const lut = listingById(FILLET_LUT_ID);
  const drawer = listingById(FILLET_DRAWER_ID);
  const lid = listingById(FILLET_LID_ID);
  const gift = listingById(FILLET_GIFT_ID);
  const zine = listingById(FILLET_ZINE_ID);
  const chair = listingById(FILLET_CHAIR_ID);

  assert.equal(canTapeFillet(lut), false);
  assert.equal(canTapeFillet(drawer), false);
  assert.equal(canTapeFillet(lid), false);
  assert.equal(canTapeFillet(gift), false);
  assert.equal(canTapeFillet(zine), false);
  assert.equal(canTapeFillet(chair), false);

  assert.equal(markListingFillet(lut, []), null);
  assert.equal(markListingFillet(drawer, []), null);
  assert.equal(markListingFillet(lid, []), null);
  assert.equal(markListingFillet(gift, []), null);
  assert.equal(markListingFillet(zine, []), null);
  assert.equal(markListingFillet(chair, []), null);
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
  const taped = markListingFillet(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingFillet(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(filletCookieValue(cleared), "[]");
  assert.equal(isListingFilletOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(FILLET_LUT_ID);
  const taped = markListingFillet(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingFillet(lut, []), null);

  const cleared = clearListingFillet(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FILLET_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFillet(chair, []), null);
});

test("fillet write never aliases pogo, underfill, reball, clock, reflow, or flux paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingFillet(boy, []);
  assert.ok(taped);
  writeFilletListingIds(taped);
  assert.deepEqual(readFilletListingIds(), ["gtk-game-boy"]);
  assert.notEqual(FILLET_STORAGE_KEY, "iss:pogo-listing-ids");
  assert.notEqual(FILLET_STORAGE_KEY, "iss:underfill-listing-ids");
  assert.notEqual(FILLET_STORAGE_KEY, "iss:reball-listing-ids");
  assert.notEqual(FILLET_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(FILLET_STORAGE_KEY, "iss:reflow-listing-ids");
  assert.notEqual(FILLET_STORAGE_KEY, "iss:flux-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-underfill-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-reball-listing-ids");
  assert.notEqual(FILLET_COOKIE_NAME, "iss-clock-listing-ids");
  writeFilletListingIds([]);
});
