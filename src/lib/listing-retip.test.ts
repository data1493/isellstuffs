import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ZENITH_STORAGE_KEY } from "./listing-zenith";
import {
  RETIP_CHAIR_ID,
  RETIP_COOKIE_NAME,
  RETIP_HOST_ID,
  RETIP_LEAVE_LINE,
  RETIP_NOTICE_TITLE,
  RETIP_STORAGE_KEY,
  canTapeRetip,
  clearListingRetip,
  isListingRetipOverlay,
  markListingRetip,
  parseRetipListingIds,
  retipCookieValue,
} from "./listing-retip";

test("cookie and storage keys stay the retip paper names", () => {
  assert.equal(RETIP_STORAGE_KEY, "iss:retip-listing-ids");
  assert.equal(RETIP_COOKIE_NAME, "iss-retip-listing-ids");
  assert.equal(RETIP_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    RETIP_NOTICE_TITLE,
    "I will not retip it. Still a skip. Still unnamed.",
  );
  assert.equal(RETIP_LEAVE_LINE, "Leave the skip");
  assert.notEqual(RETIP_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(RETIP_STORAGE_KEY, ZENITH_STORAGE_KEY);
  assert.notEqual(RETIP_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
});

test("write-result objects never parse as a retip set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseRetipListingIds(writeResult), []);
  assert.equal(
    isListingRetipOverlay(
      "mdb-scratched-lp",
      parseRetipListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = retipCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseRetipListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeRetip(lp));
  assert.equal(canTapeRetip(mixtape), false);
  assert.equal(canTapeRetip(jewels), false);
  assert.equal(canTapeRetip(liner), false);

  const taped = markListingRetip(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(retipCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingRetipOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingRetipOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingRetipOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingRetipOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a retip write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(RETIP_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeRetip(mixtape), false);
  assert.equal(canTapeRetip(jewels), false);
  assert.equal(canTapeRetip(liner), false);
  assert.equal(canTapeRetip(chair), false);
  assert.equal(canTapeRetip(gift), false);
  assert.equal(canTapeRetip(zine), false);
  assert.equal(canTapeRetip(junk), false);
  assert.equal(canTapeRetip(lamp), false);

  assert.equal(markListingRetip(mixtape, []), null);
  assert.equal(markListingRetip(jewels, []), null);
  assert.equal(markListingRetip(liner, []), null);
  assert.equal(markListingRetip(chair, []), null);
  assert.equal(markListingRetip(gift, []), null);
  assert.equal(markListingRetip(zine, []), null);
  assert.equal(markListingRetip(junk, []), null);
  assert.equal(markListingRetip(lamp, []), null);
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
  const taped = markListingRetip(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingRetip(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(retipCookieValue(cleared), "[]");
  assert.equal(isListingRetipOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingRetip(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );

  const cleared = clearListingRetip(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(RETIP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRetip(chair, []), null);
});
