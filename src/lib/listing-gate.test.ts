import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LOOP_STORAGE_KEY } from "./listing-loop";
import { STEMS_STORAGE_KEY } from "./listing-stems";
import { TUNE_STORAGE_KEY } from "./listing-tune";
import {
  GATE_COOKIE_NAME,
  GATE_HOST_ID,
  GATE_LEAVE_LINE,
  GATE_NOTICE_TITLE,
  GATE_STORAGE_KEY,
  canTapeGate,
  clearListingGate,
  gateCookieValue,
  isListingGateOverlay,
  markListingGate,
  parseGateListingIds,
} from "./listing-gate";

test("cookie and storage keys stay the gate paper names", () => {
  assert.equal(GATE_STORAGE_KEY, "iss:gate-listing-ids");
  assert.equal(GATE_COOKIE_NAME, "iss-gate-listing-ids");
  assert.equal(GATE_HOST_ID, "dl-sample-pack");
  assert.equal(
    GATE_NOTICE_TITLE,
    "I will not gate it. Still twelve shots. Still a loop.",
  );
  assert.equal(GATE_LEAVE_LINE, "Leave the shots");
  assert.notEqual(GATE_STORAGE_KEY, STEMS_STORAGE_KEY);
  assert.notEqual(GATE_STORAGE_KEY, TUNE_STORAGE_KEY);
  assert.notEqual(GATE_STORAGE_KEY, LOOP_STORAGE_KEY);
});

test("write-result objects never parse as a gate set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-sample-pack"],
  });
  assert.deepEqual(parseGateListingIds(writeResult), []);
  assert.equal(
    isListingGateOverlay(
      "dl-sample-pack",
      parseGateListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = gateCookieValue(["dl-sample-pack", "dl-sample-pack", ""]);
  assert.equal(raw, '["dl-sample-pack"]');
  assert.deepEqual(parseGateListingIds(raw), ["dl-sample-pack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("sample pack tapes; font, LUT, and lamp stay off that cookie", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.ok(canTapeGate(pack));
  assert.equal(canTapeGate(font), false);
  assert.equal(canTapeGate(luts), false);
  assert.equal(canTapeGate(lamp), false);

  const taped = markListingGate(pack, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-sample-pack"]);
  assert.equal(gateCookieValue(taped), '["dl-sample-pack"]');
  assert.equal(isListingGateOverlay("dl-sample-pack", taped), true);
  assert.equal(isListingGateOverlay("dl-booth-font", taped), false);
  assert.equal(isListingGateOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingGateOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(pack?.cartEligible, true);
  assert.equal(pack?.status, "available");
  assert.equal(pack?.price.amountCents, 400);
});

test("font, LUT, gift, zine, physical, and overlay-owned rows refuse a gate write", () => {
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lamp = listingById("ysk-wobbly-lamp");
  const boy = listingById("gtk-game-boy");
  const junk = listingById("dl-junk-pricing-pdf");
  const jacket = listingById("clo-windbreaker");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeGate(font), false);
  assert.equal(canTapeGate(luts), false);
  assert.equal(canTapeGate(gift), false);
  assert.equal(canTapeGate(zine), false);
  assert.equal(canTapeGate(lamp), false);
  assert.equal(canTapeGate(boy), false);
  assert.equal(canTapeGate(junk), false);
  assert.equal(canTapeGate(jacket), false);
  assert.equal(canTapeGate(drawer), false);

  assert.equal(markListingGate(font, []), null);
  assert.equal(markListingGate(luts, []), null);
  assert.equal(markListingGate(gift, []), null);
  assert.equal(markListingGate(zine, []), null);
  assert.equal(markListingGate(lamp, []), null);
  assert.equal(markListingGate(boy, []), null);
  assert.equal(markListingGate(junk, []), null);
  assert.equal(markListingGate(jacket, []), null);
  assert.equal(markListingGate(drawer, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const pack = listingById("dl-sample-pack");
  assert.ok(pack);
  const before = {
    price: pack.price,
    status: pack.status,
    cartEligible: pack.cartEligible,
  };
  const taped = markListingGate(pack, []);
  assert.deepEqual(taped, ["dl-sample-pack"]);
  const after = listingById("dl-sample-pack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that sample-pack id", () => {
  const pack = listingById("dl-sample-pack");
  const cleared = clearListingGate(pack, ["dl-sample-pack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(gateCookieValue(cleared), "[]");
  assert.equal(isListingGateOverlay("dl-sample-pack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const taped = markListingGate(pack, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingGate(font, []), null);

  const cleared = clearListingGate(pack, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
