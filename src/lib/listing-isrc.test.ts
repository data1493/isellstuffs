import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ATIP_COOKIE_NAME, ATIP_STORAGE_KEY } from "./listing-atip";
import { CUE_COOKIE_NAME, CUE_STORAGE_KEY } from "./listing-cue";
import {
  ISRC_CHAIR_ID,
  ISRC_COOKIE_NAME,
  ISRC_FONT_ID,
  ISRC_GIFT_ID,
  ISRC_HOST_ID,
  ISRC_LEAVE_LINE,
  ISRC_MIXTAPE_ID,
  ISRC_NOTICE_TITLE,
  ISRC_PACK_ID,
  ISRC_STORAGE_KEY,
  ISRC_ZINE_ID,
  canTapeIsrc,
  clearListingIsrc,
  isListingIsrcOverlay,
  isrcCookieValue,
  markListingIsrc,
  parseIsrcListingIds,
  readIsrcListingIds,
  writeIsrcListingIds,
} from "./listing-isrc";
import { OVERBURN_COOKIE_NAME, OVERBURN_STORAGE_KEY } from "./listing-overburn";
import { PREGAP_COOKIE_NAME, PREGAP_STORAGE_KEY } from "./listing-pregap";
import { STAMPER_COOKIE_NAME, STAMPER_STORAGE_KEY } from "./listing-stamper";

test("cookie and storage keys stay the isrc paper names", () => {
  assert.equal(ISRC_STORAGE_KEY, "iss:isrc-listing-ids");
  assert.equal(ISRC_COOKIE_NAME, "iss-isrc-listing-ids");
  assert.equal(ISRC_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    ISRC_NOTICE_TITLE,
    "I will not isrc it. Still Sharpie. Still a jewel case.",
  );
  assert.equal(ISRC_LEAVE_LINE, "Leave the burn");
  assert.notEqual(ISRC_STORAGE_KEY, PREGAP_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, ATIP_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, STAMPER_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(ISRC_STORAGE_KEY, "iss:upc-listing-ids");
  assert.notEqual(ISRC_STORAGE_KEY, "iss:ean-listing-ids");
  assert.notEqual(ISRC_STORAGE_KEY, "iss:catalog-listing-ids");
});

test("write-result objects never parse as an isrc set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseIsrcListingIds(writeResult), []);
  assert.equal(
    isListingIsrcOverlay(
      "ysk-burned-cdr",
      parseIsrcListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseIsrcListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = isrcCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseIsrcListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("disc tapes; pack, mixtape, and font stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(ISRC_PACK_ID);
  const mixtape = listingById(ISRC_MIXTAPE_ID);
  const font = listingById(ISRC_FONT_ID);

  assert.ok(canTapeIsrc(disc));
  assert.equal(canTapeIsrc(pack), false);
  assert.equal(canTapeIsrc(mixtape), false);
  assert.equal(canTapeIsrc(font), false);

  const taped = markListingIsrc(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(isrcCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingIsrcOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingIsrcOverlay(ISRC_PACK_ID, taped), false);
  assert.equal(isListingIsrcOverlay(ISRC_MIXTAPE_ID, taped), false);
  assert.equal(isListingIsrcOverlay(ISRC_FONT_ID, taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
});

test("pack, mixtape, font, chair, gift, zine, and overlay-owned rows refuse an isrc write", () => {
  const pack = listingById(ISRC_PACK_ID);
  const mixtape = listingById(ISRC_MIXTAPE_ID);
  const font = listingById(ISRC_FONT_ID);
  const chair = listingById(ISRC_CHAIR_ID);
  const gift = listingById(ISRC_GIFT_ID);
  const zine = listingById(ISRC_ZINE_ID);
  const boy = listingById("gtk-game-boy");
  const luts = listingById("dl-camera-luts");

  assert.equal(canTapeIsrc(pack), false);
  assert.equal(canTapeIsrc(mixtape), false);
  assert.equal(canTapeIsrc(font), false);
  assert.equal(canTapeIsrc(chair), false);
  assert.equal(canTapeIsrc(gift), false);
  assert.equal(canTapeIsrc(zine), false);
  assert.equal(canTapeIsrc(boy), false);
  assert.equal(canTapeIsrc(luts), false);

  assert.equal(markListingIsrc(pack, []), null);
  assert.equal(markListingIsrc(mixtape, []), null);
  assert.equal(markListingIsrc(font, []), null);
  assert.equal(markListingIsrc(chair, []), null);
  assert.equal(markListingIsrc(gift, []), null);
  assert.equal(markListingIsrc(zine, []), null);
  assert.equal(markListingIsrc(boy, []), null);
  assert.equal(markListingIsrc(luts, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const disc = listingById("ysk-burned-cdr");
  assert.ok(disc);
  const before = {
    price: disc.price,
    status: disc.status,
    cartEligible: disc.cartEligible,
  };
  const taped = markListingIsrc(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingIsrc(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(isrcCookieValue(cleared), "[]");
  assert.equal(isListingIsrcOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(ISRC_PACK_ID);
  const taped = markListingIsrc(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingIsrc(pack, []), null);

  const cleared = clearListingIsrc(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ISRC_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingIsrc(chair, []), null);
});

test("isrc write does not write pregap, atip, stamper, encode, cue, or overburn paper", () => {
  const disc = listingById("ysk-burned-cdr");
  const taped = markListingIsrc(disc, []);
  assert.ok(taped);
  writeIsrcListingIds(taped);
  assert.deepEqual(readIsrcListingIds(), ["ysk-burned-cdr"]);
  assert.notEqual(ISRC_STORAGE_KEY, PREGAP_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, ATIP_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, STAMPER_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(ISRC_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(ISRC_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(ISRC_COOKIE_NAME, PREGAP_COOKIE_NAME);
  assert.notEqual(ISRC_COOKIE_NAME, ATIP_COOKIE_NAME);
  assert.notEqual(ISRC_COOKIE_NAME, STAMPER_COOKIE_NAME);
  assert.notEqual(ISRC_COOKIE_NAME, "iss-encode-listing-ids");
  assert.notEqual(ISRC_COOKIE_NAME, CUE_COOKIE_NAME);
  assert.notEqual(ISRC_COOKIE_NAME, OVERBURN_COOKIE_NAME);
  assert.notEqual(ISRC_COOKIE_NAME, "iss-upc-listing-ids");
  assert.notEqual(ISRC_COOKIE_NAME, "iss-ean-listing-ids");
  assert.notEqual(ISRC_COOKIE_NAME, "iss-catalog-listing-ids");
  writeIsrcListingIds([]);
});
