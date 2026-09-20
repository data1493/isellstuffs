import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { PROOF_STORAGE_KEY } from "./listing-proof";
import { SCALE_STORAGE_KEY } from "./listing-scale";
import { VIBE_STORAGE_KEY } from "./listing-vibe";
import {
  REGISTER_CHAIR_ID,
  REGISTER_COOKIE_NAME,
  REGISTER_HOST_ID,
  REGISTER_JACKET_ID,
  REGISTER_LEAVE_LINE,
  REGISTER_NOTICE_TITLE,
  REGISTER_STORAGE_KEY,
  canTapeRegister,
  clearListingRegister,
  isListingRegisterOverlay,
  markListingRegister,
  parseRegisterListingIds,
  registerCookieValue,
} from "./listing-register";

test("cookie and storage keys stay the register paper names", () => {
  assert.equal(REGISTER_STORAGE_KEY, "iss:register-listing-ids");
  assert.equal(REGISTER_COOKIE_NAME, "iss-register-listing-ids");
  assert.equal(REGISTER_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    REGISTER_NOTICE_TITLE,
    "I will not register it. Still three cards. Still vibes.",
  );
  assert.equal(REGISTER_LEAVE_LINE, "Leave the scan");
  assert.notEqual(REGISTER_STORAGE_KEY, PROOF_STORAGE_KEY);
  assert.notEqual(REGISTER_STORAGE_KEY, SCALE_STORAGE_KEY);
  assert.notEqual(REGISTER_STORAGE_KEY, VIBE_STORAGE_KEY);
});

test("write-result objects never parse as a register set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseRegisterListingIds(writeResult), []);
  assert.equal(
    isListingRegisterOverlay(
      "dl-drawer-recipes",
      parseRegisterListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = registerCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseRegisterListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; PDF, font, jacket, and lid stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const jacket = listingById(REGISTER_JACKET_ID);
  const lid = listingById("kdr-lid-no-pot");

  assert.ok(canTapeRegister(recipes));
  assert.equal(canTapeRegister(pdf), false);
  assert.equal(canTapeRegister(font), false);
  assert.equal(canTapeRegister(jacket), false);
  assert.equal(canTapeRegister(lid), false);

  const taped = markListingRegister(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(registerCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingRegisterOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingRegisterOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingRegisterOverlay("dl-booth-font", taped), false);
  assert.equal(isListingRegisterOverlay("clo-windbreaker", taped), false);
  assert.equal(isListingRegisterOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("jacket, gift, zine, PDF, font, and overlay-owned rows refuse a register write", () => {
  const jacket = listingById(REGISTER_JACKET_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const chair = listingById(REGISTER_CHAIR_ID);
  const pack = listingById("dl-sample-pack");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeRegister(jacket), false);
  assert.equal(canTapeRegister(gift), false);
  assert.equal(canTapeRegister(zine), false);
  assert.equal(canTapeRegister(pdf), false);
  assert.equal(canTapeRegister(font), false);
  assert.equal(canTapeRegister(chair), false);
  assert.equal(canTapeRegister(pack), false);
  assert.equal(canTapeRegister(mixtape), false);

  assert.equal(markListingRegister(jacket, []), null);
  assert.equal(markListingRegister(gift, []), null);
  assert.equal(markListingRegister(zine, []), null);
  assert.equal(markListingRegister(pdf, []), null);
  assert.equal(markListingRegister(font, []), null);
  assert.equal(markListingRegister(chair, []), null);
  assert.equal(markListingRegister(pack, []), null);
  assert.equal(markListingRegister(mixtape, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(recipes);
  const before = {
    price: recipes.price,
    status: recipes.status,
    cartEligible: recipes.cartEligible,
  };
  const taped = markListingRegister(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingRegister(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(registerCookieValue(cleared), "[]");
  assert.equal(isListingRegisterOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const jacket = listingById(REGISTER_JACKET_ID);
  const taped = markListingRegister(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingRegister(jacket, []), null);

  const cleared = clearListingRegister(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(REGISTER_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingRegister(chair, []), null);
});
