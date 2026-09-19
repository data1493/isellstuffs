import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CONTENTS_STORAGE_KEY } from "./listing-contents";
import { DUB_STORAGE_KEY } from "./listing-dub";
import { FERRITE_STORAGE_KEY } from "./listing-ferrite";
import { INK_STORAGE_KEY } from "./listing-ink";
import {
  FINALIZE_COOKIE_NAME,
  FINALIZE_LEAVE_LINE,
  FINALIZE_NOTICE_TITLE,
  FINALIZE_STORAGE_KEY,
  canTapeFinalize,
  clearListingFinalize,
  finalizeCookieValue,
  isListingFinalizeOverlay,
  markListingFinalize,
  parseFinalizeListingIds,
} from "./listing-finalize";
import { PLAYS_STORAGE_KEY } from "./listing-plays";
import { POLISH_STORAGE_KEY } from "./listing-polish";
import { STITCH_STORAGE_KEY } from "./listing-stitch";
import { VARIABLE_STORAGE_KEY } from "./listing-variable";

test("cookie and storage keys stay the finalize paper names", () => {
  assert.equal(FINALIZE_STORAGE_KEY, "iss:finalize-listing-ids");
  assert.equal(FINALIZE_COOKIE_NAME, "iss-finalize-listing-ids");
  assert.equal(
    FINALIZE_NOTICE_TITLE,
    "I will not finalize it. Still Sharpie. Still scratched.",
  );
  assert.equal(FINALIZE_LEAVE_LINE, "Leave the session");
  assert.notEqual(FINALIZE_STORAGE_KEY, POLISH_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, INK_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, PLAYS_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, CONTENTS_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, STITCH_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, VARIABLE_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, DUB_STORAGE_KEY);
  assert.notEqual(FINALIZE_STORAGE_KEY, FERRITE_STORAGE_KEY);
});

test("write-result objects never parse as a finalize set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseFinalizeListingIds(writeResult), []);
  assert.equal(
    isListingFinalizeOverlay(
      "ysk-burned-cdr",
      parseFinalizeListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = finalizeCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseFinalizeListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("CD-R tapes; other overlay hosts stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const soles = listingById("clo-split-soles");
  const jacket = listingById("clo-windbreaker");
  const cable = listingById("gtk-cable-drawer");
  const mixtape = listingById("mdb-mixtape-93");

  assert.ok(canTapeFinalize(disc));
  assert.equal(canTapeFinalize(pack), false);
  assert.equal(canTapeFinalize(font), false);
  assert.ok(canTapeFinalize(soles));
  assert.ok(canTapeFinalize(jacket));
  assert.ok(canTapeFinalize(cable));
  assert.ok(canTapeFinalize(mixtape));

  const taped = markListingFinalize(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(finalizeCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingFinalizeOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingFinalizeOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingFinalizeOverlay("dl-booth-font", taped), false);
  assert.equal(isListingFinalizeOverlay("clo-split-soles", taped), false);
  assert.equal(isListingFinalizeOverlay("clo-windbreaker", taped), false);
  assert.equal(isListingFinalizeOverlay("gtk-cable-drawer", taped), false);
  assert.equal(isListingFinalizeOverlay("mdb-mixtape-93", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("sample pack, booth font, gift, and stain zine refuse a finalize write", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeFinalize(pack), false);
  assert.equal(canTapeFinalize(font), false);
  assert.equal(canTapeFinalize(gift), false);
  assert.equal(canTapeFinalize(zine), false);

  assert.equal(markListingFinalize(pack, []), null);
  assert.equal(markListingFinalize(font, []), null);
  assert.equal(markListingFinalize(gift, []), null);
  assert.equal(markListingFinalize(zine, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const disc = listingById("ysk-burned-cdr");
  assert.ok(disc);
  const before = {
    price: disc.price,
    status: disc.status,
    cartEligible: disc.cartEligible,
  };
  const taped = markListingFinalize(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that CD-R id", () => {
  const disc = listingById("ysk-burned-cdr");
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingFinalize(lamp, ["ysk-burned-cdr"]);
  assert.deepEqual(taped, ["ysk-burned-cdr", "ysk-wobbly-lamp"]);
  const cleared = clearListingFinalize(disc, taped!);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, ["ysk-wobbly-lamp"]);
  assert.equal(finalizeCookieValue(cleared!), '["ysk-wobbly-lamp"]');
  assert.equal(isListingFinalizeOverlay("ysk-burned-cdr", cleared!), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const taped = markListingFinalize(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingFinalize(pack, []), null);

  const cleared = clearListingFinalize(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
