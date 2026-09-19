import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  SAND_COOKIE_NAME,
  SAND_NOTICE_TITLE,
  SAND_STORAGE_KEY,
  canTapeSand,
  clearListingSand,
  isListingSandOverlay,
  markListingSand,
  parseSandListingIds,
  sandCookieValue,
} from "./listing-sand";

test("cookie and storage keys stay the sand paper names", () => {
  assert.equal(SAND_STORAGE_KEY, "iss:sand-listing-ids");
  assert.equal(SAND_COOKIE_NAME, "iss-sand-listing-ids");
  assert.equal(
    SAND_NOTICE_TITLE,
    "I will not sand it. Chip stays. Still a mug.",
  );
});

test("write-result objects never parse as a sand set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-chipped-mug"],
  });
  assert.deepEqual(parseSandListingIds(writeResult), []);
  assert.equal(isListingSandOverlay("kdr-chipped-mug", parseSandListingIds(writeResult)), false);
});

test("cookie value is always a string array", () => {
  const raw = sandCookieValue(["kdr-chipped-mug", "kdr-chipped-mug", ""]);
  assert.equal(raw, '["kdr-chipped-mug"]');
  assert.deepEqual(parseSandListingIds(raw), ["kdr-chipped-mug"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
});

test("physical mug tapes; lid and whisk stay off that cookie", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const whisk = listingById("kdr-bent-whisk");
  const lamp = listingById("ysk-wobbly-lamp");
  assert.ok(canTapeSand(mug));
  assert.ok(canTapeSand(lid));
  assert.ok(canTapeSand(whisk));
  assert.ok(canTapeSand(lamp));

  const taped = markListingSand(mug, []);
  assert.equal(taped.ok, true);
  if (taped.ok) {
    assert.deepEqual(taped.listingIds, ["kdr-chipped-mug"]);
    assert.equal(sandCookieValue(taped.listingIds), '["kdr-chipped-mug"]');
    assert.equal(isListingSandOverlay("kdr-lid-no-pot", taped.listingIds), false);
    assert.equal(isListingSandOverlay("kdr-bent-whisk", taped.listingIds), false);
    assert.equal(isListingSandOverlay("ysk-wobbly-lamp", taped.listingIds), false);
  }
});

test("recipes, gift, chair, and stain zine refuse a sand write", () => {
  const recipes = listingById("dl-drawer-recipes");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeSand(recipes), false);
  assert.equal(canTapeSand(gift), false);
  assert.equal(canTapeSand(chair), false);
  assert.equal(canTapeSand(zine), false);

  assert.equal(markListingSand(recipes, []).ok, false);
  assert.equal(markListingSand(gift, []).ok, false);
  assert.equal(markListingSand(chair, []).ok, false);
  assert.equal(markListingSand(zine, []).ok, false);
  assert.deepEqual(markListingSand(recipes, []).listingIds, []);
});

test("clear peels only that mug id", () => {
  const mug = listingById("kdr-chipped-mug");
  const cleared = clearListingSand(mug, ["kdr-chipped-mug"]);
  assert.equal(cleared.ok, true);
  if (cleared.ok) {
    assert.deepEqual(cleared.listingIds, []);
    assert.equal(sandCookieValue(cleared.listingIds), "[]");
  }
});
