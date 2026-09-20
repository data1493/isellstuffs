import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import { FOAM_STORAGE_KEY } from "./listing-foam";
import { NEST_STORAGE_KEY } from "./listing-nest";
import { TUMBLE_STORAGE_KEY } from "./listing-tumble";
import { VACUUM_STORAGE_KEY } from "./listing-vacuum";
import { ERASE_STORAGE_KEY } from "./listing-erase";
import {
  WELD_CHAIR_ID,
  WELD_COOKIE_NAME,
  WELD_HOST_ID,
  WELD_LEAVE_LINE,
  WELD_NOTICE_TITLE,
  WELD_STORAGE_KEY,
  canTapeWeld,
  clearListingWeld,
  isListingWeldOverlay,
  markListingWeld,
  parseWeldListingIds,
  weldCookieValue,
} from "./listing-weld";

test("cookie and storage keys stay the weld paper names", () => {
  assert.equal(WELD_STORAGE_KEY, "iss:weld-listing-ids");
  assert.equal(WELD_COOKIE_NAME, "iss-weld-listing-ids");
  assert.equal(WELD_HOST_ID, "mdb-jewel-stack");
  assert.equal(
    WELD_NOTICE_TITLE,
    "I will not weld them. Still five empties. Still one hinge gone.",
  );
  assert.equal(WELD_LEAVE_LINE, "Leave the empties");
  assert.notEqual(WELD_STORAGE_KEY, FOAM_STORAGE_KEY);
  assert.notEqual(WELD_STORAGE_KEY, NEST_STORAGE_KEY);
  assert.notEqual(WELD_STORAGE_KEY, TUMBLE_STORAGE_KEY);
  assert.notEqual(WELD_STORAGE_KEY, VACUUM_STORAGE_KEY);
  assert.notEqual(WELD_STORAGE_KEY, ERASE_STORAGE_KEY);
});

test("write-result objects never parse as a weld set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-jewel-stack"],
  });
  assert.deepEqual(parseWeldListingIds(writeResult), []);
  assert.equal(
    isListingWeldOverlay("mdb-jewel-stack", parseWeldListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = weldCookieValue(["mdb-jewel-stack", "mdb-jewel-stack", ""]);
  assert.equal(raw, '["mdb-jewel-stack"]');
  assert.deepEqual(parseWeldListingIds(raw), ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("jewel stack tapes; LP, mixtape, and liner stay off that cookie", () => {
  const jewels = listingById("mdb-jewel-stack");
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const liner = listingById("dl-crate-side-a");

  assert.ok(canTapeWeld(jewels));
  assert.equal(canTapeWeld(lp), false);
  assert.equal(canTapeWeld(mixtape), false);
  assert.equal(canTapeWeld(liner), false);

  const taped = markListingWeld(jewels, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  assert.equal(weldCookieValue(taped), '["mdb-jewel-stack"]');
  assert.equal(isListingWeldOverlay("mdb-jewel-stack", taped), true);
  assert.equal(isListingWeldOverlay("mdb-scratched-lp", taped), false);
  assert.equal(isListingWeldOverlay("mdb-mixtape-93", taped), false);
  assert.equal(isListingWeldOverlay("dl-crate-side-a", taped), false);
  assert.equal(jewels?.cartEligible, true);
  assert.equal(jewels?.status, "available");
  assert.equal(jewels?.price.amountCents, 250);
});

test("LP, mixtape, liner, chair, gift, zine, and overlay-owned rows refuse a weld write", () => {
  const lp = listingById("mdb-scratched-lp");
  const mixtape = listingById("mdb-mixtape-93");
  const liner = listingById("dl-crate-side-a");
  const chair = listingById(WELD_CHAIR_ID);
  const gift = listingById("dl-mall-gift-card");
  const zine = listingById("dl-stain-zine");
  const pack = listingById("dl-sample-pack");
  const jacket = listingById("clo-windbreaker");
  const soles = listingById("clo-split-soles");
  const drawer = listingById("gtk-cable-drawer");

  assert.equal(canTapeWeld(lp), false);
  assert.equal(canTapeWeld(mixtape), false);
  assert.equal(canTapeWeld(liner), false);
  assert.equal(canTapeWeld(chair), false);
  assert.equal(canTapeWeld(gift), false);
  assert.equal(canTapeWeld(zine), false);
  assert.equal(canTapeWeld(pack), false);
  assert.equal(canTapeWeld(jacket), false);
  assert.equal(canTapeWeld(soles), false);
  assert.equal(canTapeWeld(drawer), false);

  assert.equal(markListingWeld(lp, []), null);
  assert.equal(markListingWeld(mixtape, []), null);
  assert.equal(markListingWeld(liner, []), null);
  assert.equal(markListingWeld(chair, []), null);
  assert.equal(markListingWeld(gift, []), null);
  assert.equal(markListingWeld(zine, []), null);
  assert.equal(markListingWeld(pack, []), null);
  assert.equal(markListingWeld(jacket, []), null);
  assert.equal(markListingWeld(soles, []), null);
  assert.equal(markListingWeld(drawer, []), null);
  assert.equal(chair?.status, "sold");
  assert.equal(zine?.status, "file-gone");
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const jewels = listingById("mdb-jewel-stack");
  assert.ok(jewels);
  const before = {
    price: jewels.price,
    status: jewels.status,
    cartEligible: jewels.cartEligible,
  };
  const taped = markListingWeld(jewels, []);
  assert.deepEqual(taped, ["mdb-jewel-stack"]);
  const after = listingById("mdb-jewel-stack");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that jewel-stack id", () => {
  const jewels = listingById("mdb-jewel-stack");
  const cleared = clearListingWeld(jewels, ["mdb-jewel-stack"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(weldCookieValue(cleared), "[]");
  assert.equal(isListingWeldOverlay("mdb-jewel-stack", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const jewels = listingById("mdb-jewel-stack");
  const liner = listingById("dl-crate-side-a");
  const taped = markListingWeld(jewels, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);
  assert.equal(markListingWeld(liner, []), null);

  const cleared = clearListingWeld(jewels, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});

test("chair stays fixture-sold", () => {
  const chair = listingById(WELD_CHAIR_ID);
  assert.equal(chair?.status, "sold");
  assert.equal(chair?.cartEligible, false);
  assert.equal(markListingWeld(chair, []), null);
});
