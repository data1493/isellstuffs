import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { CASES_STORAGE_KEY } from "./listing-cases";
import { FILL_STORAGE_KEY } from "./listing-fill";
import { HINGE_STORAGE_KEY } from "./listing-hinge";
import { INSIDE_STORAGE_KEY } from "./listing-inside";
import {
  NEST_COOKIE_NAME,
  NEST_HOST_ID,
  NEST_LEAVE_LINE,
  NEST_NOTICE_TITLE,
  NEST_STORAGE_KEY,
  canTapeNest,
  clearListingNest,
  isListingNestOverlay,
  markListingNest,
  nestCookieValue,
  parseNestListingIds,
} from "./listing-nest";

test("cookie and storage keys stay the nest paper names", () => {
  assert.equal(NEST_STORAGE_KEY, "iss:nest-listing-ids");
  assert.equal(NEST_COOKIE_NAME, "iss-nest-listing-ids");
  assert.equal(NEST_HOST_ID, "mdb-jewel-stack");
  assert.equal(
    NEST_NOTICE_TITLE,
    "I will not nest them. Still a pile. Still empty.",
  );
  assert.equal(NEST_LEAVE_LINE, "Leave the pile");
  assert.notEqual(NEST_STORAGE_KEY, CASES_STORAGE_KEY);
  assert.notEqual(NEST_STORAGE_KEY, HINGE_STORAGE_KEY);
  assert.notEqual(NEST_STORAGE_KEY, INSIDE_STORAGE_KEY);
  assert.notEqual(NEST_STORAGE_KEY, FILL_STORAGE_KEY);
  assert.notEqual(NEST_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
});

test("write-result objects never parse as a nest set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-jewel-stack"],
  });
  assert.deepEqual(parseNestListingIds(writeResult), []);
  assert.equal(
    isListingNestOverlay("mdb-jewel-stack", parseNestListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = nestCookieValue(["mdb-jewel-stack", "mdb-jewel-stack", ""]);
  assert.equal(raw, '["mdb-jewel-stack"]');
  assert.deepEqual(parseNestListingIds(raw), ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jewel stack tapes; LP, mixtape, and CD-R stay off that cookie", () => {
  const jewels = listingById("mdb-jewel-stack");
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const disc = listingById("ysk-burned-cdr");

  assert.ok(canTapeNest(jewels));
  assert.equal(canTapeNest(lp), false);
  assert.equal(canTapeNest(mixtape), false);
  assert.equal(canTapeNest(disc), false);

  const taped = markListingNest(jewels, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  assert.equal(nestCookieValue(taped), '["mdb-jewel-stack"]');
  assert.equal(isListingNestOverlay("mdb-jewel-stack", taped), true);
  assert.equal(isListingNestOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingNestOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingNestOverlay("ysk-burned-cdr", taped), false);
  assert.equal(jewels?.cartEligible, true);
  assert.equal(jewels?.status, "available");
  assert.equal(jewels?.price.amountCents, 250);
});

test("LP, mixtape, CD-R, gift, zine, and overlay-owned rows refuse a nest write", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const disc = listingById("ysk-burned-cdr");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pack = listingById("dl-sample-pack");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeNest(lp), false);
  assert.equal(canTapeNest(mixtape), false);
  assert.equal(canTapeNest(disc), false);
  assert.equal(canTapeNest(gift), false);
  assert.equal(canTapeNest(zine), false);
  assert.equal(canTapeNest(pack), false);
  assert.equal(canTapeNest(jacket), false);
  assert.equal(canTapeNest(soles), false);
  assert.equal(canTapeNest(drawer), false);

  assert.equal(markListingNest(lp, []), null);
  assert.equal(markListingNest(mixtape, []), null);
  assert.equal(markListingNest(disc, []), null);
  assert.equal(markListingNest(gift, []), null);
  assert.equal(markListingNest(zine, []), null);
  assert.equal(markListingNest(pack, []), null);
  assert.equal(markListingNest(jacket, []), null);
  assert.equal(markListingNest(soles, []), null);
  assert.equal(markListingNest(drawer, []), null);
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
  const taped = markListingNest(jewels, []);
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  const after = listingById("mdb-jewel-stack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jewel-stack id", () => {
  const jewels = listingById("mdb-jewel-stack");
  const cleared = clearListingNest(jewels, ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(nestCookieValue(cleared), "[]");
  assert.equal(isListingNestOverlay("mdb-jewel-stack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jewels = listingById("mdb-jewel-stack");
  const disc = listingById("ysk-burned-cdr");
  const taped = markListingNest(jewels, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingNest(disc, []), null);

  const cleared = clearListingNest(jewels, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
