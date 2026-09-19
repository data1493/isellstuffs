import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BAKE_STORAGE_KEY } from "./listing-bake";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import {
  DEGAUSS_COOKIE_NAME,
  DEGAUSS_HOST_ID,
  DEGAUSS_LEAVE_LINE,
  DEGAUSS_NOTICE_TITLE,
  DEGAUSS_STORAGE_KEY,
  canTapeDegauss,
  clearListingDegauss,
  degaussCookieValue,
  isListingDegaussOverlay,
  markListingDegauss,
  parseDegaussListingIds,
} from "./listing-degauss";
import { SPLICE_STORAGE_KEY } from "./listing-splice";

test("cookie and storage keys stay the degauss paper names", () => {
  assert.equal(DEGAUSS_STORAGE_KEY, "iss:degauss-listing-ids");
  assert.equal(DEGAUSS_COOKIE_NAME, "iss-degauss-listing-ids");
  assert.equal(DEGAUSS_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    DEGAUSS_NOTICE_TITLE,
    "I will not degauss it. Still hiss. Still fading ink.",
  );
  assert.equal(DEGAUSS_LEAVE_LINE, "Leave the tape");
  assert.notEqual(DEGAUSS_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(DEGAUSS_STORAGE_KEY, BAKE_STORAGE_KEY);
  assert.notEqual(DEGAUSS_STORAGE_KEY, SPLICE_STORAGE_KEY);
});

test("write-result objects never parse as a degauss set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseDegaussListingIds(writeResult), []);
  assert.equal(
    isListingDegaussOverlay(
      "mdb-mixtape-93",
      parseDegaussListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = degaussCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseDegaussListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jacket, and drawer stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById("mdb-scratched-lp");
  const jacket = listingById("clo-windbreaker");
  const drawer = listingById("gtk-cable-drawer");
  assert.ok(canTapeDegauss(mixtape));
  assert.equal(canTapeDegauss(lp), false);
  assert.equal(canTapeDegauss(jacket), false);
  assert.equal(canTapeDegauss(drawer), false);

  const taped = markListingDegauss(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(degaussCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingDegaussOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingDegaussOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingDegaussOverlay("clo-windbreaker", taped), false);
  assert.equal(isListingDegaussOverlay("gtk-cable-drawer", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, liner PDF, gift, zine, and overlay-owned rows refuse a degauss write", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById("dl-crate-side-a");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");

  assert.equal(canTapeDegauss(lp), false);
  assert.equal(canTapeDegauss(liner), false);
  assert.equal(canTapeDegauss(gift), false);
  assert.equal(canTapeDegauss(zine), false);
  assert.equal(canTapeDegauss(jacket), false);
  assert.equal(canTapeDegauss(soles), false);
  assert.equal(canTapeDegauss(drawer), false);
  assert.equal(canTapeDegauss(disc), false);

  assert.equal(markListingDegauss(lp, []), null);
  assert.equal(markListingDegauss(liner, []), null);
  assert.equal(markListingDegauss(gift, []), null);
  assert.equal(markListingDegauss(zine, []), null);
  assert.equal(markListingDegauss(jacket, []), null);
  assert.equal(markListingDegauss(soles, []), null);
  assert.equal(markListingDegauss(drawer, []), null);
  assert.equal(markListingDegauss(disc, []), null);
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
  const taped = markListingDegauss(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingDegauss(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(degaussCookieValue(cleared), "[]");
  assert.equal(isListingDegaussOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingDegauss(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingDegauss(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
