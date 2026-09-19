import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DOLBY_STORAGE_KEY } from "./listing-dolby";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import {
  PANCAKE_CHAIR_ID,
  PANCAKE_COOKIE_NAME,
  PANCAKE_HOST_ID,
  PANCAKE_JEWELS_ID,
  PANCAKE_LEAVE_LINE,
  PANCAKE_LINER_ID,
  PANCAKE_LP_ID,
  PANCAKE_NOTICE_TITLE,
  PANCAKE_STORAGE_KEY,
  canTapePancake,
  clearListingPancake,
  isListingPancakeOverlay,
  markListingPancake,
  pancakeCookieValue,
  parsePancakeListingIds,
} from "./listing-pancake";

test("cookie and storage keys stay the pancake paper names", () => {
  assert.equal(PANCAKE_STORAGE_KEY, "iss:pancake-listing-ids");
  assert.equal(PANCAKE_COOKIE_NAME, "iss-pancake-listing-ids");
  assert.equal(PANCAKE_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    PANCAKE_NOTICE_TITLE,
    "I will not pancake it. Still hiss. Still SUMMER 93.",
  );
  assert.equal(PANCAKE_LEAVE_LINE, "Leave the flop");
  assert.notEqual(PANCAKE_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(PANCAKE_STORAGE_KEY, DOLBY_STORAGE_KEY);
});

test("write-result objects never parse as a pancake set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parsePancakeListingIds(writeResult), []);
  assert.equal(
    isListingPancakeOverlay(
      "mdb-mixtape-93",
      parsePancakeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pancakeCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parsePancakeListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(PANCAKE_LP_ID);
  const jewels = listingById(PANCAKE_JEWELS_ID);
  const liner = listingById(PANCAKE_LINER_ID);
  assert.ok(canTapePancake(mixtape));
  assert.equal(canTapePancake(lp), false);
  assert.equal(canTapePancake(jewels), false);
  assert.equal(canTapePancake(liner), false);

  const taped = markListingPancake(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(pancakeCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingPancakeOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingPancakeOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingPancakeOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingPancakeOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse a pancake write", () => {
  const lp = listingById(PANCAKE_LP_ID);
  const jewels = listingById(PANCAKE_JEWELS_ID);
  const liner = listingById(PANCAKE_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(PANCAKE_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapePancake(lp), false);
  assert.equal(canTapePancake(jewels), false);
  assert.equal(canTapePancake(liner), false);
  assert.equal(canTapePancake(gift), false);
  assert.equal(canTapePancake(zine), false);
  assert.equal(canTapePancake(chair), false);
  assert.equal(canTapePancake(mug), false);

  assert.equal(markListingPancake(lp, []), null);
  assert.equal(markListingPancake(jewels, []), null);
  assert.equal(markListingPancake(liner, []), null);
  assert.equal(markListingPancake(gift, []), null);
  assert.equal(markListingPancake(zine, []), null);
  assert.equal(markListingPancake(chair, []), null);
  assert.equal(markListingPancake(mug, []), null);
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
  const taped = markListingPancake(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingPancake(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pancakeCookieValue(cleared), "[]");
  assert.equal(isListingPancakeOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingPancake(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPancake(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
