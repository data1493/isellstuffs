import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BEEP_STORAGE_KEY } from "./listing-beep";
import {
  COIL_COOKIE_NAME,
  COIL_LEAVE_LINE,
  COIL_NOTICE_TITLE,
  COIL_STORAGE_KEY,
  canTapeCoil,
  clearListingCoil,
  coilCookieValue,
  isListingCoilOverlay,
  markListingCoil,
  parseCoilListingIds,
} from "./listing-coil";
import { DONGLE_STORAGE_KEY } from "./listing-dongle";
import { LABEL_STORAGE_KEY } from "./listing-label";
import { PILE_STORAGE_KEY } from "./listing-pile";

test("cookie and storage keys stay the coil paper names", () => {
  assert.equal(COIL_STORAGE_KEY, "iss:coil-listing-ids");
  assert.equal(COIL_COOKIE_NAME, "iss-coil-listing-ids");
  assert.equal(
    COIL_NOTICE_TITLE,
    "I will not coil them. Still a pile. Still mystery ends.",
  );
  assert.equal(COIL_LEAVE_LINE, "Leave the tangle");
  assert.notEqual(COIL_STORAGE_KEY, PILE_STORAGE_KEY);
  assert.notEqual(COIL_STORAGE_KEY, DONGLE_STORAGE_KEY);
  assert.notEqual(COIL_STORAGE_KEY, BEEP_STORAGE_KEY);
  assert.notEqual(COIL_STORAGE_KEY, LABEL_STORAGE_KEY);
});

test("write-result objects never parse as a coil set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-cable-drawer"],
  });
  assert.deepEqual(parseCoilListingIds(writeResult), []);
  assert.equal(
    isListingCoilOverlay("gtk-cable-drawer", parseCoilListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = coilCookieValue(["gtk-cable-drawer", "gtk-cable-drawer", ""]);
  assert.equal(raw, '["gtk-cable-drawer"]');
  assert.deepEqual(parseCoilListingIds(raw), ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("drawer tapes; Game Boy stays off that cookie", () => {
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");
  assert.ok(canTapeCoil(drawer));
  assert.ok(canTapeCoil(boy));

  const taped = markListingCoil(drawer, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-cable-drawer"]);
  assert.equal(coilCookieValue(taped), '["gtk-cable-drawer"]');
  assert.equal(isListingCoilOverlay("gtk-cable-drawer", taped), true);
  assert.equal(isListingCoilOverlay("gtk-game-boy", taped), false);
  assert.equal(drawer?.cartEligible, true);
  assert.equal(drawer?.status, "available");
  assert.equal(drawer?.price.amountCents, 600);
});

test("LUTs, sample pack, gift, chair, and stain zine refuse a coil write", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeCoil(luts), false);
  assert.equal(canTapeCoil(pack), false);
  assert.equal(canTapeCoil(gift), false);
  assert.equal(canTapeCoil(chair), false);
  assert.equal(canTapeCoil(zine), false);

  assert.equal(markListingCoil(luts, []), null);
  assert.equal(markListingCoil(pack, []), null);
  assert.equal(markListingCoil(gift, []), null);
  assert.equal(markListingCoil(chair, []), null);
  assert.equal(markListingCoil(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("clear peels only that drawer id", () => {
  const drawer = listingById("gtk-cable-drawer");
  const cleared = clearListingCoil(drawer, ["gtk-cable-drawer"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(coilCookieValue(cleared), "[]");
  assert.equal(isListingCoilOverlay("gtk-cable-drawer", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const drawer = listingById("gtk-cable-drawer");
  const taped = markListingCoil(drawer, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingCoil(drawer, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
