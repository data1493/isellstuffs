import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CAP_STORAGE_KEY } from "./listing-cap";
import { CHIP_STORAGE_KEY } from "./listing-chip";
import {
  HANDLE_COOKIE_NAME,
  HANDLE_HOST_ID,
  HANDLE_LEAVE_LINE,
  HANDLE_NOTICE_TITLE,
  HANDLE_STORAGE_KEY,
  canTapeHandle,
  clearListingHandle,
  handleCookieValue,
  isListingHandleOverlay,
  markListingHandle,
  parseHandleListingIds,
} from "./listing-handle";
import { WHOSE_STORAGE_KEY } from "./listing-whose";

test("cookie and storage keys stay the handle paper names", () => {
  assert.equal(HANDLE_STORAGE_KEY, "iss:handle-listing-ids");
  assert.equal(HANDLE_COOKIE_NAME, "iss-handle-listing-ids");
  assert.equal(HANDLE_HOST_ID, "kdr-chipped-mug");
  assert.equal(
    HANDLE_NOTICE_TITLE,
    "I will not handle it. Still a chip. Still coffee.",
  );
  assert.equal(HANDLE_LEAVE_LINE, "Leave the mug");
  assert.notEqual(HANDLE_STORAGE_KEY, CHIP_STORAGE_KEY);
  assert.notEqual(HANDLE_STORAGE_KEY, WHOSE_STORAGE_KEY);
  assert.notEqual(HANDLE_STORAGE_KEY, CAP_STORAGE_KEY);
});

test("write-result objects never parse as a handle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseHandleListingIds(writeResult), []);
  assert.equal(
    isListingHandleOverlay("kdr-chipped-mug", parseHandleListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = handleCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseHandleListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mug tapes; whisk and lid stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const whisk = listingById("kdr-bent-whisk");
  const lid = listingById("kdr-lid-no-pot");
  assert.ok(canTapeHandle(mug));
  assert.equal(canTapeHandle(whisk), false);
  assert.equal(canTapeHandle(lid), false);

  const taped = markListingHandle(mug, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  assert.equal(handleCookieValue(taped), '["kdr-chipped-mug"]');
  assert.equal(isListingHandleOverlay("kdr-chipped-mug", taped), true);
  assert.equal(isListingHandleOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingHandleOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(mug?.cartEligible, true);
  assert.equal(mug?.status, "available");
  assert.equal(mug?.price.amountCents, 500);
});

test("whisk, lid, gift, zine, and overlay-owned rows refuse a handle write", () => {
  const whisk = listingById("kdr-bent-whisk");
  const lid = listingById("kdr-lid-no-pot");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const jewels = listingById("mdb-jewel-stack");
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeHandle(whisk), false);
  assert.equal(canTapeHandle(lid), false);
  assert.equal(canTapeHandle(gift), false);
  assert.equal(canTapeHandle(zine), false);
  assert.equal(canTapeHandle(jacket), false);
  assert.equal(canTapeHandle(jewels), false);
  assert.equal(canTapeHandle(drawer), false);
  assert.equal(canTapeHandle(boy), false);

  assert.equal(markListingHandle(whisk, []), null);
  assert.equal(markListingHandle(lid, []), null);
  assert.equal(markListingHandle(gift, []), null);
  assert.equal(markListingHandle(zine, []), null);
  assert.equal(markListingHandle(jacket, []), null);
  assert.equal(markListingHandle(jewels, []), null);
  assert.equal(markListingHandle(drawer, []), null);
  assert.equal(markListingHandle(boy, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mug = listingById("kdr-chipped-mug");
  assert.ok(mug);
  const before = {
    price: mug.price,
    status: mug.status,
    cartEligible: mug.cartEligible,
  };
  const taped = markListingHandle(mug, []);
  assert.deepEqual(taped, ["kdr-chipped-mug"]);
  const after = listingById("kdr-chipped-mug");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingHandle(mug, ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(handleCookieValue(cleared), "[]");
  assert.equal(isListingHandleOverlay("kdr-chipped-mug", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mug = listingById("kdr-chipped-mug");
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingHandle(mug, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingHandle(whisk, []), null);

  const cleared = clearListingHandle(mug, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
