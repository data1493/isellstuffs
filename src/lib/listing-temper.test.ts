import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ANNEAL_STORAGE_KEY } from "./listing-anneal";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import { TINES_STORAGE_KEY } from "./listing-tines";
import {
  TEMPER_CHAIR_ID,
  TEMPER_COOKIE_NAME,
  TEMPER_HOST_ID,
  TEMPER_LEAVE_LINE,
  TEMPER_NOTICE_TITLE,
  TEMPER_PACK_ID,
  TEMPER_STORAGE_KEY,
  canTapeTemper,
  clearListingTemper,
  isListingTemperOverlay,
  markListingTemper,
  parseTemperListingIds,
  temperCookieValue,
} from "./listing-temper";

test("cookie and storage keys stay the temper paper names", () => {
  assert.equal(TEMPER_STORAGE_KEY, "iss:temper-listing-ids");
  assert.equal(TEMPER_COOKIE_NAME, "iss-temper-listing-ids");
  assert.equal(TEMPER_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    TEMPER_NOTICE_TITLE,
    "I will not temper it. Still splayed. Still metal.",
  );
  assert.equal(TEMPER_LEAVE_LINE, "Leave the splay");
  assert.notEqual(TEMPER_STORAGE_KEY, ANNEAL_STORAGE_KEY);
  assert.notEqual(TEMPER_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(TEMPER_STORAGE_KEY, TINES_STORAGE_KEY);
});

test("write-result objects never parse as a temper set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseTemperListingIds(writeResult), []);
  assert.equal(
    isListingTemperOverlay(
      "kdr-bent-whisk",
      parseTemperListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = temperCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseTemperListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and sample pack stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const pack = listingById(TEMPER_PACK_ID);
  assert.ok(canTapeTemper(whisk));
  assert.equal(canTapeTemper(mug), false);
  assert.equal(canTapeTemper(lid), false);
  assert.equal(canTapeTemper(pack), false);

  const taped = markListingTemper(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(temperCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingTemperOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingTemperOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingTemperOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingTemperOverlay(TEMPER_PACK_ID, taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, pack, gift, zine, chair, and overlay-owned rows refuse a temper write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const pack = listingById(TEMPER_PACK_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TEMPER_CHAIR_ID);
  const jacket = listingById("clo-windbreaker");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeTemper(mug), false);
  assert.equal(canTapeTemper(lid), false);
  assert.equal(canTapeTemper(recipes), false);
  assert.equal(canTapeTemper(pack), false);
  assert.equal(canTapeTemper(gift), false);
  assert.equal(canTapeTemper(zine), false);
  assert.equal(canTapeTemper(chair), false);
  assert.equal(canTapeTemper(jacket), false);
  assert.equal(canTapeTemper(mixtape), false);

  assert.equal(markListingTemper(mug, []), null);
  assert.equal(markListingTemper(lid, []), null);
  assert.equal(markListingTemper(recipes, []), null);
  assert.equal(markListingTemper(pack, []), null);
  assert.equal(markListingTemper(gift, []), null);
  assert.equal(markListingTemper(zine, []), null);
  assert.equal(markListingTemper(chair, []), null);
  assert.equal(markListingTemper(jacket, []), null);
  assert.equal(markListingTemper(mixtape, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(whisk);
  const before = {
    price: whisk.price,
    status: whisk.status,
    cartEligible: whisk.cartEligible,
  };
  const taped = markListingTemper(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingTemper(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(temperCookieValue(cleared), "[]");
  assert.equal(isListingTemperOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingTemper(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingTemper(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
