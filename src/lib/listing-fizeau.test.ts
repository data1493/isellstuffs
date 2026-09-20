import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLANCHARD_STORAGE_KEY } from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { DRESS_STORAGE_KEY } from "./listing-dress";
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
  FIZEAU_CHAIR_ID,
  FIZEAU_COOKIE_NAME,
  FIZEAU_HOST_ID,
  FIZEAU_LEAVE_LINE,
  FIZEAU_MUG_ID,
  FIZEAU_NOTICE_TITLE,
  FIZEAU_RECIPES_ID,
  FIZEAU_STORAGE_KEY,
  FIZEAU_WHISK_ID,
  canTapeFizeau,
  clearListingFizeau,
  fizeauCookieValue,
  isListingFizeauOverlay,
  markListingFizeau,
  parseFizeauListingIds,
  writeFizeauListingIds,
} from "./listing-fizeau";
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

test("cookie and storage keys stay the fizeau paper names", () => {
  assert.equal(FIZEAU_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.equal(FIZEAU_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.equal(FIZEAU_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    FIZEAU_NOTICE_TITLE,
    "I will not fizeau it. Still a lid. Still no pot.",
  );
  assert.equal(FIZEAU_LEAVE_LINE, "Leave the fizeau");
  assert.notEqual(FIZEAU_STORAGE_KEY, FRINGE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(FIZEAU_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, TAP_COOKIE_NAME);
});

test("write-result objects never parse as a fizeau set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseFizeauListingIds(writeResult), []);
  assert.equal(
    isListingFizeauOverlay(
      "kdr-lid-no-pot",
      parseFizeauListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = fizeauCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseFizeauListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(FIZEAU_WHISK_ID);
  const mug = listingById(FIZEAU_MUG_ID);
  const recipes = listingById(FIZEAU_RECIPES_ID);
  assert.ok(canTapeFizeau(lid));
  assert.equal(canTapeFizeau(whisk), false);
  assert.equal(canTapeFizeau(mug), false);
  assert.equal(canTapeFizeau(recipes), false);

  const taped = markListingFizeau(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(fizeauCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingFizeauOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingFizeauOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingFizeauOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingFizeauOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a fizeau write", () => {
  const whisk = listingById(FIZEAU_WHISK_ID);
  const mug = listingById(FIZEAU_MUG_ID);
  const recipes = listingById(FIZEAU_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(FIZEAU_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeFizeau(whisk), false);
  assert.equal(canTapeFizeau(mug), false);
  assert.equal(canTapeFizeau(recipes), false);
  assert.equal(canTapeFizeau(gift), false);
  assert.equal(canTapeFizeau(zine), false);
  assert.equal(canTapeFizeau(chair), false);
  assert.equal(canTapeFizeau(boy), false);

  assert.equal(markListingFizeau(whisk, []), null);
  assert.equal(markListingFizeau(mug, []), null);
  assert.equal(markListingFizeau(recipes, []), null);
  assert.equal(markListingFizeau(gift, []), null);
  assert.equal(markListingFizeau(zine, []), null);
  assert.equal(markListingFizeau(chair, []), null);
  assert.equal(markListingFizeau(boy, []), null);
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
  const taped = markListingFizeau(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingFizeau(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(fizeauCookieValue(cleared), "[]");
  assert.equal(isListingFizeauOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingFizeau(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingFizeau(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(FIZEAU_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingFizeau(chair, []), null);
});

test("write never touches fringe, frost, prussian, wedge, sine, wring, snug, countersink, or spotface keys", () => {
  writeFizeauListingIds(["kdr-lid-no-pot"]);
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
  assert.notEqual(FIZEAU_STORAGE_KEY, FRINGE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(FIZEAU_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(FIZEAU_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-prussian-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(FIZEAU_COOKIE_NAME, "iss-spotface-listing-ids");
});
