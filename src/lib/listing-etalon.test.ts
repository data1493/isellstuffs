import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BILLBOARD_STORAGE_KEY } from "./listing-billboard";
import { BLOWHOLE_COOKIE_NAME, BLOWHOLE_STORAGE_KEY } from "./listing-blowhole";
import { BREWSTER_COOKIE_NAME, BREWSTER_STORAGE_KEY } from "./listing-brewster";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import { EBDT_COOKIE_NAME, EBDT_STORAGE_KEY } from "./listing-ebdt";
import {
  ECCENTRIC_COOKIE_NAME,
  ECCENTRIC_STORAGE_KEY,
} from "./listing-eccentric";
import {
  ETALON_CHAIR_ID,
  ETALON_COOKIE_NAME,
  ETALON_HOST_ID,
  ETALON_LEAVE_LINE,
  ETALON_MUG_ID,
  ETALON_NOTICE_TITLE,
  ETALON_RECIPES_ID,
  ETALON_STORAGE_KEY,
  ETALON_WHISK_ID,
  canTapeEtalon,
  clearListingEtalon,
  etalonCookieValue,
  isListingEtalonOverlay,
  markListingEtalon,
  parseEtalonListingIds,
  writeEtalonListingIds,
} from "./listing-etalon";
import { FIZEAU_COOKIE_NAME, FIZEAU_STORAGE_KEY } from "./listing-fizeau";
import { FROST_COOKIE_NAME, FROST_STORAGE_KEY } from "./listing-frost";
import {
  HAIDINGER_COOKIE_NAME,
  HAIDINGER_STORAGE_KEY,
} from "./listing-haidinger";
import { ICICLE_COOKIE_NAME, ICICLE_STORAGE_KEY } from "./listing-icicle";
import { MOTHER_COOKIE_NAME, MOTHER_STORAGE_KEY } from "./listing-mother";
import { PCLT_COOKIE_NAME, PCLT_STORAGE_KEY } from "./listing-pclt";
import { SNUG_COOKIE_NAME, SNUG_STORAGE_KEY } from "./listing-snug";
import { SPOTFACE_COOKIE_NAME, SPOTFACE_STORAGE_KEY } from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";

test("cookie and storage keys stay the etalon paper names", () => {
  assert.equal(ETALON_STORAGE_KEY, "iss:etalon-listing-ids");
  assert.equal(ETALON_COOKIE_NAME, "iss-etalon-listing-ids");
  assert.equal(ETALON_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    ETALON_NOTICE_TITLE,
    "I will not etalon it. Still a lid. Still no pot.",
  );
  assert.equal(ETALON_LEAVE_LINE, "Leave the etalon");
  assert.notEqual(ETALON_STORAGE_KEY, BREWSTER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, HAIDINGER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, PCLT_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, ECCENTRIC_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, MOTHER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, EBDT_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, BLOWHOLE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, BILLBOARD_STORAGE_KEY);
  assert.notEqual(ETALON_COOKIE_NAME, BREWSTER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, HAIDINGER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, PCLT_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, MOTHER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, EBDT_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, BLOWHOLE_COOKIE_NAME);
});

test("write-result objects never parse as an etalon set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseEtalonListingIds(writeResult), []);
  assert.equal(
    isListingEtalonOverlay(
      "kdr-lid-no-pot",
      parseEtalonListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = etalonCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseEtalonListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(ETALON_WHISK_ID);
  const mug = listingById(ETALON_MUG_ID);
  const recipes = listingById(ETALON_RECIPES_ID);
  assert.ok(canTapeEtalon(lid));
  assert.equal(canTapeEtalon(whisk), false);
  assert.equal(canTapeEtalon(mug), false);
  assert.equal(canTapeEtalon(recipes), false);

  const taped = markListingEtalon(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(etalonCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingEtalonOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingEtalonOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingEtalonOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingEtalonOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse an etalon write", () => {
  const whisk = listingById(ETALON_WHISK_ID);
  const mug = listingById(ETALON_MUG_ID);
  const recipes = listingById(ETALON_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(ETALON_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeEtalon(whisk), false);
  assert.equal(canTapeEtalon(mug), false);
  assert.equal(canTapeEtalon(recipes), false);
  assert.equal(canTapeEtalon(gift), false);
  assert.equal(canTapeEtalon(zine), false);
  assert.equal(canTapeEtalon(chair), false);
  assert.equal(canTapeEtalon(boy), false);

  assert.equal(markListingEtalon(whisk, []), null);
  assert.equal(markListingEtalon(mug, []), null);
  assert.equal(markListingEtalon(recipes, []), null);
  assert.equal(markListingEtalon(gift, []), null);
  assert.equal(markListingEtalon(zine, []), null);
  assert.equal(markListingEtalon(chair, []), null);
  assert.equal(markListingEtalon(boy, []), null);
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
  const taped = markListingEtalon(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingEtalon(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(etalonCookieValue(cleared), "[]");
  assert.equal(isListingEtalonOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingEtalon(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingEtalon(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(ETALON_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingEtalon(chair, []), null);
});

test("write never touches leftover brewster, haidinger, mother, ebdt, blowhole, or blackpad keys", () => {
  writeEtalonListingIds(["kdr-lid-no-pot"]);
  assert.equal(ETALON_STORAGE_KEY, "iss:etalon-listing-ids");
  assert.equal(BREWSTER_STORAGE_KEY, "iss:brewster-listing-ids");
  assert.equal(HAIDINGER_STORAGE_KEY, "iss:haidinger-listing-ids");
  assert.equal(FIZEAU_STORAGE_KEY, "iss:fizeau-listing-ids");
  assert.equal(FROST_STORAGE_KEY, "iss:frost-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.equal(ICICLE_STORAGE_KEY, "iss:icicle-listing-ids");
  assert.equal(PCLT_STORAGE_KEY, "iss:pclt-listing-ids");
  assert.equal(ECCENTRIC_STORAGE_KEY, "iss:eccentric-listing-ids");
  assert.equal(MOTHER_STORAGE_KEY, "iss:mother-listing-ids");
  assert.equal(EBDT_STORAGE_KEY, "iss:ebdt-listing-ids");
  assert.equal(BLOWHOLE_STORAGE_KEY, "iss:blowhole-listing-ids");
  assert.equal(BILLBOARD_STORAGE_KEY, "iss:billboard-listing-ids");
  assert.notEqual(ETALON_STORAGE_KEY, BREWSTER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, HAIDINGER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, FIZEAU_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, FROST_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, ICICLE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, PCLT_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, MOTHER_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, EBDT_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, BLOWHOLE_STORAGE_KEY);
  assert.notEqual(ETALON_STORAGE_KEY, "iss:blackpad-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, BREWSTER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, HAIDINGER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, FIZEAU_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, FROST_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, ICICLE_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, PCLT_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, ECCENTRIC_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, MOTHER_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, EBDT_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, BLOWHOLE_COOKIE_NAME);
  assert.notEqual(ETALON_COOKIE_NAME, "iss-brewster-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-haidinger-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-fizeau-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-frost-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-icicle-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-pclt-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-blowhole-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-mother-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-ebdt-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-blackpad-listing-ids");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-booth-stator");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-booth-eddy");
  assert.notEqual(ETALON_COOKIE_NAME, "iss-booth-reflex");
  assert.notEqual(ETALON_STORAGE_KEY, "iss:talbot-listing-ids");
  assert.notEqual(ETALON_STORAGE_KEY, "iss:fabry-listing-ids");
});
