import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BOLD_STORAGE_KEY } from "./listing-bold";
import { CRUSH_STORAGE_KEY } from "./listing-crush";
import { ICONS_STORAGE_KEY } from "./listing-icons";
import {
  VARIABLE_COOKIE_NAME,
  VARIABLE_LEAVE_LINE,
  VARIABLE_NOTICE_TITLE,
  VARIABLE_STORAGE_KEY,
  canTapeVariable,
  clearListingVariable,
  isListingVariableOverlay,
  markListingVariable,
  parseVariableListingIds,
  variableCookieValue,
} from "./listing-variable";

test("cookie and storage keys stay the variable paper names", () => {
  assert.equal(VARIABLE_STORAGE_KEY, "iss:variable-listing-ids");
  assert.equal(VARIABLE_COOKIE_NAME, "iss-variable-listing-ids");
  assert.equal(
    VARIABLE_NOTICE_TITLE,
    "I will not variable it. Two weights. Still almost-bold.",
  );
  assert.equal(VARIABLE_LEAVE_LINE, "Leave the two weights");
  assert.notEqual(VARIABLE_STORAGE_KEY, BOLD_STORAGE_KEY);
  assert.notEqual(VARIABLE_STORAGE_KEY, CRUSH_STORAGE_KEY);
  assert.notEqual(VARIABLE_STORAGE_KEY, ICONS_STORAGE_KEY);
});

test("write-result objects never parse as a variable set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-booth-font"],
  });
  assert.deepEqual(parseVariableListingIds(writeResult), []);
  assert.equal(
    isListingVariableOverlay(
      "dl-booth-font",
      parseVariableListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = variableCookieValue(["dl-booth-font", "dl-booth-font", ""]);
  assert.equal(raw, '["dl-booth-font"]');
  assert.deepEqual(parseVariableListingIds(raw), ["dl-booth-font"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("booth font tapes; Game Boy, LUT, and pack stay off that cookie", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const pdf = listingById("dl-junk-pricing-pdf");

  assert.ok(canTapeVariable(font));
  assert.equal(canTapeVariable(boy), false);
  assert.ok(canTapeVariable(luts));
  assert.ok(canTapeVariable(pack));
  assert.ok(canTapeVariable(pdf));

  const taped = markListingVariable(font, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-booth-font"]);
  assert.equal(variableCookieValue(taped), '["dl-booth-font"]');
  assert.equal(isListingVariableOverlay("dl-booth-font", taped), true);
  assert.equal(isListingVariableOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingVariableOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingVariableOverlay("dl-sample-pack", taped), false);
  assert.equal(font?.cartEligible, true);
  assert.equal(font?.status, "available");
  assert.equal(font?.price.amountCents, 700);
});

test("Game Boy, gift, chair, and stain zine refuse a variable write", () => {
  const boy = listingById("gtk-game-boy");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeVariable(boy), false);
  assert.equal(canTapeVariable(gift), false);
  assert.equal(canTapeVariable(chair), false);
  assert.equal(canTapeVariable(zine), false);

  assert.equal(markListingVariable(boy, []), null);
  assert.equal(markListingVariable(gift, []), null);
  assert.equal(markListingVariable(chair, []), null);
  assert.equal(markListingVariable(zine, []), null);
  assert.equal(chair?.status, "sold");
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
  const taped = markListingVariable(font, []);
  assert.deepEqual(taped, ["dl-booth-font"]);
  const after = listingById("dl-booth-font");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that font id", () => {
  const font = listingById("dl-booth-font");
  const cleared = clearListingVariable(font, ["dl-booth-font"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(variableCookieValue(cleared), "[]");
  assert.equal(isListingVariableOverlay("dl-booth-font", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const taped = markListingVariable(font, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingVariable(boy, []), null);

  const cleared = clearListingVariable(font, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
