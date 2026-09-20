import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BUSH_STORAGE_KEY } from "./listing-bush";
import { SOCKET_STORAGE_KEY } from "./listing-socket";
import {
  HICKEY_CHAIR_ID,
  HICKEY_COOKIE_NAME,
  HICKEY_HOST_ID,
  HICKEY_JUNK_ID,
  HICKEY_LEAVE_LINE,
  HICKEY_MUG_ID,
  HICKEY_NOTICE_TITLE,
  HICKEY_STORAGE_KEY,
  canTapeHickey,
  clearListingHickey,
  hickeyCookieValue,
  isListingHickeyOverlay,
  markListingHickey,
  parseHickeyListingIds,
  writeHickeyListingIds,
} from "./listing-hickey";

test("cookie and storage keys stay the hickey paper names", () => {
  assert.equal(HICKEY_STORAGE_KEY, "iss:hickey-listing-ids");
  assert.equal(HICKEY_COOKIE_NAME, "iss-hickey-listing-ids");
  assert.equal(HICKEY_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    HICKEY_NOTICE_TITLE,
    "I will not hickey it. Still a wiggle. Still shade optional.",
  );
  assert.equal(HICKEY_LEAVE_LINE, "Leave the pipe");
  assert.notEqual(HICKEY_STORAGE_KEY, BUSH_STORAGE_KEY);
  assert.notEqual(HICKEY_STORAGE_KEY, SOCKET_STORAGE_KEY);
});

test("write-result objects never parse as a hickey set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseHickeyListingIds(writeResult), []);
  assert.equal(
    isListingHickeyOverlay(
      "ysk-wobbly-lamp",
      parseHickeyListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = hickeyCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseHickeyListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, mug, and junk PDF stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById(HICKEY_CHAIR_ID);
  const mug = listingById(HICKEY_MUG_ID);
  const junk = listingById(HICKEY_JUNK_ID);

  assert.ok(canTapeHickey(lamp));
  assert.equal(canTapeHickey(chair), false);
  assert.equal(canTapeHickey(mug), false);
  assert.equal(canTapeHickey(junk), false);

  const taped = markListingHickey(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(hickeyCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingHickeyOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingHickeyOverlay(HICKEY_CHAIR_ID, taped), false);
  assert.equal(isListingHickeyOverlay(HICKEY_MUG_ID, taped), false);
  assert.equal(isListingHickeyOverlay(HICKEY_JUNK_ID, taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, mug, junk PDF, gift, and zine refuse a hickey write", () => {
  const chair = listingById(HICKEY_CHAIR_ID);
  const mug = listingById(HICKEY_MUG_ID);
  const junk = listingById(HICKEY_JUNK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeHickey(chair), false);
  assert.equal(canTapeHickey(mug), false);
  assert.equal(canTapeHickey(junk), false);
  assert.equal(canTapeHickey(gift), false);
  assert.equal(canTapeHickey(zine), false);

  assert.equal(markListingHickey(chair, []), null);
  assert.equal(markListingHickey(mug, []), null);
  assert.equal(markListingHickey(junk, []), null);
  assert.equal(markListingHickey(gift, []), null);
  assert.equal(markListingHickey(zine, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  assert.ok(lamp);
  const before = {
    price: lamp.price,
    status: lamp.status,
    cartEligible: lamp.cartEligible,
  };
  const taped = markListingHickey(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingHickey(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(hickeyCookieValue(cleared), "[]");
  assert.equal(isListingHickeyOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const mug = listingById(HICKEY_MUG_ID);
  const taped = markListingHickey(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingHickey(mug, []), null);

  const cleared = clearListingHickey(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(HICKEY_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingHickey(chair, []), null);
});

test("write never touches fuse, chase, broach, or socket storage keys", () => {
  writeHickeyListingIds(["ysk-wobbly-lamp"]);
  assert.equal(HICKEY_STORAGE_KEY, "iss:hickey-listing-ids");
  assert.equal(SOCKET_STORAGE_KEY, "iss:socket-listing-ids");
  assert.equal(BUSH_STORAGE_KEY, "iss:bush-listing-ids");
  assert.notEqual(HICKEY_STORAGE_KEY, SOCKET_STORAGE_KEY);
  assert.notEqual(HICKEY_STORAGE_KEY, BUSH_STORAGE_KEY);
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-fuse-listing-ids");
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-chase-listing-ids");
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-broach-listing-ids");
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-socket-listing-ids");
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-shank-listing-ids");
  assert.notEqual(HICKEY_COOKIE_NAME, "iss-detune-listing-ids");
});
