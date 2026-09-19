import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { LOOP_STORAGE_KEY } from "./listing-loop";
import { NORM_STORAGE_KEY } from "./listing-norm";
import { RIGHTS_STORAGE_KEY } from "./listing-rights";
import { STEMS_STORAGE_KEY } from "./listing-stems";
import { TUNE_STORAGE_KEY } from "./listing-tune";
import {
  CRUSH_COOKIE_NAME,
  CRUSH_NOTICE_TITLE,
  CRUSH_STORAGE_KEY,
  canTapeCrush,
  clearListingCrush,
  crushCookieValue,
  isListingCrushOverlay,
  markListingCrush,
  parseCrushListingIds,
} from "./listing-crush";

test("cookie and storage keys stay the crush paper names", () => {
  assert.equal(CRUSH_STORAGE_KEY, "iss:crush-listing-ids");
  assert.equal(CRUSH_COOKIE_NAME, "iss-crush-listing-ids");
  assert.equal(
    CRUSH_NOTICE_TITLE,
    "I will not crush it. Twelve shots. Still a zip.",
  );
  assert.notEqual(CRUSH_STORAGE_KEY, TUNE_STORAGE_KEY);
  assert.notEqual(CRUSH_STORAGE_KEY, LOOP_STORAGE_KEY);
  assert.notEqual(CRUSH_STORAGE_KEY, STEMS_STORAGE_KEY);
  assert.notEqual(CRUSH_STORAGE_KEY, NORM_STORAGE_KEY);
  assert.notEqual(CRUSH_STORAGE_KEY, RIGHTS_STORAGE_KEY);
});

test("write-result objects never parse as a crush set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-sample-pack"],
  });
  assert.deepEqual(parseCrushListingIds(writeResult), []);
  assert.equal(
    isListingCrushOverlay("dl-sample-pack", parseCrushListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = crushCookieValue(["dl-sample-pack", "dl-sample-pack", ""]);
  assert.equal(raw, '["dl-sample-pack"]');
  assert.deepEqual(parseCrushListingIds(raw), ["dl-sample-pack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
});

test("sample pack tapes; font, LUT, and junk PDF stay off that cookie", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const luts = listingById("dl-camera-luts");
  const pdf = listingById("dl-junk-pricing-pdf");
  assert.ok(canTapeCrush(pack));
  assert.ok(canTapeCrush(font));
  assert.ok(canTapeCrush(luts));
  assert.ok(canTapeCrush(pdf));

  const taped = markListingCrush(pack, []);
  if (!taped) {
    assert.fail("sample pack should take a crush note");
  }
  assert.deepEqual(taped, ["dl-sample-pack"]);
  assert.equal(crushCookieValue(taped), '["dl-sample-pack"]');
  assert.equal(isListingCrushOverlay("dl-sample-pack", taped), true);
  assert.equal(isListingCrushOverlay("dl-booth-font", taped), false);
  assert.equal(isListingCrushOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingCrushOverlay("dl-junk-pricing-pdf", taped), false);
});

test("CD-R, Game Boy, gift, chair, and stain zine refuse a crush write", () => {
  const cdr = listingById("ysk-burned-cdr");
  const boy = listingById("gtk-game-boy");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeCrush(cdr), false);
  assert.equal(canTapeCrush(boy), false);
  assert.equal(canTapeCrush(gift), false);
  assert.equal(canTapeCrush(chair), false);
  assert.equal(canTapeCrush(zine), false);

  assert.equal(markListingCrush(cdr, []), null);
  assert.equal(markListingCrush(boy, []), null);
  assert.equal(markListingCrush(gift, []), null);
  assert.equal(markListingCrush(chair, []), null);
  assert.equal(markListingCrush(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("clear peels only that pack id", () => {
  const pack = listingById("dl-sample-pack");
  const cleared = clearListingCrush(pack, ["dl-sample-pack"]);
  if (!cleared) {
    assert.fail("clear should peel the pack id");
  }
  assert.deepEqual(cleared, []);
  assert.equal(crushCookieValue(cleared), "[]");
});
