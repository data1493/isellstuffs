import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BEVEL_STORAGE_KEY } from "./listing-bevel";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { LATHE_STORAGE_KEY } from "./listing-lathe";
import {
  OVERBURN_CHAIR_ID,
  OVERBURN_COOKIE_NAME,
  OVERBURN_HOST_ID,
  OVERBURN_LEAVE_LINE,
  OVERBURN_NOTICE_TITLE,
  OVERBURN_STORAGE_KEY,
  canTapeOverburn,
  clearListingOverburn,
  isListingOverburnOverlay,
  markListingOverburn,
  overburnCookieValue,
  parseOverburnListingIds,
} from "./listing-overburn";
import { POLISH_STORAGE_KEY } from "./listing-polish";

test("cookie and storage keys stay the overburn paper names", () => {
  assert.equal(OVERBURN_STORAGE_KEY, "iss:overburn-listing-ids");
  assert.equal(OVERBURN_COOKIE_NAME, "iss-overburn-listing-ids");
  assert.equal(OVERBURN_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    OVERBURN_NOTICE_TITLE,
    "I will not overburn it. Still Sharpie. Still scratched.",
  );
  assert.equal(OVERBURN_LEAVE_LINE, "Leave the extra");
  assert.notEqual(OVERBURN_STORAGE_KEY, BEVEL_STORAGE_KEY);
  assert.notEqual(OVERBURN_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(OVERBURN_STORAGE_KEY, LATHE_STORAGE_KEY);
  assert.notEqual(OVERBURN_STORAGE_KEY, POLISH_STORAGE_KEY);
});

test("write-result objects never parse as an overburn set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseOverburnListingIds(writeResult), []);
  assert.equal(
    isListingOverburnOverlay(
      "ysk-burned-cdr",
      parseOverburnListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = overburnCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseOverburnListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("disc tapes; Game Boy, LP, and junk PDF stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const boy = listingById("gtk-game-boy");
  const lp = listingById("mdb-scratched-lp");
  const junk = listingById("dl-junk-pricing-pdf");

  assert.ok(canTapeOverburn(disc));
  assert.equal(canTapeOverburn(boy), false);
  assert.equal(canTapeOverburn(lp), false);
  assert.equal(canTapeOverburn(junk), false);

  const taped = markListingOverburn(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(overburnCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingOverburnOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingOverburnOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingOverburnOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingOverburnOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("junk PDF, gift, zine, chair, Game Boy, and LP refuse an overburn write", () => {
  const junk = listingById("dl-junk-pricing-pdf");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(OVERBURN_CHAIR_ID);
  const boy = listingById("gtk-game-boy");
  const lp = listingById("mdb-scratched-lp");

  assert.equal(canTapeOverburn(junk), false);
  assert.equal(canTapeOverburn(gift), false);
  assert.equal(canTapeOverburn(zine), false);
  assert.equal(canTapeOverburn(chair), false);
  assert.equal(canTapeOverburn(boy), false);
  assert.equal(canTapeOverburn(lp), false);

  assert.equal(markListingOverburn(junk, []), null);
  assert.equal(markListingOverburn(gift, []), null);
  assert.equal(markListingOverburn(zine, []), null);
  assert.equal(markListingOverburn(chair, []), null);
  assert.equal(markListingOverburn(boy, []), null);
  assert.equal(markListingOverburn(lp, []), null);
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
  const taped = markListingOverburn(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingOverburn(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(overburnCookieValue(cleared), "[]");
  assert.equal(isListingOverburnOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const junk = listingById("dl-junk-pricing-pdf");
  const taped = markListingOverburn(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingOverburn(junk, []), null);

  const cleared = clearListingOverburn(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(OVERBURN_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingOverburn(chair, []), null);
});
