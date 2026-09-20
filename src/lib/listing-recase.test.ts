import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DOLBY_STORAGE_KEY } from "./listing-dolby";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import { PANCAKE_STORAGE_KEY } from "./listing-pancake";
import {
  RECASE_CHAIR_ID,
  RECASE_COOKIE_NAME,
  RECASE_HOST_ID,
  RECASE_JEWELS_ID,
  RECASE_LEAVE_LINE,
  RECASE_LINER_ID,
  RECASE_LP_ID,
  RECASE_NOTICE_TITLE,
  RECASE_STORAGE_KEY,
  canTapeRecase,
  clearListingRecase,
  isListingRecaseOverlay,
  markListingRecase,
  parseRecaseListingIds,
  recaseCookieValue,
} from "./listing-recase";

test("cookie and storage keys stay the recase paper names", () => {
  assert.equal(RECASE_STORAGE_KEY, "iss:recase-listing-ids");
  assert.equal(RECASE_COOKIE_NAME, "iss-recase-listing-ids");
  assert.equal(RECASE_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    RECASE_NOTICE_TITLE,
    "I will not recase it. Still fading. Still hiss.",
  );
  assert.equal(RECASE_LEAVE_LINE, "Leave the shell");
  assert.notEqual(RECASE_STORAGE_KEY, PANCAKE_STORAGE_KEY);
  assert.notEqual(RECASE_STORAGE_KEY, DOLBY_STORAGE_KEY);
  assert.notEqual(RECASE_STORAGE_KEY, HISS_STORAGE_KEY);
});

test("write-result objects never parse as a recase set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseRecaseListingIds(writeResult), []);
  assert.equal(
    isListingRecaseOverlay(
      "mdb-mixtape-93",
      parseRecaseListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = recaseCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseRecaseListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(RECASE_LP_ID);
  const jewels = listingById(RECASE_JEWELS_ID);
  const liner = listingById(RECASE_LINER_ID);
  assert.ok(canTapeRecase(mixtape));
  assert.equal(canTapeRecase(lp), false);
  assert.equal(canTapeRecase(jewels), false);
  assert.equal(canTapeRecase(liner), false);

  const taped = markListingRecase(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(recaseCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingRecaseOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingRecaseOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingRecaseOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRecaseOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a recase write", () => {
  const lp = listingById(RECASE_LP_ID);
  const jewels = listingById(RECASE_JEWELS_ID);
  const liner = listingById(RECASE_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(RECASE_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeRecase(lp), false);
  assert.equal(canTapeRecase(jewels), false);
  assert.equal(canTapeRecase(liner), false);
  assert.equal(canTapeRecase(gift), false);
  assert.equal(canTapeRecase(zine), false);
  assert.equal(canTapeRecase(chair), false);
  assert.equal(canTapeRecase(mug), false);

  assert.equal(markListingRecase(lp, []), null);
  assert.equal(markListingRecase(jewels, []), null);
  assert.equal(markListingRecase(liner, []), null);
  assert.equal(markListingRecase(gift, []), null);
  assert.equal(markListingRecase(zine, []), null);
  assert.equal(markListingRecase(chair, []), null);
  assert.equal(markListingRecase(mug, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(mixtape);
  const before = {
    price: mixtape.price,
    status: mixtape.status,
    cartEligible: mixtape.cartEligible,
  };
  const taped = markListingRecase(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingRecase(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(recaseCookieValue(cleared), "[]");
  assert.equal(isListingRecaseOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingRecase(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingRecase(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
