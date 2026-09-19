import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { COLLATE_STORAGE_KEY } from "./listing-collate";
import { PAGINATE_STORAGE_KEY } from "./listing-paginate";
import {
  PREFLIGHT_CHAIR_ID,
  PREFLIGHT_COOKIE_NAME,
  PREFLIGHT_HOST_ID,
  PREFLIGHT_LEAVE_LINE,
  PREFLIGHT_NOTICE_TITLE,
  PREFLIGHT_STORAGE_KEY,
  canTapePreflight,
  clearListingPreflight,
  isListingPreflightOverlay,
  markListingPreflight,
  parsePreflightListingIds,
  preflightCookieValue,
} from "./listing-preflight";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";

test("cookie and storage keys stay the preflight paper names", () => {
  assert.equal(PREFLIGHT_STORAGE_KEY, "iss:preflight-listing-ids");
  assert.equal(PREFLIGHT_COOKIE_NAME, "iss-preflight-listing-ids");
  assert.equal(PREFLIGHT_HOST_ID, "dl-junk-pricing-pdf");
  assert.equal(
    PREFLIGHT_NOTICE_TITLE,
    "I will not preflight it. Still one page. Still a PDF.",
  );
  assert.equal(PREFLIGHT_LEAVE_LINE, "Leave the page");
  assert.notEqual(PREFLIGHT_STORAGE_KEY, COLLATE_STORAGE_KEY);
  assert.notEqual(PREFLIGHT_STORAGE_KEY, PAGINATE_STORAGE_KEY);
  assert.notEqual(PREFLIGHT_STORAGE_KEY, TYPESET_STORAGE_KEY);
});

test("write-result objects never parse as a preflight set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-junk-pricing-pdf"],
  });
  assert.deepEqual(parsePreflightListingIds(writeResult), []);
  assert.equal(
    isListingPreflightOverlay(
      "dl-junk-pricing-pdf",
      parsePreflightListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = preflightCookieValue([
    "dl-junk-pricing-pdf",
    "dl-junk-pricing-pdf",
    "",
  ]);
  assert.equal(raw, '["dl-junk-pricing-pdf"]');
  assert.deepEqual(parsePreflightListingIds(raw), ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("junk PDF tapes; font, LUT, and pack stay off that cookie", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const lut = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");

  assert.ok(canTapePreflight(pdf));
  assert.equal(canTapePreflight(font), false);
  assert.equal(canTapePreflight(lut), false);
  assert.equal(canTapePreflight(pack), false);

  const taped = markListingPreflight(pdf, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  assert.equal(preflightCookieValue(taped), '["dl-junk-pricing-pdf"]');
  assert.equal(isListingPreflightOverlay("dl-junk-pricing-pdf", taped), true);
  assert.equal(isListingPreflightOverlay("dl-booth-font", taped), false);
  assert.equal(isListingPreflightOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingPreflightOverlay("dl-sample-pack", taped), false);
  assert.equal(pdf?.cartEligible, true);
  assert.equal(pdf?.status, "available");
  assert.equal(pdf?.price.amountCents, 200);
});

test("font, LUT, windbreaker, gift, zine, and chair refuse a preflight write", () => {
  const font = listingById("dl-booth-font");
  const lut = listingById("dl-camera-luts");
  const jacket = listingById("clo-windbreaker");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(PREFLIGHT_CHAIR_ID);

  assert.equal(canTapePreflight(font), false);
  assert.equal(canTapePreflight(lut), false);
  assert.equal(canTapePreflight(jacket), false);
  assert.equal(canTapePreflight(gift), false);
  assert.equal(canTapePreflight(zine), false);
  assert.equal(canTapePreflight(chair), false);

  assert.equal(markListingPreflight(font, []), null);
  assert.equal(markListingPreflight(lut, []), null);
  assert.equal(markListingPreflight(jacket, []), null);
  assert.equal(markListingPreflight(gift, []), null);
  assert.equal(markListingPreflight(zine, []), null);
  assert.equal(markListingPreflight(chair, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  assert.ok(pdf);
  const before = {
    price: pdf.price,
    status: pdf.status,
    cartEligible: pdf.cartEligible,
  };
  const taped = markListingPreflight(pdf, []);
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  const after = listingById("dl-junk-pricing-pdf");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that junk-PDF id", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const cleared = clearListingPreflight(pdf, ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(preflightCookieValue(cleared), "[]");
  assert.equal(isListingPreflightOverlay("dl-junk-pricing-pdf", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const taped = markListingPreflight(pdf, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingPreflight(font, []), null);

  const cleared = clearListingPreflight(pdf, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PREFLIGHT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPreflight(chair, []), null);
});
