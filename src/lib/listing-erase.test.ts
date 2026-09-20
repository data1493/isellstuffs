import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BAKE_STORAGE_KEY } from "./listing-bake";
import { DEGAUSS_STORAGE_KEY } from "./listing-degauss";
import { DUB_STORAGE_KEY } from "./listing-dub";
import {
  ERASE_CHAIR_ID,
  ERASE_COOKIE_NAME,
  ERASE_HOST_ID,
  ERASE_JEWELS_ID,
  ERASE_LEAVE_LINE,
  ERASE_LINER_ID,
  ERASE_LP_ID,
  ERASE_NOTICE_TITLE,
  ERASE_STORAGE_KEY,
  canTapeErase,
  clearListingErase,
  eraseCookieValue,
  isListingEraseOverlay,
  markListingErase,
  parseEraseListingIds,
} from "./listing-erase";
import { PINCH_STORAGE_KEY } from "./listing-pinch";
import { RECASE_STORAGE_KEY } from "./listing-recase";

test("cookie and storage keys stay the erase paper names", () => {
  assert.equal(ERASE_STORAGE_KEY, "iss:erase-listing-ids");
  assert.equal(ERASE_COOKIE_NAME, "iss-erase-listing-ids");
  assert.equal(ERASE_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    ERASE_NOTICE_TITLE,
    "I will not erase it. Still a radio edit. Still hiss.",
  );
  assert.equal(ERASE_LEAVE_LINE, "Leave the radio edit");
  assert.notEqual(ERASE_STORAGE_KEY, DEGAUSS_STORAGE_KEY);
  assert.notEqual(ERASE_STORAGE_KEY, DUB_STORAGE_KEY);
  assert.notEqual(ERASE_STORAGE_KEY, BAKE_STORAGE_KEY);
  assert.notEqual(ERASE_STORAGE_KEY, RECASE_STORAGE_KEY);
  assert.notEqual(ERASE_STORAGE_KEY, PINCH_STORAGE_KEY);
});

test("write-result objects never parse as an erase set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseEraseListingIds(writeResult), []);
  assert.equal(
    isListingEraseOverlay(
      "mdb-mixtape-93",
      parseEraseListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = eraseCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseEraseListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jewels, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById(ERASE_LP_ID);
  const jewels = listingById(ERASE_JEWELS_ID);
  const liner = listingById(ERASE_LINER_ID);
  assert.ok(canTapeErase(mixtape));
  assert.equal(canTapeErase(lp), false);
  assert.equal(canTapeErase(jewels), false);
  assert.equal(canTapeErase(liner), false);

  const taped = markListingErase(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(eraseCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingEraseOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingEraseOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingEraseOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingEraseOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, jewels, liner PDF, gift, zine, chair, and overlay-owned rows refuse an erase write", () => {
  const lp = listingById(ERASE_LP_ID);
  const jewels = listingById(ERASE_JEWELS_ID);
  const liner = listingById(ERASE_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(ERASE_CHAIR_ID);
  const mug = listingById("kdr-chipped-mug");

  assert.equal(canTapeErase(lp), false);
  assert.equal(canTapeErase(jewels), false);
  assert.equal(canTapeErase(liner), false);
  assert.equal(canTapeErase(gift), false);
  assert.equal(canTapeErase(zine), false);
  assert.equal(canTapeErase(chair), false);
  assert.equal(canTapeErase(mug), false);

  assert.equal(markListingErase(lp, []), null);
  assert.equal(markListingErase(jewels, []), null);
  assert.equal(markListingErase(liner, []), null);
  assert.equal(markListingErase(gift, []), null);
  assert.equal(markListingErase(zine, []), null);
  assert.equal(markListingErase(chair, []), null);
  assert.equal(markListingErase(mug, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(mixtape);
  const before = {
    price: mixtape.price,
    status: mixtape.status,
    cartEligible: mixtape.cartEligible,
  };
  const taped = markListingErase(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingErase(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(eraseCookieValue(cleared), "[]");
  assert.equal(isListingEraseOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingErase(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingErase(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
