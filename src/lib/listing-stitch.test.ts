import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CEMENT_STORAGE_KEY } from "./listing-cement";
import { PAD_STORAGE_KEY } from "./listing-pad";
import {
  STITCH_COOKIE_NAME,
  STITCH_LEAVE_LINE,
  STITCH_NOTICE_TITLE,
  STITCH_STORAGE_KEY,
  canTapeStitch,
  clearListingStitch,
  isListingStitchOverlay,
  markListingStitch,
  parseStitchListingIds,
  stitchCookieValue,
} from "./listing-stitch";

test("cookie and storage keys stay the stitch paper names", () => {
  assert.equal(STITCH_STORAGE_KEY, "iss:stitch-listing-ids");
  assert.equal(STITCH_COOKIE_NAME, "iss-stitch-listing-ids");
  assert.equal(
    STITCH_NOTICE_TITLE,
    "I will not stitch them. Still a pair. Still peeling.",
  );
  assert.equal(STITCH_LEAVE_LINE, "Leave the split");
  assert.notEqual(STITCH_STORAGE_KEY, CEMENT_STORAGE_KEY);
  assert.notEqual(STITCH_STORAGE_KEY, PAD_STORAGE_KEY);
});

test("write-result objects never parse as a stitch set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseStitchListingIds(writeResult), []);
  assert.equal(
    isListingStitchOverlay("clo-split-soles", parseStitchListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = stitchCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseStitchListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket and Game Boy stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById("clo-windbreaker");
  const boy = listingById("gtk-game-boy");
  assert.ok(canTapeStitch(soles));
  assert.ok(canTapeStitch(jacket));
  assert.ok(canTapeStitch(boy));

  const taped = markListingStitch(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(stitchCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingStitchOverlay("clo-split-soles", taped), true);
  assert.equal(isListingStitchOverlay("clo-windbreaker", taped), false);
  assert.equal(isListingStitchOverlay("gtk-game-boy", taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("LUTs, sample pack, gift, chair, and stain zine refuse a stitch write", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeStitch(luts), false);
  assert.equal(canTapeStitch(pack), false);
  assert.equal(canTapeStitch(gift), false);
  assert.equal(canTapeStitch(chair), false);
  assert.equal(canTapeStitch(zine), false);

  assert.equal(markListingStitch(luts, []), null);
  assert.equal(markListingStitch(pack, []), null);
  assert.equal(markListingStitch(gift, []), null);
  assert.equal(markListingStitch(chair, []), null);
  assert.equal(markListingStitch(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingStitch(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(stitchCookieValue(cleared), "[]");
  assert.equal(isListingStitchOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const taped = markListingStitch(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingStitch(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
