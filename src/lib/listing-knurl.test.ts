import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { GLASS_STORAGE_KEY } from "./listing-glass";
import { KNOB_STORAGE_KEY } from "./listing-knob";
import {
  KNURL_COOKIE_NAME,
  KNURL_HOST_ID,
  KNURL_LEAVE_LINE,
  KNURL_NOTICE_TITLE,
  KNURL_STORAGE_KEY,
  canTapeKnurl,
  clearListingKnurl,
  isListingKnurlOverlay,
  knurlCookieValue,
  markListingKnurl,
  parseKnurlListingIds,
} from "./listing-knurl";
import { VENT_STORAGE_KEY } from "./listing-vent";

test("cookie and storage keys stay the knurl paper names", () => {
  assert.equal(KNURL_STORAGE_KEY, "iss:knurl-listing-ids");
  assert.equal(KNURL_COOKIE_NAME, "iss-knurl-listing-ids");
  assert.equal(KNURL_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    KNURL_NOTICE_TITLE,
    "I will not knurl it. Still loose. Still a lid.",
  );
  assert.equal(KNURL_LEAVE_LINE, "Leave the lid");
  assert.notEqual(KNURL_STORAGE_KEY, KNOB_STORAGE_KEY);
  assert.notEqual(KNURL_STORAGE_KEY, GLASS_STORAGE_KEY);
  assert.notEqual(KNURL_STORAGE_KEY, VENT_STORAGE_KEY);
});

test("write-result objects never parse as a knurl set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseKnurlListingIds(writeResult), []);
  assert.equal(
    isListingKnurlOverlay("kdr-lid-no-pot", parseKnurlListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = knurlCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseKnurlListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; mug, recipes, and whisk stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById("kdr-chipped-mug");
  const recipes = listingById("dl-drawer-recipes");
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(canTapeKnurl(lid));
  assert.equal(canTapeKnurl(mug), false);
  assert.equal(canTapeKnurl(recipes), false);
  assert.equal(canTapeKnurl(whisk), false);

  const taped = markListingKnurl(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(knurlCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingKnurlOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingKnurlOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingKnurlOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingKnurlOverlay("kdr-bent-whisk", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("mug, recipes, whisk, gift, zine, and overlay-owned rows refuse a knurl write", () => {
  const mug = listingById("kdr-chipped-mug");
  const recipes = listingById("dl-drawer-recipes");
  const whisk = listingById("kdr-bent-whisk");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const jewels = listingById("mdb-jewel-stack");
  const drawer = listingById("gtk-cable-drawer");
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeKnurl(mug), false);
  assert.equal(canTapeKnurl(recipes), false);
  assert.equal(canTapeKnurl(whisk), false);
  assert.equal(canTapeKnurl(gift), false);
  assert.equal(canTapeKnurl(zine), false);
  assert.equal(canTapeKnurl(jacket), false);
  assert.equal(canTapeKnurl(jewels), false);
  assert.equal(canTapeKnurl(drawer), false);
  assert.equal(canTapeKnurl(boy), false);

  assert.equal(markListingKnurl(mug, []), null);
  assert.equal(markListingKnurl(recipes, []), null);
  assert.equal(markListingKnurl(whisk, []), null);
  assert.equal(markListingKnurl(gift, []), null);
  assert.equal(markListingKnurl(zine, []), null);
  assert.equal(markListingKnurl(jacket, []), null);
  assert.equal(markListingKnurl(jewels, []), null);
  assert.equal(markListingKnurl(drawer, []), null);
  assert.equal(markListingKnurl(boy, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lid = listingById("kdr-lid-no-pot");
  assert.ok(lid);
  const before = {
    price: lid.price,
    status: lid.status,
    cartEligible: lid.cartEligible,
  };
  const taped = markListingKnurl(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingKnurl(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(knurlCookieValue(cleared), "[]");
  assert.equal(isListingKnurlOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const mug = listingById("kdr-chipped-mug");
  const taped = markListingKnurl(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingKnurl(mug, []), null);

  const cleared = clearListingKnurl(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
