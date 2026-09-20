import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { DUST_STORAGE_KEY } from "./listing-dust";
import { HONE_STORAGE_KEY } from "./listing-hone";
import { PUCK_STORAGE_KEY } from "./listing-puck";
import { RINSE_STORAGE_KEY } from "./listing-rinse";
import { SKIP_STORAGE_KEY } from "./listing-skip";
import {
  ANTISTAT_CHAIR_ID,
  ANTISTAT_COOKIE_NAME,
  ANTISTAT_HOST_ID,
  ANTISTAT_LEAVE_LINE,
  ANTISTAT_NOTICE_TITLE,
  ANTISTAT_STORAGE_KEY,
  antistatCookieValue,
  canTapeAntistat,
  clearListingAntistat,
  isListingAntistatOverlay,
  markListingAntistat,
  parseAntistatListingIds,
} from "./listing-antistat";

test("cookie and storage keys stay the antistat paper names", () => {
  assert.equal(ANTISTAT_STORAGE_KEY, "iss:antistat-listing-ids");
  assert.equal(ANTISTAT_COOKIE_NAME, "iss-antistat-listing-ids");
  assert.equal(ANTISTAT_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    ANTISTAT_NOTICE_TITLE,
    "I will not antistat it. Still a scratch. Still a skip.",
  );
  assert.equal(ANTISTAT_LEAVE_LINE, "Leave the scratch");
  assert.notEqual(ANTISTAT_STORAGE_KEY, RINSE_STORAGE_KEY);
  assert.notEqual(ANTISTAT_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(ANTISTAT_STORAGE_KEY, PUCK_STORAGE_KEY);
  assert.notEqual(ANTISTAT_STORAGE_KEY, DUST_STORAGE_KEY);
  assert.notEqual(ANTISTAT_STORAGE_KEY, SKIP_STORAGE_KEY);
});

test("write-result objects never parse as an antistat set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseAntistatListingIds(writeResult), []);
  assert.equal(
    isListingAntistatOverlay(
      "mdb-scratched-lp",
      parseAntistatListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = antistatCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseAntistatListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeAntistat(lp));
  assert.equal(canTapeAntistat(mixtape), false);
  assert.equal(canTapeAntistat(jewels), false);
  assert.equal(canTapeAntistat(liner), false);

  const taped = markListingAntistat(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(antistatCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingAntistatOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingAntistatOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingAntistatOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingAntistatOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse an antistat write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(ANTISTAT_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeAntistat(mixtape), false);
  assert.equal(canTapeAntistat(jewels), false);
  assert.equal(canTapeAntistat(liner), false);
  assert.equal(canTapeAntistat(chair), false);
  assert.equal(canTapeAntistat(gift), false);
  assert.equal(canTapeAntistat(zine), false);
  assert.equal(canTapeAntistat(junk), false);
  assert.equal(canTapeAntistat(lamp), false);

  assert.equal(markListingAntistat(mixtape, []), null);
  assert.equal(markListingAntistat(jewels, []), null);
  assert.equal(markListingAntistat(liner, []), null);
  assert.equal(markListingAntistat(chair, []), null);
  assert.equal(markListingAntistat(gift, []), null);
  assert.equal(markListingAntistat(zine, []), null);
  assert.equal(markListingAntistat(junk, []), null);
  assert.equal(markListingAntistat(lamp, []), null);
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
  const taped = markListingAntistat(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingAntistat(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(antistatCookieValue(cleared), "[]");
  assert.equal(isListingAntistatOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingAntistat(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );

  const cleared = clearListingAntistat(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ANTISTAT_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingAntistat(chair, []), null);
});
