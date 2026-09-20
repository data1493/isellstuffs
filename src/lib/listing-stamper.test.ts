import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CUE_COOKIE_NAME, CUE_STORAGE_KEY } from "./listing-cue";
import { FINALIZE_COOKIE_NAME, FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { OVERBURN_STORAGE_KEY } from "./listing-overburn";
import { PREGAP_COOKIE_NAME, PREGAP_STORAGE_KEY } from "./listing-pregap";
import {
  STAMPER_CHAIR_ID,
  STAMPER_COOKIE_NAME,
  STAMPER_FONT_ID,
  STAMPER_GIFT_ID,
  STAMPER_HOST_ID,
  STAMPER_LEAVE_LINE,
  STAMPER_MIXTAPE_ID,
  STAMPER_NOTICE_TITLE,
  STAMPER_PACK_ID,
  STAMPER_STORAGE_KEY,
  STAMPER_ZINE_ID,
  canTapeStamper,
  clearListingStamper,
  isListingStamperOverlay,
  markListingStamper,
  parseStamperListingIds,
  stamperCookieValue,
  writeStamperListingIds,
} from "./listing-stamper";

test("cookie and storage keys stay the stamper paper names", () => {
  assert.equal(STAMPER_STORAGE_KEY, "iss:stamper-listing-ids");
  assert.equal(STAMPER_COOKIE_NAME, "iss-stamper-listing-ids");
  assert.equal(STAMPER_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    STAMPER_NOTICE_TITLE,
    "I will not stamper it. Still Sharpie. Still a jewel case.",
  );
  assert.equal(STAMPER_LEAVE_LINE, "Leave the burn");
  assert.notEqual(STAMPER_STORAGE_KEY, PREGAP_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(STAMPER_STORAGE_KEY, "iss:press-listing-ids");
  assert.notEqual(STAMPER_COOKIE_NAME, PREGAP_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, CUE_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, FINALIZE_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-encode-listing-ids");
});

test("write-result objects never parse as a stamper set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseStamperListingIds(writeResult), []);
  assert.equal(
    isListingStamperOverlay(
      "ysk-burned-cdr",
      parseStamperListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = stamperCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseStamperListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("CD-R tapes; pack, mixtape, and font stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(STAMPER_PACK_ID);
  const mixtape = listingById(STAMPER_MIXTAPE_ID);
  const font = listingById(STAMPER_FONT_ID);
  assert.ok(canTapeStamper(disc));
  assert.equal(canTapeStamper(pack), false);
  assert.equal(canTapeStamper(mixtape), false);
  assert.equal(canTapeStamper(font), false);

  const taped = markListingStamper(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(stamperCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingStamperOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingStamperOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingStamperOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingStamperOverlay("dl-booth-font", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, mixtape, font, gift, zine, chair, and overlay-owned rows refuse a stamper write", () => {
  const pack = listingById(STAMPER_PACK_ID);
  const mixtape = listingById(STAMPER_MIXTAPE_ID);
  const font = listingById(STAMPER_FONT_ID);
  const gift = listingById(STAMPER_GIFT_ID);
  const zine = listingById(STAMPER_ZINE_ID);
  const chair = listingById(STAMPER_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeStamper(pack), false);
  assert.equal(canTapeStamper(mixtape), false);
  assert.equal(canTapeStamper(font), false);
  assert.equal(canTapeStamper(gift), false);
  assert.equal(canTapeStamper(zine), false);
  assert.equal(canTapeStamper(chair), false);
  assert.equal(canTapeStamper(mug), false);

  assert.equal(markListingStamper(pack, []), null);
  assert.equal(markListingStamper(mixtape, []), null);
  assert.equal(markListingStamper(font, []), null);
  assert.equal(markListingStamper(gift, []), null);
  assert.equal(markListingStamper(zine, []), null);
  assert.equal(markListingStamper(chair, []), null);
  assert.equal(markListingStamper(mug, []), null);
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
  const taped = markListingStamper(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingStamper(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(stamperCookieValue(cleared), "[]");
  assert.equal(isListingStamperOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(STAMPER_PACK_ID);
  const taped = markListingStamper(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingStamper(pack, []), null);

  const cleared = clearListingStamper(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(STAMPER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingStamper(chair, []), null);
});

test("write never touches pregap, encode, cue, or finalize storage keys", () => {
  writeStamperListingIds(["ysk-burned-cdr"]);
  assert.equal(STAMPER_STORAGE_KEY, "iss:stamper-listing-ids");
  assert.equal(PREGAP_STORAGE_KEY, "iss:pregap-listing-ids");
  assert.equal(CUE_STORAGE_KEY, "iss:cue-listing-ids");
  assert.equal(FINALIZE_STORAGE_KEY, "iss:finalize-listing-ids");
  assert.notEqual(STAMPER_STORAGE_KEY, PREGAP_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(STAMPER_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(STAMPER_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(STAMPER_COOKIE_NAME, PREGAP_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, CUE_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-encode-listing-ids");
  assert.notEqual(STAMPER_COOKIE_NAME, FINALIZE_COOKIE_NAME);
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-overburn-listing-ids");
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-press-listing-ids");
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-glassmaster-listing-ids");
  assert.notEqual(STAMPER_COOKIE_NAME, "iss-father-listing-ids");
});
