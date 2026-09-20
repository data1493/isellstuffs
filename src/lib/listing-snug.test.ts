import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { KNURL_STORAGE_KEY } from "./listing-knurl";
import {
  SNUG_CHAIR_ID,
  SNUG_COOKIE_NAME,
  SNUG_HOST_ID,
  SNUG_LAMP_ID,
  SNUG_LEAVE_LINE,
  SNUG_MUG_ID,
  SNUG_NOTICE_TITLE,
  SNUG_RECIPES_ID,
  SNUG_STORAGE_KEY,
  SNUG_WHISK_ID,
  canTapeSnug,
  clearListingSnug,
  isListingSnugOverlay,
  markListingSnug,
  parseSnugListingIds,
  snugCookieValue,
  writeSnugListingIds,
} from "./listing-snug";
import { STAKE_STORAGE_KEY } from "./listing-stake";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import { VENT_STORAGE_KEY } from "./listing-vent";

test("cookie and storage keys stay the snug paper names", () => {
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(SNUG_COOKIE_NAME, "iss-snug-listing-ids");
  assert.equal(SNUG_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    SNUG_NOTICE_TITLE,
    "I will not snug it. Still a wiggle. Still a lid.",
  );
  assert.equal(SNUG_LEAVE_LINE, "Leave the wiggle");
  assert.notEqual(SNUG_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, VENT_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, STAKE_STORAGE_KEY);
});

test("write-result objects never parse as a snug set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseSnugListingIds(writeResult), []);
  assert.equal(
    isListingSnugOverlay("kdr-lid-no-pot", parseSnugListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = snugCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseSnugListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, whisk, and lamp stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(SNUG_MUG_ID);
  const recipes = listingById(SNUG_RECIPES_ID);
  const whisk = listingById(SNUG_WHISK_ID);
  const lamp = listingById(SNUG_LAMP_ID);
  assert.ok(canTapeSnug(lid));
  assert.equal(canTapeSnug(mug), false);
  assert.equal(canTapeSnug(recipes), false);
  assert.equal(canTapeSnug(whisk), false);
  assert.equal(canTapeSnug(lamp), false);

  const taped = markListingSnug(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(snugCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingSnugOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingSnugOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingSnugOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingSnugOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingSnugOverlay("ysk-wobbly-lamp", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, lamp, gift, zine, chair, and overlay-owned rows refuse a snug write", () => {
  const mug = listingById(SNUG_MUG_ID);
  const recipes = listingById(SNUG_RECIPES_ID);
  const whisk = listingById(SNUG_WHISK_ID);
  const lamp = listingById(SNUG_LAMP_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SNUG_CHAIR_ID);
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeSnug(mug), false);
  assert.equal(canTapeSnug(recipes), false);
  assert.equal(canTapeSnug(whisk), false);
  assert.equal(canTapeSnug(lamp), false);
  assert.equal(canTapeSnug(gift), false);
  assert.equal(canTapeSnug(zine), false);
  assert.equal(canTapeSnug(chair), false);
  assert.equal(canTapeSnug(mixtape), false);

  assert.equal(markListingSnug(mug, []), null);
  assert.equal(markListingSnug(recipes, []), null);
  assert.equal(markListingSnug(whisk, []), null);
  assert.equal(markListingSnug(lamp, []), null);
  assert.equal(markListingSnug(gift, []), null);
  assert.equal(markListingSnug(zine, []), null);
  assert.equal(markListingSnug(chair, []), null);
  assert.equal(markListingSnug(mixtape, []), null);
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
  const taped = markListingSnug(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingSnug(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(snugCookieValue(cleared), "[]");
  assert.equal(isListingSnugOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingSnug(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSnug(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SNUG_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingSnug(chair, []), null);
});

test("write never touches tap, knurl, vent, or stake storage keys", () => {
  writeSnugListingIds(["kdr-lid-no-pot"]);
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.equal(KNURL_STORAGE_KEY, "iss:knurl-listing-ids");
  assert.equal(VENT_STORAGE_KEY, "iss:vent-listing-ids");
  assert.equal(STAKE_STORAGE_KEY, "iss:stake-listing-ids");
  assert.notEqual(SNUG_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, VENT_STORAGE_KEY);
  assert.notEqual(SNUG_STORAGE_KEY, STAKE_STORAGE_KEY);
  assert.notEqual(SNUG_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(SNUG_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(SNUG_COOKIE_NAME, "iss-knurl-listing-ids");
  assert.notEqual(SNUG_COOKIE_NAME, "iss-vent-listing-ids");
  assert.notEqual(SNUG_COOKIE_NAME, "iss-chamfer-listing-ids");
  assert.notEqual(SNUG_COOKIE_NAME, "iss-chase-listing-ids");
});
