import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { CARDS_STORAGE_KEY } from "./listing-cards";
import { DOUBLE_STORAGE_KEY } from "./listing-double";
import { SCALE_STORAGE_KEY } from "./listing-scale";
import { VIBE_STORAGE_KEY } from "./listing-vibe";
import {
  PROOF_CHAIR_ID,
  PROOF_COOKIE_NAME,
  PROOF_HOST_ID,
  PROOF_LEAVE_LINE,
  PROOF_NOTICE_TITLE,
  PROOF_STORAGE_KEY,
  canTapeProof,
  clearListingProof,
  isListingProofOverlay,
  markListingProof,
  parseProofListingIds,
  proofCookieValue,
} from "./listing-proof";

test("cookie and storage keys stay the proof paper names", () => {
  assert.equal(PROOF_STORAGE_KEY, "iss:proof-listing-ids");
  assert.equal(PROOF_COOKIE_NAME, "iss-proof-listing-ids");
  assert.equal(PROOF_HOST_ID, "dl-drawer-recipes");
  assert.equal(
    PROOF_NOTICE_TITLE,
    "I will not proof them. Still three cards. Still vibes.",
  );
  assert.equal(PROOF_LEAVE_LINE, "Leave the vibes");
  assert.notEqual(PROOF_STORAGE_KEY, CARDS_STORAGE_KEY);
  assert.notEqual(PROOF_STORAGE_KEY, VIBE_STORAGE_KEY);
  assert.notEqual(PROOF_STORAGE_KEY, DOUBLE_STORAGE_KEY);
  assert.notEqual(PROOF_STORAGE_KEY, SCALE_STORAGE_KEY);
});

test("write-result objects never parse as a proof set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-drawer-recipes"],
  });
  assert.deepEqual(parseProofListingIds(writeResult), []);
  assert.equal(
    isListingProofOverlay(
      "dl-drawer-recipes",
      parseProofListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = proofCookieValue([
    "dl-drawer-recipes",
    "dl-drawer-recipes",
    "",
  ]);
  assert.equal(raw, '["dl-drawer-recipes"]');
  assert.deepEqual(parseProofListingIds(raw), ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("recipes tape; PDF, font, and lid stay off that cookie", () => {
  const recipes = listingById("dl-drawer-recipes");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const lid = listingById("kdr-lid-no-pot");

  assert.ok(canTapeProof(recipes));
  assert.equal(canTapeProof(pdf), false);
  assert.equal(canTapeProof(font), false);
  assert.equal(canTapeProof(lid), false);

  const taped = markListingProof(recipes, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  assert.equal(proofCookieValue(taped), '["dl-drawer-recipes"]');
  assert.equal(isListingProofOverlay("dl-drawer-recipes", taped), true);
  assert.equal(isListingProofOverlay("dl-junk-pricing-pdf", taped), false);
  assert.equal(isListingProofOverlay("dl-booth-font", taped), false);
  assert.equal(isListingProofOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(recipes?.cartEligible, true);
  assert.equal(recipes?.status, "available");
  assert.equal(recipes?.price.amountCents, 200);
});

test("lid, gift, zine, PDF, font, and overlay-owned rows refuse a proof write", () => {
  const lid = listingById("kdr-lid-no-pot");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const chair = listingById(PROOF_CHAIR_ID);
  const pack = listingById("dl-sample-pack");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeProof(lid), false);
  assert.equal(canTapeProof(gift), false);
  assert.equal(canTapeProof(zine), false);
  assert.equal(canTapeProof(pdf), false);
  assert.equal(canTapeProof(font), false);
  assert.equal(canTapeProof(chair), false);
  assert.equal(canTapeProof(pack), false);
  assert.equal(canTapeProof(mixtape), false);

  assert.equal(markListingProof(lid, []), null);
  assert.equal(markListingProof(gift, []), null);
  assert.equal(markListingProof(zine, []), null);
  assert.equal(markListingProof(pdf, []), null);
  assert.equal(markListingProof(font, []), null);
  assert.equal(markListingProof(chair, []), null);
  assert.equal(markListingProof(pack, []), null);
  assert.equal(markListingProof(mixtape, []), null);
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
  const taped = markListingProof(recipes, []);
  assert.deepEqual(taped, ["dl-drawer-recipes"]);
  const after = listingById("dl-drawer-recipes");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that recipes id", () => {
  const recipes = listingById("dl-drawer-recipes");
  const cleared = clearListingProof(recipes, ["dl-drawer-recipes"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(proofCookieValue(cleared), "[]");
  assert.equal(isListingProofOverlay("dl-drawer-recipes", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const recipes = listingById("dl-drawer-recipes");
  const lid = listingById("kdr-lid-no-pot");
  const taped = markListingProof(recipes, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingProof(lid, []), null);

  const cleared = clearListingProof(recipes, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(PROOF_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingProof(chair, []), null);
});
