import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BLEED_STORAGE_KEY } from "./listing-bleed";
import { COLLATE_STORAGE_KEY } from "./listing-collate";
import { PREFLIGHT_STORAGE_KEY } from "./listing-preflight";
import {
  TRAP_CHAIR_ID,
  TRAP_COOKIE_NAME,
  TRAP_HOST_ID,
  TRAP_LEAVE_LINE,
  TRAP_NOTICE_TITLE,
  TRAP_STORAGE_KEY,
  canTapeTrap,
  clearListingTrap,
  isListingTrapOverlay,
  markListingTrap,
  parseTrapListingIds,
  trapCookieValue,
} from "./listing-trap";
import { TYPESET_STORAGE_KEY } from "./listing-typeset";

test("cookie and storage keys stay the trap paper names", () => {
  assert.equal(TRAP_STORAGE_KEY, "iss:trap-listing-ids");
  assert.equal(TRAP_COOKIE_NAME, "iss-trap-listing-ids");
  assert.equal(TRAP_HOST_ID, "dl-junk-pricing-pdf");
  assert.equal(
    TRAP_NOTICE_TITLE,
    "I will not trap it. Still a junk PDF. Still a driveway print.",
  );
  assert.equal(TRAP_LEAVE_LINE, "Leave the knockout");
  assert.notEqual(TRAP_STORAGE_KEY, PREFLIGHT_STORAGE_KEY);
  assert.notEqual(TRAP_STORAGE_KEY, COLLATE_STORAGE_KEY);
  assert.notEqual(TRAP_STORAGE_KEY, BLEED_STORAGE_KEY);
  assert.notEqual(TRAP_STORAGE_KEY, TYPESET_STORAGE_KEY);
});

test("write-result objects never parse as a trap set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["dl-junk-pricing-pdf"],
  });
  assert.deepEqual(parseTrapListingIds(writeResult), []);
  assert.equal(
    isListingTrapOverlay(
      "dl-junk-pricing-pdf",
      parseTrapListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = trapCookieValue([
    "dl-junk-pricing-pdf",
    "dl-junk-pricing-pdf",
    "",
  ]);
  assert.equal(raw, '["dl-junk-pricing-pdf"]');
  assert.deepEqual(parseTrapListingIds(raw), ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("junk PDF tapes; font, LUT, and pack stay off that cookie", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const lut = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");

  assert.ok(canTapeTrap(pdf));
  assert.equal(canTapeTrap(font), false);
  assert.equal(canTapeTrap(lut), false);
  assert.equal(canTapeTrap(pack), false);

  const taped = markListingTrap(pdf, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  assert.equal(trapCookieValue(taped), '["dl-junk-pricing-pdf"]');
  assert.equal(isListingTrapOverlay("dl-junk-pricing-pdf", taped), true);
  assert.equal(isListingTrapOverlay("dl-booth-font", taped), false);
  assert.equal(isListingTrapOverlay("dl-camera-luts", taped), false);
  assert.equal(isListingTrapOverlay("dl-sample-pack", taped), false);
  assert.equal(pdf?.cartEligible, true);
  assert.equal(pdf?.status, "available");
  assert.equal(pdf?.price.amountCents, 200);
});

test("font, LUT, windbreaker, gift, zine, and chair refuse a trap write", () => {
  const font = listingById("dl-booth-font");
  const lut = listingById("dl-camera-luts");
  const jacket = listingById("clo-windbreaker");
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(TRAP_CHAIR_ID);

  assert.equal(canTapeTrap(font), false);
  assert.equal(canTapeTrap(lut), false);
  assert.equal(canTapeTrap(jacket), false);
  assert.equal(canTapeTrap(gift), false);
  assert.equal(canTapeTrap(zine), false);
  assert.equal(canTapeTrap(chair), false);

  assert.equal(markListingTrap(font, []), null);
  assert.equal(markListingTrap(lut, []), null);
  assert.equal(markListingTrap(jacket, []), null);
  assert.equal(markListingTrap(gift, []), null);
  assert.equal(markListingTrap(zine, []), null);
  assert.equal(markListingTrap(chair, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("liner, lamp, and LP stay off a trap write", () => {
  const liner = listingById("dl-crate-side-a");
  const lamp = listingById("ysk-wobbly-lamp");
  const lp = listingById("mdb-scratched-lp");

  assert.equal(canTapeTrap(liner), false);
  assert.equal(canTapeTrap(lamp), false);
  assert.equal(canTapeTrap(lp), false);
  assert.equal(markListingTrap(liner, []), null);
  assert.equal(markListingTrap(lamp, []), null);
  assert.equal(markListingTrap(lp, []), null);
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  assert.ok(pdf);
  const before = {
    price: pdf.price,
    status: pdf.status,
    cartEligible: pdf.cartEligible,
  };
  const taped = markListingTrap(pdf, []);
  assert.deepEqual(taped, ["dl-junk-pricing-pdf"]);
  const after = listingById("dl-junk-pricing-pdf");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that junk-PDF id", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const cleared = clearListingTrap(pdf, ["dl-junk-pricing-pdf"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(trapCookieValue(cleared), "[]");
  assert.equal(isListingTrapOverlay("dl-junk-pricing-pdf", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const pdf = listingById("dl-junk-pricing-pdf");
  const font = listingById("dl-booth-font");
  const taped = markListingTrap(pdf, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(
    Object.prototype.hasOwnProperty.call(taped, "listingIds"),
    false,
  );
  assert.equal(markListingTrap(font, []), null);

  const cleared = clearListingTrap(pdf, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(TRAP_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingTrap(chair, []), null);
});
