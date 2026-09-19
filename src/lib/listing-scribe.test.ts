import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GLASS_STORAGE_KEY } from "./listing-glass";
import { KNURL_STORAGE_KEY } from "./listing-knurl";
import {
  SCRIBE_CHAIR_ID,
  SCRIBE_COOKIE_NAME,
  SCRIBE_HOST_ID,
  SCRIBE_LEAVE_LINE,
  SCRIBE_MUG_ID,
  SCRIBE_NOTICE_TITLE,
  SCRIBE_RECIPES_ID,
  SCRIBE_STORAGE_KEY,
  SCRIBE_WHISK_ID,
  canTapeScribe,
  clearListingScribe,
  isListingScribeOverlay,
  markListingScribe,
  parseScribeListingIds,
  scribeCookieValue,
} from "./listing-scribe";

test("cookie and storage keys stay the scribe paper names", () => {
  assert.equal(SCRIBE_STORAGE_KEY, "iss:scribe-listing-ids");
  assert.equal(SCRIBE_COOKIE_NAME, "iss-scribe-listing-ids");
  assert.equal(SCRIBE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    SCRIBE_NOTICE_TITLE,
    "I will not scribe it. Still a lid. Still no pot.",
  );
  assert.equal(SCRIBE_LEAVE_LINE, "Leave the glass");
  assert.notEqual(SCRIBE_STORAGE_KEY, KNURL_STORAGE_KEY);
  assert.notEqual(SCRIBE_STORAGE_KEY, GLASS_STORAGE_KEY);
});

test("write-result objects never parse as a scribe set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseScribeListingIds(writeResult), []);
  assert.equal(
    isListingScribeOverlay(
      "kdr-lid-no-pot",
      parseScribeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = scribeCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseScribeListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, and whisk stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById(SCRIBE_MUG_ID);
  const recipes = listingById(SCRIBE_RECIPES_ID);
  const whisk = listingById(SCRIBE_WHISK_ID);
  assert.ok(canTapeScribe(lid));
  assert.equal(canTapeScribe(mug), false);
  assert.equal(canTapeScribe(recipes), false);
  assert.equal(canTapeScribe(whisk), false);

  const taped = markListingScribe(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(scribeCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingScribeOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingScribeOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingScribeOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingScribeOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, gift, zine, chair, and overlay-owned rows refuse a scribe write", () => {
  const mug = listingById(SCRIBE_MUG_ID);
  const recipes = listingById(SCRIBE_RECIPES_ID);
  const whisk = listingById(SCRIBE_WHISK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(SCRIBE_CHAIR_ID);
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeScribe(mug), false);
  assert.equal(canTapeScribe(recipes), false);
  assert.equal(canTapeScribe(whisk), false);
  assert.equal(canTapeScribe(gift), false);
  assert.equal(canTapeScribe(zine), false);
  assert.equal(canTapeScribe(chair), false);
  assert.equal(canTapeScribe(mixtape), false);

  assert.equal(markListingScribe(mug, []), null);
  assert.equal(markListingScribe(recipes, []), null);
  assert.equal(markListingScribe(whisk, []), null);
  assert.equal(markListingScribe(gift, []), null);
  assert.equal(markListingScribe(zine, []), null);
  assert.equal(markListingScribe(chair, []), null);
  assert.equal(markListingScribe(mixtape, []), null);
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
  const taped = markListingScribe(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingScribe(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(scribeCookieValue(cleared), "[]");
  assert.equal(isListingScribeOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingScribe(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingScribe(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
