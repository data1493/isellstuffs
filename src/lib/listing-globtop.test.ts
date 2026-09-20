import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { ACF_COOKIE_NAME, ACF_STORAGE_KEY } from "./listing-acf";
import { FILLET_COOKIE_NAME, FILLET_STORAGE_KEY } from "./listing-fillet";
import { HOTBAR_COOKIE_NAME, HOTBAR_STORAGE_KEY } from "./listing-hotbar";
import { POGO_COOKIE_NAME, POGO_STORAGE_KEY } from "./listing-pogo";
import { REBALL_COOKIE_NAME, REBALL_STORAGE_KEY } from "./listing-reball";
import { REFLOW_COOKIE_NAME, REFLOW_STORAGE_KEY } from "./listing-reflow";
import { SOAK_COOKIE_NAME, SOAK_STORAGE_KEY } from "./listing-soak";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_STORAGE_KEY,
} from "./listing-underfill";
import {
  GLOBTOP_CHAIR_ID,
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_DRAWER_ID,
  GLOBTOP_GIFT_ID,
  GLOBTOP_HOST_ID,
  GLOBTOP_LEAVE_LINE,
  GLOBTOP_LID_ID,
  GLOBTOP_LUT_ID,
  GLOBTOP_NOTICE_TITLE,
  GLOBTOP_STORAGE_KEY,
  GLOBTOP_ZINE_ID,
  canTapeGlobtop,
  clearListingGlobtop,
  globtopCookieValue,
  isListingGlobtopOverlay,
  markListingGlobtop,
  parseGlobtopListingIds,
  readGlobtopListingIds,
  writeGlobtopListingIds,
} from "./listing-globtop";

test("cookie and storage keys stay the globtop paper names", () => {
  assert.equal(GLOBTOP_STORAGE_KEY, "iss:globtop-listing-ids");
  assert.equal(GLOBTOP_COOKIE_NAME, "iss-globtop-listing-ids");
  assert.equal(GLOBTOP_HOST_ID, "gtk-game-boy");
  assert.equal(
    GLOBTOP_NOTICE_TITLE,
    "I will not globtop it. Still a crack. Still Tetris.",
  );
  assert.equal(GLOBTOP_LEAVE_LINE, "Leave the blob");
  assert.notEqual(GLOBTOP_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:ncf-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:cof-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:encapsulant-listing-ids");
  assert.notEqual(GLOBTOP_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, REFLOW_COOKIE_NAME);
});

test("write-result objects never parse as a globtop set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseGlobtopListingIds(writeResult), []);
  assert.equal(
    isListingGlobtopOverlay(
      "gtk-game-boy",
      parseGlobtopListingIds(writeResult),
    ),
    false,
  );
  assert.deepEqual(parseGlobtopListingIds(JSON.stringify({ ok: true })), []);
});

test("cookie value is always a string array", () => {
  const raw = globtopCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseGlobtopListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer, lid, and LUT stay off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById(GLOBTOP_DRAWER_ID);
  const lid = listingById(GLOBTOP_LID_ID);
  const lut = listingById(GLOBTOP_LUT_ID);

  assert.ok(canTapeGlobtop(boy));
  assert.equal(canTapeGlobtop(drawer), false);
  assert.equal(canTapeGlobtop(lid), false);
  assert.equal(canTapeGlobtop(lut), false);

  const taped = markListingGlobtop(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(globtopCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingGlobtopOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingGlobtopOverlay(GLOBTOP_DRAWER_ID, taped), false);
  assert.equal(isListingGlobtopOverlay(GLOBTOP_LID_ID, taped), false);
  assert.equal(isListingGlobtopOverlay(GLOBTOP_LUT_ID, taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUT, drawer, lid, gift, zine, and chair refuse a globtop write", () => {
  const lut = listingById(GLOBTOP_LUT_ID);
  const drawer = listingById(GLOBTOP_DRAWER_ID);
  const lid = listingById(GLOBTOP_LID_ID);
  const gift = listingById(GLOBTOP_GIFT_ID);
  const zine = listingById(GLOBTOP_ZINE_ID);
  const chair = listingById(GLOBTOP_CHAIR_ID);

  assert.equal(canTapeGlobtop(lut), false);
  assert.equal(canTapeGlobtop(drawer), false);
  assert.equal(canTapeGlobtop(lid), false);
  assert.equal(canTapeGlobtop(gift), false);
  assert.equal(canTapeGlobtop(zine), false);
  assert.equal(canTapeGlobtop(chair), false);

  assert.equal(markListingGlobtop(lut, []), null);
  assert.equal(markListingGlobtop(drawer, []), null);
  assert.equal(markListingGlobtop(lid, []), null);
  assert.equal(markListingGlobtop(gift, []), null);
  assert.equal(markListingGlobtop(zine, []), null);
  assert.equal(markListingGlobtop(chair, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const boy = listingById("gtk-game-boy");
  assert.ok(boy);
  const before = {
    price: boy.price,
    status: boy.status,
    cartEligible: boy.cartEligible,
  };
  const taped = markListingGlobtop(boy, []);
  assert.deepEqual(taped, ["gtk-game-boy"]);
  const after = listingById("gtk-game-boy");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingGlobtop(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(globtopCookieValue(cleared), "[]");
  assert.equal(isListingGlobtopOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const lut = listingById(GLOBTOP_LUT_ID);
  const taped = markListingGlobtop(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingGlobtop(lut, []), null);

  const cleared = clearListingGlobtop(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(GLOBTOP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingGlobtop(chair, []), null);
});

test("globtop write does not write acf, soak, hotbar, pogo, underfill, reball, fillet, clock, or reflow paper", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingGlobtop(boy, []);
  assert.ok(taped);
  writeGlobtopListingIds(taped);
  assert.deepEqual(readGlobtopListingIds(), ["gtk-game-boy"]);
  assert.notEqual(GLOBTOP_STORAGE_KEY, ACF_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, SOAK_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, HOTBAR_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, POGO_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, UNDERFILL_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, REBALL_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, FILLET_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, REFLOW_STORAGE_KEY);
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:clock-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:zaxis-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:anisotropic-listing-ids");
  assert.notEqual(GLOBTOP_STORAGE_KEY, "iss:film-listing-ids");
  assert.notEqual(GLOBTOP_COOKIE_NAME, ACF_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, SOAK_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, HOTBAR_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, POGO_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, UNDERFILL_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, REBALL_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, FILLET_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, REFLOW_COOKIE_NAME);
  assert.notEqual(GLOBTOP_COOKIE_NAME, "iss-clock-listing-ids");
  writeGlobtopListingIds([]);
});
