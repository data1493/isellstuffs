import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LIGATURE_STORAGE_KEY } from "./listing-ligature";
import {
  OUTLINE_CHAIR_ID,
  OUTLINE_COOKIE_NAME,
  OUTLINE_HOST_ID,
  OUTLINE_LEAVE_LINE,
  OUTLINE_NOTICE_TITLE,
  OUTLINE_STORAGE_KEY,
  canTapeOutline,
  clearListingOutline,
  isListingOutlineOverlay,
  markListingOutline,
  outlineCookieValue,
  parseOutlineListingIds,
} from "./listing-outline";
import { SUBSET_STORAGE_KEY } from "./listing-subset";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";

test("cookie and storage keys stay the outline paper names", () => {
  assert.equal(OUTLINE_STORAGE_KEY, "iss:outline-listing-ids");
  assert.equal(OUTLINE_COOKIE_NAME, "iss-outline-listing-ids");
  assert.equal(OUTLINE_HOST_ID, "dl-booth-font");
  assert.equal(
    OUTLINE_NOTICE_TITLE,
    "I will not outline them. Still two weights. Still OTF.",
  );
  assert.equal(OUTLINE_LEAVE_LINE, "Leave the file");
  assert.notEqual(OUTLINE_STORAGE_KEY, SUBSET_STORAGE_KEY);
  assert.notEqual(OUTLINE_STORAGE_KEY, LIGATURE_STORAGE_KEY);
  assert.notEqual(OUTLINE_STORAGE_KEY, VARIABLE_STORAGE_KEY);
});

test("write-result objects never parse as an outline set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseOutlineListingIds(writeResult), []);
  assert.equal(
    isListingOutlineOverlay(
      "dl-booth-font",
      parseOutlineListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = outlineCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseOutlineListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; pack, LUT, and overlay hosts stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const boy = listingById("gtk-game-boy");
  const jewels = listingById("mdb-jewel-stack");

  assert.ok(canTapeOutline(font));
  assert.equal(canTapeOutline(pack), false);
  assert.equal(canTapeOutline(luts), false);
  assert.equal(canTapeOutline(boy), false);
  assert.equal(canTapeOutline(jewels), false);

  const taped = markListingOutline(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(outlineCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingOutlineOverlay("dl-booth-font", taped), true);
  assert.equal(isListingOutlineOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingOutlineOverlay("dl-camera-luts", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("pack, LUT, gift, zine, jacket, and overlay-owned rows refuse an outline write", () => {
  const pack = listingById("dl-sample-pack");
  const luts = listingById("dl-camera-luts");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const chair = listingById(OUTLINE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const jewels = listingById("mdb-jewel-stack");
  const mixtape = listingById("mdb-mixtape-93");
  const lamp = listingById("ysk-wobbly-lamp");
  const junk = listingById("dl-junk-pricing-pdf");

  assert.equal(canTapeOutline(pack), false);
  assert.equal(canTapeOutline(luts), false);
  assert.equal(canTapeOutline(gift), false);
  assert.equal(canTapeOutline(zine), false);
  assert.equal(canTapeOutline(jacket), false);
  assert.equal(canTapeOutline(chair), false);
  assert.equal(canTapeOutline(boy), false);
  assert.equal(canTapeOutline(soles), false);
  assert.equal(canTapeOutline(drawer), false);
  assert.equal(canTapeOutline(jewels), false);
  assert.equal(canTapeOutline(mixtape), false);
  assert.equal(canTapeOutline(lamp), false);
  assert.equal(canTapeOutline(junk), false);

  assert.equal(markListingOutline(pack, []), null);
  assert.equal(markListingOutline(luts, []), null);
  assert.equal(markListingOutline(gift, []), null);
  assert.equal(markListingOutline(zine, []), null);
  assert.equal(markListingOutline(jacket, []), null);
  assert.equal(markListingOutline(chair, []), null);
  assert.equal(markListingOutline(boy, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const font = listingById("dl-booth-font");
  assert.ok(font);
  const before = {
    price: font.price,
    status: font.status,
    cartEligible: font.cartEligible,
  };
  const taped = markListingOutline(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingOutline(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(outlineCookieValue(cleared), "[]");
  assert.equal(isListingOutlineOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const taped = markListingOutline(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingOutline(pack, []), null);

  const cleared = clearListingOutline(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(OUTLINE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingOutline(chair, []), null);
});
