import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHANNEL_STORAGE_KEY } from "./listing-channel";
import { DESCREEN_STORAGE_KEY } from "./listing-descreen";
import { FLUX_STORAGE_KEY } from "./listing-flux";
import { POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_STORAGE_KEY } from "./listing-reflow";
import { TIN_STORAGE_KEY } from "./listing-tin";
import { TORQUE_STORAGE_KEY } from "./listing-torque";
import {
  UNDERFILL_CHAIR_ID,
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_DRAWER_ID,
  UNDERFILL_GIFT_ID,
  UNDERFILL_HOST_ID,
  UNDERFILL_LEAVE_LINE,
  UNDERFILL_LID_ID,
  UNDERFILL_LUT_ID,
  UNDERFILL_NOTICE_TITLE,
  UNDERFILL_STORAGE_KEY,
  UNDERFILL_ZINE_ID,
  canTapeUnderfill,
  clearListingUnderfill,
  isListingUnderfillOverlay,
  markListingUnderfill,
  parseUnderfillListingIds,
  underfillCookieValue,
} from "./listing-underfill";

test("cookie and storage keys stay the underfill paper names", () => {
  assert.equal(UNDERFILL_STORAGE_KEY, "iss:underfill-listing-ids");
  assert.equal(UNDERFILL_COOKIE_NAME, "iss-underfill-listing-ids");
  assert.equal(UNDERFILL_HOST_ID, "gtk-game-boy");
  assert.equal(
    UNDERFILL_NOTICE_TITLE,
    "I will not underfill it. Still a crack. Still Tetris.",
  );
  assert.equal(UNDERFILL_LEAVE_LINE, "Leave the crack");
  assert.notEqual(UNDERFILL_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, FLUX_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, TIN_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, TORQUE_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, CHANNEL_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, DESCREEN_STORAGE_KEY);
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-clock-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-reball-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-flux-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-tin-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-torque-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-descreen-listing-ids");
});

test("write-result objects never parse as an underfill set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseUnderfillListingIds(writeResult), []);
  assert.equal(
    isListingUnderfillOverlay(
      "gtk-game-boy",
      parseUnderfillListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = underfillCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseUnderfillListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(UNDERFILL_DRAWER_ID);
  const lid = listingById(UNDERFILL_LID_ID);
  const lut = listingById(UNDERFILL_LUT_ID);

  assert.ok(canTapeUnderfill(boy));
  assert.equal(canTapeUnderfill(drawer), false);
  assert.equal(canTapeUnderfill(lid), false);
  assert.equal(canTapeUnderfill(lut), false);

  const taped = markListingUnderfill(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(underfillCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingUnderfillOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingUnderfillOverlay(UNDERFILL_DRAWER_ID, taped), false);
  assert.equal(isListingUnderfillOverlay(UNDERFILL_LID_ID, taped), false);
  assert.equal(isListingUnderfillOverlay(UNDERFILL_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse an underfill write", () => {
  const lut = listingById(UNDERFILL_LUT_ID);
  const drawer = listingById(UNDERFILL_DRAWER_ID);
  const lid = listingById(UNDERFILL_LID_ID);
  const gift = listingById(UNDERFILL_GIFT_ID);
  const zine = listingById(UNDERFILL_ZINE_ID);
  const chair = listingById(UNDERFILL_CHAIR_ID);

  assert.equal(canTapeUnderfill(lut), false);
  assert.equal(canTapeUnderfill(drawer), false);
  assert.equal(canTapeUnderfill(lid), false);
  assert.equal(canTapeUnderfill(gift), false);
  assert.equal(canTapeUnderfill(zine), false);
  assert.equal(canTapeUnderfill(chair), false);

  assert.equal(markListingUnderfill(lut, []), null);
  assert.equal(markListingUnderfill(drawer, []), null);
  assert.equal(markListingUnderfill(lid, []), null);
  assert.equal(markListingUnderfill(gift, []), null);
  assert.equal(markListingUnderfill(zine, []), null);
  assert.equal(markListingUnderfill(chair, []), null);
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
  const taped = markListingUnderfill(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingUnderfill(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(underfillCookieValue(cleared), "[]");
  assert.equal(isListingUnderfillOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(UNDERFILL_LUT_ID);
  const taped = markListingUnderfill(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingUnderfill(lut, []), null);

  const cleared = clearListingUnderfill(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(UNDERFILL_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingUnderfill(chair, []), null);
});

test("underfill write never aliases pogo, clock, reball, reflow, flux, tin, torque, or descreen paper", () => {
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:pogo-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:reball-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:reflow-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:flux-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:tin-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:torque-listing-ids");
  assert.notEqual(UNDERFILL_STORAGE_KEY, "iss:descreen-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-pogo-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-clock-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-reball-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-flux-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-tin-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-torque-listing-ids");
  assert.notEqual(UNDERFILL_COOKIE_NAME, "iss-descreen-listing-ids");
});
