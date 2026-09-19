import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DART_STORAGE_KEY } from "./listing-dart";
import { SERGE_STORAGE_KEY } from "./listing-serge";
import {
  FELL_CHAIR_ID,
  FELL_COOKIE_NAME,
  FELL_FONT_ID,
  FELL_HOST_ID,
  FELL_LEAVE_LINE,
  FELL_NOTICE_TITLE,
  FELL_STORAGE_KEY,
  canTapeFell,
  clearListingFell,
  isListingFellOverlay,
  markListingFell,
  parseFellListingIds,
  fellCookieValue,
} from "./listing-fell";

test("cookie and storage keys stay the fell paper names", () => {
  assert.equal(FELL_STORAGE_KEY, "iss:fell-listing-ids");
  assert.equal(FELL_COOKIE_NAME, "iss-fell-listing-ids");
  assert.equal(FELL_HOST_ID, "clo-windbreaker");
  assert.equal(
    FELL_NOTICE_TITLE,
    "I will not fell it. Still worn twice. Still mint-green.",
  );
  assert.equal(FELL_LEAVE_LINE, "Leave the pits");
  assert.notEqual(FELL_STORAGE_KEY, SERGE_STORAGE_KEY);
  assert.notEqual(FELL_STORAGE_KEY, DART_STORAGE_KEY);
  assert.notEqual(FELL_COOKIE_NAME, "iss-serge-listing-ids");
  assert.notEqual(FELL_COOKIE_NAME, "iss-dart-listing-ids");
});

test("write-result objects never parse as a fell set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-windbreaker"],
  });
  assert.deepEqual(parseFellListingIds(writeResult), []);
  assert.equal(
    isListingFellOverlay(
      "clo-windbreaker",
      parseFellListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = fellCookieValue(["clo-windbreaker", "clo-windbreaker", ""]);
  assert.equal(raw, '["clo-windbreaker"]');
  assert.deepEqual(parseFellListingIds(raw), ["clo-windbreaker"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jacket tapes; sneakers, chair, and overlay hosts stay off that cookie", () => {
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const chair = listingById(FELL_CHAIR_ID);
  const lamp = listingById("ysk-wobbly-lamp");
  const font = listingById(FELL_FONT_ID);
  assert.ok(canTapeFell(jacket));
  assert.equal(canTapeFell(soles), false);
  assert.equal(canTapeFell(chair), false);
  assert.equal(canTapeFell(lamp), false);
  assert.equal(canTapeFell(font), false);

  const taped = markListingFell(jacket, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-windbreaker"]);
  assert.equal(fellCookieValue(taped), '["clo-windbreaker"]');
  assert.equal(isListingFellOverlay("clo-windbreaker", taped), true);
  assert.equal(isListingFellOverlay("clo-split-soles", taped), false);
  assert.equal(isListingFellOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingFellOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(jacket?.cartEligible, true);
  assert.equal(jacket?.status, "available");
  assert.equal(jacket?.price.amountCents, 1800);
});

test("sneakers, zine, chair, gift, font, and overlay-owned rows refuse a fell write", () => {
  const soles = listingById("clo-split-soles");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const gift = listingById("dl-mall-gift-card");
  const font = listingById("dl-booth-font");
  const lamp = listingById("ysk-wobbly-lamp");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeFell(soles), false);
  assert.equal(canTapeFell(zine), false);
  assert.equal(canTapeFell(chair), false);
  assert.equal(canTapeFell(gift), false);
  assert.equal(canTapeFell(font), false);
  assert.equal(canTapeFell(lamp), false);
  assert.equal(canTapeFell(drawer), false);

  assert.equal(markListingFell(soles, []), null);
  assert.equal(markListingFell(zine, []), null);
  assert.equal(markListingFell(chair, []), null);
  assert.equal(markListingFell(gift, []), null);
  assert.equal(markListingFell(font, []), null);
  assert.equal(markListingFell(lamp, []), null);
  assert.equal(markListingFell(drawer, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jacket = listingById("clo-windbreaker");
  assert.ok(jacket);
  const before = {
    price: jacket.price,
    status: jacket.status,
    cartEligible: jacket.cartEligible,
  };
  const taped = markListingFell(jacket, []);
  assert.deepEqual(taped, ["clo-windbreaker"]);
  const after = listingById("clo-windbreaker");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jacket id", () => {
  const jacket = listingById("clo-windbreaker");
  const cleared = clearListingFell(jacket, ["clo-windbreaker"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(fellCookieValue(cleared), "[]");
  assert.equal(isListingFellOverlay("clo-windbreaker", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jacket = listingById("clo-windbreaker");
  const taped = markListingFell(jacket, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFell(jacket, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
