import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LINE_STORAGE_KEY } from "./listing-line";
import {
  REFLOW_CHAIR_ID,
  REFLOW_COOKIE_NAME,
  REFLOW_HOST_ID,
  REFLOW_LEAVE_LINE,
  REFLOW_NOTICE_TITLE,
  REFLOW_STORAGE_KEY,
  canTapeReflow,
  clearListingReflow,
  isListingReflowOverlay,
  markListingReflow,
  parseReflowListingIds,
  reflowCookieValue,
} from "./listing-reflow";
import { TIN_STORAGE_KEY } from "./listing-tin";

test("cookie and storage keys stay the reflow paper names", () => {
  assert.equal(REFLOW_STORAGE_KEY, "iss:reflow-listing-ids");
  assert.equal(REFLOW_COOKIE_NAME, "iss-reflow-listing-ids");
  assert.equal(REFLOW_HOST_ID, "gtk-game-boy");
  assert.equal(
    REFLOW_NOTICE_TITLE,
    "I will not reflow it. Still a line. Still fused.",
  );
  assert.equal(REFLOW_LEAVE_LINE, "Leave the joints");
  assert.notEqual(REFLOW_STORAGE_KEY, LINE_STORAGE_KEY);
  assert.notEqual(REFLOW_STORAGE_KEY, TIN_STORAGE_KEY);
});

test("write-result objects never parse as a reflow set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseReflowListingIds(writeResult), []);
  assert.equal(
    isListingReflowOverlay(
      "gtk-game-boy",
      parseReflowListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = reflowCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseReflowListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lamp, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById("gtk-cable-drawer");
  const lamp = listingById("ysk-wobbly-lamp");
  const lut = listingById("dl-camera-luts");

  assert.ok(canTapeReflow(boy));
  assert.equal(canTapeReflow(drawer), false);
  assert.equal(canTapeReflow(lamp), false);
  assert.equal(canTapeReflow(lut), false);

  const taped = markListingReflow(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(reflowCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingReflowOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingReflowOverlay("gtk-cable-drawer", taped), false);
  assert.equal(isListingReflowOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(isListingReflowOverlay("dl-camera-luts", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lamp, gift, zine, and chair refuse a reflow write", () => {
  const lut = listingById("dl-camera-luts");
  const drawer = listingById("gtk-cable-drawer");
  const lamp = listingById("ysk-wobbly-lamp");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(REFLOW_CHAIR_ID);

  assert.equal(canTapeReflow(lut), false);
  assert.equal(canTapeReflow(drawer), false);
  assert.equal(canTapeReflow(lamp), false);
  assert.equal(canTapeReflow(gift), false);
  assert.equal(canTapeReflow(zine), false);
  assert.equal(canTapeReflow(chair), false);

  assert.equal(markListingReflow(lut, []), null);
  assert.equal(markListingReflow(drawer, []), null);
  assert.equal(markListingReflow(lamp, []), null);
  assert.equal(markListingReflow(gift, []), null);
  assert.equal(markListingReflow(zine, []), null);
  assert.equal(markListingReflow(chair, []), null);
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
  const taped = markListingReflow(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingReflow(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(reflowCookieValue(cleared), "[]");
  assert.equal(isListingReflowOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById("dl-camera-luts");
  const taped = markListingReflow(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingReflow(lut, []), null);

  const cleared = clearListingReflow(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(REFLOW_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingReflow(chair, []), null);
});
