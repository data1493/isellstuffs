import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FOAM_STORAGE_KEY } from "./listing-foam";
import { NEST_STORAGE_KEY } from "./listing-nest";
import {
  FLOCK_CHAIR_ID,
  FLOCK_COOKIE_NAME,
  FLOCK_HOST_ID,
  FLOCK_LEAVE_LINE,
  FLOCK_NOTICE_TITLE,
  FLOCK_STORAGE_KEY,
  canTapeFlock,
  clearListingFlock,
  flockCookieValue,
  isListingFlockOverlay,
  markListingFlock,
  parseFlockListingIds,
} from "./listing-flock";

test("cookie and storage keys stay the flock paper names", () => {
  assert.equal(FLOCK_STORAGE_KEY, "iss:flock-listing-ids");
  assert.equal(FLOCK_COOKIE_NAME, "iss-flock-listing-ids");
  assert.equal(FLOCK_HOST_ID, "mdb-jewel-stack");
  assert.equal(
    FLOCK_NOTICE_TITLE,
    "I will not flock them. Still empty. Still one crack.",
  );
  assert.equal(FLOCK_LEAVE_LINE, "Leave the empties");
  assert.notEqual(FLOCK_STORAGE_KEY, FOAM_STORAGE_KEY);
  assert.notEqual(FLOCK_STORAGE_KEY, NEST_STORAGE_KEY);
});

test("write-result objects never parse as a flock set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-jewel-stack"],
  });
  assert.deepEqual(parseFlockListingIds(writeResult), []);
  assert.equal(
    isListingFlockOverlay("mdb-jewel-stack", parseFlockListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = flockCookieValue(["mdb-jewel-stack", "mdb-jewel-stack", ""]);
  assert.equal(raw, '["mdb-jewel-stack"]');
  assert.deepEqual(parseFlockListingIds(raw), ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jewel stack tapes; LP, mixtape, and sample pack stay off that cookie", () => {
  const jewels = listingById("mdb-jewel-stack");
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const pack = listingById("dl-sample-pack");

  assert.ok(canTapeFlock(jewels));
  assert.equal(canTapeFlock(lp), false);
  assert.equal(canTapeFlock(mixtape), false);
  assert.equal(canTapeFlock(pack), false);

  const taped = markListingFlock(jewels, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  assert.equal(flockCookieValue(taped), '["mdb-jewel-stack"]');
  assert.equal(isListingFlockOverlay("mdb-jewel-stack", taped), true);
  assert.equal(isListingFlockOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingFlockOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingFlockOverlay("dl-sample-pack", taped), false);
  assert.equal(jewels?.cartEligible, true);
  assert.equal(jewels?.status, "available");
  assert.equal(jewels?.price.amountCents, 250);
});

test("LP, mixtape, pack, gift, zine, and chair refuse a flock write", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FLOCK_CHAIR_ID);

  assert.equal(canTapeFlock(lp), false);
  assert.equal(canTapeFlock(mixtape), false);
  assert.equal(canTapeFlock(pack), false);
  assert.equal(canTapeFlock(gift), false);
  assert.equal(canTapeFlock(zine), false);
  assert.equal(canTapeFlock(chair), false);

  assert.equal(markListingFlock(lp, []), null);
  assert.equal(markListingFlock(mixtape, []), null);
  assert.equal(markListingFlock(pack, []), null);
  assert.equal(markListingFlock(gift, []), null);
  assert.equal(markListingFlock(zine, []), null);
  assert.equal(markListingFlock(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jewels = listingById("mdb-jewel-stack");
  assert.ok(jewels);
  const before = {
    price: jewels.price,
    status: jewels.status,
    cartEligible: jewels.cartEligible,
  };
  const taped = markListingFlock(jewels, []);
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  const after = listingById("mdb-jewel-stack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jewel-stack id", () => {
  const jewels = listingById("mdb-jewel-stack");
  const cleared = clearListingFlock(jewels, ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(flockCookieValue(cleared), "[]");
  assert.equal(isListingFlockOverlay("mdb-jewel-stack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jewels = listingById("mdb-jewel-stack");
  const pack = listingById("dl-sample-pack");
  const taped = markListingFlock(jewels, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingFlock(pack, []), null);

  const cleared = clearListingFlock(jewels, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FLOCK_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFlock(chair, []), null);
});
