import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONTENTS_STORAGE_KEY } from "./listing-contents";
import { CUE_STORAGE_KEY } from "./listing-cue";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { OVERBURN_STORAGE_KEY } from "./listing-overburn";
import {
  PREGAP_CHAIR_ID,
  PREGAP_COOKIE_NAME,
  PREGAP_HOST_ID,
  PREGAP_LEAVE_LINE,
  PREGAP_LINER_ID,
  PREGAP_MIXTAPE_ID,
  PREGAP_NOTICE_TITLE,
  PREGAP_PACK_ID,
  PREGAP_STORAGE_KEY,
  PREGAP_ZINE_ID,
  canTapePregap,
  clearListingPregap,
  isListingPregapOverlay,
  markListingPregap,
  parsePregapListingIds,
  pregapCookieValue,
  writePregapListingIds,
} from "./listing-pregap";

test("cookie and storage keys stay the pregap paper names", () => {
  assert.equal(PREGAP_STORAGE_KEY, "iss:pregap-listing-ids");
  assert.equal(PREGAP_COOKIE_NAME, "iss-pregap-listing-ids");
  assert.equal(PREGAP_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    PREGAP_NOTICE_TITLE,
    "I will not pregap it. Still a burn. Still scratched.",
  );
  assert.equal(PREGAP_LEAVE_LINE, "Leave the burn");
  assert.notEqual(PREGAP_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, FINALIZE_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, CONTENTS_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, ERASE_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, "iss:encode-listing-ids");
  assert.notEqual(PREGAP_STORAGE_KEY, "iss:session-listing-ids");
});

test("write-result objects never parse as a pregap set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parsePregapListingIds(writeResult), []);
  assert.equal(
    isListingPregapOverlay(
      "ysk-burned-cdr",
      parsePregapListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = pregapCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parsePregapListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("CD-R tapes; pack, mixtape, and liner stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(PREGAP_PACK_ID);
  const mixtape = listingById(PREGAP_MIXTAPE_ID);
  const liner = listingById(PREGAP_LINER_ID);
  assert.ok(canTapePregap(disc));
  assert.equal(canTapePregap(pack), false);
  assert.equal(canTapePregap(mixtape), false);
  assert.equal(canTapePregap(liner), false);

  const taped = markListingPregap(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(pregapCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingPregapOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingPregapOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingPregapOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingPregapOverlay("dl-crate-side-a", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, mixtape, liner, gift, zine, chair, and overlay-owned rows refuse a pregap write", () => {
  const pack = listingById(PREGAP_PACK_ID);
  const mixtape = listingById(PREGAP_MIXTAPE_ID);
  const liner = listingById(PREGAP_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById(PREGAP_ZINE_ID);
  const chair = listingById(PREGAP_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapePregap(pack), false);
  assert.equal(canTapePregap(mixtape), false);
  assert.equal(canTapePregap(liner), false);
  assert.equal(canTapePregap(gift), false);
  assert.equal(canTapePregap(zine), false);
  assert.equal(canTapePregap(chair), false);
  assert.equal(canTapePregap(mug), false);

  assert.equal(markListingPregap(pack, []), null);
  assert.equal(markListingPregap(mixtape, []), null);
  assert.equal(markListingPregap(liner, []), null);
  assert.equal(markListingPregap(gift, []), null);
  assert.equal(markListingPregap(zine, []), null);
  assert.equal(markListingPregap(chair, []), null);
  assert.equal(markListingPregap(mug, []), null);
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
  const taped = markListingPregap(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingPregap(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(pregapCookieValue(cleared), "[]");
  assert.equal(isListingPregapOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById(PREGAP_PACK_ID);
  const taped = markListingPregap(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingPregap(pack, []), null);

  const cleared = clearListingPregap(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PREGAP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingPregap(chair, []), null);
});

test("write never touches cue, encode, overburn, or finalize storage keys", () => {
  writePregapListingIds(["ysk-burned-cdr"]);
  assert.equal(PREGAP_STORAGE_KEY, "iss:pregap-listing-ids");
  assert.equal(CUE_STORAGE_KEY, "iss:cue-listing-ids");
  assert.equal(OVERBURN_STORAGE_KEY, "iss:overburn-listing-ids");
  assert.equal(FINALIZE_STORAGE_KEY, "iss:finalize-listing-ids");
  assert.notEqual(PREGAP_STORAGE_KEY, CUE_STORAGE_KEY);
  assert.notEqual(PREGAP_STORAGE_KEY, OVERBURN_STORAGE_KEY);
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-cue-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-encode-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-overburn-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-finalize-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-contents-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-erase-listing-ids");
  assert.notEqual(PREGAP_COOKIE_NAME, "iss-session-listing-ids");
});
