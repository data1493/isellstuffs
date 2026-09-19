import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GRID_STORAGE_KEY } from "./listing-grid";
import {
  PAGINATE_COOKIE_NAME,
  PAGINATE_HOST_ID,
  PAGINATE_LEAVE_LINE,
  PAGINATE_NOTICE_TITLE,
  PAGINATE_STORAGE_KEY,
  canTapePaginate,
  clearListingPaginate,
  isListingPaginateOverlay,
  markListingPaginate,
  paginateCookieValue,
  parsePaginateListingIds,
} from "./listing-paginate";
import { REVISE_STORAGE_KEY } from "./listing-revise";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";

test("cookie and storage keys stay the paginate paper names", () => {
  assert.equal(PAGINATE_STORAGE_KEY, "iss:paginate-listing-ids");
  assert.equal(PAGINATE_COOKIE_NAME, "iss-paginate-listing-ids");
  assert.equal(PAGINATE_HOST_ID, "dl-junk-pricing-pdf");
  assert.equal(
    PAGINATE_NOTICE_TITLE,
    "I will not paginate it. Still one page. Still a rule of thumb.",
  );
  assert.equal(PAGINATE_LEAVE_LINE, "Leave the one page");
  assert.notEqual(PAGINATE_STORAGE_KEY, TYPESET_STORAGE_KEY);
  assert.notEqual(PAGINATE_STORAGE_KEY, REVISE_STORAGE_KEY);
  assert.notEqual(PAGINATE_STORAGE_KEY, GRID_STORAGE_KEY);
  assert.notEqual(PAGINATE_STORAGE_KEY, VARIABLE_STORAGE_KEY);
});

test("write-result objects never parse as a paginate set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-junk-pricing-pdf"],
  });
  assert.deepEqual(parsePaginateListingIds(writeResult), []);
  assert.equal(
    isListingPaginateOverlay(
      "dl-junk-pricing-pdf",
      parsePaginateListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = paginateCookieValue([
    "dl-junk-pricing-pdf",
    "dl-junk-pricing-pdf",
    "",
  ]);
  assert.equal(raw, '["dl-junk-pricing-pdf"]');
  assert.deepEqual(parsePaginateListingIds(raw), ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("junk PDF tapes; liner, font, and lamp stay off that cookie", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const liner = listingById("dl-crate-side-a");
  const font = listingById("dl-booth-font");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.ok(canTapePaginate(pdf));
  assert.equal(canTapePaginate(liner), false);
  assert.equal(canTapePaginate(font), false);
  assert.equal(canTapePaginate(lamp), false);

  const taped = markListingPaginate(pdf, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  assert.equal(paginateCookieValue(taped), '["dl-junk-pricing-pdf"]');
  assert.equal(isListingPaginateOverlay("dl-junk-pricing-pdf", taped), true);
  assert.equal(isListingPaginateOverlay("dl-crate-side-a", taped), false);
  assert.equal(isListingPaginateOverlay("dl-booth-font", taped), false);
  assert.equal(isListingPaginateOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(pdf?.cartEligible, true);
  assert.equal(pdf?.status, "available");
  assert.equal(pdf?.price.amountCents, 200);
});

test("liner, font, lamp, gift, zine, and overlay-owned rows refuse a paginate write", () => {
  const liner = listingById("dl-crate-side-a");
  const font = listingById("dl-booth-font");
  const lamp = listingById("ysk-wobbly-lamp");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pack = listingById("dl-sample-pack");
  const jewels = listingById("mdb-jewel-stack");
  const mixtape = listingById("mdb-mixtape-93");
  const disc = listingById("ysk-burned-cdr");

  assert.equal(canTapePaginate(liner), false);
  assert.equal(canTapePaginate(font), false);
  assert.equal(canTapePaginate(lamp), false);
  assert.equal(canTapePaginate(gift), false);
  assert.equal(canTapePaginate(zine), false);
  assert.equal(canTapePaginate(pack), false);
  assert.equal(canTapePaginate(jewels), false);
  assert.equal(canTapePaginate(mixtape), false);
  assert.equal(canTapePaginate(disc), false);

  assert.equal(markListingPaginate(liner, []), null);
  assert.equal(markListingPaginate(font, []), null);
  assert.equal(markListingPaginate(lamp, []), null);
  assert.equal(markListingPaginate(gift, []), null);
  assert.equal(markListingPaginate(zine, []), null);
  assert.equal(markListingPaginate(pack, []), null);
  assert.equal(markListingPaginate(jewels, []), null);
  assert.equal(markListingPaginate(mixtape, []), null);
  assert.equal(markListingPaginate(disc, []), null);
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
  const taped = markListingPaginate(pdf, []);
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  const after = listingById("dl-junk-pricing-pdf");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that junk-PDF id", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const cleared = clearListingPaginate(pdf, ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(paginateCookieValue(cleared), "[]");
  assert.equal(isListingPaginateOverlay("dl-junk-pricing-pdf", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const liner = listingById("dl-crate-side-a");
  const taped = markListingPaginate(pdf, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingPaginate(liner, []), null);

  const cleared = clearListingPaginate(pdf, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
