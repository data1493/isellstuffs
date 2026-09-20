import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  CUE_BOY_ID,
  CUE_CHAIR_ID,
  CUE_COOKIE_NAME,
  CUE_HOST_ID,
  CUE_JEWELS_ID,
  CUE_LEAVE_LINE,
  CUE_NOTICE_TITLE,
  CUE_PACK_ID,
  CUE_STORAGE_KEY,
  canTapeCue,
  clearListingCue,
  cueCookieValue,
  isListingCueOverlay,
  markListingCue,
  parseCueListingIds,
} from "./listing-cue";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { OVERBURN_STORAGE_KEY } from "./listing-overburn";

test("cookie and storage keys stay the cue paper names", () => {
  assert.equal(CUE_STORAGE_KEY, "iss:cue-listing-ids");
  assert.equal(CUE_COOKIE_NAME, "iss-cue-listing-ids");
  assert.equal(CUE_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    CUE_NOTICE_TITLE,
    "I will not cue it. Still a Sharpie. Still a skip.",
  );
  assert.equal(CUE_LEAVE_LINE, "Leave the Sharpie");
  assert.notEqual(CUE_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(CUE_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(CUE_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(CUE_STORAGE_KEY, "iss:author-listing-ids");
});

test("write-result objects never parse as a cue set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseCueListingIds(writeResult), []);
  assert.equal(
    isListingCueOverlay(
      "ysk-burned-cdr",
      parseCueListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = cueCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseCueListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("disc tapes; Game Boy, jewels, and pack stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const boy = listingById(CUE_BOY_ID);
  const jewels = listingById(CUE_JEWELS_ID);
  const pack = listingById(CUE_PACK_ID);

  assert.ok(canTapeCue(disc));
  assert.equal(canTapeCue(boy), false);
  assert.equal(canTapeCue(jewels), false);
  assert.equal(canTapeCue(pack), false);

  const taped = markListingCue(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(cueCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingCueOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingCueOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingCueOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingCueOverlay("dl-sample-pack", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, gift, Game Boy, jewels, and chair refuse a cue write", () => {
  const pack = listingById(CUE_PACK_ID);
  const gift = listingById("dl-mall-gift-card");
  const boy = listingById(CUE_BOY_ID);
  const jewels = listingById(CUE_JEWELS_ID);
  const chair = listingById(CUE_CHAIR_ID);

  assert.equal(canTapeCue(pack), false);
  assert.equal(canTapeCue(gift), false);
  assert.equal(canTapeCue(boy), false);
  assert.equal(canTapeCue(jewels), false);
  assert.equal(canTapeCue(chair), false);

  assert.equal(markListingCue(pack, []), null);
  assert.equal(markListingCue(gift, []), null);
  assert.equal(markListingCue(boy, []), null);
  assert.equal(markListingCue(jewels, []), null);
  assert.equal(markListingCue(chair, []), null);
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const disc = listingById("ysk-burned-cdr");
  assert.ok(disc);
  const before = {
    price: disc.price,
    status: disc.status,
    cartEligible: disc.cartEligible,
  };
  const taped = markListingCue(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingCue(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(cueCookieValue(cleared), "[]");
  assert.equal(isListingCueOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(CUE_PACK_ID);
  const taped = markListingCue(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingCue(pack, []), null);

  const cleared = clearListingCue(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(CUE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingCue(chair, []), null);
});

test("cue write never aliases finalize or overburn paper", () => {
  assert.notEqual(CUE_STORAGE_KEY, "iss:finalize-listing-ids");
  assert.notEqual(CUE_STORAGE_KEY, "iss:overburn-listing-ids");
  assert.notEqual(CUE_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(CUE_STORAGE_KEY, "iss:author-listing-ids");
  assert.notEqual(CUE_STORAGE_KEY, "iss:contents-listing-ids");
  assert.notEqual(CUE_COOKIE_NAME, "iss-finalize-listing-ids");
  assert.notEqual(CUE_COOKIE_NAME, "iss-overburn-listing-ids");
});
