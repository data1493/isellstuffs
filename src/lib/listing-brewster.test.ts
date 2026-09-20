import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BILLBOARD_STORAGE_KEY } from "./listing-billboard";
import { BLANCHARD_STORAGE_KEY } from "./listing-blanchard";
import {
  BREWSTER_CHAIR_ID,
  BREWSTER_COOKIE_NAME,
  BREWSTER_HOST_ID,
  BREWSTER_LEAVE_LINE,
  BREWSTER_MUG_ID,
  BREWSTER_NOTICE_TITLE,
  BREWSTER_RECIPES_ID,
  BREWSTER_STORAGE_KEY,
  BREWSTER_WHISK_ID,
  brewsterCookieValue,
  canTapeBrewster,
  clearListingBrewster,
  isListingBrewsterOverlay,
  markListingBrewster,
  parseBrewsterListingIds,
  writeBrewsterListingIds,
} from "./listing-brewster";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { DEWET_STORAGE_KEY } from "./listing-dewet";
import { DRESS_STORAGE_KEY } from "./listing-dress";
import {
  ECCENTRIC_COOKIE_NAME,
  ECCENTRIC_STORAGE_KEY,
} from "./listing-eccentric";
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
  HAIDINGER_COOKIE_NAME,
  HAIDINGER_STORAGE_KEY,
} from "./listing-haidinger";
import {
  ICICLE_COOKIE_NAME,
  ICICLE_STORAGE_KEY,
} from "./listing-icicle";
import { MISTRACK_STORAGE_KEY } from "./listing-mistrack";
import {
  PCLT_COOKIE_NAME,
  PCLT_STORAGE_KEY,
} from "./listing-pclt";
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

test("cookie and storage keys stay the brewster paper names", () => {
  assert.equal(BREWSTER_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.equal(BREWSTER_COOKIE_NAME, "iss-brewster-listing-ids");
  assert.equal(BREWSTER_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    BREWSTER_NOTICE_TITLE,
    "I will not brewster it. Still a lid. Still no pot.",
  );
  assert.equal(BREWSTER_LEAVE_LINE, "Leave the brewster");
  assert.notEqual(BREWSTER_STORAGE_KEY, HAIDINGER_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FRINGE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, PRUSSIAN_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, WEDGE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, PCLT_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, ECCENTRIC_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, DEWET_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, MISTRACK_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, BILLBOARD_STORAGE_KEY);
  assert.notEqual(BREWSTER_COOKIE_NAME, HAIDINGER_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, PCLT_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
});

test("write-result objects never parse as a brewster set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseBrewsterListingIds(writeResult), []);
  assert.equal(
    isListingBrewsterOverlay(
      "kdr-lid-no-pot",
      parseBrewsterListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = brewsterCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseBrewsterListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(BREWSTER_WHISK_ID);
  const mug = listingById(BREWSTER_MUG_ID);
  const recipes = listingById(BREWSTER_RECIPES_ID);
  assert.ok(canTapeBrewster(lid));
  assert.equal(canTapeBrewster(whisk), false);
  assert.equal(canTapeBrewster(mug), false);
  assert.equal(canTapeBrewster(recipes), false);

  const taped = markListingBrewster(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(brewsterCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingBrewsterOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingBrewsterOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingBrewsterOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingBrewsterOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a brewster write", () => {
  const whisk = listingById(BREWSTER_WHISK_ID);
  const mug = listingById(BREWSTER_MUG_ID);
  const recipes = listingById(BREWSTER_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(BREWSTER_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeBrewster(whisk), false);
  assert.equal(canTapeBrewster(mug), false);
  assert.equal(canTapeBrewster(recipes), false);
  assert.equal(canTapeBrewster(gift), false);
  assert.equal(canTapeBrewster(zine), false);
  assert.equal(canTapeBrewster(chair), false);
  assert.equal(canTapeBrewster(boy), false);

  assert.equal(markListingBrewster(whisk, []), null);
  assert.equal(markListingBrewster(mug, []), null);
  assert.equal(markListingBrewster(recipes, []), null);
  assert.equal(markListingBrewster(gift, []), null);
  assert.equal(markListingBrewster(zine, []), null);
  assert.equal(markListingBrewster(chair, []), null);
  assert.equal(markListingBrewster(boy, []), null);
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
  const taped = markListingBrewster(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingBrewster(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(brewsterCookieValue(cleared), "[]");
  assert.equal(isListingBrewsterOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingBrewster(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingBrewster(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(BREWSTER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingBrewster(chair, []), null);
});

test("write never touches leftover haidinger, fizeau, frost, snug, spotface, icicle, pclt, or eccentric keys", () => {
  writeBrewsterListingIds(["kdr-lid-no-pot"]);
  assert.equal(BREWSTER_STORAGE_KEY, "iss:brewster-listing-ids");
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
  assert.equal(ICICLE_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.equal(PCLT_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.equal(ECCENTRIC_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.equal(DEWET_STORAGE_KEY, "iss:dewet-listing-ids");
  assert.equal(MISTRACK_STORAGE_KEY, "iss:mistrack-listing-ids");
  assert.equal(BILLBOARD_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(BREWSTER_STORAGE_KEY, HAIDINGER_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(BREWSTER_STORAGE_KEY, PCLT_STORAGE_KEY);
  assert.notEqual(BREWSTER_COOKIE_NAME, HAIDINGER_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FRINGE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, PRUSSIAN_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, WEDGE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, PCLT_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-fringe-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(BREWSTER_COOKIE_NAME, "iss-mother-listing-ids");
});
