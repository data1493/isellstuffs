import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLEED_STORAGE_KEY } from "./listing-bleed";
import { PREFLIGHT_STORAGE_KEY } from "./listing-preflight";
import { TRAP_STORAGE_KEY } from "./listing-trap";
import {
  VARNISH_CHAIR_ID,
  VARNISH_COOKIE_NAME,
  VARNISH_FONT_ID,
  VARNISH_GIFT_ID,
  VARNISH_HOST_ID,
  VARNISH_LAMP_ID,
  VARNISH_LEAVE_LINE,
  VARNISH_NOTICE_TITLE,
  VARNISH_RECIPES_ID,
  VARNISH_STORAGE_KEY,
  canTapeVarnish,
  clearListingVarnish,
  isListingVarnishOverlay,
  markListingVarnish,
  parseVarnishListingIds,
  varnishCookieValue,
} from "./listing-varnish";

test("cookie and storage keys stay the varnish paper names", () => {
  assert.equal(VARNISH_STORAGE_KEY, "iss:varnish-listing-ids");
  assert.equal(VARNISH_COOKIE_NAME, "iss-varnish-listing-ids");
  assert.equal(VARNISH_HOST_ID, "dl-junk-pricing-pdf");
  assert.equal(
    VARNISH_NOTICE_TITLE,
    "I will not varnish it. Still one page. Still a rule of thumb.",
  );
  assert.equal(VARNISH_LEAVE_LINE, "Leave the one-pager");
  assert.notEqual(VARNISH_STORAGE_KEY, BLEED_STORAGE_KEY);
  assert.notEqual(VARNISH_STORAGE_KEY, TRAP_STORAGE_KEY);
  assert.notEqual(VARNISH_STORAGE_KEY, PREFLIGHT_STORAGE_KEY);
  assert.notEqual(VARNISH_COOKIE_NAME, "iss-bleed-listing-ids");
  assert.notEqual(VARNISH_COOKIE_NAME, "iss-trap-listing-ids");
});

test("write-result objects never parse as a varnish set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-junk-pricing-pdf"],
  });
  assert.deepEqual(parseVarnishListingIds(writeResult), []);
  assert.equal(
    isListingVarnishOverlay(
      "dl-junk-pricing-pdf",
      parseVarnishListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = varnishCookieValue([
    "dl-junk-pricing-pdf",
    "dl-junk-pricing-pdf",
    "",
  ]);
  assert.equal(raw, '["dl-junk-pricing-pdf"]');
  assert.deepEqual(parseVarnishListingIds(raw), ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("junk PDF tapes; recipes, font, and lamp stay off that cookie", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const recipes = listingById(VARNISH_RECIPES_ID);
  const font = listingById(VARNISH_FONT_ID);
  const lamp = listingById(VARNISH_LAMP_ID);

  assert.ok(canTapeVarnish(pdf));
  assert.equal(canTapeVarnish(recipes), false);
  assert.equal(canTapeVarnish(font), false);
  assert.equal(canTapeVarnish(lamp), false);

  const taped = markListingVarnish(pdf, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  assert.equal(varnishCookieValue(taped), '["dl-junk-pricing-pdf"]');
  assert.equal(isListingVarnishOverlay("dl-junk-pricing-pdf", taped), true);
  assert.equal(isListingVarnishOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingVarnishOverlay("dl-booth-font", taped), false);
  assert.equal(isListingVarnishOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(pdf?.cartEligible, true);
  assert.equal(pdf?.status, "available");
  assert.equal(pdf?.price.amountCents, 200);
});

test("recipes, font, lamp, gift, zine, and chair refuse a varnish write", () => {
  const recipes = listingById(VARNISH_RECIPES_ID);
  const font = listingById(VARNISH_FONT_ID);
  const lamp = listingById(VARNISH_LAMP_ID);
  const gift = listingById(VARNISH_GIFT_ID);
  const zine = listingById("dl-stain-zine");
  const chair = listingById(VARNISH_CHAIR_ID);

  assert.equal(canTapeVarnish(recipes), false);
  assert.equal(canTapeVarnish(font), false);
  assert.equal(canTapeVarnish(lamp), false);
  assert.equal(canTapeVarnish(gift), false);
  assert.equal(canTapeVarnish(zine), false);
  assert.equal(canTapeVarnish(chair), false);

  assert.equal(markListingVarnish(recipes, []), null);
  assert.equal(markListingVarnish(font, []), null);
  assert.equal(markListingVarnish(lamp, []), null);
  assert.equal(markListingVarnish(gift, []), null);
  assert.equal(markListingVarnish(zine, []), null);
  assert.equal(markListingVarnish(chair, []), null);
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
  const taped = markListingVarnish(pdf, []);
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  const after = listingById("dl-junk-pricing-pdf");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that junk-PDF id", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const cleared = clearListingVarnish(pdf, ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(varnishCookieValue(cleared), "[]");
  assert.equal(isListingVarnishOverlay("dl-junk-pricing-pdf", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const lamp = listingById(VARNISH_LAMP_ID);
  const taped = markListingVarnish(pdf, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingVarnish(lamp, []), null);

  const cleared = clearListingVarnish(pdf, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(VARNISH_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingVarnish(chair, []), null);
});

test("varnish write never aliases bleed or trap paper", () => {
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:bleed-listing-ids");
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:trap-listing-ids");
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:preflight-listing-ids");
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:score-listing-ids");
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:crop-listing-ids");
  assert.notEqual(VARNISH_STORAGE_KEY, "iss:lacquer-listing-ids");
  assert.notEqual(VARNISH_COOKIE_NAME, "iss-bleed-listing-ids");
  assert.notEqual(VARNISH_COOKIE_NAME, "iss-trap-listing-ids");
});
