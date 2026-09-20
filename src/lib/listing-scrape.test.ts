import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANTISTAT_STORAGE_KEY } from "./listing-antistat";
import { DUST_STORAGE_KEY } from "./listing-dust";
import { HONE_STORAGE_KEY } from "./listing-hone";
import { PUCK_STORAGE_KEY } from "./listing-puck";
import { RINSE_STORAGE_KEY } from "./listing-rinse";
import { SKIP_STORAGE_KEY } from "./listing-skip";
import {
  SCRAPE_CHAIR_ID,
  SCRAPE_COOKIE_NAME,
  SCRAPE_HOST_ID,
  SCRAPE_LEAVE_LINE,
  SCRAPE_NOTICE_TITLE,
  SCRAPE_STORAGE_KEY,
  canTapeScrape,
  clearListingScrape,
  isListingScrapeOverlay,
  markListingScrape,
  parseScrapeListingIds,
  scrapeCookieValue,
} from "./listing-scrape";

test("cookie and storage keys stay the scrape paper names", () => {
  assert.equal(SCRAPE_STORAGE_KEY, "iss:scrape-listing-ids");
  assert.equal(SCRAPE_COOKIE_NAME, "iss-scrape-listing-ids");
  assert.equal(SCRAPE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    SCRAPE_NOTICE_TITLE,
    "I will not scrape it. Still a scratch. Still a skip.",
  );
  assert.equal(SCRAPE_LEAVE_LINE, "Leave the scratch");
  assert.notEqual(SCRAPE_STORAGE_KEY, RINSE_STORAGE_KEY);
  assert.notEqual(SCRAPE_STORAGE_KEY, HONE_STORAGE_KEY);
  assert.notEqual(SCRAPE_STORAGE_KEY, PUCK_STORAGE_KEY);
  assert.notEqual(SCRAPE_STORAGE_KEY, DUST_STORAGE_KEY);
  assert.notEqual(SCRAPE_STORAGE_KEY, SKIP_STORAGE_KEY);
  assert.notEqual(SCRAPE_STORAGE_KEY, ANTISTAT_STORAGE_KEY);
});

test("write-result objects never parse as a scrape set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseScrapeListingIds(writeResult), []);
  assert.equal(
    isListingScrapeOverlay(
      "mdb-scratched-lp",
      parseScrapeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = scrapeCookieValue([
    "mdb-scratched-lp",
    "mdb-scratched-lp",
    "",
  ]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseScrapeListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeScrape(lp));
  assert.equal(canTapeScrape(mixtape), false);
  assert.equal(canTapeScrape(jewels), false);
  assert.equal(canTapeScrape(liner), false);

  const taped = markListingScrape(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(scrapeCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingScrapeOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingScrapeOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingScrapeOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingScrapeOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a scrape write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(SCRAPE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const junk = listingById("dl-junk-pricing-pdf");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeScrape(mixtape), false);
  assert.equal(canTapeScrape(jewels), false);
  assert.equal(canTapeScrape(liner), false);
  assert.equal(canTapeScrape(chair), false);
  assert.equal(canTapeScrape(gift), false);
  assert.equal(canTapeScrape(zine), false);
  assert.equal(canTapeScrape(junk), false);
  assert.equal(canTapeScrape(lamp), false);

  assert.equal(markListingScrape(mixtape, []), null);
  assert.equal(markListingScrape(jewels, []), null);
  assert.equal(markListingScrape(liner, []), null);
  assert.equal(markListingScrape(chair, []), null);
  assert.equal(markListingScrape(gift, []), null);
  assert.equal(markListingScrape(zine, []), null);
  assert.equal(markListingScrape(junk, []), null);
  assert.equal(markListingScrape(lamp, []), null);
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
  const taped = markListingScrape(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingScrape(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(scrapeCookieValue(cleared), "[]");
  assert.equal(isListingScrapeOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingScrape(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );

  const cleared = clearListingScrape(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(SCRAPE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingScrape(chair, []), null);
});
