import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { INK_STORAGE_KEY } from "./listing-ink";
import {
  LATHE_COOKIE_NAME,
  LATHE_HOST_ID,
  LATHE_LEAVE_LINE,
  LATHE_NOTICE_TITLE,
  LATHE_STORAGE_KEY,
  canTapeLathe,
  clearListingLathe,
  isListingLatheOverlay,
  latheCookieValue,
  markListingLathe,
  parseLatheListingIds,
} from "./listing-lathe";
import { PLAYS_STORAGE_KEY } from "./listing-plays";
import { POLISH_STORAGE_KEY } from "./listing-polish";

test("cookie and storage keys stay the lathe paper names", () => {
  assert.equal(LATHE_STORAGE_KEY, "iss:lathe-listing-ids");
  assert.equal(LATHE_COOKIE_NAME, "iss-lathe-listing-ids");
  assert.equal(LATHE_HOST_ID, "ysk-burned-cdr");
  assert.equal(
    LATHE_NOTICE_TITLE,
    "I will not lathe it. Still scratched. Still Sharpie.",
  );
  assert.equal(LATHE_LEAVE_LINE, "Leave the scratch");
  assert.notEqual(LATHE_STORAGE_KEY, POLISH_STORAGE_KEY);
  assert.notEqual(LATHE_STORAGE_KEY, INK_STORAGE_KEY);
  assert.notEqual(LATHE_STORAGE_KEY, PLAYS_STORAGE_KEY);
});

test("write-result objects never parse as a lathe set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseLatheListingIds(writeResult), []);
  assert.equal(
    isListingLatheOverlay("ysk-burned-cdr", parseLatheListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = latheCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseLatheListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("disc tapes; pack, font, and overlay hosts stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const boy = listingById("gtk-game-boy");
  const drawer = listingById("gtk-cable-drawer");
  assert.ok(canTapeLathe(disc));
  assert.equal(canTapeLathe(pack), false);
  assert.equal(canTapeLathe(font), false);
  assert.equal(canTapeLathe(boy), false);
  assert.equal(canTapeLathe(drawer), false);

  const taped = markListingLathe(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(latheCookieValue(taped), '["ysk-burned-cdr"]');
  assert.equal(isListingLatheOverlay("ysk-burned-cdr", taped), true);
  assert.equal(isListingLatheOverlay("dl-sample-pack", taped), false);
  assert.equal(isListingLatheOverlay("dl-booth-font", taped), false);
  assert.equal(disc?.cartEligible, true);
  assert.equal(disc?.status, "available");
  assert.equal(disc?.price.amountCents, 300);
});

test("pack, font, gift, zine, and overlay-owned rows refuse a lathe write", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const boy = listingById("gtk-game-boy");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const jewels = listingById("mdb-jewel-stack");
  const mixtape = listingById("mdb-mixtape-93");
  const lamp = listingById("ysk-wobbly-lamp");
  const whisk = listingById("kdr-bent-whisk");
  const junk = listingById("dl-junk-pricing-pdf");

  assert.equal(canTapeLathe(pack), false);
  assert.equal(canTapeLathe(font), false);
  assert.equal(canTapeLathe(gift), false);
  assert.equal(canTapeLathe(zine), false);
  assert.equal(canTapeLathe(boy), false);
  assert.equal(canTapeLathe(jacket), false);
  assert.equal(canTapeLathe(soles), false);
  assert.equal(canTapeLathe(drawer), false);
  assert.equal(canTapeLathe(jewels), false);
  assert.equal(canTapeLathe(mixtape), false);
  assert.equal(canTapeLathe(lamp), false);
  assert.equal(canTapeLathe(whisk), false);
  assert.equal(canTapeLathe(junk), false);

  assert.equal(markListingLathe(pack, []), null);
  assert.equal(markListingLathe(font, []), null);
  assert.equal(markListingLathe(gift, []), null);
  assert.equal(markListingLathe(zine, []), null);
  assert.equal(markListingLathe(boy, []), null);
  assert.equal(markListingLathe(jacket, []), null);
  assert.equal(markListingLathe(soles, []), null);
  assert.equal(markListingLathe(drawer, []), null);
  assert.equal(markListingLathe(jewels, []), null);
  assert.equal(markListingLathe(mixtape, []), null);
  assert.equal(markListingLathe(lamp, []), null);
  assert.equal(markListingLathe(whisk, []), null);
  assert.equal(markListingLathe(junk, []), null);
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
  const taped = markListingLathe(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that disc id", () => {
  const disc = listingById("ysk-burned-cdr");
  const cleared = clearListingLathe(disc, ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(latheCookieValue(cleared), "[]");
  assert.equal(isListingLatheOverlay("ysk-burned-cdr", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const taped = markListingLathe(disc, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingLathe(pack, []), null);

  const cleared = clearListingLathe(disc, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
