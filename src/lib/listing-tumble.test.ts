import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FOAM_STORAGE_KEY } from "./listing-foam";
import { NEST_STORAGE_KEY } from "./listing-nest";
import { FLOCK_STORAGE_KEY } from "./listing-flock";
import {
  TUMBLE_CHAIR_ID,
  TUMBLE_COOKIE_NAME,
  TUMBLE_HOST_ID,
  TUMBLE_LEAVE_LINE,
  TUMBLE_LINER_ID,
  TUMBLE_NOTICE_TITLE,
  TUMBLE_STORAGE_KEY,
  canTapeTumble,
  clearListingTumble,
  isListingTumbleOverlay,
  markListingTumble,
  parseTumbleListingIds,
  tumbleCookieValue,
} from "./listing-tumble";

test("cookie and storage keys stay the tumble paper names", () => {
  assert.equal(TUMBLE_STORAGE_KEY, "iss:tumble-listing-ids");
  assert.equal(TUMBLE_COOKIE_NAME, "iss-tumble-listing-ids");
  assert.equal(TUMBLE_HOST_ID, "mdb-jewel-stack");
  assert.equal(
    TUMBLE_NOTICE_TITLE,
    "I will not tumble them. Still empty. Still cracked.",
  );
  assert.equal(TUMBLE_LEAVE_LINE, "Leave the pile");
  assert.notEqual(TUMBLE_STORAGE_KEY, FOAM_STORAGE_KEY);
  assert.notEqual(TUMBLE_STORAGE_KEY, NEST_STORAGE_KEY);
  assert.notEqual(TUMBLE_STORAGE_KEY, FLOCK_STORAGE_KEY);
});

test("write-result objects never parse as a tumble set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-jewel-stack"],
  });
  assert.deepEqual(parseTumbleListingIds(writeResult), []);
  assert.equal(
    isListingTumbleOverlay("mdb-jewel-stack", parseTumbleListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = tumbleCookieValue(["mdb-jewel-stack", "mdb-jewel-stack", ""]);
  assert.equal(raw, '["mdb-jewel-stack"]');
  assert.deepEqual(parseTumbleListingIds(raw), ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jewel stack tapes; LP, mixtape, and liner stay off that cookie", () => {
  const jewels = listingById("mdb-jewel-stack");
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const liner = listingById(TUMBLE_LINER_ID);

  assert.ok(canTapeTumble(jewels));
  assert.equal(canTapeTumble(lp), false);
  assert.equal(canTapeTumble(mixtape), false);
  assert.equal(canTapeTumble(liner), false);

  const taped = markListingTumble(jewels, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  assert.equal(tumbleCookieValue(taped), '["mdb-jewel-stack"]');
  assert.equal(isListingTumbleOverlay("mdb-jewel-stack", taped), true);
  assert.equal(isListingTumbleOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingTumbleOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingTumbleOverlay("dl-crate-side-a", taped), false);
  assert.equal(jewels?.cartEligible, true);
  assert.equal(jewels?.status, "available");
  assert.equal(jewels?.price.amountCents, 250);
});

test("liner, gift, zine, chair, LP, and mixtape refuse a tumble write", () => {
  const liner = listingById(TUMBLE_LINER_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TUMBLE_CHAIR_ID);
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeTumble(liner), false);
  assert.equal(canTapeTumble(gift), false);
  assert.equal(canTapeTumble(zine), false);
  assert.equal(canTapeTumble(chair), false);
  assert.equal(canTapeTumble(lp), false);
  assert.equal(canTapeTumble(mixtape), false);

  assert.equal(markListingTumble(liner, []), null);
  assert.equal(markListingTumble(gift, []), null);
  assert.equal(markListingTumble(zine, []), null);
  assert.equal(markListingTumble(chair, []), null);
  assert.equal(markListingTumble(lp, []), null);
  assert.equal(markListingTumble(mixtape, []), null);
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
  const taped = markListingTumble(jewels, []);
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  const after = listingById("mdb-jewel-stack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jewel-stack id", () => {
  const jewels = listingById("mdb-jewel-stack");
  const cleared = clearListingTumble(jewels, ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(tumbleCookieValue(cleared), "[]");
  assert.equal(isListingTumbleOverlay("mdb-jewel-stack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById(TUMBLE_LINER_ID);
  const taped = markListingTumble(jewels, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingTumble(liner, []), null);

  const cleared = clearListingTumble(jewels, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TUMBLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTumble(chair, []), null);
});
