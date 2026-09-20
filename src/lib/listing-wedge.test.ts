import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  BLANCHARD_COOKIE_NAME,
  BLANCHARD_STORAGE_KEY,
} from "./listing-blanchard";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_STORAGE_KEY,
} from "./listing-countersink";
import {
  DRESS_COOKIE_NAME,
  DRESS_STORAGE_KEY,
} from "./listing-dress";
import {
  FLYCUT_COOKIE_NAME,
  FLYCUT_STORAGE_KEY,
} from "./listing-flycut";
import {
  SINE_COOKIE_NAME,
  SINE_STORAGE_KEY,
} from "./listing-sine";
import {
  SNUG_COOKIE_NAME,
  SNUG_STORAGE_KEY,
} from "./listing-snug";
import {
  SPOTFACE_COOKIE_NAME,
  SPOTFACE_STORAGE_KEY,
} from "./listing-spotface";
import { TAP_COOKIE_NAME, TAP_STORAGE_KEY } from "./listing-tap";
import {
  TREPAN_COOKIE_NAME,
  TREPAN_STORAGE_KEY,
} from "./listing-trepan";
import {
  WRING_COOKIE_NAME,
  WRING_STORAGE_KEY,
} from "./listing-wring";
import {
  WEDGE_CHAIR_ID,
  WEDGE_COOKIE_NAME,
  WEDGE_HOST_ID,
  WEDGE_LEAVE_LINE,
  WEDGE_MUG_ID,
  WEDGE_NOTICE_TITLE,
  WEDGE_RECIPES_ID,
  WEDGE_STORAGE_KEY,
  WEDGE_WHISK_ID,
  canTapeWedge,
  clearListingWedge,
  isListingWedgeOverlay,
  markListingWedge,
  parseWedgeListingIds,
  wedgeCookieValue,
  writeWedgeListingIds,
} from "./listing-wedge";

test("cookie and storage keys stay the wedge paper names", () => {
  assert.equal(WEDGE_STORAGE_KEY, "iss:wedge-listing-ids");
  assert.equal(WEDGE_COOKIE_NAME, "iss-wedge-listing-ids");
  assert.equal(WEDGE_HOST_ID, "kdr-lid-no-pot");
  assert.equal(
    WEDGE_NOTICE_TITLE,
    "I will not wedge it. Still a lid. Still no pot.",
  );
  assert.equal(WEDGE_LEAVE_LINE, "Leave the rise");
  assert.notEqual(WEDGE_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:clinometer-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:parallel-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:compound-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:incline-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:rotary-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:cupwheel-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:surfacegrind-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:granite-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:joblock-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:interferometer-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:sinebar-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:angleblock-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:jo-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, WRING_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-lap-listing-ids");
});

test("write-result objects never parse as a wedge set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-lid-no-pot"],
  });
  assert.deepEqual(parseWedgeListingIds(writeResult), []);
  assert.equal(
    isListingWedgeOverlay(
      "kdr-lid-no-pot",
      parseWedgeListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseWedgeListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = wedgeCookieValue(["kdr-lid-no-pot", "kdr-lid-no-pot", ""]);
  assert.equal(raw, '["kdr-lid-no-pot"]');
  assert.deepEqual(parseWedgeListingIds(raw), ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lid tapes; whisk, mug, and recipes stay off that cookie", () => {
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById(WEDGE_WHISK_ID);
  const mug = listingById(WEDGE_MUG_ID);
  const recipes = listingById(WEDGE_RECIPES_ID);
  assert.ok(canTapeWedge(lid));
  assert.equal(canTapeWedge(whisk), false);
  assert.equal(canTapeWedge(mug), false);
  assert.equal(canTapeWedge(recipes), false);

  const taped = markListingWedge(lid, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  assert.equal(wedgeCookieValue(taped), '["kdr-lid-no-pot"]');
  assert.equal(isListingWedgeOverlay("kdr-lid-no-pot", taped), true);
  assert.equal(isListingWedgeOverlay("kdr-bent-whisk", taped), false);
  assert.equal(isListingWedgeOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingWedgeOverlay("dl-drawer-recipes", taped), false);
  assert.equal(lid?.cartEligible, true);
  assert.equal(lid?.status, "available");
  assert.equal(lid?.price.amountCents, 300);
});

test("whisk, mug, recipes, gift, zine, chair, and overlay-owned rows refuse a wedge write", () => {
  const whisk = listingById(WEDGE_WHISK_ID);
  const mug = listingById(WEDGE_MUG_ID);
  const recipes = listingById(WEDGE_RECIPES_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(WEDGE_CHAIR_ID);
  const boy = listingById("gtk-game-boy");

  assert.equal(canTapeWedge(whisk), false);
  assert.equal(canTapeWedge(mug), false);
  assert.equal(canTapeWedge(recipes), false);
  assert.equal(canTapeWedge(gift), false);
  assert.equal(canTapeWedge(zine), false);
  assert.equal(canTapeWedge(chair), false);
  assert.equal(canTapeWedge(boy), false);

  assert.equal(markListingWedge(whisk, []), null);
  assert.equal(markListingWedge(mug, []), null);
  assert.equal(markListingWedge(recipes, []), null);
  assert.equal(markListingWedge(gift, []), null);
  assert.equal(markListingWedge(zine, []), null);
  assert.equal(markListingWedge(chair, []), null);
  assert.equal(markListingWedge(boy, []), null);
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
  const taped = markListingWedge(lid, []);
  assert.deepEqual(taped, ["kdr-lid-no-pot"]);
  const after = listingById("kdr-lid-no-pot");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lid id", () => {
  const lid = listingById("kdr-lid-no-pot");
  const cleared = clearListingWedge(lid, ["kdr-lid-no-pot"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(wedgeCookieValue(cleared), "[]");
  assert.equal(isListingWedgeOverlay("kdr-lid-no-pot", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingWedge(lid, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingWedge(lid, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(WEDGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingWedge(chair, []), null);
});

test("write never touches sine, wring, blanchard, dress, flycut, snug, countersink, spotface, trepan, lap, or tap storage keys", () => {
  writeWedgeListingIds(["kdr-lid-no-pot"]);
  assert.equal(WEDGE_STORAGE_KEY, "iss:wedge-listing-ids");
  assert.equal(SINE_STORAGE_KEY, "iss:sine-listing-ids");
  assert.equal(WRING_STORAGE_KEY, "iss:wring-listing-ids");
  assert.equal(BLANCHARD_STORAGE_KEY, "iss:blanchard-listing-ids");
  assert.equal(DRESS_STORAGE_KEY, "iss:dress-listing-ids");
  assert.equal(FLYCUT_STORAGE_KEY, "iss:flycut-listing-ids");
  assert.equal(SNUG_STORAGE_KEY, "iss:snug-listing-ids");
  assert.equal(COUNTERSINK_STORAGE_KEY, "iss:countersink-listing-ids");
  assert.equal(SPOTFACE_STORAGE_KEY, "iss:spotface-listing-ids");
  assert.equal(TREPAN_STORAGE_KEY, "iss:trepan-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(WEDGE_STORAGE_KEY, SINE_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, WRING_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, BLANCHARD_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, DRESS_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, FLYCUT_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, SNUG_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, COUNTERSINK_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, SPOTFACE_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, TREPAN_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(WEDGE_STORAGE_KEY, "iss:lap-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, SINE_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, WRING_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, BLANCHARD_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, DRESS_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, FLYCUT_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, SNUG_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, COUNTERSINK_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, SPOTFACE_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, TREPAN_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, TAP_COOKIE_NAME);
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-sine-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-wring-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-blanchard-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-dress-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-flycut-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-snug-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-countersink-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-spotface-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-trepan-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-lap-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-clinometer-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-parallel-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-compound-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-incline-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-rotary-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-cupwheel-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-surfacegrind-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-granite-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-joblock-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-interferometer-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-sinebar-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-angleblock-listing-ids");
  assert.notEqual(WEDGE_COOKIE_NAME, "iss-jo-listing-ids");
});
