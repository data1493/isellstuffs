import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { QUENCH_COOKIE_NAME, QUENCH_STORAGE_KEY } from "./listing-quench";
import { PEEN_STORAGE_KEY } from "./listing-peen";
import { TRUSS_STORAGE_KEY } from "./listing-truss";
import {
  JOGGLE_CHAIR_ID,
  JOGGLE_COOKIE_NAME,
  JOGGLE_HOST_ID,
  JOGGLE_LEAVE_LINE,
  JOGGLE_NOTICE_TITLE,
  JOGGLE_STORAGE_KEY,
  canTapeJoggle,
  clearListingJoggle,
  isListingJoggleOverlay,
  joggleCookieValue,
  markListingJoggle,
  parseJoggleListingIds,
  readJoggleListingIds,
  writeJoggleListingIds,
} from "./listing-joggle";

test("cookie and storage keys stay the joggle paper names", () => {
  assert.equal(JOGGLE_STORAGE_KEY, "iss:joggle-listing-ids");
  assert.equal(JOGGLE_COOKIE_NAME, "iss-joggle-listing-ids");
  assert.equal(JOGGLE_HOST_ID, "kdr-bent-whisk");
  assert.equal(
    JOGGLE_NOTICE_TITLE,
    "I will not joggle it. Still bent. Still metal.",
  );
  assert.equal(JOGGLE_LEAVE_LINE, "Leave the tines");
  assert.notEqual(JOGGLE_STORAGE_KEY, QUENCH_STORAGE_KEY);
  assert.notEqual(JOGGLE_STORAGE_KEY, TRUSS_STORAGE_KEY);
  assert.notEqual(JOGGLE_STORAGE_KEY, PEEN_STORAGE_KEY);
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:upset-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:step-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:kink-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:setover-listing-ids");
  assert.notEqual(JOGGLE_COOKIE_NAME, QUENCH_COOKIE_NAME);
  assert.notEqual(JOGGLE_COOKIE_NAME, "iss-upset-listing-ids");
  assert.notEqual(JOGGLE_COOKIE_NAME, "iss-braze-listing-ids");
});

test("write-result objects never parse as a joggle set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["kdr-bent-whisk"],
  });
  assert.deepEqual(parseJoggleListingIds(writeResult), []);
  assert.equal(
    isListingJoggleOverlay(
      "kdr-bent-whisk",
      parseJoggleListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseJoggleListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = joggleCookieValue(["kdr-bent-whisk", "kdr-bent-whisk", ""]);
  assert.equal(raw, '["kdr-bent-whisk"]');
  assert.deepEqual(parseJoggleListingIds(raw), ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("whisk tapes; mug, lid, and recipes stay off that cookie", () => {
  const whisk = listingById("kdr-bent-whisk");
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  assert.ok(canTapeJoggle(whisk));
  assert.equal(canTapeJoggle(mug), false);
  assert.equal(canTapeJoggle(lid), false);
  assert.equal(canTapeJoggle(recipes), false);

  const taped = markListingJoggle(whisk, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  assert.equal(joggleCookieValue(taped), '["kdr-bent-whisk"]');
  assert.equal(isListingJoggleOverlay("kdr-bent-whisk", taped), true);
  assert.equal(isListingJoggleOverlay("kdr-chipped-mug", taped), false);
  assert.equal(isListingJoggleOverlay("kdr-lid-no-pot", taped), false);
  assert.equal(isListingJoggleOverlay("dl-drawer-recipes", taped), false);
  assert.equal(whisk?.cartEligible, true);
  assert.equal(whisk?.status, "available");
  assert.equal(whisk?.price.amountCents, 200);
});

test("mug, lid, recipes, gift, zine, and overlay-owned rows refuse a joggle write", () => {
  const mug = listingById("kdr-chipped-mug");
  const lid = listingById("kdr-lid-no-pot");
  const recipes = listingById("dl-drawer-recipes");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");

  assert.equal(canTapeJoggle(mug), false);
  assert.equal(canTapeJoggle(lid), false);
  assert.equal(canTapeJoggle(recipes), false);
  assert.equal(canTapeJoggle(gift), false);
  assert.equal(canTapeJoggle(zine), false);
  assert.equal(canTapeJoggle(jacket), false);
  assert.equal(canTapeJoggle(soles), false);
  assert.equal(canTapeJoggle(disc), false);
  assert.equal(canTapeJoggle(mixtape), false);

  assert.equal(markListingJoggle(mug, []), null);
  assert.equal(markListingJoggle(lid, []), null);
  assert.equal(markListingJoggle(recipes, []), null);
  assert.equal(markListingJoggle(gift, []), null);
  assert.equal(markListingJoggle(zine, []), null);
  assert.equal(markListingJoggle(jacket, []), null);
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const whisk = listingById("kdr-bent-whisk");
  assert.ok(whisk);
  const before = {
    price: whisk.price,
    status: whisk.status,
    cartEligible: whisk.cartEligible,
  };
  const taped = markListingJoggle(whisk, []);
  assert.deepEqual(taped, ["kdr-bent-whisk"]);
  const after = listingById("kdr-bent-whisk");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that whisk id", () => {
  const whisk = listingById("kdr-bent-whisk");
  const cleared = clearListingJoggle(whisk, ["kdr-bent-whisk"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(joggleCookieValue(cleared), "[]");
  assert.equal(isListingJoggleOverlay("kdr-bent-whisk", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const whisk = listingById("kdr-bent-whisk");
  const recipes = listingById("dl-drawer-recipes");
  const taped = markListingJoggle(whisk, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingJoggle(recipes, []), null);

  const cleared = clearListingJoggle(whisk, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(JOGGLE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingJoggle(chair, []), null);
});

test("joggle write never aliases quench, planish, braze, or upset paper", () => {
  const whisk = listingById("kdr-bent-whisk");
  const taped = markListingJoggle(whisk, []);
  assert.ok(taped);
  writeJoggleListingIds(taped);
  assert.deepEqual(readJoggleListingIds(), ["kdr-bent-whisk"]);
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:quench-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:planish-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:braze-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:upset-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:truss-listing-ids");
  assert.notEqual(JOGGLE_STORAGE_KEY, "iss:peen-listing-ids");
  assert.notEqual(JOGGLE_COOKIE_NAME, "iss-quench-listing-ids");
  assert.notEqual(JOGGLE_COOKIE_NAME, "iss-upset-listing-ids");
  assert.notEqual(JOGGLE_COOKIE_NAME, "iss-braze-listing-ids");
  writeJoggleListingIds([]);
});
