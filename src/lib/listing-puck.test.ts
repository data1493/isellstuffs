import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { SKIP_STORAGE_KEY } from "./listing-skip";
import { WARP_STORAGE_KEY } from "./listing-warp";
import {
  PUCK_CHAIR_ID,
  PUCK_COOKIE_NAME,
  PUCK_HOST_ID,
  PUCK_LEAVE_LINE,
  PUCK_NOTICE_TITLE,
  PUCK_STORAGE_KEY,
  canTapePuck,
  clearListingPuck,
  isListingPuckOverlay,
  markListingPuck,
  parsePuckListingIds,
  puckCookieValue,
} from "./listing-puck";

test("cookie and storage keys stay the puck paper names", () => {
  assert.equal(PUCK_STORAGE_KEY, "iss:puck-listing-ids");
  assert.equal(PUCK_COOKIE_NAME, "iss-puck-listing-ids");
  assert.equal(PUCK_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    PUCK_NOTICE_TITLE,
    "I will not puck it. Still a skip. Still a grocery bag.",
  );
  assert.equal(PUCK_LEAVE_LINE, "Leave the skip");
  assert.notEqual(PUCK_STORAGE_KEY, SKIP_STORAGE_KEY);
  assert.notEqual(PUCK_STORAGE_KEY, WARP_STORAGE_KEY);
});

test("write-result objects never parse as a puck set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parsePuckListingIds(writeResult), []);
  assert.equal(
    isListingPuckOverlay(
      "mdb-scratched-lp",
      parsePuckListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = puckCookieValue(["mdb-scratched-lp", "mdb-scratched-lp", ""]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parsePuckListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapePuck(lp));
  assert.equal(canTapePuck(mixtape), false);
  assert.equal(canTapePuck(jewels), false);
  assert.equal(canTapePuck(liner), false);

  const taped = markListingPuck(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(puckCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingPuckOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingPuckOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingPuckOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingPuckOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a puck write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(PUCK_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const mug = listingById("kdr-chipped-mug");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapePuck(mixtape), false);
  assert.equal(canTapePuck(jewels), false);
  assert.equal(canTapePuck(liner), false);
  assert.equal(canTapePuck(chair), false);
  assert.equal(canTapePuck(gift), false);
  assert.equal(canTapePuck(zine), false);
  assert.equal(canTapePuck(mug), false);
  assert.equal(canTapePuck(lamp), false);

  assert.equal(markListingPuck(mixtape, []), null);
  assert.equal(markListingPuck(jewels, []), null);
  assert.equal(markListingPuck(liner, []), null);
  assert.equal(markListingPuck(chair, []), null);
  assert.equal(markListingPuck(gift, []), null);
  assert.equal(markListingPuck(zine, []), null);
  assert.equal(markListingPuck(mug, []), null);
  assert.equal(markListingPuck(lamp, []), null);
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
  const taped = markListingPuck(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingPuck(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(puckCookieValue(cleared), "[]");
  assert.equal(isListingPuckOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingPuck(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingPuck(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
