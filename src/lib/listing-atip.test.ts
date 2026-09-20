import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUE_COOKIE_NAME, CUE_STORAGE_KEY } from "./listing-cue";
import { FINALIZE_COOKIE_NAME, FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { OVERBURN_STORAGE_KEY } from "./listing-overburn";
import { PREGAP_COOKIE_NAME, PREGAP_STORAGE_KEY } from "./listing-pregap";
import { STAMPER_COOKIE_NAME, STAMPER_STORAGE_KEY } from "./listing-stamper";
import {
  ATIP_CHAIR_ID,
  ATIP_COOKIE_NAME,
  ATIP_FONT_ID,
  ATIP_GIFT_ID,
  ATIP_HOST_ID,
  ATIP_LEAVE_LINE,
  ATIP_MIXTAPE_ID,
  ATIP_NOTICE_TITLE,
  ATIP_PACK_ID,
  ATIP_STORAGE_KEY,
  ATIP_ZINE_ID,
  atipCookieValue,
  canTapeAtip,
  clearListingAtip,
  isListingAtipOverlay,
  markListingAtip,
  parseAtipListingIds,
  readAtipListingIds,
  writeAtipListingIds,
} from "./listing-atip";

test("cookie and storage keys stay the atip paper names", () => {
  assert.equal(ATIP_STORAGE_KEY, "iss:atip-listing-ids");
  assert.equal(ATIP_COOKIE_NAME, "iss-atip-listing-ids");
  assert.equal(ATIP_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    ATIP_NOTICE_TITLE,
    "I will not atip it. Still Sharpie. Still a jewel case.",
  );
  assert.equal(ATIP_LEAVE_LINE, "Leave the burn");
  assert.notEqual(ATIP_STORAGE_KEY, PREGAP_STORAGE_KEY);
  assert.notEqual(ATIP_STORAGE_KEY, STAMPER_STORAGE_KEY);
  assert.notEqual(ATIP_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(ATIP_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(ATIP_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(ATIP_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:leadin-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, PREGAP_COOKIE_NAME);
  assert.notEqual(ATIP_COOKIE_NAME, STAMPER_COOKIE_NAME);
  assert.notEqual(ATIP_COOKIE_NAME, CUE_COOKIE_NAME);
  assert.notEqual(ATIP_COOKIE_NAME, "iss-encode-listing-ids");
});

test("write-result objects never parse as an atip set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseAtipListingIds(writeResult), []);
  assert.equal(
    isListingAtipOverlay(
      "ysk-burned-cdr",
      parseAtipListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = atipCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseAtipListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("CD-R tapes; pack, mixtape, and font stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(ATIP_PACK_ID);
  const mixtape = listingById(ATIP_MIXTAPE_ID);
  const font = listingById(ATIP_FONT_ID);
  assert.ok(canTapeAtip(disc));
  assert.equal(canTapeAtip(pack), false);
  assert.equal(canTapeAtip(mixtape), false);
  assert.equal(canTapeAtip(font), false);

  const taped = markListingAtip(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(atipCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingAtipOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingAtipOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingAtipOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingAtipOverlay("dl-booth-font", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, mixtape, font, gift, zine, chair, and overlay-owned rows refuse an atip write", () => {
  const pack = listingById(ATIP_PACK_ID);
  const mixtape = listingById(ATIP_MIXTAPE_ID);
  const font = listingById(ATIP_FONT_ID);
  const gift = listingById(ATIP_GIFT_ID);
  const zine = listingById(ATIP_ZINE_ID);
  const chair = listingById(ATIP_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeAtip(pack), false);
  assert.equal(canTapeAtip(mixtape), false);
  assert.equal(canTapeAtip(font), false);
  assert.equal(canTapeAtip(gift), false);
  assert.equal(canTapeAtip(zine), false);
  assert.equal(canTapeAtip(chair), false);
  assert.equal(canTapeAtip(mug), false);

  assert.equal(markListingAtip(pack, []), null);
  assert.equal(markListingAtip(mixtape, []), null);
  assert.equal(markListingAtip(font, []), null);
  assert.equal(markListingAtip(gift, []), null);
  assert.equal(markListingAtip(zine, []), null);
  assert.equal(markListingAtip(chair, []), null);
  assert.equal(markListingAtip(mug, []), null);
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
  const taped = markListingAtip(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingAtip(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(atipCookieValue(cleared), "[]");
  assert.equal(isListingAtipOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(ATIP_PACK_ID);
  const taped = markListingAtip(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingAtip(pack, []), null);

  const cleared = clearListingAtip(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ATIP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAtip(chair, []), null);
});

test("atip write does not write pregap, encode, stamper, cue, or finalize paper", () => {
  const disc = listingById("ysk-burned-cdr");
  const taped = markListingAtip(disc, []);
  assert.ok(taped);
  writeAtipListingIds(taped);
  assert.deepEqual(readAtipListingIds(), ["ysk-burned-cdr"]);
  assert.notEqual(ATIP_STORAGE_KEY, "iss:pregap-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:stamper-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:cue-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:overburn-listing-ids");
  assert.notEqual(ATIP_STORAGE_KEY, "iss:finalize-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-pregap-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-encode-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-stamper-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-leadin-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-pma-listing-ids");
  assert.notEqual(ATIP_COOKIE_NAME, "iss-msf-listing-ids");
  writeAtipListingIds([]);
});
