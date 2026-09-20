import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { REGISTER_STORAGE_KEY } from "./listing-register";
import { VERSO_STORAGE_KEY } from "./listing-verso";
import {
  GALLEY_BOY_ID,
  GALLEY_CHAIR_ID,
  GALLEY_COOKIE_NAME,
  GALLEY_GIFT_ID,
  GALLEY_HOST_ID,
  GALLEY_LEAVE_LINE,
  GALLEY_MIXTAPE_ID,
  GALLEY_NOTICE_TITLE,
  GALLEY_PDF_ID,
  GALLEY_STORAGE_KEY,
  canTapeGalley,
  clearListingGalley,
  galleyCookieValue,
  isListingGalleyOverlay,
  markListingGalley,
  parseGalleyListingIds,
  writeGalleyListingIds,
} from "./listing-galley";

test("cookie and storage keys stay the galley paper names", () => {
  assert.equal(GALLEY_STORAGE_KEY, "iss:galley-listing-ids");
  assert.equal(GALLEY_COOKIE_NAME, "iss-galley-listing-ids");
  assert.equal(GALLEY_HOST_ID, "dl-crate-side-a");
  assert.equal(
    GALLEY_NOTICE_TITLE,
    "I will not galley it. Still one page. Still wrong on purpose.",
  );
  assert.equal(GALLEY_LEAVE_LINE, "Leave the liner");
  assert.notEqual(GALLEY_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(GALLEY_STORAGE_KEY, VERSO_STORAGE_KEY);
  assert.notEqual(GALLEY_STORAGE_KEY, REGISTER_STORAGE_KEY);
});

test("write-result objects never parse as a galley set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-crate-side-a"],
  });
  assert.deepEqual(parseGalleyListingIds(writeResult), []);
  assert.equal(
    isListingGalleyOverlay(
      "dl-crate-side-a",
      parseGalleyListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = galleyCookieValue([
    "dl-crate-side-a",
    "dl-crate-side-a",
    "",
  ]);
  assert.equal(raw, '["dl-crate-side-a"]');
  assert.deepEqual(parseGalleyListingIds(raw), ["dl-crate-side-a"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("liner tapes; mixtape, junk PDF, recipes, and font stay off that cookie", () => {
  const liner = listingById("dl-crate-side-a");
  const mixtape = listingById(GALLEY_MIXTAPE_ID);
  const pdf = listingById(GALLEY_PDF_ID);
  const recipes = listingById("dl-drawer-recipes");
  const font = listingById("dl-booth-font");

  assert.ok(canTapeGalley(liner));
  assert.equal(canTapeGalley(mixtape), false);
  assert.equal(canTapeGalley(pdf), false);
  assert.equal(canTapeGalley(recipes), false);
  assert.equal(canTapeGalley(font), false);

  const taped = markListingGalley(liner, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  assert.equal(galleyCookieValue(taped), '["dl-crate-side-a"]');
  assert.equal(isListingGalleyOverlay("dl-crate-side-a", taped), true);
  assert.equal(isListingGalleyOverlay(GALLEY_MIXTAPE_ID, taped), false);
  assert.equal(isListingGalleyOverlay(GALLEY_PDF_ID, taped), false);
  assert.equal(isListingGalleyOverlay("dl-drawer-recipes", taped), false);
  assert.equal(isListingGalleyOverlay("dl-booth-font", taped), false);
  assert.equal(liner?.cartEligible, true);
  assert.equal(liner?.status, "available");
  assert.equal(liner?.price.amountCents, 150);
});

test("Game Boy, gift, sold chair, mixtape, and junk PDF refuse a galley write", () => {
  const boy = listingById(GALLEY_BOY_ID);
  const gift = listingById(GALLEY_GIFT_ID);
  const chair = listingById(GALLEY_CHAIR_ID);
  const mixtape = listingById(GALLEY_MIXTAPE_ID);
  const pdf = listingById(GALLEY_PDF_ID);
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeGalley(boy), false);
  assert.equal(canTapeGalley(gift), false);
  assert.equal(canTapeGalley(chair), false);
  assert.equal(canTapeGalley(mixtape), false);
  assert.equal(canTapeGalley(pdf), false);
  assert.equal(canTapeGalley(zine), false);

  assert.equal(markListingGalley(boy, []), null);
  assert.equal(markListingGalley(gift, []), null);
  assert.equal(markListingGalley(chair, []), null);
  assert.equal(markListingGalley(mixtape, []), null);
  assert.equal(markListingGalley(pdf, []), null);
  assert.equal(markListingGalley(zine, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const liner = listingById("dl-crate-side-a");
  assert.ok(liner);
  const before = {
    price: liner.price,
    status: liner.status,
    cartEligible: liner.cartEligible,
  };
  const taped = markListingGalley(liner, []);
  assert.deepEqual(taped, ["dl-crate-side-a"]);
  const after = listingById("dl-crate-side-a");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that liner id", () => {
  const liner = listingById("dl-crate-side-a");
  const cleared = clearListingGalley(liner, ["dl-crate-side-a"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(galleyCookieValue(cleared), "[]");
  assert.equal(isListingGalleyOverlay("dl-crate-side-a", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const liner = listingById("dl-crate-side-a");
  const mixtape = listingById(GALLEY_MIXTAPE_ID);
  const taped = markListingGalley(liner, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingGalley(mixtape, []), null);

  const cleared = clearListingGalley(liner, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GALLEY_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGalley(chair, []), null);
});

test("write never touches mat, dedicate, impose, verso, or register storage keys", () => {
  writeGalleyListingIds(["dl-crate-side-a"]);
  assert.equal(GALLEY_STORAGE_KEY, "iss:galley-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.equal(VERSO_STORAGE_KEY, "iss:verso-listing-ids");
  assert.equal(REGISTER_STORAGE_KEY, "iss:register-listing-ids");
  assert.notEqual(GALLEY_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(GALLEY_STORAGE_KEY, VERSO_STORAGE_KEY);
  assert.notEqual(GALLEY_STORAGE_KEY, REGISTER_STORAGE_KEY);
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-mat-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-dedicate-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-impose-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-verso-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-register-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-hickey-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-sprig-listing-ids");
  assert.notEqual(GALLEY_COOKIE_NAME, "iss-flutter-listing-ids");
});
