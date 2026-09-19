import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { HONE_STORAGE_KEY } from "./listing-hone";
import { PUCK_STORAGE_KEY } from "./listing-puck";
import { SKIP_STORAGE_KEY } from "./listing-skip";
import { WASH_STORAGE_KEY } from "./listing-wash";
import {
  RINSE_CHAIR_ID,
  RINSE_COOKIE_NAME,
  RINSE_HOST_ID,
  RINSE_LEAVE_LINE,
  RINSE_NOTICE_TITLE,
  RINSE_STORAGE_KEY,
  canTapeRinse,
  clearListingRinse,
  isListingRinseOverlay,
  markListingRinse,
  parseRinseListingIds,
  rinseCookieValue,
} from "./listing-rinse";

test("cookie and storage keys stay the rinse paper names", () => {
  assert.equal(RINSE_STORAGE_KEY, "iss:rinse-listing-ids");
  assert.equal(RINSE_COOKIE_NAME, "iss-rinse-listing-ids");
  assert.equal(RINSE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RINSE_NOTICE_TITLE,
    "I will not rinse it. Still a skip. Still unnamed.",
  );
  assert.equal(RINSE_LEAVE_LINE, "Leave the smear");
  assert.notEqual(RINSE_STORAGE_KEY, SKIP_STORAGE_KEY);
  assert.notEqual(RINSE_STORAGE_KEY, PUCK_STORAGE_KEY);
  assert.notEqual(RINSE_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(RINSE_STORAGE_KEY, WASH_STORAGE_KEY);
});

test("write-result objects never parse as a rinse set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseRinseListingIds(writeResult), []);
  assert.equal(
    isListingRinseOverlay(
      "mdb-scratched-lp",
      parseRinseListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = rinseCookieValue(["mdb-scratched-lp", "mdb-scratched-lp", ""]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseRinseListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeRinse(lp));
  assert.equal(canTapeRinse(mixtape), false);
  assert.equal(canTapeRinse(jewels), false);
  assert.equal(canTapeRinse(liner), false);

  const taped = markListingRinse(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(rinseCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingRinseOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingRinseOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingRinseOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRinseOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a rinse write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RINSE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeRinse(mixtape), false);
  assert.equal(canTapeRinse(jewels), false);
  assert.equal(canTapeRinse(liner), false);
  assert.equal(canTapeRinse(chair), false);
  assert.equal(canTapeRinse(gift), false);
  assert.equal(canTapeRinse(zine), false);
  assert.equal(canTapeRinse(junk), false);
  assert.equal(canTapeRinse(lamp), false);

  assert.equal(markListingRinse(mixtape, []), null);
  assert.equal(markListingRinse(jewels, []), null);
  assert.equal(markListingRinse(liner, []), null);
  assert.equal(markListingRinse(chair, []), null);
  assert.equal(markListingRinse(gift, []), null);
  assert.equal(markListingRinse(zine, []), null);
  assert.equal(markListingRinse(junk, []), null);
  assert.equal(markListingRinse(lamp, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lp = listingById("mdb-scratched-lp");
  assert.ok(lp);
  const before = {
    price: lp.price,
    status: lp.status,
    cartEligible: lp.cartEligible,
  };
  const taped = markListingRinse(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingRinse(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(rinseCookieValue(cleared), "[]");
  assert.equal(isListingRinseOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingRinse(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingRinse(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
