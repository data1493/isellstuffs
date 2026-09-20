import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CHANNEL_STORAGE_KEY } from "./listing-channel";
import { GEM_STORAGE_KEY } from "./listing-gem";
import { SHANK_COOKIE_NAME, SHANK_STORAGE_KEY } from "./listing-shank";
import {
  VAMP_CHAIR_ID,
  VAMP_COOKIE_NAME,
  VAMP_HOST_ID,
  VAMP_JACKET_ID,
  VAMP_LEAVE_LINE,
  VAMP_LID_ID,
  VAMP_NOTICE_TITLE,
  VAMP_RECIPES_ID,
  VAMP_STORAGE_KEY,
  canTapeVamp,
  clearListingVamp,
  isListingVampOverlay,
  markListingVamp,
  parseVampListingIds,
  vampCookieValue,
  writeVampListingIds,
} from "./listing-vamp";

test("cookie and storage keys stay the vamp paper names", () => {
  assert.equal(VAMP_STORAGE_KEY, "iss:vamp-listing-ids");
  assert.equal(VAMP_COOKIE_NAME, "iss-vamp-listing-ids");
  assert.equal(VAMP_HOST_ID, "clo-split-soles");
  assert.equal(
    VAMP_NOTICE_TITLE,
    "I will not vamp them. Still a flex. Still original laces.",
  );
  assert.equal(VAMP_LEAVE_LINE, "Leave the flex");
  assert.notEqual(VAMP_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(VAMP_STORAGE_KEY, GEM_STORAGE_KEY);
  assert.notEqual(VAMP_STORAGE_KEY, CHANNEL_STORAGE_KEY);
});

test("write-result objects never parse as a vamp set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseVampListingIds(writeResult), []);
  assert.equal(
    isListingVampOverlay("clo-split-soles", parseVampListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = vampCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseVampListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, lid, and recipes stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(VAMP_JACKET_ID);
  const lid = listingById(VAMP_LID_ID);
  const recipes = listingById(VAMP_RECIPES_ID);

  assert.ok(canTapeVamp(soles));
  assert.equal(canTapeVamp(jacket), false);
  assert.equal(canTapeVamp(lid), false);
  assert.equal(canTapeVamp(recipes), false);

  const taped = markListingVamp(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(vampCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingVampOverlay("clo-split-soles", taped), true);
  assert.equal(isListingVampOverlay(VAMP_JACKET_ID, taped), false);
  assert.equal(isListingVampOverlay(VAMP_LID_ID, taped), false);
  assert.equal(isListingVampOverlay(VAMP_RECIPES_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("jacket, lid, recipes, gift, zine, and chair refuse a vamp write", () => {
  const jacket = listingById(VAMP_JACKET_ID);
  const lid = listingById(VAMP_LID_ID);
  const recipes = listingById(VAMP_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(VAMP_CHAIR_ID);

  assert.equal(canTapeVamp(jacket), false);
  assert.equal(canTapeVamp(lid), false);
  assert.equal(canTapeVamp(recipes), false);
  assert.equal(canTapeVamp(gift), false);
  assert.equal(canTapeVamp(zine), false);
  assert.equal(canTapeVamp(chair), false);

  assert.equal(markListingVamp(jacket, []), null);
  assert.equal(markListingVamp(lid, []), null);
  assert.equal(markListingVamp(recipes, []), null);
  assert.equal(markListingVamp(gift, []), null);
  assert.equal(markListingVamp(zine, []), null);
  assert.equal(markListingVamp(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const soles = listingById("clo-split-soles");
  assert.ok(soles);
  const before = {
    price: soles.price,
    status: soles.status,
    cartEligible: soles.cartEligible,
  };
  const taped = markListingVamp(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingVamp(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(vampCookieValue(cleared), "[]");
  assert.equal(isListingVampOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(VAMP_JACKET_ID);
  const taped = markListingVamp(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingVamp(jacket, []), null);

  const cleared = clearListingVamp(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(VAMP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingVamp(chair, []), null);
});

test("write never touches shank or gem storage keys", () => {
  writeVampListingIds(["clo-split-soles"]);
  assert.equal(VAMP_STORAGE_KEY, "iss:vamp-listing-ids");
  assert.equal(SHANK_STORAGE_KEY, "iss:shank-listing-ids");
  assert.equal(GEM_STORAGE_KEY, "iss:gem-listing-ids");
  assert.notEqual(VAMP_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(VAMP_STORAGE_KEY, GEM_STORAGE_KEY);
  assert.notEqual(VAMP_COOKIE_NAME, SHANK_COOKIE_NAME);
  assert.notEqual(VAMP_COOKIE_NAME, "iss-gem-listing-ids");
  assert.notEqual(VAMP_COOKIE_NAME, "iss-channel-listing-ids");
  assert.notEqual(VAMP_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(VAMP_COOKIE_NAME, "iss-edge-listing-ids");
  assert.notEqual(VAMP_COOKIE_NAME, "iss-welt-listing-ids");
});
