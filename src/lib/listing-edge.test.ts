import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { BURNISH_STORAGE_KEY } from "./listing-burnish";
import { DARN_STORAGE_KEY } from "./listing-darn";
import { MAT_STORAGE_KEY } from "./listing-mat";
import { PLEAT_STORAGE_KEY } from "./listing-pleat";
import { SCRAPE_STORAGE_KEY } from "./listing-scrape";
import { SKIVE_STORAGE_KEY } from "./listing-skive";
import { TAP_STORAGE_KEY } from "./listing-tap";
import { WELT_STORAGE_KEY } from "./listing-welt";
import {
  EDGE_CHAIR_ID,
  EDGE_COOKIE_NAME,
  EDGE_FONT_ID,
  EDGE_HOST_ID,
  EDGE_JACKET_ID,
  EDGE_LEAVE_LINE,
  EDGE_NOTICE_TITLE,
  EDGE_STORAGE_KEY,
  canTapeEdge,
  clearListingEdge,
  edgeCookieValue,
  isListingEdgeOverlay,
  markListingEdge,
  parseEdgeListingIds,
  writeEdgeListingIds,
} from "./listing-edge";

test("cookie and storage keys stay the edge paper names", () => {
  assert.equal(EDGE_STORAGE_KEY, "iss:edge-listing-ids");
  assert.equal(EDGE_COOKIE_NAME, "iss-edge-listing-ids");
  assert.equal(EDGE_HOST_ID, "clo-split-soles");
  assert.equal(
    EDGE_NOTICE_TITLE,
    "I will not edge it. Still a pair. Still a peel.",
  );
  assert.equal(EDGE_LEAVE_LINE, "Leave the peel");
  assert.notEqual(EDGE_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, BURNISH_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, SCRAPE_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, DARN_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, PLEAT_STORAGE_KEY);
});

test("write-result objects never parse as an edge set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["clo-split-soles"],
  });
  assert.deepEqual(parseEdgeListingIds(writeResult), []);
  assert.equal(
    isListingEdgeOverlay("clo-split-soles", parseEdgeListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = edgeCookieValue(["clo-split-soles", "clo-split-soles", ""]);
  assert.equal(raw, '["clo-split-soles"]');
  assert.deepEqual(parseEdgeListingIds(raw), ["clo-split-soles"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("soles tape; jacket and font stay off that cookie", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(EDGE_JACKET_ID);
  const font = listingById(EDGE_FONT_ID);

  assert.ok(canTapeEdge(soles));
  assert.equal(canTapeEdge(jacket), false);
  assert.equal(canTapeEdge(font), false);

  const taped = markListingEdge(soles, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["clo-split-soles"]);
  assert.equal(edgeCookieValue(taped), '["clo-split-soles"]');
  assert.equal(isListingEdgeOverlay("clo-split-soles", taped), true);
  assert.equal(isListingEdgeOverlay(EDGE_JACKET_ID, taped), false);
  assert.equal(isListingEdgeOverlay(EDGE_FONT_ID, taped), false);
  assert.equal(soles?.cartEligible, true);
  assert.equal(soles?.status, "available");
  assert.equal(soles?.price.amountCents, 1400);
});

test("jacket, font, gift, zine, chair, liner, and LP refuse an edge write", () => {
  const jacket = listingById(EDGE_JACKET_ID);
  const font = listingById(EDGE_FONT_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const chair = listingById(EDGE_CHAIR_ID);
  const liner = listingById("dl-crate-side-a");
  const lp = listingById("mdb-scratched-lp");
  const lid = listingById("kdr-lid-no-pot");

  assert.equal(canTapeEdge(jacket), false);
  assert.equal(canTapeEdge(font), false);
  assert.equal(canTapeEdge(gift), false);
  assert.equal(canTapeEdge(zine), false);
  assert.equal(canTapeEdge(chair), false);
  assert.equal(canTapeEdge(liner), false);
  assert.equal(canTapeEdge(lp), false);
  assert.equal(canTapeEdge(lid), false);

  assert.equal(markListingEdge(jacket, []), null);
  assert.equal(markListingEdge(font, []), null);
  assert.equal(markListingEdge(gift, []), null);
  assert.equal(markListingEdge(zine, []), null);
  assert.equal(markListingEdge(chair, []), null);
  assert.equal(markListingEdge(liner, []), null);
  assert.equal(markListingEdge(lp, []), null);
  assert.equal(markListingEdge(lid, []), null);
  assert.equal(zine?.status, "file-gone");
  assert.equal(chair?.status, "sold");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const soles = listingById("clo-split-soles");
  assert.ok(soles);
  const before = {
    price: soles.price,
    status: soles.status,
    cartEligible: soles.cartEligible,
  };
  const taped = markListingEdge(soles, []);
  assert.deepEqual(taped, ["clo-split-soles"]);
  const after = listingById("clo-split-soles");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that pair id", () => {
  const soles = listingById("clo-split-soles");
  const cleared = clearListingEdge(soles, ["clo-split-soles"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(edgeCookieValue(cleared), "[]");
  assert.equal(isListingEdgeOverlay("clo-split-soles", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const soles = listingById("clo-split-soles");
  const jacket = listingById(EDGE_JACKET_ID);
  const taped = markListingEdge(soles, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingEdge(jacket, []), null);

  const cleared = clearListingEdge(soles, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(EDGE_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingEdge(chair, []), null);
});

test("write never touches skive, welt, burnish, scrape, mat, or tap storage keys", () => {
  writeEdgeListingIds(["clo-split-soles"]);
  assert.equal(EDGE_STORAGE_KEY, "iss:edge-listing-ids");
  assert.equal(SKIVE_STORAGE_KEY, "iss:skive-listing-ids");
  assert.equal(WELT_STORAGE_KEY, "iss:welt-listing-ids");
  assert.equal(BURNISH_STORAGE_KEY, "iss:burnish-listing-ids");
  assert.equal(SCRAPE_STORAGE_KEY, "iss:scrape-listing-ids");
  assert.equal(MAT_STORAGE_KEY, "iss:mat-listing-ids");
  assert.equal(TAP_STORAGE_KEY, "iss:tap-listing-ids");
  assert.notEqual(EDGE_STORAGE_KEY, SKIVE_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, WELT_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, BURNISH_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, SCRAPE_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, MAT_STORAGE_KEY);
  assert.notEqual(EDGE_STORAGE_KEY, TAP_STORAGE_KEY);
  assert.notEqual(EDGE_COOKIE_NAME, "iss-skive-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-welt-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-scrape-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-mat-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-tap-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-erase-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-foxing-listing-ids");
  assert.notEqual(EDGE_COOKIE_NAME, "iss-dye-listing-ids");
});
