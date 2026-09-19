import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GRID_STORAGE_KEY } from "./listing-grid";
import {
  COLLATE_COOKIE_NAME,
  COLLATE_HOST_ID,
  COLLATE_LEAVE_LINE,
  COLLATE_NOTICE_TITLE,
  COLLATE_STORAGE_KEY,
  canTapeCollate,
  clearListingCollate,
  collateCookieValue,
  isListingCollateOverlay,
  markListingCollate,
  parseCollateListingIds,
} from "./listing-collate";
import { PAGINATE_STORAGE_KEY } from "./listing-paginate";
import { REVISE_STORAGE_KEY } from "./listing-revise";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";

test("cookie and storage keys stay the collate paper names", () => {
  assert.equal(COLLATE_STORAGE_KEY, "iss:collate-listing-ids");
  assert.equal(COLLATE_COOKIE_NAME, "iss-collate-listing-ids");
  assert.equal(COLLATE_HOST_ID, "dl-junk-pricing-pdf");
  assert.equal(
    COLLATE_NOTICE_TITLE,
    "I will not collate them. Still one page. Still a folding table.",
  );
  assert.equal(COLLATE_LEAVE_LINE, "Leave the one-pager");
  assert.notEqual(COLLATE_STORAGE_KEY, TYPESET_STORAGE_KEY);
  assert.notEqual(COLLATE_STORAGE_KEY, PAGINATE_STORAGE_KEY);
  assert.notEqual(COLLATE_STORAGE_KEY, REVISE_STORAGE_KEY);
  assert.notEqual(COLLATE_STORAGE_KEY, GRID_STORAGE_KEY);
});

test("write-result objects never parse as a collate set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-junk-pricing-pdf"],
  });
  assert.deepEqual(parseCollateListingIds(writeResult), []);
  assert.equal(
    isListingCollateOverlay(
      "dl-junk-pricing-pdf",
      parseCollateListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = collateCookieValue([
    "dl-junk-pricing-pdf",
    "dl-junk-pricing-pdf",
    "",
  ]);
  assert.equal(raw, '["dl-junk-pricing-pdf"]');
  assert.deepEqual(parseCollateListingIds(raw), ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("junk PDF tapes; font, pack, and lamp stay off that cookie", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.ok(canTapeCollate(pdf));
  assert.equal(canTapeCollate(font), false);
  assert.equal(canTapeCollate(pack), false);
  assert.equal(canTapeCollate(lamp), false);

  const taped = markListingCollate(pdf, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  assert.equal(collateCookieValue(taped), '["dl-junk-pricing-pdf"]');
  assert.equal(isListingCollateOverlay("dl-junk-pricing-pdf", taped), true);
  assert.equal(isListingCollateOverlay("dl-booth-font", taped), false);
  assert.equal(isListingCollateOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingCollateOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(pdf?.cartEligible, true);
  assert.equal(pdf?.status, "available");
  assert.equal(pdf?.price.amountCents, 200);
});

test("font, pack, lamp, gift, zine, chair, and overlay-owned rows refuse a collate write", () => {
  const font = listingById("dl-booth-font");
  const pack = listingById("dl-sample-pack");
  const lamp = listingById("ysk-wobbly-lamp");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById("ysk-folding-chair");
  const liner = listingById("dl-crate-side-a");
  const jewels = listingById("mdb-jewel-stack");

  assert.equal(canTapeCollate(font), false);
  assert.equal(canTapeCollate(pack), false);
  assert.equal(canTapeCollate(lamp), false);
  assert.equal(canTapeCollate(gift), false);
  assert.equal(canTapeCollate(zine), false);
  assert.equal(canTapeCollate(chair), false);
  assert.equal(canTapeCollate(liner), false);
  assert.equal(canTapeCollate(jewels), false);

  assert.equal(markListingCollate(font, []), null);
  assert.equal(markListingCollate(pack, []), null);
  assert.equal(markListingCollate(lamp, []), null);
  assert.equal(markListingCollate(gift, []), null);
  assert.equal(markListingCollate(zine, []), null);
  assert.equal(markListingCollate(chair, []), null);
  assert.equal(markListingCollate(liner, []), null);
  assert.equal(markListingCollate(jewels, []), null);
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
  const taped = markListingCollate(pdf, []);
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  const after = listingById("dl-junk-pricing-pdf");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that junk-PDF id", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const cleared = clearListingCollate(pdf, ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(collateCookieValue(cleared), "[]");
  assert.equal(isListingCollateOverlay("dl-junk-pricing-pdf", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const taped = markListingCollate(pdf, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCollate(font, []), null);

  const cleared = clearListingCollate(pdf, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
