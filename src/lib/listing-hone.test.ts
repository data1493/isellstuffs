import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { PUCK_STORAGE_KEY } from "./listing-puck";
import { SKIP_STORAGE_KEY } from "./listing-skip";
import {
  HONE_CHAIR_ID,
  HONE_COOKIE_NAME,
  HONE_HOST_ID,
  HONE_LEAVE_LINE,
  HONE_MUG_ID,
  HONE_NOTICE_TITLE,
  HONE_STORAGE_KEY,
  canTapeHone,
  clearListingHone,
  isListingHoneOverlay,
  markListingHone,
  parseHoneListingIds,
  honeCookieValue,
} from "./listing-hone";

test("cookie and storage keys stay the hone paper names", () => {
  assert.equal(HONE_STORAGE_KEY, "iss:hone-listing-ids");
  assert.equal(HONE_COOKIE_NAME, "iss-hone-listing-ids");
  assert.equal(HONE_HOST_ID, "mdb-scratched-lp");
  assert.equal(
    HONE_NOTICE_TITLE,
    "I will not hone it. Still skips. Still unnamed.",
  );
  assert.equal(HONE_LEAVE_LINE, "Leave the nick");
  assert.notEqual(HONE_STORAGE_KEY, SKIP_STORAGE_KEY);
  assert.notEqual(HONE_STORAGE_KEY, PUCK_STORAGE_KEY);
});

test("write-result objects never parse as a hone set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-scratched-lp"],
  });
  assert.deepEqual(parseHoneListingIds(writeResult), []);
  assert.equal(
    isListingHoneOverlay(
      "mdb-scratched-lp",
      parseHoneListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = honeCookieValue(["mdb-scratched-lp", "mdb-scratched-lp", ""]);
  assert.equal(raw, '["mdb-scratched-lp"]');
  assert.deepEqual(parseHoneListingIds(raw), ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("LP tapes; mixtape, mug, jewels, and liner stay off that cookie", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const mug = listingById(HONE_MUG_ID);
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  assert.ok(canTapeHone(lp));
  assert.equal(canTapeHone(mixtape), false);
  assert.equal(canTapeHone(mug), false);
  assert.equal(canTapeHone(jewels), false);
  assert.equal(canTapeHone(liner), false);

  const taped = markListingHone(lp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  assert.equal(honeCookieValue(taped), '["mdb-scratched-lp"]');
  assert.equal(isListingHoneOverlay("mdb-scratched-lp", taped), true);
  assert.equal(isListingHoneOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingHoneOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingHoneOverlay("mdb-jewel-stack", taped), false);
  assert.equal(isListingHoneOverlay("dl-crate-side-a", taped), false);
  assert.equal(lp?.cartEligible, true);
  assert.equal(lp?.status, "available");
  assert.equal(lp?.price.amountCents, 900);
});

test("mixtape, mug, jewels, liner, chair, gift, zine, and overlay-owned rows refuse a hone write", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const mug = listingById(HONE_MUG_ID);
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(HONE_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.equal(canTapeHone(mixtape), false);
  assert.equal(canTapeHone(mug), false);
  assert.equal(canTapeHone(jewels), false);
  assert.equal(canTapeHone(liner), false);
  assert.equal(canTapeHone(chair), false);
  assert.equal(canTapeHone(gift), false);
  assert.equal(canTapeHone(zine), false);
  assert.equal(canTapeHone(lamp), false);

  assert.equal(markListingHone(mixtape, []), null);
  assert.equal(markListingHone(mug, []), null);
  assert.equal(markListingHone(jewels, []), null);
  assert.equal(markListingHone(liner, []), null);
  assert.equal(markListingHone(chair, []), null);
  assert.equal(markListingHone(gift, []), null);
  assert.equal(markListingHone(zine, []), null);
  assert.equal(markListingHone(lamp, []), null);
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
  const taped = markListingHone(lp, []);
  assert.deepEqual(taped, ["mdb-scratched-lp"]);
  const after = listingById("mdb-scratched-lp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that LP id", () => {
  const lp = listingById("mdb-scratched-lp");
  const cleared = clearListingHone(lp, ["mdb-scratched-lp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(honeCookieValue(cleared), "[]");
  assert.equal(isListingHoneOverlay("mdb-scratched-lp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lp = listingById("mdb-scratched-lp");
  const taped = markListingHone(lp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingHone(lp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
