import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLEED_STORAGE_KEY } from "./listing-bleed";
import { PREFLIGHT_STORAGE_KEY } from "./listing-preflight";
import { TRAP_STORAGE_KEY } from "./listing-trap";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";
import {
  MAT_CHAIR_ID,
  MAT_COOKIE_NAME,
  MAT_HOST_ID,
  MAT_LEAVE_LINE,
  MAT_NOTICE_TITLE,
  MAT_STORAGE_KEY,
  canTapeMat,
  clearListingMat,
  isListingMatOverlay,
  markListingMat,
  matCookieValue,
  parseMatListingIds,
} from "./listing-mat";

test("cookie and storage keys stay the mat paper names", () => {
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.equal(MAT_COOKIE_NAME, "iss-mat-listing-ids");
  assert.equal(MAT_HOST_ID, "dl-crate-side-a");
  assert.equal(
    MAT_NOTICE_TITLE,
    "I will not mat it. Still one page. Still wrong on purpose.",
  );
  assert.equal(MAT_LEAVE_LINE, "Leave the mount");
  assert.notEqual(MAT_STORAGE_KEY, BLEED_STORAGE_KEY);
  assert.notEqual(MAT_STORAGE_KEY, TYPESET_STORAGE_KEY);
  assert.notEqual(MAT_STORAGE_KEY, PREFLIGHT_STORAGE_KEY);
  assert.notEqual(MAT_STORAGE_KEY, TRAP_STORAGE_KEY);
});

test("write-result objects never parse as a mat set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-crate-side-a"],
  });
  assert.deepEqual(parseMatListingIds(writeResult), []);
  assert.equal(
    isListingMatOverlay(
      "dl-crate-side-a",
      parseMatListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = matCookieValue([
    "dl-crate-side-a",
    "dl-crate-side-a",
    "",
  ]);
  assert.equal(raw, '["dl-crate-side-a"]');
  assert.deepEqual(parseMatListingIds(raw), ["dl-crate-side-a"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("liner tapes; junk PDF and font stay off that cookie", () => {
  const liner = listingById("dl-crate-side-a");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");

  assert.ok(canTapeMat(liner));
  assert.equal(canTapeMat(pdf), false);
  assert.equal(canTapeMat(font), false);

  const taped = markListingMat(liner, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  assert.equal(matCookieValue(taped), '["dl-crate-side-a"]');
  assert.equal(isListingMatOverlay("dl-crate-side-a", taped), true);
  assert.equal(isListingMatOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingMatOverlay("dl-booth-font", taped), false);
  assert.equal(liner?.cartEligible, true);
  assert.equal(liner?.status, "available");
  assert.equal(liner?.price.amountCents, 150);
});

test("junk PDF, font, windbreaker, gift, zine, and chair refuse a mat write", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const jacket = listingById("clo-windbreaker");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(MAT_CHAIR_ID);

  assert.equal(canTapeMat(pdf), false);
  assert.equal(canTapeMat(font), false);
  assert.equal(canTapeMat(jacket), false);
  assert.equal(canTapeMat(gift), false);
  assert.equal(canTapeMat(zine), false);
  assert.equal(canTapeMat(chair), false);

  assert.equal(markListingMat(pdf, []), null);
  assert.equal(markListingMat(font, []), null);
  assert.equal(markListingMat(jacket, []), null);
  assert.equal(markListingMat(gift, []), null);
  assert.equal(markListingMat(zine, []), null);
  assert.equal(markListingMat(chair, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("lamp, LP, and recipes stay off a mat write", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const lp = listingById("mdb-scratched-lp");
  const recipes = listingById("dl-drawer-recipes");

  assert.equal(canTapeMat(lamp), false);
  assert.equal(canTapeMat(lp), false);
  assert.equal(canTapeMat(recipes), false);
  assert.equal(markListingMat(lamp, []), null);
  assert.equal(markListingMat(lp, []), null);
  assert.equal(markListingMat(recipes, []), null);
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const liner = listingById("dl-crate-side-a");
  assert.ok(liner);
  const before = {
    price: liner.price,
    status: liner.status,
    cartEligible: liner.cartEligible,
  };
  const taped = markListingMat(liner, []);
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  const after = listingById("dl-crate-side-a");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that liner id", () => {
  const liner = listingById("dl-crate-side-a");
  const cleared = clearListingMat(liner, ["dl-crate-side-a"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(matCookieValue(cleared), "[]");
  assert.equal(isListingMatOverlay("dl-crate-side-a", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const liner = listingById("dl-crate-side-a");
  const pdf = listingById("dl-junk-pricing-pdf");
  const taped = markListingMat(liner, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingMat(pdf, []), null);

  const cleared = clearListingMat(liner, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(MAT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingMat(chair, []), null);
});
