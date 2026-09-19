import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BAKE_STORAGE_KEY } from "./listing-bake";
import { CINCH_STORAGE_KEY } from "./listing-cinch";
import { DUB_STORAGE_KEY } from "./listing-dub";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { HISS_STORAGE_KEY } from "./listing-hiss";
import { SPLICE_STORAGE_KEY } from "./listing-splice";
import {
  AZIMUTH_COOKIE_NAME,
  AZIMUTH_HOST_ID,
  AZIMUTH_LEAVE_LINE,
  AZIMUTH_NOTICE_TITLE,
  AZIMUTH_STORAGE_KEY,
  azimuthCookieValue,
  canTapeAzimuth,
  clearListingAzimuth,
  isListingAzimuthOverlay,
  markListingAzimuth,
  parseAzimuthListingIds,
} from "./listing-azimuth";

test("cookie and storage keys stay the azimuth paper names", () => {
  assert.equal(AZIMUTH_STORAGE_KEY, "iss:azimuth-listing-ids");
  assert.equal(AZIMUTH_COOKIE_NAME, "iss-azimuth-listing-ids");
  assert.equal(AZIMUTH_HOST_ID, "mdb-mixtape-93");
  assert.equal(
    AZIMUTH_NOTICE_TITLE,
    "I will not azimuth it. Still hiss. Still 93.",
  );
  assert.equal(AZIMUTH_LEAVE_LINE, "Leave the heading");
  assert.notEqual(AZIMUTH_STORAGE_KEY, HISS_STORAGE_KEY);
  assert.notEqual(AZIMUTH_STORAGE_KEY, SPLICE_STORAGE_KEY);
  assert.notEqual(AZIMUTH_STORAGE_KEY, BAKE_STORAGE_KEY);
  assert.notEqual(AZIMUTH_STORAGE_KEY, DUB_STORAGE_KEY);
  assert.notEqual(AZIMUTH_STORAGE_KEY, CINCH_STORAGE_KEY);
  assert.notEqual(AZIMUTH_STORAGE_KEY, FINALIZE_STORAGE_KEY);
});

test("write-result objects never parse as an azimuth set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseAzimuthListingIds(writeResult), []);
  assert.equal(
    isListingAzimuthOverlay(
      "mdb-mixtape-93",
      parseAzimuthListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = azimuthCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseAzimuthListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("mixtape tapes; LP, jacket, and drawer stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById("mdb-scratched-lp");
  const jacket = listingById("clo-windbreaker");
  const drawer = listingById("gtk-cable-drawer");
  assert.ok(canTapeAzimuth(mixtape));
  assert.equal(canTapeAzimuth(lp), false);
  assert.equal(canTapeAzimuth(jacket), false);
  assert.equal(canTapeAzimuth(drawer), false);

  const taped = markListingAzimuth(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(azimuthCookieValue(taped), '["mdb-mixtape-93"]');
  assert.equal(isListingAzimuthOverlay("mdb-mixtape-93", taped), true);
  assert.equal(isListingAzimuthOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingAzimuthOverlay("clo-windbreaker", taped), false);
  assert.equal(isListingAzimuthOverlay("gtk-cable-drawer", taped), false);
  assert.equal(mixtape?.cartEligible, true);
  assert.equal(mixtape?.status, "available");
  assert.equal(mixtape?.price.amountCents, 400);
});

test("LP, liner PDF, gift, zine, and overlay-owned rows refuse an azimuth write", () => {
  const lp = listingById("mdb-scratched-lp");
  const liner = listingById("dl-crate-side-a");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");

  assert.equal(canTapeAzimuth(lp), false);
  assert.equal(canTapeAzimuth(liner), false);
  assert.equal(canTapeAzimuth(gift), false);
  assert.equal(canTapeAzimuth(zine), false);
  assert.equal(canTapeAzimuth(jacket), false);
  assert.equal(canTapeAzimuth(soles), false);
  assert.equal(canTapeAzimuth(drawer), false);
  assert.equal(canTapeAzimuth(disc), false);

  assert.equal(markListingAzimuth(lp, []), null);
  assert.equal(markListingAzimuth(liner, []), null);
  assert.equal(markListingAzimuth(gift, []), null);
  assert.equal(markListingAzimuth(zine, []), null);
  assert.equal(markListingAzimuth(jacket, []), null);
  assert.equal(markListingAzimuth(soles, []), null);
  assert.equal(markListingAzimuth(drawer, []), null);
  assert.equal(markListingAzimuth(disc, []), null);
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
  const taped = markListingAzimuth(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const cleared = clearListingAzimuth(mixtape, ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(azimuthCookieValue(cleared), "[]");
  assert.equal(isListingAzimuthOverlay("mdb-mixtape-93", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingAzimuth(mixtape, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingAzimuth(mixtape, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
