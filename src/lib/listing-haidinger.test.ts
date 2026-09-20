import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLANCHARD_STORAGE_KEY } from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { DRESS_STORAGE_KEY } from "./listing-dress";
import {
  FIZEAU_COOKIE_NAME,
  FIZEAU_STORAGE_KEY,
} from "./listing-fizeau";
import { FLYCUT_STORAGE_KEY } from "./listing-flycut";
import {
  FRINGE_COOKIE_NAME,
  FRINGE_STORAGE_KEY,
} from "./listing-fringe";
import {
  FROST_COOKIE_NAME,
  FROST_STORAGE_KEY,
} from "./listing-frost";
import {
  HAIDINGER_CHAIR_ID,
  HAIDINGER_COOKIE_NAME,
  HAIDINGER_HOST_ID,
  HAIDINGER_LEAVE_LINE,
  HAIDINGER_MUG_ID,
  HAIDINGER_NOTICE_TITLE,
  HAIDINGER_RECIPES_ID,
  HAIDINGER_STORAGE_KEY,
  HAIDINGER_WHISK_ID,
  canTapeHaidinger,
  clearListingHaidinger,
  haidingerCookieValue,
  isListingHaidingerOverlay,
  markListingHaidinger,
  parseHaidingerListingIds,
  writeHaidingerListingIds,
} from "./listing-haidinger";
import {
  PRUSSIAN_COOKIE_NAME,
  PRUSSIAN_STORAGE_KEY,
} from "./listing-prussian";
import { SINE_COOKIE_NAME, SINE_STORAGE_KEY } from "./listing-sine";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { SPOTFACE_COOKIE_NAME, SPOTFACE_STORAGE_KEY } from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import { WEDGE_COOKIE_NAME, WEDGE_STORAGE_KEY } from "./listing-wedge";
import { WRING_STORAGE_KEY } from "./listing-wring";

test("cookie and storage keys stay the haidinger paper names", () => {
  assert.equal(HAIDINGER_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.equal(HAIDINGER_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.equal(HAIDINGER_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    HAIDINGER_NOTICE_TITLE,
    "I will not haidinger it. Still a lid. Still no pot.",
  );
  assert.equal(HAIDINGER_LEAVE_LINE, "Leave the haidinger");
  assert.notEqual(HAIDINGER_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, FRINGE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, TAP_COOKIE_NAME);
});

test("write-result objects never parse as a haidinger set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseHaidingerListingIds(writeResult), []);
  assert.equal(
    isListingHaidingerOverlay(
      "kdr-lid-no-pot",
      parseHaidingerListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = haidingerCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseHaidingerListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(HAIDINGER_WHISK_ID);
  const mug = listingById(HAIDINGER_MUG_ID);
  const recipes = listingById(HAIDINGER_RECIPES_ID);
  assert.ok(canTapeHaidinger(lid));
  assert.equal(canTapeHaidinger(whisk), false);
  assert.equal(canTapeHaidinger(mug), false);
  assert.equal(canTapeHaidinger(recipes), false);

  const taped = markListingHaidinger(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(haidingerCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingHaidingerOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingHaidingerOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingHaidingerOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingHaidingerOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a haidinger write", () => {
  const whisk = listingById(HAIDINGER_WHISK_ID);
  const mug = listingById(HAIDINGER_MUG_ID);
  const recipes = listingById(HAIDINGER_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(HAIDINGER_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeHaidinger(whisk), false);
  assert.equal(canTapeHaidinger(mug), false);
  assert.equal(canTapeHaidinger(recipes), false);
  assert.equal(canTapeHaidinger(gift), false);
  assert.equal(canTapeHaidinger(zine), false);
  assert.equal(canTapeHaidinger(chair), false);
  assert.equal(canTapeHaidinger(boy), false);

  assert.equal(markListingHaidinger(whisk, []), null);
  assert.equal(markListingHaidinger(mug, []), null);
  assert.equal(markListingHaidinger(recipes, []), null);
  assert.equal(markListingHaidinger(gift, []), null);
  assert.equal(markListingHaidinger(zine, []), null);
  assert.equal(markListingHaidinger(chair, []), null);
  assert.equal(markListingHaidinger(boy, []), null);
  assert.equal(chair?.status, "sold");
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
  const taped = markListingHaidinger(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingHaidinger(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(haidingerCookieValue(cleared), "[]");
  assert.equal(isListingHaidingerOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingHaidinger(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingHaidinger(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(HAIDINGER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingHaidinger(chair, []), null);
});

test("write never touches fizeau, fringe, frost, prussian, wedge, sine, wring, snug, countersink, or spotface keys", () => {
  writeHaidingerListingIds(["kdr-lid-no-pot"]);
  assert.equal(HAIDINGER_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.equal(FIZEAU_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.equal(FRINGE_STORAGE_KEY, "iss:fringe-listing-ids");
  assert.equal(FROST_STORAGE_KEY, "iss:frost-listing-ids");
  assert.equal(PRUSSIAN_STORAGE_KEY, "iss:prussian-listing-ids");
  assert.equal(WEDGE_STORAGE_KEY, "iss:wedge-listing-ids");
  assert.equal(SINE_STORAGE_KEY, "iss:sine-listing-ids");
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(HAIDINGER_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, FRINGE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(HAIDINGER_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-prussian-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(HAIDINGER_COOKIE_NAME, "iss-spotface-listing-ids");
});
