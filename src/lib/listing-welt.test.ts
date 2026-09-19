import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { TOE_STORAGE_KEY } from "./listing-toe";
import {
  WELT_CHAIR_ID,
  WELT_COOKIE_NAME,
  WELT_FONT_ID,
  WELT_HOST_ID,
  WELT_JACKET_ID,
  WELT_LEAVE_LINE,
  WELT_NOTICE_TITLE,
  WELT_STORAGE_KEY,
  WELT_WHISK_ID,
  canTapeWelt,
  clearListingWelt,
  isListingWeltOverlay,
  markListingWelt,
  parseWeltListingIds,
  weltCookieValue,
} from "./listing-welt";

test("cookie and storage keys stay the welt paper names", () => {
  assert.equal(WELT_STORAGE_KEY, "iss:welt-listing-ids");
  assert.equal(WELT_COOKIE_NAME, "iss-welt-listing-ids");
  assert.equal(WELT_HOST_ID, "clo-split-soles");
  assert.equal(
    WELT_NOTICE_TITLE,
    "I will not welt them. Still peeling. Still a pair.",
  );
  assert.equal(WELT_LEAVE_LINE, "Leave the split");
  assert.notEqual(WELT_STORAGE_KEY, TOE_STORAGE_KEY);
  assert.notEqual(WELT_STORAGE_KEY, STITCH_STORAGE_KEY);
});

test("write-result objects never parse as a welt set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseWeltListingIds(writeResult), []);
  assert.equal(
    isListingWeltOverlay("clo-split-soles", parseWeltListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = weltCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseWeltListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, whisk, and font stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(WELT_JACKET_ID);
  const whisk = listingById(WELT_WHISK_ID);
  const font = listingById(WELT_FONT_ID);

  assert.ok(canTapeWelt(soles));
  assert.equal(canTapeWelt(jacket), false);
  assert.equal(canTapeWelt(whisk), false);
  assert.equal(canTapeWelt(font), false);

  const taped = markListingWelt(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(weltCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingWeltOverlay("clo-split-soles", taped), true);
  assert.equal(isListingWeltOverlay(WELT_JACKET_ID, taped), false);
  assert.equal(isListingWeltOverlay(WELT_WHISK_ID, taped), false);
  assert.equal(isListingWeltOverlay(WELT_FONT_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("font, gift, zine, and chair refuse a welt write", () => {
  const font = listingById(WELT_FONT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(WELT_CHAIR_ID);

  assert.equal(canTapeWelt(font), false);
  assert.equal(canTapeWelt(gift), false);
  assert.equal(canTapeWelt(zine), false);
  assert.equal(canTapeWelt(chair), false);

  assert.equal(markListingWelt(font, []), null);
  assert.equal(markListingWelt(gift, []), null);
  assert.equal(markListingWelt(zine, []), null);
  assert.equal(markListingWelt(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const soles = listingById("clo-split-soles");
  assert.ok(soles);
  const before = {
    price: soles.price,
    status: soles.status,
    cartEligible: soles.cartEligible,
  };
  const taped = markListingWelt(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingWelt(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(weltCookieValue(cleared), "[]");
  assert.equal(isListingWeltOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const font = listingById(WELT_FONT_ID);
  const taped = markListingWelt(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingWelt(font, []), null);

  const cleared = clearListingWelt(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(WELT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingWelt(chair, []), null);
});
