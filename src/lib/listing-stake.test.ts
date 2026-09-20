import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { KNURL_STORAGE_KEY } from "./listing-knurl";
import { SCRIBE_STORAGE_KEY } from "./listing-scribe";
import {
  STAKE_CHAIR_ID,
  STAKE_COOKIE_NAME,
  STAKE_HOST_ID,
  STAKE_LEAVE_LINE,
  STAKE_MUG_ID,
  STAKE_NOTICE_TITLE,
  STAKE_RECIPES_ID,
  STAKE_STORAGE_KEY,
  STAKE_WHISK_ID,
  canTapeStake,
  clearListingStake,
  isListingStakeOverlay,
  markListingStake,
  parseStakeListingIds,
  stakeCookieValue,
  writeStakeListingIds,
} from "./listing-stake";

test("cookie and storage keys stay the stake paper names", () => {
  assert.equal(STAKE_STORAGE_KEY, "iss:stake-listing-ids");
  assert.equal(STAKE_COOKIE_NAME, "iss-stake-listing-ids");
  assert.equal(STAKE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    STAKE_NOTICE_TITLE,
    "I will not stake it. Still a lid. Still no pot.",
  );
  assert.equal(STAKE_LEAVE_LINE, "Leave the knob");
  assert.notEqual(STAKE_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(STAKE_STORAGE_KEY, SCRIBE_STORAGE_KEY);
});

test("write-result objects never parse as a stake set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseStakeListingIds(writeResult), []);
  assert.equal(
    isListingStakeOverlay("kdr-lid-no-pot", parseStakeListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = stakeCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseStakeListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, and whisk stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(STAKE_MUG_ID);
  const recipes = listingById(STAKE_RECIPES_ID);
  const whisk = listingById(STAKE_WHISK_ID);
  assert.ok(canTapeStake(lid));
  assert.equal(canTapeStake(mug), false);
  assert.equal(canTapeStake(recipes), false);
  assert.equal(canTapeStake(whisk), false);

  const taped = markListingStake(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(stakeCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingStakeOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingStakeOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingStakeOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingStakeOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, gift, zine, chair, and overlay-owned rows refuse a stake write", () => {
  const mug = listingById(STAKE_MUG_ID);
  const recipes = listingById(STAKE_RECIPES_ID);
  const whisk = listingById(STAKE_WHISK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(STAKE_CHAIR_ID);
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeStake(mug), false);
  assert.equal(canTapeStake(recipes), false);
  assert.equal(canTapeStake(whisk), false);
  assert.equal(canTapeStake(gift), false);
  assert.equal(canTapeStake(zine), false);
  assert.equal(canTapeStake(chair), false);
  assert.equal(canTapeStake(mixtape), false);

  assert.equal(markListingStake(mug, []), null);
  assert.equal(markListingStake(recipes, []), null);
  assert.equal(markListingStake(whisk, []), null);
  assert.equal(markListingStake(gift, []), null);
  assert.equal(markListingStake(zine, []), null);
  assert.equal(markListingStake(chair, []), null);
  assert.equal(markListingStake(mixtape, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lid = listingById("kdr-lid-no-pot");
  assert.ok(lid);
  const before = {
    price: lid.price,
    status: lid.status,
    cartEligible: lid.cartEligible,
  };
  const taped = markListingStake(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingStake(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(stakeCookieValue(cleared), "[]");
  assert.equal(isListingStakeOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingStake(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingStake(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(STAKE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingStake(chair, []), null);
});

test("write never touches knurl or scribe storage keys", () => {
  writeStakeListingIds(["kdr-lid-no-pot"]);
  assert.equal(STAKE_STORAGE_KEY, "iss:stake-listing-ids");
  assert.equal(KNURL_STORAGE_KEY, "iss:knurl-listing-ids");
  assert.equal(SCRIBE_STORAGE_KEY, "iss:scribe-listing-ids");
  assert.notEqual(STAKE_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(STAKE_STORAGE_KEY, SCRIBE_STORAGE_KEY);
  assert.notEqual(STAKE_COOKIE_NAME, "iss-knurl-listing-ids");
  assert.notEqual(STAKE_COOKIE_NAME, "iss-scribe-listing-ids");
});
