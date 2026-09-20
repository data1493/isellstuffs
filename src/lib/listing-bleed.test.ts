import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { PREFLIGHT_STORAGE_KEY } from "./listing-preflight";
import { REMEMBER_STORAGE_KEY } from "./listing-remember";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";
import { VERSO_STORAGE_KEY } from "./listing-verso";
import {
  BLEED_CHAIR_ID,
  BLEED_COOKIE_NAME,
  BLEED_HOST_ID,
  BLEED_LEAVE_LINE,
  BLEED_NOTICE_TITLE,
  BLEED_STORAGE_KEY,
  bleedCookieValue,
  canTapeBleed,
  clearListingBleed,
  isListingBleedOverlay,
  markListingBleed,
  parseBleedListingIds,
} from "./listing-bleed";

test("cookie and storage keys stay the bleed paper names", () => {
  assert.equal(BLEED_STORAGE_KEY, "iss:bleed-listing-ids");
  assert.equal(BLEED_COOKIE_NAME, "iss-bleed-listing-ids");
  assert.equal(BLEED_HOST_ID, "dl-crate-side-a");
  assert.equal(
    BLEED_NOTICE_TITLE,
    "I will not bleed it. Still one page. Still wrong.",
  );
  assert.equal(BLEED_LEAVE_LINE, "Leave the page");
  assert.notEqual(BLEED_STORAGE_KEY, TYPESET_STORAGE_KEY);
  assert.notEqual(BLEED_STORAGE_KEY, REMEMBER_STORAGE_KEY);
  assert.notEqual(BLEED_STORAGE_KEY, VERSO_STORAGE_KEY);
  assert.notEqual(BLEED_STORAGE_KEY, PREFLIGHT_STORAGE_KEY);
});

test("write-result objects never parse as a bleed set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-crate-side-a"],
  });
  assert.deepEqual(parseBleedListingIds(writeResult), []);
  assert.equal(
    isListingBleedOverlay(
      "dl-crate-side-a",
      parseBleedListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = bleedCookieValue([
    "dl-crate-side-a",
    "dl-crate-side-a",
    "",
  ]);
  assert.equal(raw, '["dl-crate-side-a"]');
  assert.deepEqual(parseBleedListingIds(raw), ["dl-crate-side-a"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("liner tapes; junk PDF and font stay off that cookie", () => {
  const liner = listingById("dl-crate-side-a");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");

  assert.ok(canTapeBleed(liner));
  assert.equal(canTapeBleed(pdf), false);
  assert.equal(canTapeBleed(font), false);

  const taped = markListingBleed(liner, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  assert.equal(bleedCookieValue(taped), '["dl-crate-side-a"]');
  assert.equal(isListingBleedOverlay("dl-crate-side-a", taped), true);
  assert.equal(isListingBleedOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingBleedOverlay("dl-booth-font", taped), false);
  assert.equal(liner?.cartEligible, true);
  assert.equal(liner?.status, "available");
  assert.equal(liner?.price.amountCents, 150);
});

test("junk PDF, font, windbreaker, gift, zine, and chair refuse a bleed write", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const jacket = listingById("clo-windbreaker");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(BLEED_CHAIR_ID);

  assert.equal(canTapeBleed(pdf), false);
  assert.equal(canTapeBleed(font), false);
  assert.equal(canTapeBleed(jacket), false);
  assert.equal(canTapeBleed(gift), false);
  assert.equal(canTapeBleed(zine), false);
  assert.equal(canTapeBleed(chair), false);

  assert.equal(markListingBleed(pdf, []), null);
  assert.equal(markListingBleed(font, []), null);
  assert.equal(markListingBleed(jacket, []), null);
  assert.equal(markListingBleed(gift, []), null);
  assert.equal(markListingBleed(zine, []), null);
  assert.equal(markListingBleed(chair, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const liner = listingById("dl-crate-side-a");
  assert.ok(liner);
  const before = {
    price: liner.price,
    status: liner.status,
    cartEligible: liner.cartEligible,
  };
  const taped = markListingBleed(liner, []);
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  const after = listingById("dl-crate-side-a");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that liner id", () => {
  const liner = listingById("dl-crate-side-a");
  const cleared = clearListingBleed(liner, ["dl-crate-side-a"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(bleedCookieValue(cleared), "[]");
  assert.equal(isListingBleedOverlay("dl-crate-side-a", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const liner = listingById("dl-crate-side-a");
  const pdf = listingById("dl-junk-pricing-pdf");
  const taped = markListingBleed(liner, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingBleed(pdf, []), null);

  const cleared = clearListingBleed(liner, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BLEED_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBleed(chair, []), null);
});
