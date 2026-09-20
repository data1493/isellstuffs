import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANTISTAT_STORAGE_KEY } from "./listing-antistat";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import { HONE_STORAGE_KEY } from "./listing-hone";
import { RINSE_STORAGE_KEY } from "./listing-rinse";
import { SCRAPE_STORAGE_KEY } from "./listing-scrape";
import { WARP_STORAGE_KEY } from "./listing-warp";
import {
  VACUUM_CHAIR_ID,
  VACUUM_COOKIE_NAME,
  VACUUM_HOST_ID,
  VACUUM_LEAVE_LINE,
  VACUUM_NOTICE_TITLE,
  VACUUM_STORAGE_KEY,
  canTapeVacuum,
  clearListingVacuum,
  isListingVacuumOverlay,
  markListingVacuum,
  parseVacuumListingIds,
  vacuumCookieValue,
} from "./listing-vacuum";

test("cookie and storage keys stay the vacuum paper names", () => {
  assert.equal(VACUUM_STORAGE_KEY, "iss:vacuum-listing-ids");
  assert.equal(VACUUM_COOKIE_NAME, "iss-vacuum-listing-ids");
  assert.equal(VACUUM_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    VACUUM_NOTICE_TITLE,
    "I will not vacuum it. Still a skip. Still a grocery bag.",
  );
  assert.equal(VACUUM_LEAVE_LINE, "Leave the skip");
  assert.notEqual(VACUUM_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(VACUUM_STORAGE_KEY, ANTISTAT_STORAGE_KEY);
  assert.notEqual(VACUUM_STORAGE_KEY, RINSE_STORAGE_KEY);
  assert.notEqual(VACUUM_STORAGE_KEY, WARP_STORAGE_KEY);
  assert.notEqual(VACUUM_STORAGE_KEY, SCRAPE_STORAGE_KEY);
  assert.notEqual(VACUUM_STORAGE_KEY, ERASE_STORAGE_KEY);
});

test("write-result objects never parse as a vacuum set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseVacuumListingIds(writeResult), []);
  assert.equal(
    isListingVacuumOverlay(
      "mdb-scratched-lp",
      parseVacuumListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = vacuumCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseVacuumListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeVacuum(lp));
  assert.equal(canTapeVacuum(mixtape), false);
  assert.equal(canTapeVacuum(jewels), false);
  assert.equal(canTapeVacuum(liner), false);

  const taped = markListingVacuum(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(vacuumCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingVacuumOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingVacuumOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingVacuumOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingVacuumOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a vacuum write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(VACUUM_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeVacuum(mixtape), false);
  assert.equal(canTapeVacuum(jewels), false);
  assert.equal(canTapeVacuum(liner), false);
  assert.equal(canTapeVacuum(chair), false);
  assert.equal(canTapeVacuum(gift), false);
  assert.equal(canTapeVacuum(zine), false);
  assert.equal(canTapeVacuum(junk), false);
  assert.equal(canTapeVacuum(lamp), false);

  assert.equal(markListingVacuum(mixtape, []), null);
  assert.equal(markListingVacuum(jewels, []), null);
  assert.equal(markListingVacuum(liner, []), null);
  assert.equal(markListingVacuum(chair, []), null);
  assert.equal(markListingVacuum(gift, []), null);
  assert.equal(markListingVacuum(zine, []), null);
  assert.equal(markListingVacuum(junk, []), null);
  assert.equal(markListingVacuum(lamp, []), null);
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
  const taped = markListingVacuum(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingVacuum(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(vacuumCookieValue(cleared), "[]");
  assert.equal(isListingVacuumOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingVacuum(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );

  const cleared = clearListingVacuum(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(VACUUM_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingVacuum(chair, []), null);
});
