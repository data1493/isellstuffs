import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { AZIMUTH_STORAGE_KEY } from "./listing-azimuth";
import { BOX_STORAGE_KEY } from "./listing-box";
import { FINALIZE_STORAGE_KEY } from "./listing-finalize";
import { LED_STORAGE_KEY } from "./listing-led";
import { TWIST_STORAGE_KEY } from "./listing-twist";
import {
  GROMMET_COOKIE_NAME,
  GROMMET_HOST_ID,
  GROMMET_LEAVE_LINE,
  GROMMET_NOTICE_TITLE,
  GROMMET_STORAGE_KEY,
  canTapeGrommet,
  clearListingGrommet,
  grommetCookieValue,
  isListingGrommetOverlay,
  markListingGrommet,
  parseGrommetListingIds,
} from "./listing-grommet";

test("cookie and storage keys stay the grommet paper names", () => {
  assert.equal(GROMMET_STORAGE_KEY, "iss:grommet-listing-ids");
  assert.equal(GROMMET_COOKIE_NAME, "iss-grommet-listing-ids");
  assert.equal(GROMMET_HOST_ID, "ysk-wobbly-lamp");
  assert.equal(
    GROMMET_NOTICE_TITLE,
    "I will not grommet it. Still a tired box. Still a wobbly neck.",
  );
  assert.equal(GROMMET_LEAVE_LINE, "Leave the shade");
  assert.notEqual(GROMMET_STORAGE_KEY, TWIST_STORAGE_KEY);
  assert.notEqual(GROMMET_STORAGE_KEY, LED_STORAGE_KEY);
  assert.notEqual(GROMMET_STORAGE_KEY, BOX_STORAGE_KEY);
  assert.notEqual(GROMMET_STORAGE_KEY, AZIMUTH_STORAGE_KEY);
  assert.notEqual(GROMMET_STORAGE_KEY, FINALIZE_STORAGE_KEY);
});

test("write-result objects never parse as a grommet set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-wobbly-lamp"],
  });
  assert.deepEqual(parseGrommetListingIds(writeResult), []);
  assert.equal(
    isListingGrommetOverlay(
      "ysk-wobbly-lamp",
      parseGrommetListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = grommetCookieValue(["ysk-wobbly-lamp", "ysk-wobbly-lamp", ""]);
  assert.equal(raw, '["ysk-wobbly-lamp"]');
  assert.deepEqual(parseGrommetListingIds(raw), ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("lamp tapes; chair, Game Boy, and overlay hosts stay off that cookie", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const chair = listingById("ysk-folding-chair");
  const boy = listingById("gtk-game-boy");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(canTapeGrommet(lamp));
  assert.equal(canTapeGrommet(chair), false);
  assert.equal(canTapeGrommet(boy), false);
  assert.equal(canTapeGrommet(mixtape), false);
  assert.equal(canTapeGrommet(jewels), false);
  assert.equal(canTapeGrommet(whisk), false);

  const taped = markListingGrommet(lamp, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  assert.equal(grommetCookieValue(taped), '["ysk-wobbly-lamp"]');
  assert.equal(isListingGrommetOverlay("ysk-wobbly-lamp", taped), true);
  assert.equal(isListingGrommetOverlay("ysk-folding-chair", taped), false);
  assert.equal(isListingGrommetOverlay("gtk-game-boy", taped), false);
  assert.equal(isListingGrommetOverlay("mdb-mixtape-93", taped), false);
  assert.equal(lamp?.cartEligible, true);
  assert.equal(lamp?.status, "available");
  assert.equal(lamp?.price.amountCents, 1200);
});

test("chair, junk PDF, Game Boy, gift, zine, and overlay-owned rows refuse a grommet write", () => {
  const chair = listingById("ysk-folding-chair");
  const junk = listingById("dl-junk-pricing-pdf");
  const boy = listingById("gtk-game-boy");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");
  const jewels = listingById("mdb-jewel-stack");
  const whisk = listingById("kdr-bent-whisk");

  assert.equal(canTapeGrommet(chair), false);
  assert.equal(canTapeGrommet(junk), false);
  assert.equal(canTapeGrommet(boy), false);
  assert.equal(canTapeGrommet(gift), false);
  assert.equal(canTapeGrommet(zine), false);
  assert.equal(canTapeGrommet(jacket), false);
  assert.equal(canTapeGrommet(soles), false);
  assert.equal(canTapeGrommet(drawer), false);
  assert.equal(canTapeGrommet(disc), false);
  assert.equal(canTapeGrommet(mixtape), false);
  assert.equal(canTapeGrommet(jewels), false);
  assert.equal(canTapeGrommet(whisk), false);

  assert.equal(markListingGrommet(chair, []), null);
  assert.equal(markListingGrommet(junk, []), null);
  assert.equal(markListingGrommet(boy, []), null);
  assert.equal(markListingGrommet(gift, []), null);
  assert.equal(markListingGrommet(zine, []), null);
  assert.equal(markListingGrommet(jacket, []), null);
  assert.equal(markListingGrommet(soles, []), null);
  assert.equal(markListingGrommet(drawer, []), null);
  assert.equal(markListingGrommet(disc, []), null);
  assert.equal(markListingGrommet(mixtape, []), null);
  assert.equal(markListingGrommet(jewels, []), null);
  assert.equal(markListingGrommet(whisk, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  assert.ok(lamp);
  const before = {
    price: lamp.price,
    status: lamp.status,
    cartEligible: lamp.cartEligible,
  };
  const taped = markListingGrommet(lamp, []);
  assert.deepEqual(taped, ["ysk-wobbly-lamp"]);
  const after = listingById("ysk-wobbly-lamp");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that lamp id", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const cleared = clearListingGrommet(lamp, ["ysk-wobbly-lamp"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(grommetCookieValue(cleared), "[]");
  assert.equal(isListingGrommetOverlay("ysk-wobbly-lamp", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingGrommet(lamp, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingGrommet(lamp, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
