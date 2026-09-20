import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { EDGE_COOKIE_NAME, EDGE_STORAGE_KEY } from "./listing-edge";
import { SHANK_COOKIE_NAME, SHANK_STORAGE_KEY } from "./listing-shank";
import { SKIVE_STORAGE_KEY } from "./listing-skive";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  CHANNEL_CHAIR_ID,
  CHANNEL_COOKIE_NAME,
  CHANNEL_GIFT_ID,
  CHANNEL_HOST_ID,
  CHANNEL_JACKET_ID,
  CHANNEL_LEAVE_LINE,
  CHANNEL_LID_ID,
  CHANNEL_NOTICE_TITLE,
  CHANNEL_RECIPES_ID,
  CHANNEL_STORAGE_KEY,
  CHANNEL_ZINE_ID,
  canTapeChannel,
  channelCookieValue,
  clearListingChannel,
  isListingChannelOverlay,
  markListingChannel,
  parseChannelListingIds,
  writeChannelListingIds,
} from "./listing-channel";

test("cookie and storage keys stay the channel paper names", () => {
  assert.equal(CHANNEL_STORAGE_KEY, "iss:channel-listing-ids");
  assert.equal(CHANNEL_COOKIE_NAME, "iss-channel-listing-ids");
  assert.equal(CHANNEL_HOST_ID, "clo-split-soles");
  assert.equal(
    CHANNEL_NOTICE_TITLE,
    "I will not channel them. Still a flex. Still original laces.",
  );
  assert.equal(CHANNEL_LEAVE_LINE, "Leave the flex");
  assert.notEqual(CHANNEL_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(CHANNEL_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(CHANNEL_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(CHANNEL_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(CHANNEL_STORAGE_KEY, "iss:cream-listing-ids");
  assert.notEqual(CHANNEL_STORAGE_KEY, "iss:rand-listing-ids");
  assert.notEqual(CHANNEL_COOKIE_NAME, SHANK_COOKIE_NAME);
  assert.notEqual(CHANNEL_COOKIE_NAME, EDGE_COOKIE_NAME);
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-welt-listing-ids");
});

test("write-result objects never parse as a channel set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseChannelListingIds(writeResult), []);
  assert.equal(
    isListingChannelOverlay(
      "clo-split-soles",
      parseChannelListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = channelCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseChannelListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket, lid, and recipes stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(CHANNEL_JACKET_ID);
  const lid = listingById(CHANNEL_LID_ID);
  const recipes = listingById(CHANNEL_RECIPES_ID);

  assert.ok(canTapeChannel(soles));
  assert.equal(canTapeChannel(jacket), false);
  assert.equal(canTapeChannel(lid), false);
  assert.equal(canTapeChannel(recipes), false);

  const taped = markListingChannel(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(channelCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingChannelOverlay("clo-split-soles", taped), true);
  assert.equal(isListingChannelOverlay(CHANNEL_JACKET_ID, taped), false);
  assert.equal(isListingChannelOverlay(CHANNEL_LID_ID, taped), false);
  assert.equal(isListingChannelOverlay(CHANNEL_RECIPES_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("jacket, lid, recipes, gift, zine, and chair refuse a channel write", () => {
  const jacket = listingById(CHANNEL_JACKET_ID);
  const lid = listingById(CHANNEL_LID_ID);
  const recipes = listingById(CHANNEL_RECIPES_ID);
  const gift = listingById(CHANNEL_GIFT_ID);
  const zine = listingById(CHANNEL_ZINE_ID);
  const chair = listingById(CHANNEL_CHAIR_ID);

  assert.equal(canTapeChannel(jacket), false);
  assert.equal(canTapeChannel(lid), false);
  assert.equal(canTapeChannel(recipes), false);
  assert.equal(canTapeChannel(gift), false);
  assert.equal(canTapeChannel(zine), false);
  assert.equal(canTapeChannel(chair), false);

  assert.equal(markListingChannel(jacket, []), null);
  assert.equal(markListingChannel(lid, []), null);
  assert.equal(markListingChannel(recipes, []), null);
  assert.equal(markListingChannel(gift, []), null);
  assert.equal(markListingChannel(zine, []), null);
  assert.equal(markListingChannel(chair, []), null);
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
  const taped = markListingChannel(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingChannel(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(channelCookieValue(cleared), "[]");
  assert.equal(isListingChannelOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(CHANNEL_JACKET_ID);
  const taped = markListingChannel(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingChannel(jacket, []), null);

  const cleared = clearListingChannel(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(CHANNEL_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingChannel(chair, []), null);
});

test("write never touches shank, edge, skive, or welt storage keys", () => {
  writeChannelListingIds(["clo-split-soles"]);
  assert.equal(CHANNEL_STORAGE_KEY, "iss:channel-listing-ids");
  assert.equal(SHANK_STORAGE_KEY, "iss:shank-listing-ids");
  assert.equal(EDGE_STORAGE_KEY, "iss:edge-listing-ids");
  assert.equal(SKIVE_STORAGE_KEY, "iss:skive-listing-ids");
  assert.equal(WELT_STORAGE_KEY, "iss:welt-listing-ids");
  assert.notEqual(CHANNEL_STORAGE_KEY, SHANK_STORAGE_KEY);
  assert.notEqual(CHANNEL_STORAGE_KEY, EDGE_STORAGE_KEY);
  assert.notEqual(CHANNEL_COOKIE_NAME, SHANK_COOKIE_NAME);
  assert.notEqual(CHANNEL_COOKIE_NAME, EDGE_COOKIE_NAME);
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-welt-listing-ids");
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-cream-listing-ids");
  assert.notEqual(CHANNEL_COOKIE_NAME, "iss-rand-listing-ids");
});
