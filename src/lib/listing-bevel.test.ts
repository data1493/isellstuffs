import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LATHE_STORAGE_KEY } from "./listing-lathe";
import {
  BEVEL_CHAIR_ID,
  BEVEL_COOKIE_NAME,
  BEVEL_HOST_ID,
  BEVEL_LEAVE_LINE,
  BEVEL_NOTICE_TITLE,
  BEVEL_STORAGE_KEY,
  bevelCookieValue,
  canTapeBevel,
  clearListingBevel,
  isListingBevelOverlay,
  markListingBevel,
  parseBevelListingIds,
} from "./listing-bevel";
import { POLISH_STORAGE_KEY } from "./listing-polish";

test("cookie and storage keys stay the bevel paper names", () => {
  assert.equal(BEVEL_STORAGE_KEY, "iss:bevel-listing-ids");
  assert.equal(BEVEL_COOKIE_NAME, "iss-bevel-listing-ids");
  assert.equal(BEVEL_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    BEVEL_NOTICE_TITLE,
    "I will not bevel it. Still scratched. Still Sharpie.",
  );
  assert.equal(BEVEL_LEAVE_LINE, "Leave the catch");
  assert.notEqual(BEVEL_STORAGE_KEY, LATHE_STORAGE_KEY);
  assert.notEqual(BEVEL_STORAGE_KEY, POLISH_STORAGE_KEY);
});

test("write-result objects never parse as a bevel set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseBevelListingIds(writeResult), []);
  assert.equal(
    isListingBevelOverlay("ysk-burned-cdr", parseBevelListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = bevelCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseBevelListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("disc tapes; pack, font, and overlay hosts stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const jewels = listingById("mdb-jewel-stack");
  assert.ok(canTapeBevel(disc));
  assert.equal(canTapeBevel(pack), false);
  assert.equal(canTapeBevel(font), false);
  assert.equal(canTapeBevel(jewels), false);

  const taped = markListingBevel(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(bevelCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingBevelOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingBevelOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingBevelOverlay("dl-booth-font", taped), false);
  assert.equal(isListingBevelOverlay("mdb-jewel-stack", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, font, gift, zine, chair, and overlay-owned rows refuse a bevel write", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(BEVEL_CHAIR_ID);
  const jewels = listingById("mdb-jewel-stack");
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeBevel(pack), false);
  assert.equal(canTapeBevel(font), false);
  assert.equal(canTapeBevel(gift), false);
  assert.equal(canTapeBevel(zine), false);
  assert.equal(canTapeBevel(chair), false);
  assert.equal(canTapeBevel(jewels), false);
  assert.equal(canTapeBevel(mug), false);

  assert.equal(markListingBevel(pack, []), null);
  assert.equal(markListingBevel(font, []), null);
  assert.equal(markListingBevel(gift, []), null);
  assert.equal(markListingBevel(zine, []), null);
  assert.equal(markListingBevel(chair, []), null);
  assert.equal(markListingBevel(jewels, []), null);
  assert.equal(markListingBevel(mug, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const disc = listingById("ysk-burned-cdr");
  assert.ok(disc);
  const before = {
    price: disc.price,
    status: disc.status,
    cartEligible: disc.cartEligible,
  };
  const taped = markListingBevel(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingBevel(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(bevelCookieValue(cleared), "[]");
  assert.equal(isListingBevelOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const taped = markListingBevel(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingBevel(pack, []), null);

  const cleared = clearListingBevel(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
