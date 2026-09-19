import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CASES_STORAGE_KEY } from "./listing-cases";
import { FILL_STORAGE_KEY } from "./listing-fill";
import { HINGE_STORAGE_KEY } from "./listing-hinge";
import { INSIDE_STORAGE_KEY } from "./listing-inside";
import { NEST_STORAGE_KEY } from "./listing-nest";
import {
  FOAM_COOKIE_NAME,
  FOAM_HOST_ID,
  FOAM_LEAVE_LINE,
  FOAM_NOTICE_TITLE,
  FOAM_STORAGE_KEY,
  canTapeFoam,
  clearListingFoam,
  foamCookieValue,
  isListingFoamOverlay,
  markListingFoam,
  parseFoamListingIds,
} from "./listing-foam";

test("cookie and storage keys stay the foam paper names", () => {
  assert.equal(FOAM_STORAGE_KEY, "iss:foam-listing-ids");
  assert.equal(FOAM_COOKIE_NAME, "iss-foam-listing-ids");
  assert.equal(FOAM_HOST_ID, "mdb-jewel-stack");
  assert.equal(
    FOAM_NOTICE_TITLE,
    "I will not foam them. Still a pile. Still empty.",
  );
  assert.equal(FOAM_LEAVE_LINE, "Leave the pile");
  assert.notEqual(FOAM_STORAGE_KEY, CASES_STORAGE_KEY);
  assert.notEqual(FOAM_STORAGE_KEY, HINGE_STORAGE_KEY);
  assert.notEqual(FOAM_STORAGE_KEY, INSIDE_STORAGE_KEY);
  assert.notEqual(FOAM_STORAGE_KEY, FILL_STORAGE_KEY);
  assert.notEqual(FOAM_STORAGE_KEY, NEST_STORAGE_KEY);
});

test("write-result objects never parse as a foam set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-jewel-stack"],
  });
  assert.deepEqual(parseFoamListingIds(writeResult), []);
  assert.equal(
    isListingFoamOverlay("mdb-jewel-stack", parseFoamListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = foamCookieValue(["mdb-jewel-stack", "mdb-jewel-stack", ""]);
  assert.equal(raw, '["mdb-jewel-stack"]');
  assert.deepEqual(parseFoamListingIds(raw), ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jewel stack tapes; LP, mixtape, and CD-R stay off that cookie", () => {
  const jewels = listingById("mdb-jewel-stack");
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const disc = listingById("ysk-burned-cdr");

  assert.ok(canTapeFoam(jewels));
  assert.equal(canTapeFoam(lp), false);
  assert.equal(canTapeFoam(mixtape), false);
  assert.equal(canTapeFoam(disc), false);

  const taped = markListingFoam(jewels, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  assert.equal(foamCookieValue(taped), '["mdb-jewel-stack"]');
  assert.equal(isListingFoamOverlay("mdb-jewel-stack", taped), true);
  assert.equal(isListingFoamOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingFoamOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingFoamOverlay("ysk-burned-cdr", taped), false);
  assert.equal(jewels?.cartEligible, true);
  assert.equal(jewels?.status, "available");
  assert.equal(jewels?.price.amountCents, 250);
});

test("LP, mixtape, CD-R, gift, zine, and overlay-owned rows refuse a foam write", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const disc = listingById("ysk-burned-cdr");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pack = listingById("dl-sample-pack");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeFoam(lp), false);
  assert.equal(canTapeFoam(mixtape), false);
  assert.equal(canTapeFoam(disc), false);
  assert.equal(canTapeFoam(gift), false);
  assert.equal(canTapeFoam(zine), false);
  assert.equal(canTapeFoam(pack), false);
  assert.equal(canTapeFoam(jacket), false);
  assert.equal(canTapeFoam(soles), false);
  assert.equal(canTapeFoam(drawer), false);

  assert.equal(markListingFoam(lp, []), null);
  assert.equal(markListingFoam(mixtape, []), null);
  assert.equal(markListingFoam(disc, []), null);
  assert.equal(markListingFoam(gift, []), null);
  assert.equal(markListingFoam(zine, []), null);
  assert.equal(markListingFoam(pack, []), null);
  assert.equal(markListingFoam(jacket, []), null);
  assert.equal(markListingFoam(soles, []), null);
  assert.equal(markListingFoam(drawer, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jewels = listingById("mdb-jewel-stack");
  assert.ok(jewels);
  const before = {
    price: jewels.price,
    status: jewels.status,
    cartEligible: jewels.cartEligible,
  };
  const taped = markListingFoam(jewels, []);
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  const after = listingById("mdb-jewel-stack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jewel-stack id", () => {
  const jewels = listingById("mdb-jewel-stack");
  const cleared = clearListingFoam(jewels, ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(foamCookieValue(cleared), "[]");
  assert.equal(isListingFoamOverlay("mdb-jewel-stack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jewels = listingById("mdb-jewel-stack");
  const disc = listingById("ysk-burned-cdr");
  const taped = markListingFoam(jewels, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingFoam(disc, []), null);

  const cleared = clearListingFoam(jewels, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
