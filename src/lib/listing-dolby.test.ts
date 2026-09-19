import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DEGAUSS_STORAGE_KEY } from "./listing-degauss";
import {
  DOLBY_CHAIR_ID,
  DOLBY_COOKIE_NAME,
  DOLBY_HOST_ID,
  DOLBY_LEAVE_LINE,
  DOLBY_NOTICE_TITLE,
  DOLBY_STORAGE_KEY,
  canTapeDolby,
  clearListingDolby,
  dolbyCookieValue,
  isListingDolbyOverlay,
  markListingDolby,
  parseDolbyListingIds,
} from "./listing-dolby";
import { HISS_STORAGE_KEY } from "./listing-hiss";

test("cookie and storage keys stay the Dolby paper names", () => {
  assert.equal(DOLBY_STORAGE_KEY, "iss:dolby-listing-ids");
  assert.equal(DOLBY_COOKIE_NAME, "iss-dolby-listing-ids");
  assert.equal(DOLBY_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    DOLBY_NOTICE_TITLE,
    "I will not Dolby it. Still hiss. Still SUMMER 93.",
  );
  assert.equal(DOLBY_LEAVE_LINE, "Leave the hiss");
  assert.notEqual(DOLBY_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(DOLBY_STORAGE_KEY, DEGAUSS_STORAGE_KEY);
});

test("write-result objects never parse as a Dolby set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseDolbyListingIds(writeResult), []);
  assert.equal(
    isListingDolbyOverlay(
      "mdb-mixtape-93",
      parseDolbyListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = dolbyCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseDolbyListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, CD-R, and liner stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById("mdb-scratched-lp");
  const cdr = listingById("ysk-burned-cdr");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeDolby(mixtape));
  assert.equal(canTapeDolby(lp), false);
  assert.equal(canTapeDolby(cdr), false);
  assert.equal(canTapeDolby(liner), false);

  const taped = markListingDolby(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(dolbyCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingDolbyOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingDolbyOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingDolbyOverlay("ysk-burned-cdr", taped), false);
  assert.equal(isListingDolbyOverlay("dl-crate-side-a", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, liner PDF, gift, zine, chair, and overlay-owned rows refuse a Dolby write", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById("dl-crate-side-a");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(DOLBY_CHAIR_ID);
  const cdr = listingById("ysk-burned-cdr");
  const jacket = listingById("clo-windbreaker");

  assert.equal(canTapeDolby(lp), false);
  assert.equal(canTapeDolby(liner), false);
  assert.equal(canTapeDolby(gift), false);
  assert.equal(canTapeDolby(zine), false);
  assert.equal(canTapeDolby(chair), false);
  assert.equal(canTapeDolby(cdr), false);
  assert.equal(canTapeDolby(jacket), false);

  assert.equal(markListingDolby(lp, []), null);
  assert.equal(markListingDolby(liner, []), null);
  assert.equal(markListingDolby(gift, []), null);
  assert.equal(markListingDolby(zine, []), null);
  assert.equal(markListingDolby(chair, []), null);
  assert.equal(markListingDolby(cdr, []), null);
  assert.equal(markListingDolby(jacket, []), null);
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
  const taped = markListingDolby(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingDolby(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(dolbyCookieValue(cleared), "[]");
  assert.equal(isListingDolbyOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingDolby(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingDolby(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
